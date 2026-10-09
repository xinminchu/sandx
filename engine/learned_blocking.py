"""Learned blocking via a neural retriever (pure Python + numpy).

The research idea: train the retriever for the *blocking* objective
(recall@K — don't miss true duplicates in each record's top-K), not for
pairwise classification accuracy. A retriever trained for recall@K is a
different object from a matcher trained for F1.

Pipeline:
  1. char n-gram hashing  -> fixed-dim sparse-ish record vectors
  2. small MLP encoder     -> L2-normalized dense embeddings
  3. InfoNCE training      -> duplicates rank each other at the top
  4. top-K cosine retrieval -> candidate pairs (the blocking output)

Honesty discipline (mirrors ERBOT):
  - training uses truth-labeled pairs (like any supervised model);
  - K is chosen from the *pair budget* alone — truth never selects K;
  - recall@K is reported once, at the end, on held-out entities when asked.

No truth at all? Falls back to untrained n-gram cosine retrieval
(still a valid blocking, just without learning).
"""

import math

NGRAM_N = 3
NGRAM_DIM = 512
EMBED_DIM = 64
HIDDEN_DIM = 128


def _ngram_hashes(text, n=NGRAM_N, dim=NGRAM_DIM):
    """Hashed character n-gram indices for a string (deterministic)."""
    text = " " + text.lower() + " "
    idxs = set()
    for i in range(len(text) - n + 1):
        g = text[i:i + n]
        h = 0
        for ch in g:
            h = (h * 31 + ord(ch)) & 0xFFFFFFFF
        idxs.add(h % dim)
    return idxs


def record_vectors(texts, dim=NGRAM_DIM):
    """List of strings -> (n, dim) count matrix (numpy)."""
    import numpy as np
    X = np.zeros((len(texts), dim))
    for r, t in enumerate(texts):
        if not t:
            continue
        for h in _ngram_hashes(t):
            X[r, h] += 1.0
    # sublinear TF: 1 + log(count)
    np.log1p(X, out=X)
    return X


class Retriever:
    """Char n-gram -> MLP -> L2-normalized embedding.

    Architecture: dim -> HIDDEN_DIM (tanh) -> EMBED_DIM, L2-normalized.
    Trained with InfoNCE: each duplicate pair should rank each other
    at the top of the batch.
    """

    def __init__(self, dim_in=NGRAM_DIM, hidden=HIDDEN_DIM,
                 dim_out=EMBED_DIM, seed=42):
        self.dim_in = dim_in
        self.hidden = hidden
        self.dim_out = dim_out
        self.seed = seed
        self.trained_ = False

    def _init(self, rng):
        import numpy as np
        s1 = math.sqrt(1.0 / self.dim_in)
        s2 = math.sqrt(1.0 / self.hidden)
        self.W1_ = rng.normal(0, s1, (self.dim_in, self.hidden))
        self.b1_ = np.zeros(self.hidden)
        self.W2_ = rng.normal(0, s2, (self.hidden, self.dim_out))
        self.b2_ = np.zeros(self.dim_out)

    def _forward(self, X):
        import numpy as np
        z1 = X @ self.W1_ + self.b1_
        a1 = np.tanh(z1)
        z2 = a1 @ self.W2_ + self.b2_
        nrm = np.sqrt((z2 ** 2).sum(axis=1, keepdims=True)) + 1e-9
        return z1, a1, z2 / nrm

    def embed(self, X):
        import numpy as np
        X = np.asarray(X, dtype=np.float64)
        _, _, e = self._forward(X)
        return e

    def fit(self, X, dup_pairs, epochs=20, batch=256, lr=0.05,
            temperature=0.1, verbose=False):
        """Train on duplicate pairs.

        X: (n, dim_in) record vectors.
        dup_pairs: list of (i, j) known-duplicate index pairs.
        InfoNCE over each batch: for anchor i with duplicate j,
        maximize P(j | i) = softmax over batch similarities.
        """
        import numpy as np
        import time as _time
        X = np.asarray(X, dtype=np.float64)
        n = len(X)
        if len(dup_pairs) < 4:
            raise ValueError(
                f"retriever needs >= 4 duplicate pairs to train "
                f"(got {len(dup_pairs)}).")
        rng = np.random.default_rng(self.seed)
        self._init(rng)
        t0 = _time.monotonic()

        idx = np.arange(n)
        for ep in range(epochs):
            rng.shuffle(idx)
            # build batches of anchors; positives looked up per anchor
            pos_of = {}
            for i, j in dup_pairs:
                pos_of.setdefault(i, []).append(j)
                pos_of.setdefault(j, []).append(i)
            for s in range(0, n, batch):
                anch = idx[s:s + batch]
                # keep anchors that have a known duplicate
                anch = [int(a) for a in anch if a in pos_of]
                if len(anch) < 2:
                    continue
                # positive for each anchor: random known duplicate
                pos = [pos_of[a][rng.integers(len(pos_of[a]))] for a in anch]
                B = len(anch)
                Xa = X[anch]                       # (B, dim)
                Xp = X[pos]                        # (B, dim)
                # forward both
                z1a, a1a, ea = self._forward(Xa)
                z1p, a1p, ep_ = self._forward(Xp)
                # similarity matrix anchor-vs-all-batch-positives
                S = (ea @ ep_.T) / temperature     # (B, B); S[b, b] is the positive
                # InfoNCE: softmax over columns
                m = S.max(axis=1, keepdims=True)
                E = np.exp(S - m)
                P = E / E.sum(axis=1, keepdims=True)
                # dL/dS = (P - I) / B
                dS = P.copy()
                dS[np.arange(B), np.arange(B)] -= 1.0
                dS /= B
                dS /= temperature
                # backprop into ea and ep_
                dea = dS @ ep_                     # (B, d)
                dep = dS.T @ ea
                # through L2-normalization: de/dz = (de - e*(e.de))/||z||
                # (recompute norms from forward)
                for (e_, de_, z1_, a1_, X_) in ((ea, dea, z1a, a1a, Xa),
                                               (ep_, dep, z1p, a1p, Xp)):
                    # need pre-norm z2; recompute cheaply
                    z2_pre = a1_ @ self.W2_ + self.b2_
                    nrm = np.sqrt((z2_pre ** 2).sum(axis=1, keepdims=True)) + 1e-9
                    dz2 = (de_ - e_ * (e_ * de_).sum(axis=1, keepdims=True)) / nrm
                    dW2 = a1_.T @ dz2
                    db2 = dz2.sum(axis=0)
                    da1 = dz2 @ self.W2_.T
                    dz1 = da1 * (1 - a1_ ** 2)
                    dW1 = X_.T @ dz1
                    db1 = dz1.sum(axis=0)
                    self.W2_ -= lr * dW2
                    self.b2_ -= lr * db2
                    self.W1_ -= lr * dW1
                    self.b1_ -= lr * db1
            if verbose and (ep + 1) % 5 == 0:
                print(f"  epoch {ep+1}/{epochs} ({_time.monotonic()-t0:.1f}s)")
        self.trained_ = True
        return self


def topk_pairs(E, k, chunk=1000):
    """Top-K cosine neighbors per record -> candidate pair set.

    E: (n, d) L2-normalized embeddings. Returns sorted list of (i, j),
    i < j, excluding self-pairs. Chunked so n = 10k stays in memory.
    """
    import numpy as np
    n = len(E)
    k = max(1, min(int(k), n - 1))
    seen = set()
    for s in range(0, n, chunk):
        e = min(s + chunk, n)
        S = E[s:e] @ E.T                      # (chunk, n)
        # exclude self
        rows = np.arange(s, e)
        S[np.arange(e - s), rows] = -np.inf
        # top-k indices per row
        kk = min(k, n - 1)
        idx = np.argpartition(S, -kk, axis=1)[:, -kk:]
        for r, row in enumerate(idx):
            i = s + r
            for j in row.tolist():
                a, b = (i, j) if i < j else (j, i)
                seen.add((a, b))
    return sorted(seen)


def k_for_budget(n, budget):
    """Honest K selection: K from the pair budget alone (no truth).

    Expected pairs ~= n*K/2 <= budget  ->  K = floor(2*budget / n).
    """
    return max(1, int((2 * budget) // max(n, 1)))


def recall_at_k(pairs, dup_pairs, n):
    """Fraction of true duplicate pairs present in the candidate pairs.

    dup_pairs: set of (i, j) with i < j. Reporting metric only.
    """
    if not dup_pairs:
        return float("nan")
    cand = set((a, b) if a < b else (b, a) for a, b in pairs)
    hit = sum(1 for p in dup_pairs if p in cand)
    return hit / len(dup_pairs)
