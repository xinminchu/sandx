"""Supervised pair classifiers, pure Python (no sklearn/scipy).

Mirrors the advisor's classifier list (er_modular.R) and ERBOT's
er_supervised_classifiers(): logistic, lda, qda, knn, wknn, tree, rf,
xgboost, nnet, fellegi_sunter, svm_radial. Each classifier trains on
per-field pair similarities with pair labels derived from gold truth,
then predicts match probabilities for all pairs.

The heavier members (tree ensembles, boosting, MLP, RBF-SVM) are
implemented from scratch in numpy — no compiled dependencies, so they
run on the serverless demo. Training is stratified-capped at ~2000
pairs (mirrors KNN.MAX_REF).
"""

import math


def _mat_inv(a):
    """Gauss-Jordan inverse for small dense matrices."""
    n = len(a)
    m = [row[:] + [1.0 if i == j else 0.0 for j in range(n)]
         for i, row in enumerate(a)]
    for col in range(n):
        piv = max(range(col, n), key=lambda r: abs(m[r][col]))
        if abs(m[piv][col]) < 1e-12:
            raise ValueError("singular covariance")
        m[col], m[piv] = m[piv], m[col]
        pv = m[col][col]
        m[col] = [v / pv for v in m[col]]
        for r in range(n):
            if r != col and m[r][col] != 0.0:
                f = m[r][col]
                m[r] = [rv - f * cv for rv, cv in zip(m[r], m[col])]
    return [row[n:] for row in m]


def _sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


class Logistic:
    """L2-regularized logistic regression via IRLS."""

    def __init__(self, l2=1.0, max_iter=50):
        self.l2 = l2
        self.max_iter = max_iter

    def fit(self, X, y):
        k = len(X[0])
        w = [0.0] * (k + 1)  # last = intercept
        n = len(X)
        for _ in range(self.max_iter):
            grad = [0.0] * (k + 1)
            hess = [[0.0] * (k + 1) for _ in range(k + 1)]
            for xi, yi in zip(X, y):
                z = w[k] + sum(wi * xij for wi, xij in zip(w, xi))
                p = _sigmoid(z)
                r = p * (1.0 - p)
                e = yi - p
                for j in range(k):
                    grad[j] += e * xi[j]
                    for l in range(k):
                        hess[j][l] += r * xi[j] * xi[l]
                    hess[j][k] += r * xi[j]
                    hess[k][j] += r * xi[j]
                grad[k] += e
                hess[k][k] += r
            for j in range(k):  # L2 (not on intercept)
                grad[j] -= self.l2 * w[j]
                hess[j][j] += self.l2
            try:
                step = _mat_inv(hess)
            except ValueError:
                break
            dw = [sum(step[j][l] * grad[l] for l in range(k + 1))
                  for j in range(k + 1)]
            if max(abs(v) for v in dw) < 1e-6:
                w = [wj + dwj for wj, dwj in zip(w, dw)]
                break
            w = [wj + dwj for wj, dwj in zip(w, dw)]
        self.w_ = w
        return self

    def predict_proba(self, X):
        k = len(self.w_) - 1
        return [_sigmoid(self.w_[k] + sum(wi * xij for wi, xij in zip(self.w_, xi)))
                for xi in X]


class _GaussianBase:
    def _fit_stats(self, X, y):
        self.classes_ = sorted(set(y))
        self.means_ = {}
        self.priors_ = {}
        for c in self.classes_:
            rows = [xi for xi, yi in zip(X, y) if yi == c]
            self.priors_[c] = len(rows) / len(X)
            self.means_[c] = [sum(col) / len(rows) for col in zip(*rows)]
        return self

    def _logpdf(self, x, mean, inv, logdet):
        d = [xi - mi for xi, mi in zip(x, mean)]
        q = sum(di * sum(inv[i][j] * dj for j, dj in enumerate(d))
                for i, di in enumerate(d))
        return -0.5 * (logdet + q)

    def _logdet(self, cov):
        # log|.| via the inverse we already compute: use Cholesky-free
        # product of pivots from a quick LU
        n = len(cov)
        m = [row[:] for row in cov]
        logd = 0.0
        for col in range(n):
            piv = max(range(col, n), key=lambda r: abs(m[r][col]))
            if abs(m[piv][col]) < 1e-12:
                return 0.0
            if piv != col:
                m[col], m[piv] = m[piv], m[col]
            pv = m[col][col]
            logd += math.log(abs(pv))
            for r in range(col + 1, n):
                f = m[r][col] / pv
                for c2 in range(col, n):
                    m[r][c2] -= f * m[col][c2]
        return logd


class LDA(_GaussianBase):
    """Linear discriminant analysis (pooled covariance)."""

    def fit(self, X, y):
        self._fit_stats(X, y)
        k = len(X[0])
        n = len(X)
        pooled = [[0.0] * k for _ in range(k)]
        for c in self.classes_:
            rows = [xi for xi, yi in zip(X, y) if yi == c]
            mu = self.means_[c]
            for xi in rows:
                d = [xij - muj for xij, muj in zip(xi, mu)]
                for i in range(k):
                    for j in range(k):
                        pooled[i][j] += d[i] * d[j]
        dof = max(n - len(self.classes_), 1)
        pooled = [[v / dof + (1e-6 if i == j else 0.0)
                   for j, v in enumerate(row)] for i, row in enumerate(pooled)]
        self.inv_ = _mat_inv(pooled)
        self.logdet_ = self._logdet(pooled)
        return self

    def predict_proba(self, X):
        out = []
        for x in X:
            scores = {c: math.log(self.priors_[c]) + self._logpdf(x, self.means_[c],
                                                                 self.inv_, self.logdet_)
                      for c in self.classes_}
            if len(scores) == 2:
                c0, c1 = self.classes_
                out.append(_sigmoid(scores[c1] - scores[c0]))
            else:
                best = max(scores, key=scores.get)
                out.append(1.0 if best == 1 else 0.0)
        return out


class QDA(_GaussianBase):
    """Quadratic discriminant analysis (per-class covariance)."""

    def fit(self, X, y):
        self._fit_stats(X, y)
        k = len(X[0])
        self.inv_ = {}
        self.logdet_ = {}
        for c in self.classes_:
            rows = [xi for xi, yi in zip(X, y) if yi == c]
            mu = self.means_[c]
            cov = [[0.0] * k for _ in range(k)]
            for xi in rows:
                d = [xij - muj for xij, muj in zip(xi, mu)]
                for i in range(k):
                    for j in range(k):
                        cov[i][j] += d[i] * d[j]
            dof = max(len(rows) - 1, 1)
            cov = [[v / dof + (1e-6 if i == j else 0.0)
                    for j, v in enumerate(row)] for i, row in enumerate(cov)]
            self.inv_[c] = _mat_inv(cov)
            self.logdet_[c] = self._logdet(cov)
        return self

    def predict_proba(self, X):
        out = []
        for x in X:
            scores = {c: math.log(self.priors_[c]) + self._logpdf(x, self.means_[c],
                                                                 self.inv_[c],
                                                                 self.logdet_[c])
                      for c in self.classes_}
            if len(scores) == 2:
                c0, c1 = self.classes_
                out.append(_sigmoid(scores[c1] - scores[c0]))
            else:
                best = max(scores, key=scores.get)
                out.append(1.0 if best == 1 else 0.0)
        return out


class KNN:
    """k-nearest neighbors classifier (k=5); proba = neighbor match rate."""

    #: max reference points; beyond this we stratified-subsample (k-NN in
    #: low-dim feature space needs coverage, not all 67k pairs)
    MAX_REF = 2000

    def __init__(self, k=5):
        self.k = k

    def fit(self, X, y):
        if len(X) > self.MAX_REF:
            import random
            idx1 = [i for i, yi in enumerate(y) if yi == 1]
            idx0 = [i for i, yi in enumerate(y) if yi == 0]
            n1 = max(1, int(self.MAX_REF * len(idx1) / len(X)))
            n0 = self.MAX_REF - n1
            rng = random.Random(42)
            keep = rng.sample(idx1, min(n1, len(idx1))) + rng.sample(
                idx0, min(n0, len(idx0))
            )
            X = [X[i] for i in keep]
            y = [y[i] for i in keep]
        self.X_ = X
        self.y_ = y
        self.n_ref_ = len(X)
        return self

    def predict_proba(self, X):
        import numpy as np
        Xa = np.asarray(X, dtype=np.float64)
        Xtr = np.asarray(self.X_, dtype=np.float64)
        ytr = np.asarray(self.y_, dtype=np.float64)
        n_tr = len(Xtr)
        if n_tr == 0 or len(Xa) == 0:
            return [0.0] * len(Xa)
        k = min(self.k, n_tr)
        tr_norm = (Xtr ** 2).sum(axis=1)
        out = np.empty(len(Xa))
        # batched: ||a-b||^2 = ||a||^2 + ||b||^2 - 2 a.b (BLAS matmul)
        B = max(50, min(2000, 12_500_000 // n_tr))
        for s in range(0, len(Xa), B):
            e = min(s + B, len(Xa))
            Xb = Xa[s:e]
            d2 = (Xb ** 2).sum(axis=1)[:, None] + tr_norm[None, :] - 2.0 * (Xb @ Xtr.T)
            np.maximum(d2, 0, out=d2)
            idx = np.argpartition(d2, k - 1, axis=1)[:, :k]
            out[s:e] = ytr[idx].mean(axis=1)
        return out.tolist()


class FellegiSunter:
    """Naive-Bayes Fellegi-Sunter: per-field binned likelihood ratios."""

    def __init__(self, bins=5, laplace=0.5):
        self.bins = bins
        self.laplace = laplace

    def fit(self, X, y):
        k = len(X[0])
        self.tables_ = []
        for j in range(k):
            match = [0.0] * self.bins
            non = [0.0] * self.bins
            for xi, yi in zip(X, y):
                b = min(self.bins - 1, int(max(0.0, min(1.0, xi[j])) * self.bins))
                if yi == 1:
                    match[b] += 1
                else:
                    non[b] += 1
            tm = sum(match) + self.laplace * self.bins
            tn = sum(non) + self.laplace * self.bins
            self.tables_.append([
                math.log((match[b] + self.laplace) / tm)
                - math.log((non[b] + self.laplace) / tn)
                for b in range(self.bins)
            ])
        n1 = sum(y)
        self.log_prior_ = math.log(n1 / len(y)) - math.log(1 - n1 / len(y)) \
            if 0 < n1 < len(y) else 0.0
        return self

    def predict_proba(self, X):
        out = []
        for xi in X:
            llr = self.log_prior_
            for j, v in enumerate(xi):
                b = min(self.bins - 1, int(max(0.0, min(1.0, v)) * self.bins))
                llr += self.tables_[j][b]
            out.append(_sigmoid(llr))
        return out


CLASSIFIERS = {
    "logistic": Logistic,
    "lda": LDA,
    "qda": QDA,
    "knn": KNN,
    "fellegi_sunter": FellegiSunter,
}


def train(name, X, y):
    """Fit a named classifier; returns the fitted model."""
    if name not in CLASSIFIERS:
        raise ValueError(f"unknown classifier: {name}")
    if len(set(y)) < 2:
        raise ValueError(f"{name}: need both match and non-match labeled pairs.")
    return CLASSIFIERS[name]().fit(X, y)


# ── Shared helpers ───────────────────────────────────────────────────────────

def _subsample_xy(X, y, max_n, seed=42):
    """Stratified cap on training pairs for the heavier classifiers."""
    if len(X) <= max_n:
        return X, y
    import random
    rng = random.Random(seed)
    idx1 = [i for i, v in enumerate(y) if v == 1]
    idx0 = [i for i, v in enumerate(y) if v == 0]
    n1 = max(1, int(max_n * len(idx1) / len(X)))
    n0 = max_n - n1
    keep = rng.sample(idx1, min(n1, len(idx1))) + rng.sample(idx0, min(n0, len(idx0)))
    return [X[i] for i in keep], [y[i] for i in keep]


# ── Weighted k-NN ────────────────────────────────────────────────────────────

class WKNN(KNN):
    """Weighted k-NN (k=5); weight 1/(1+d^2); proba = weighted match rate."""

    def predict_proba(self, X):
        import numpy as np
        Xa = np.asarray(X, dtype=np.float64)
        Xtr = np.asarray(self.X_, dtype=np.float64)
        ytr = np.asarray(self.y_, dtype=np.float64)
        n_tr = len(Xtr)
        if n_tr == 0 or len(Xa) == 0:
            return [0.0] * len(Xa)
        k = min(self.k, n_tr)
        tr_norm = (Xtr ** 2).sum(axis=1)
        out = np.empty(len(Xa))
        B = max(50, min(2000, 12_500_000 // n_tr))
        for s in range(0, len(Xa), B):
            e = min(s + B, len(Xa))
            Xb = Xa[s:e]
            d2 = (Xb ** 2).sum(axis=1)[:, None] + tr_norm[None, :] - 2.0 * (Xb @ Xtr.T)
            np.maximum(d2, 0, out=d2)
            idx = np.argpartition(d2, k - 1, axis=1)[:, :k]
            w = 1.0 / (1.0 + np.take_along_axis(d2, idx, axis=1))
            yw = np.take_along_axis(ytr[None, :].repeat(len(Xb), axis=0), idx, axis=1)
            out[s:e] = (w * yw).sum(axis=1) / w.sum(axis=1)
        return out.tolist()


# ── CART decision tree ──────────────────────────────────────────────────────

class DecisionTree:
    """CART tree (Gini / MSE), pure numpy. Mirrors rpart for 'tree'."""

    def __init__(self, max_depth=6, min_samples_split=10, max_features=None,
                 regression=False, seed=0):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.regression = regression
        self.seed = seed

    def fit(self, X, y):
        import numpy as np
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        self.n_features_ = X.shape[1]
        rng = np.random.default_rng(self.seed)
        self.tree_ = self._build(X, y, 0, rng)
        return self

    def _impurity(self, y):
        import numpy as np
        n = len(y)
        if n == 0:
            return 0.0
        if self.regression:
            m = y.mean()
            return float(((y - m) ** 2).mean())
        p = y.mean()
        return 2.0 * p * (1.0 - p)

    def _leaf_val(self, y):
        import numpy as np
        return float(y.mean()) if len(y) else 0.0

    def _build(self, X, y, depth, rng):
        import numpy as np
        n = len(y)
        if depth >= self.max_depth or n < self.min_samples_split or n < 2:
            return (self._leaf_val(y),)
        if not self.regression and (y.mean() in (0.0, 1.0)):
            return (self._leaf_val(y),)
        F = X.shape[1]
        feats = range(F)
        if self.max_features is not None and self.max_features < F:
            feats = sorted(rng.choice(F, self.max_features, replace=False).tolist())
        parent_imp = self._impurity(y)
        if parent_imp <= 1e-12:
            return (self._leaf_val(y),)
        best_gain, best = 1e-9, None
        for j in feats:
            col = X[:, j]
            order = np.argsort(col, kind="mergesort")
            sc = col[order]
            sy = y[order]
            diff = np.diff(sc) > 1e-12
            cands = np.where(diff)[0]
            if len(cands) == 0:
                continue
            if len(cands) > 40:
                cands = cands[np.linspace(0, len(cands) - 1, 40).astype(int)]
            cs = np.cumsum(sy)
            cs2 = np.cumsum(sy * sy)
            nl = cands + 1
            nr = n - nl
            ok = (nl >= 2) & (nr >= 2)
            if not np.any(ok):
                continue
            if self.regression:
                # variance reduction via sums of squares
                tot2 = cs2[-1]
                var_l = (cs2[cands] - cs[cands] ** 2 / nl) / nl
                var_r = ((tot2 - cs2[cands]) - (cs[-1] - cs[cands]) ** 2 / nr) / nr
                imp_l = np.maximum(var_l, 0.0)
                imp_r = np.maximum(var_r, 0.0)
            else:
                pl = cs[cands] / nl
                pr = (cs[-1] - cs[cands]) / nr
                imp_l = 2 * pl * (1 - pl)
                imp_r = 2 * pr * (1 - pr)
            gain = parent_imp - (nl / n) * imp_l - (nr / n) * imp_r
            gain = np.where(ok, gain, -1.0)
            q = int(np.argmax(gain))
            if gain[q] > best_gain:
                thr = (sc[cands[q]] + sc[cands[q] + 1]) / 2.0
                best_gain = float(gain[q])
                best = (j, thr)
        if best is None:
            return (self._leaf_val(y),)
        j, thr = best
        left = X[:, j] <= thr
        return (j, thr,
                self._build(X[left], y[left], depth + 1, rng),
                self._build(X[~left], y[~left], depth + 1, rng))

    def _walk(self, node, x):
        while len(node) == 4:
            j, thr, left, right = node
            node = left if x[j] <= thr else right
        return node[0]

    def predict(self, X):
        import numpy as np
        X = np.asarray(X, dtype=np.float64)
        return [self._walk(self.tree_, x) for x in X]

    def predict_proba(self, X):
        return self.predict(X)


# ── Random forest ────────────────────────────────────────────────────────────

class RandomForest:
    """Bagged CART forest with sqrt feature sampling. Mirrors randomForest."""

    MAX_TRAIN = 2000

    def __init__(self, n_trees=30, max_depth=6, min_samples_split=10, seed=42):
        self.n_trees = n_trees
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.seed = seed

    def fit(self, X, y):
        import numpy as np
        X, y = _subsample_xy(X, y, self.MAX_TRAIN, self.seed)
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        F = X.shape[1]
        mf = max(1, int(F ** 0.5))
        rng = np.random.default_rng(self.seed)
        n = len(X)
        self.trees_ = []
        for t in range(self.n_trees):
            idx = rng.integers(0, n, n)
            tree = DecisionTree(max_depth=self.max_depth,
                                min_samples_split=self.min_samples_split,
                                max_features=mf,
                                seed=self.seed + t).fit(X[idx], y[idx])
            self.trees_.append(tree)
        return self

    def predict_proba(self, X):
        import numpy as np
        P = np.mean([t.predict_proba(X) for t in self.trees_], axis=0)
        return np.clip(P, 0.0, 1.0).tolist()


# ── Gradient boosting (xgboost-like) ─────────────────────────────────────────

class GradientBoosting:
    """Gradient-boosted shallow regression trees, logistic loss.

    Mirrors xgboost (binary:logistic): F_0 = log prior odds, then each
    round fits a tree to residuals y - sigmoid(F) with Newton step sizes.
    """

    MAX_TRAIN = 2000

    def __init__(self, n_rounds=50, lr=0.1, max_depth=3, seed=42):
        self.n_rounds = n_rounds
        self.lr = lr
        self.max_depth = max_depth
        self.seed = seed

    def fit(self, X, y):
        import numpy as np
        X, y = _subsample_xy(X, y, self.MAX_TRAIN, self.seed)
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        p0 = min(max(y.mean(), 1e-3), 1 - 1e-3)
        F = np.full(len(y), math.log(p0 / (1 - p0)))
        self.trees_ = []
        for m in range(self.n_rounds):
            prob = 1.0 / (1.0 + np.exp(-F))
            grad = y - prob                      # negative gradient
            hess = np.maximum(prob * (1 - prob), 1e-6)
            tree = DecisionTree(max_depth=self.max_depth,
                                min_samples_split=10,
                                regression=True,
                                seed=self.seed + m).fit(X, grad / hess)
            # Newton step: replace each leaf mean by sum(grad)/sum(hess)
            tree.tree_ = self._newton_rescale(tree.tree_, X, grad, hess)
            F = F + self.lr * np.asarray(tree.predict(X))
            self.trees_.append(tree)
        self.f0_ = float(math.log(p0 / (1 - p0)))
        return self

    def _newton_rescale(self, node, X, grad, hess):
        """Replace regression-tree leaf means by sum(grad)/sum(hess)."""
        import numpy as np
        X = np.asarray(X)
        # collect leaf members by walking
        members = {}

        def walk(nd, idx):
            if len(nd) == 1:
                members.setdefault(id(nd), []).extend(idx.tolist())
                return
            j, thr, left, right = nd
            col = X[idx, j]
            walk(left, idx[col <= thr])
            walk(right, idx[col > thr])

        walk(node, np.arange(len(X)))

        def fix(nd):
            if len(nd) == 1:
                g = sum(float(grad[i]) for i in members.get(id(nd), []))
                h = sum(float(hess[i]) for i in members.get(id(nd), []))
                return (g / max(h, 1e-9),)
            j, thr, left, right = nd
            return (j, thr, fix(left), fix(right))

        return fix(node)

    def _raw(self, X):
        import numpy as np
        F = np.full(len(np.asarray(X)), self.f0_)
        for t in self.trees_:
            F = F + self.lr * np.asarray(t.predict(X))
        return F

    def predict_proba(self, X):
        import numpy as np
        F = self._raw(X)
        return (1.0 / (1.0 + np.exp(-F))).tolist()


# ── MLP (nnet) ───────────────────────────────────────────────────────────────

class MLP:
    """Single-hidden-layer perceptron, tanh hidden, logistic output (Adam).

    Mirrors nnet::nnet(size, decay): standardised inputs, weight decay.
    """

    MAX_TRAIN = 2000

    def __init__(self, hidden=8, lr=0.05, epochs=300, l2=1e-3, seed=42):
        self.hidden = hidden
        self.lr = lr
        self.epochs = epochs
        self.l2 = l2
        self.seed = seed

    def fit(self, X, y):
        import numpy as np
        X, y = _subsample_xy(X, y, self.MAX_TRAIN, self.seed)
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        n, F = X.shape
        mu = X.mean(axis=0)
        sd = X.std(axis=0) + 1e-9
        self.mu_, self.sd_ = mu, sd
        Xs = (X - mu) / sd
        rng = np.random.default_rng(self.seed)
        H = self.hidden
        W1 = rng.normal(0, np.sqrt(1.0 / F), (F, H))
        b1 = np.zeros(H)
        W2 = rng.normal(0, np.sqrt(1.0 / H), (H,))
        b2 = 0.0
        # Adam state
        mW1, vW1 = np.zeros_like(W1), np.zeros_like(W1)
        mb1, vb1 = np.zeros_like(b1), np.zeros_like(b1)
        mW2, vW2 = np.zeros_like(W2), np.zeros_like(W2)
        mb2, vb2 = 0.0, 0.0
        b1_, b2_ = 0.9, 0.999
        eps = 1e-8
        lr, l2 = self.lr, self.l2
        for t in range(1, self.epochs + 1):
            z1 = Xs @ W1 + b1
            a1 = np.tanh(z1)
            z2 = a1 @ W2 + b2
            p = 1.0 / (1.0 + np.exp(-z2))
            dz2 = (p - y) / n
            dW2 = a1.T @ dz2 + l2 * W2
            db2 = float(dz2.sum())
            da1 = np.outer(dz2, W2)
            dz1 = da1 * (1 - a1 ** 2)
            dW1 = Xs.T @ dz1 + l2 * W1
            db1 = dz1.sum(axis=0)
            c1, c2 = 1 - b1_ ** t, 1 - b2_ ** t
            for param, grad, ms, vs in ((W1, dW1, mW1, vW1),
                                        (b1, db1, mb1, vb1),
                                        (W2, dW2, mW2, vW2)):
                ms[:] = b1_ * ms + (1 - b1_) * grad
                vs[:] = b2_ * vs + (1 - b2_) * grad * grad
                step = (ms / c1) / (np.sqrt(vs / c2) + eps)
                param -= lr * step
            mb2 = b1_ * mb2 + (1 - b1_) * db2
            vb2 = b2_ * vb2 + (1 - b2_) * db2 * db2
            b2 -= lr * (mb2 / c1) / (np.sqrt(vb2 / c2) + eps)
        self.W1_, self.b1_, self.W2_, self.b2_ = W1, b1, W2, float(b2)
        return self

    def _forward(self, X):
        import numpy as np
        Xs = (np.asarray(X, dtype=np.float64) - self.mu_) / self.sd_
        a1 = np.tanh(Xs @ self.W1_ + self.b1_)
        return 1.0 / (1.0 + np.exp(-(a1 @ self.W2_ + self.b2_)))

    def predict_proba(self, X):
        return self._forward(X).tolist()


# ── RBF SVM via SMO ──────────────────────────────────────────────────────────

class SVMRadial:
    """RBF-kernel SVM trained by SMO, probabilities via Platt scaling.

    Mirrors e1071::svm(kernel = "radial"): gamma defaults to 1/n_features.
    """

    MAX_TRAIN = 1500  # SMO kernel matrix is O(n^2)

    def __init__(self, C=1.0, gamma=None, seed=42):
        self.C = C
        self.gamma = gamma
        self.seed = seed

    def _rbf(self, A, B):
        import numpy as np
        A = np.asarray(A, dtype=np.float64)
        B = np.asarray(B, dtype=np.float64)
        d2 = ((A ** 2).sum(axis=1)[:, None] + (B ** 2).sum(axis=1)[None, :]
              - 2.0 * (A @ B.T))
        np.maximum(d2, 0, out=d2)
        return np.exp(-self.gamma_ * d2)

    def fit(self, X, y):
        import numpy as np
        import random
        X, y = _subsample_xy(X, y, self.MAX_TRAIN, self.seed)
        Xa = np.asarray(X, dtype=np.float64)
        ya = np.asarray(y, dtype=np.float64)
        self.gamma_ = 1.0 / Xa.shape[1] if self.gamma is None else self.gamma
        n = len(Xa)
        ys = np.where(ya == 1, 1.0, -1.0)
        K = self._rbf(Xa, Xa)
        C, tol = self.C, 1e-3
        rng = random.Random(self.seed)
        alpha = np.zeros(n)
        b = 0.0
        ay = alpha * ys
        passes = 0
        while passes < 15:
            changed = 0
            for i in range(n):
                fi = float(ay @ K[:, i]) + b
                Ei = fi - ys[i]
                if (ys[i] * Ei < -tol and alpha[i] < C) or \
                   (ys[i] * Ei > tol and alpha[i] > 0):
                    j = rng.randrange(n - 1)
                    if j >= i:
                        j += 1
                    fj = float(ay @ K[:, j]) + b
                    Ej = fj - ys[j]
                    ai_old, aj_old = alpha[i], alpha[j]
                    if ys[i] != ys[j]:
                        L = max(0.0, aj_old - ai_old)
                        H = min(C, C + aj_old - ai_old)
                    else:
                        L = max(0.0, ai_old + aj_old - C)
                        H = min(C, ai_old + aj_old)
                    if H - L < 1e-9:
                        continue
                    eta = 2 * K[i, j] - K[i, i] - K[j, j]
                    if eta >= 0:
                        continue
                    alpha[j] = min(H, max(L, aj_old - ys[j] * (Ei - Ej) / eta))
                    if abs(alpha[j] - aj_old) < 1e-5:
                        continue
                    alpha[i] = ai_old + ys[i] * ys[j] * (aj_old - alpha[j])
                    ay = alpha * ys
                    b1 = (b - Ei - ys[i] * (alpha[i] - ai_old) * K[i, i]
                          - ys[j] * (alpha[j] - aj_old) * K[i, j])
                    b2 = (b - Ej - ys[i] * (alpha[i] - ai_old) * K[i, j]
                          - ys[j] * (alpha[j] - aj_old) * K[j, j])
                    if 0 < alpha[i] < C:
                        b = b1
                    elif 0 < alpha[j] < C:
                        b = b2
                    else:
                        b = (b1 + b2) / 2
                    changed += 1
            passes = 0 if changed else passes + 1
        sv = alpha > 1e-6
        self.sv_X_ = Xa[sv]
        self.sv_y_ = ys[sv]
        self.sv_alpha_ = alpha[sv]
        self.b_ = float(b)
        # Platt scaling: logistic regression on decision values
        dec = (self._dec(Xa)).reshape(-1, 1).tolist()
        self.platt_ = Logistic(max_iter=100).fit(dec, ya.tolist())
        return self

    def _dec(self, X):
        import numpy as np
        Xa = np.asarray(X, dtype=np.float64)
        K = self._rbf(Xa, self.sv_X_)
        return K @ (self.sv_alpha_ * self.sv_y_) + self.b_

    def predict_proba(self, X):
        dec = self._dec(X).reshape(-1, 1).tolist()
        return self.platt_.predict_proba(dec)


CLASSIFIERS = {
    "logistic": Logistic,
    "lda": LDA,
    "qda": QDA,
    "knn": KNN,
    "wknn": WKNN,
    "tree": DecisionTree,
    "rf": RandomForest,
    "xgboost": GradientBoosting,
    "nnet": MLP,
    "fellegi_sunter": FellegiSunter,
    "svm_radial": SVMRadial,
}
