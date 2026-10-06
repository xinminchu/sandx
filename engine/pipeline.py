"""End-to-end pipeline: block -> similarity -> combine -> cluster -> evaluate.

Pairs are streamed and only surviving edges are kept, so large unblocked
runs (a few million pairs) stay within serverless memory/time budgets.
"""
from .blocking import block
from .cluster import louvain_edges, threshold_cc_edges
from .evaluate import adjusted_rand
from .similarity import _clean, sim_cleaned

LOUVAIN_PAIR_CAP = 300_000  # networkx greedy modularity gets slow past this


def _iter_none_pairs(n, max_pairs):
    count = n * (n - 1) // 2
    if count > max_pairs:
        raise ValueError(f"pair budget exceeded: {count} > {max_pairs}")
    for i in range(n):
        for j in range(i + 1, n):
            yield i, j


def run(df, fields, block_method="standard", block_key=None, threshold=0.5,
        cluster_method="threshold_cc", truth_col=None, max_pairs=2000000,
        prefix_len=3, window=20, truth=None):
    """Run the full pipeline; return a result dict.

    `truth` is an optional list aligned with df (None = unknown record);
    it takes precedence over `truth_col`. ARI is computed over the subset
    of records that have truth.
    """
    n = len(df)
    cols = list(fields)
    meths = [fields[c] for c in cols]
    # Pre-clean each match column once; the hot loop then skips cleaning.
    cvecs = [[_clean(r.get(c)) for r in df] for c in cols]

    if block_method == "none":
        pair_iter = _iter_none_pairs(n, max_pairs)
        n_pairs_expected = n * (n - 1) // 2
    else:
        pairs = block(df, block_method, key=block_key, prefix_len=prefix_len,
                      window=window, max_pairs=max_pairs)
        pair_iter = iter(pairs)
        n_pairs_expected = len(pairs)

    if cluster_method == "louvain" and n_pairs_expected > LOUVAIN_PAIR_CAP:
        raise ValueError(
            f"louvain on {n_pairs_expected:,} pairs is too heavy for the demo; "
            "use threshold_cc or add blocking."
        )
    if cluster_method not in ("threshold_cc", "louvain"):
        raise ValueError(f"unknown cluster method: {cluster_method}")

    edges = []  # (i, j) for threshold_cc; (i, j, score) for louvain
    n_pairs = 0
    use_louvain = cluster_method == "louvain"
    for i, j in pair_iter:
        n_pairs += 1
        tot, cnt = 0.0, 0
        for cv, m in zip(cvecs, meths):
            a, b = cv[i], cv[j]
            if a is None or b is None:
                continue
            tot += sim_cleaned(a, b, m)
            cnt += 1
        score = tot / cnt if cnt else 0.0
        if use_louvain:
            if score > 0:
                edges.append((i, j, score))
        elif score >= threshold:
            edges.append((i, j))

    labels = louvain_edges(edges, n) if use_louvain else threshold_cc_edges(edges, n)

    tvec = truth
    if tvec is None and truth_col is not None:
        tmap, tvec = {}, []
        for r in df:
            v = r.get(truth_col)
            if v not in tmap:
                tmap[v] = len(tmap)
            tvec.append(tmap[v])
    ari = None
    if tvec is not None:
        sub = [(t, p) for t, p in zip(tvec, labels) if t is not None]
        if len(sub) >= 2:
            ari = adjusted_rand([t for t, _ in sub], [p for _, p in sub])

    counts = {}
    for lab in labels:
        counts[lab] = counts.get(lab, 0) + 1
    return {
        "labels": labels,
        "n_records": n,
        "n_pairs": n_pairs,
        "n_clusters": len(counts),
        "ari": ari,
        "cluster_sizes": sorted(counts.values(), reverse=True),
    }


if __name__ == "__main__":
    toy = [
        {"name": "apple inc", "city": "new york", "truth": 1},
        {"name": "apple incorporated", "city": "new york", "truth": 1},
        {"name": "banana ltd", "city": "austin", "truth": 2},
        {"name": "banana limited", "city": "austin", "truth": 2},
        {"name": "cherry co", "city": "denver", "truth": 3},
    ]
    res = run(toy, {"name": "jw", "city": "jw"}, block_method="none",
              threshold=0.5, truth_col="truth")
    print({k: v for k, v in res.items() if k != "labels"})
