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
