"""Adjusted Rand Index, pure Python (no sklearn)."""


def adjusted_rand(truth, pred):
    """ARI in [-1, 1]; 1.0 on perfect agreement; 0.0 when denominator is 0."""
    n = len(truth)
    if n != len(pred):
        raise ValueError("truth and pred must have the same length")
    t_ids, p_ids = {}, {}
    for t in truth:
        t_ids.setdefault(t, len(t_ids))
    for p in pred:
        p_ids.setdefault(p, len(p_ids))
    cont = [[0] * len(p_ids) for _ in range(len(t_ids))]
    for t, p in zip(truth, pred):
        cont[t_ids[t]][p_ids[p]] += 1

    def c2(x):
        return x * (x - 1) // 2

    sum_comb = sum(c2(c) for row in cont for c in row)
    sum_row = sum(c2(sum(row)) for row in cont)
    sum_col = sum(
        c2(sum(cont[r][c] for r in range(len(t_ids))))
        for c in range(len(p_ids))
    )
    total = c2(n)
    expected = sum_row * sum_col / total if total else 0.0
    denom = 0.5 * (sum_row + sum_col) - expected
    if denom == 0:
        return 0.0
    return (sum_comb - expected) / denom


def pairwise_prf(truth, pred):
    """Pairwise precision/recall/F1 over record pairs.

    A pair counts as predicted-positive when both records land in the same
    predicted cluster, and true-positive when they share a true cluster.
    """
    tp = fp = fn = 0
    n = len(truth)
    for i in range(n):
        ti, pi = truth[i], pred[i]
        for j in range(i + 1, n):
            st = truth[j] == ti
            sp = pred[j] == pi
            if sp and st:
                tp += 1
            elif sp:
                fp += 1
            elif st:
                fn += 1
    prec = tp / (tp + fp) if tp + fp else 0.0
    rec = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
    return {"precision": prec, "recall": rec, "f1": f1}


def b3_prf(truth, pred):
    """B-cubed precision/recall/F1: per-record scores, then averaged."""
    from collections import defaultdict

    t_members = defaultdict(set)
    p_members = defaultdict(set)
    for idx, (t, p) in enumerate(zip(truth, pred)):
        t_members[t].add(idx)
        p_members[p].add(idx)
    ps, rs = [], []
    for idx, (t, p) in enumerate(zip(truth, pred)):
        inter = len(t_members[t] & p_members[p])
        ps.append(inter / len(p_members[p]))
        rs.append(inter / len(t_members[t]))
    prec = sum(ps) / len(ps) if ps else 0.0
    rec = sum(rs) / len(rs) if rs else 0.0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
    return {"precision": prec, "recall": rec, "f1": f1}
