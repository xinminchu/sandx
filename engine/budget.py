"""Budget-allocation blocking lab (demonstration miniature of ERBOT's v2
blocking-experiment protocol).

Question: given a fixed candidate-pair budget B, which pairs should a
blocker buy? Three arms spend over one shared pool:

  fixed-k   every record buys its k nearest neighbours (k tuned on train);
  E1        collective blocking, ported from exp-e1-collective-blocking-v2.R:
            Louvain communities on the pool graph; candidate pairs =
            ALL within-community pairs (per-record cap 200 in communities
            larger than 200) + cross-community "insurance" pairs (each
            record's top-5 pool neighbours outside its community); the
            union is then aligned to exactly B (trim lowest-weight, pad
            with the best remaining pool pairs);
  E2        marginal allocation ("water-filling"), ported from
            exp-e2-waterfill-v2.R (variant A): every record's top-1 pair
            is guaranteed (floor), the remaining budget is spent on the
            directed pool stubs with the highest marginal value
            (Platt-calibrated P(match | cosine), fitted on train pairs),
            deduplicated and topped up by marginal value to exactly B.

Permutation check (E2): the observed per-record budget profile is the
degree sequence of the treatment's final pair set; shuffling it across
records and re-selecting by marginal value gives the null distribution
of dPC (R=19 in the demo; the paper runs used R=199).

Miniature simplifications, disclosed: Louvain resolution is fixed at 1
(the harness tunes it on train); pair weights are BoW cosines where the
harness's E1 uses signature agreement; only E2 variant A is shown.
Protocol otherwise mirrors the harness: char-3-gram bag-of-words cosine
pool (top-200 per record), entity-disjoint 70/30 split by gold cluster
(seed 20261012), tuning/calibration on train only.

This is a teaching demonstration on the Studio's bundled datasets — not
the paper runs (those are archived on /experiments).
"""

import random
from collections import defaultdict

import numpy as np

POOL_K = 200
GRID_K = (2, 5, 10, 20, 35, 50, 80, 120)
TUNE_K = (10, 20, 50)  # the harness's tuning grid for k*
SEED = 20261012
INS_K = 5
COMMUNITY_CAP = 200


# ---------------------------------------------------------------- texts/pool

def record_texts(rows, cols, id_col=None, truth_col=None):
    """One aggregate string per record: every column except id/truth."""
    skip = {c for c in (id_col, truth_col) if c}
    use = [c for c in cols if c not in skip]
    out = []
    for r in rows:
        parts = [str(r.get(c, "")).strip() for c in use]
        out.append(" ".join(p for p in parts if p).lower())
    return out


def _ngrams(text, n=3):
    s = " ".join(text.split())
    if len(s) <= n:
        return [s] if s else []
    return [s[i:i + n] for i in range(len(s) - n + 1)]


def build_pool(texts, pool_k=POOL_K):
    """Char-3-gram TF cosine pool.

    Returns (nbrs, sims, cos): nbrs[i] = top-`pool_k` neighbour indices
    by cosine desc; sims[i] = their cosines; cos = full float32 matrix.
    """
    n = len(texts)
    vocab = {}
    doc_tokens = []
    for t in texts:
        counts = defaultdict(int)
        for g in _ngrams(t):
            counts[g] += 1
        idx, vals = [], []
        for g, c in counts.items():
            idx.append(vocab.setdefault(g, len(vocab)))
            vals.append(c)
        doc_tokens.append((np.array(idx, dtype=np.int32),
                           np.array(vals, dtype=np.float32)))
    norms = np.array(
        [float(np.sqrt((v * v).sum())) if len(v) else 0.0 for _, v in doc_tokens],
        dtype=np.float32,
    )
    postings = defaultdict(list)
    for i, (idx, vals) in enumerate(doc_tokens):
        for j, v in zip(idx.tolist(), vals.tolist()):
            postings[j].append((i, v))
    dots = np.zeros((n, n), dtype=np.float32)
    for lst in postings.values():
        if len(lst) < 2:
            continue
        recs = np.array([r for r, _ in lst], dtype=np.int32)
        tf = np.array([v for _, v in lst], dtype=np.float32)
        dots[np.ix_(recs, recs)] += np.outer(tf, tf)
    denom = np.outer(norms, norms)
    with np.errstate(divide="ignore", invalid="ignore"):
        cos = np.where(denom > 0, dots / np.maximum(denom, 1e-12), 0.0)
    np.fill_diagonal(cos, 0.0)
    nbrs, sims = [], []
    k = min(pool_k, max(n - 1, 0))
    for i in range(n):
        row = cos[i]
        if k and row.max() > 0:
            part = np.argpartition(-row, k - 1)[:k]
            part = part[row[part] > 0]
            order = part[np.argsort(-row[part])]
        else:
            order = np.array([], dtype=int)
        nbrs.append(order.astype(int))
        sims.append(row[order].astype(float) if len(order) else np.array([]))
    return nbrs, sims, cos


# ---------------------------------------------------------------- split/gold

def split_by_cluster(truth, seed=SEED, train_frac=0.7):
    """Entity-disjoint split: whole gold clusters go to one side."""
    clusters = defaultdict(list)
    for i, t in enumerate(truth):
        clusters[t].append(i)
    keys = list(clusters.keys())
    rng = random.Random(seed)
    rng.shuffle(keys)
    train, test, target = [], [], train_frac * len(truth)
    for key in keys:
        if len(train) < target:
            train.extend(clusters[key])
        else:
            test.extend(clusters[key])
    return sorted(train), sorted(test)


def gold_pairs(idxs, truth):
    by = defaultdict(list)
    for g in idxs:
        by[truth[g]].append(g)
    out = set()
    for members in by.values():
        for a in range(len(members)):
            for b in range(a + 1, len(members)):
                out.add((members[a], members[b]))
    return out


def _pc(pair_set, gold):
    if not gold:
        return 0.0
    return len(pair_set & gold) / len(gold)


def _topk_pairs(idxs, nbrs, sims, k):
    """Fixed-k candidate set (undirected) restricted to the subset."""
    inside = set(idxs)
    out = {}
    for i in idxs:
        for j, s in zip(nbrs[i][:k], sims[i][:k]):
            j = int(j)
            if j in inside and j != i:
                key = (i, j) if i < j else (j, i)
                out[key] = max(out.get(key, 0.0), float(s))
    return out


def _align(pair_scores, budget, pool_scores):
    """Trim lowest-score pairs / pad from the pool to exactly `budget`."""
    items = sorted(pair_scores.items(), key=lambda kv: -kv[1])
    if len(items) > budget:
        items = items[:budget]
    elif len(items) < budget:
        have = {k for k, _ in items}
        extra = [kv for kv in sorted(pool_scores.items(), key=lambda kv: -kv[1])
                 if kv[0] not in have]
        items = items + extra[:budget - len(items)]
    return {k for k, _ in items}


# ---------------------------------------------------------------- E1

def _communities(idxs, nbrs, sims):
    """Louvain communities (resolution 1) on the subset's pool graph."""
    import networkx as nx

    inside = set(idxs)
    g = nx.Graph()
    g.add_nodes_from(idxs)
    for i in idxs:
        for j, s in zip(nbrs[i], sims[i]):
            j = int(j)
            if j in inside and j > i:
                g.add_edge(i, j, weight=float(s))
    comms = nx.community.louvain_communities(g, weight="weight", seed=SEED)
    comm_of = {}
    for c, members in enumerate(comms):
        for m in members:
            comm_of[int(m)] = c
    return comm_of


def _e1_pairs(idxs, nbrs, sims, cos, comm_of, budget, pool_scores):
    """pairs_from_partition + align_budget, ported (see module docstring)."""
    by_comm = defaultdict(list)
    for i in idxs:
        by_comm[comm_of[i]].append(i)
    chosen = {}
    for members in by_comm.values():
        m = len(members)
        if m < 2:
            continue
        if m <= COMMUNITY_CAP:
            for a in range(m):
                for b in range(a + 1, m):
                    i, j = members[a], members[b]
                    key = (i, j) if i < j else (j, i)
                    chosen[key] = float(cos[i, j])
        else:
            member_set = set(members)
            for i in members:
                cand = [(float(cos[i, j]), j) for j in member_set if j != i]
                cand.sort(key=lambda t: -t[0])
                for s, j in cand[:COMMUNITY_CAP]:
                    key = (i, j) if i < j else (j, i)
                    chosen[key] = max(chosen.get(key, 0.0), s)
    # cross-community insurance: per record top-INS_K pool neighbours
    # outside its own community
    inside = set(idxs)
    for i in idxs:
        taken = 0
        for j, s in zip(nbrs[i], sims[i]):
            if taken >= INS_K:
                break
            j = int(j)
            if j in inside and j != i and comm_of[j] != comm_of[i]:
                key = (i, j) if i < j else (j, i)
                chosen[key] = max(chosen.get(key, 0.0), float(s))
                taken += 1
    return _align(chosen, budget, pool_scores)


# ---------------------------------------------------------------- E2

def _fit_platt(xs, ys, iters=60):
    """Logistic regression on one feature (cosine) — Platt calibration."""
    x = np.asarray(xs, dtype=np.float64)
    y = np.asarray(ys, dtype=np.float64)
    if len(x) == 0 or y.sum() == 0 or y.sum() == len(y):
        return 0.0, 0.0
    xm, xsd = x.mean(), x.std() or 1.0
    xz = (x - xm) / xsd
    a, b = 0.0, float(np.log((y.mean() + 1e-6) / (1 - y.mean() + 1e-6)))
    for _ in range(iters):
        z = a * xz + b
        p = 1.0 / (1.0 + np.exp(-z))
        w = np.maximum(p * (1 - p), 1e-9)
        g = np.array([((p - y) * xz).sum(), (p - y).sum()])
        h = np.array([[float((w * xz * xz).sum()), float((w * xz).sum())],
                      [float((w * xz).sum()), float(w.sum())]]) + 1e-6 * np.eye(2)
        try:
            step = np.linalg.solve(h, g)
        except np.linalg.LinAlgError:
            break
        a -= step[0]
        b -= step[1]
        if np.max(np.abs(step)) < 1e-8:
            break
    return a / xsd, b - a * xm / xsd  # P = sigmoid(slope * cos + intercept)


def _stubs_by_marg(idxs, nbrs, margs):
    """Per record: [(nbr, marg)] sorted by marginal value desc."""
    inside = set(idxs)
    prof = {}
    for i in idxs:
        lst = [(int(j), float(v)) for j, v in zip(nbrs[i], margs[i])
               if int(j) in inside and int(j) != i]
        lst.sort(key=lambda t: -t[1])
        prof[i] = lst
    return prof


def _waterfill(idxs, nbrs, sims, prof, budget):
    """waterfill() ported: cosine-rank-1 floor per record, then the
    highest-marginal-value remaining stubs until `budget` stubs are
    spent; dedup; top up by marginal value to exactly `budget` pairs."""
    floor_stubs = []
    rest = []
    inside = set(idxs)
    for i in idxs:
        cos_order = [(int(j), float(s)) for j, s in zip(nbrs[i], sims[i])
                     if int(j) in inside and int(j) != i]
        marg_of = dict(prof[i])
        for rank, (j, s) in enumerate(cos_order):
            stub = (i, j, marg_of.get(j, 0.0))
            if rank == 0:
                floor_stubs.append(stub)
            else:
                rest.append(stub)
    rest.sort(key=lambda t: -t[2])
    need = budget - len(floor_stubs)
    stubs = floor_stubs + (rest[:need] if need > 0 else [])
    chosen = {}
    for i, j, mg in stubs:
        key = (i, j) if i < j else (j, i)
        chosen[key] = max(chosen.get(key, 0.0), mg)
    if len(chosen) < budget:
        for i, j, mg in rest:
            if len(chosen) >= budget:
                break
            key = (i, j) if i < j else (j, i)
            if key not in chosen:
                chosen[key] = mg
    if len(chosen) > budget:
        chosen = dict(sorted(chosen.items(), key=lambda kv: -kv[1])[:budget])
    return set(chosen)


def _select_by_alloc(prof, alloc, budget, pool_by_marg):
    """Permutation re-selection: each record takes its top-alloc[i]
    stubs by marginal value; dedup; trim/top-up by marginal value."""
    chosen = {}
    for i, lst in prof.items():
        for j, mg in lst[:alloc.get(i, 0)]:
            key = (i, j) if i < j else (j, i)
            chosen[key] = max(chosen.get(key, 0.0), mg)
    if len(chosen) > budget:
        chosen = dict(sorted(chosen.items(), key=lambda kv: -kv[1])[:budget])
    elif len(chosen) < budget:
        for key, mg in pool_by_marg:
            if len(chosen) >= budget:
                break
            if key not in chosen:
                chosen[key] = mg
    return set(chosen)


# ---------------------------------------------------------------- main entry

def budget_lab(rows, cols, truth, id_col=None, truth_col=None, perm_r=19):
    texts = record_texts(rows, cols, id_col=id_col, truth_col=truth_col)
    n = len(rows)
    nbrs, sims, cos = build_pool(texts)
    train_idx, test_idx = split_by_cluster(truth)
    gold_train = gold_pairs(train_idx, truth)
    gold_test = gold_pairs(test_idx, truth)

    # ---- tune k* (harness rule: argmax train PC over {10, 20, 50},
    # first maximum wins) and fit Platt on train only
    train_pc = {}
    for k in TUNE_K:
        train_pc[k] = _pc(set(_topk_pairs(train_idx, nbrs, sims, k)), gold_train)
    best = max(train_pc.values())
    k_star = min(k for k, v in train_pc.items() if v >= best - 1e-12)

    pool_train = _topk_pairs(train_idx, nbrs, sims, POOL_K)
    xs = [s for (i, j), s in pool_train.items()]
    ys = [1.0 if truth[i] == truth[j] else 0.0 for (i, j) in pool_train]
    rng = np.random.RandomState(SEED)
    if len(xs) > 60000:
        sel = rng.choice(len(xs), 60000, replace=False)
        xs = [xs[t] for t in sel]
        ys = [ys[t] for t in sel]
    slope, intercept = _fit_platt(xs, ys)
    margs = [1.0 / (1.0 + np.exp(-(slope * sims[i] + intercept)))
             if len(sims[i]) else sims[i] for i in range(n)]

    # ---- test arms over the k grid
    pool_test = _topk_pairs(test_idx, nbrs, sims, POOL_K)
    comm_of = _communities(test_idx, nbrs, sims)
    prof = _stubs_by_marg(test_idx, nbrs, margs)
    grid = []
    base_pairs = {}
    e2_sets = {}
    for k in GRID_K:
        fixed = _topk_pairs(test_idx, nbrs, sims, k)
        budget = len(fixed)
        base_pairs[k] = budget
        e1 = _e1_pairs(test_idx, nbrs, sims, cos, comm_of, budget, pool_test)
        e2 = _waterfill(test_idx, nbrs, sims, prof, budget)
        e2_sets[k] = e2
        grid.append({
            "k": k,
            "budget": budget,
            "fixed_pc": round(_pc(set(fixed), gold_test), 4),
            "e1_pc": round(_pc(e1, gold_test), 4),
            "e2_pc": round(_pc(e2, gold_test), 4),
        })

    # ---- permutation check for E2 at k*: shuffle the observed degree
    # profile (alloc_of in the harness) across records
    budget_star = base_pairs[k_star]
    e2_star = e2_sets[k_star]
    pc_fixed_star = _pc(set(_topk_pairs(test_idx, nbrs, sims, k_star)), gold_test)
    dpc_obs = _pc(e2_star, gold_test) - pc_fixed_star
    degrees = {i: 0 for i in test_idx}
    for i, j in e2_star:
        degrees[i] += 1
        degrees[j] += 1
    alloc_obs = [degrees[i] for i in test_idx]
    pool_by_marg = {}
    for i, lst in prof.items():
        for j, mg in lst:
            key = (i, j) if i < j else (j, i)
            pool_by_marg[key] = max(pool_by_marg.get(key, 0.0), mg)
    pool_by_marg = sorted(pool_by_marg.items(), key=lambda kv: -kv[1])
    rngp = random.Random(SEED + 1)
    null_dpcs = []
    for _ in range(perm_r):
        shuffled = alloc_obs[:]
        rngp.shuffle(shuffled)
        alloc = {i: c for i, c in zip(test_idx, shuffled)}
        e2_p = _select_by_alloc(prof, alloc, budget_star, pool_by_marg)
        null_dpcs.append(_pc(e2_p, gold_test) - pc_fixed_star)
    null_mean = float(np.mean(null_dpcs)) if null_dpcs else 0.0
    null_sd = float(np.std(null_dpcs)) if null_dpcs else 0.0
    p_val = (1 + sum(1 for d in null_dpcs if d >= dpc_obs)) / (perm_r + 1)

    return {
        "n": n,
        "entities": len(set(truth)),
        "n_train": len(train_idx),
        "n_test": len(test_idx),
        "pool_pairs_test": len(pool_test),
        "gold_pairs_test": len(gold_test),
        "k_star": k_star,
        "train_pc_at_k_star": round(train_pc[k_star], 4),
        "grid": grid,
        "perm": {
            "arm": "E2",
            "at_k": k_star,
            "budget": budget_star,
            "observed_dpc": round(dpc_obs, 4),
            "null_mean": round(null_mean, 4),
            "null_sd": round(null_sd, 4),
            "r": perm_r,
            "p": round(p_val, 3),
        },
    }
