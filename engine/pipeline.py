"""End-to-end pipeline: block -> similarity -> combine -> cluster -> evaluate."""
from .blocking import block
from .cluster import louvain, threshold_cc
from .evaluate import adjusted_rand
from .similarity import combine, pair_sims


def run(df, fields, block_method="standard", block_key=None, threshold=0.5,
        cluster_method="threshold_cc", truth_col=None, max_pairs=200000,
        prefix_len=3, window=20):
    """Run the full pipeline; return a result dict."""
    n = len(df)
    pairs = block(df, block_method, key=block_key, prefix_len=prefix_len,
                  window=window, max_pairs=max_pairs)
    scores = combine(pair_sims(df, pairs, fields))
    if cluster_method == "threshold_cc":
        labels = threshold_cc(pairs, scores, threshold, n)
    elif cluster_method == "louvain":
        labels = louvain(pairs, scores, n)
    else:
        raise ValueError(f"unknown cluster method: {cluster_method}")

    ari = None
    if truth_col is not None:
        tmap, truth = {}, []
        for r in df:
            v = r.get(truth_col)
            if v not in tmap:
                tmap[v] = len(tmap)
            truth.append(tmap[v])
        ari = adjusted_rand(truth, labels)

    counts = {}
    for lab in labels:
        counts[lab] = counts.get(lab, 0) + 1
    return {
        "labels": labels,
        "n_records": n,
        "n_pairs": len(pairs),
        "n_clusters": len(counts),
        "ari": ari,
        "cluster_sizes": sorted(counts.values(), reverse=True),
    }


if __name__ == "__main__":
    toy = [
        {"name": "apple inc", "city": "new york", "truth": 1},
        {"name": "apple incorporated", "city": "new york", "truth": 1},
        {"name": "apple corp", "city": "boston", "truth": 1},
        {"name": "banana ltd", "city": "austin", "truth": 2},
        {"name": "banana limited", "city": "austin", "truth": 2},
        {"name": "cherry co", "city": "denver", "truth": 3},
    ]
    res = run(toy, {"name": "jw", "city": "jw"}, block_method="none",
              threshold=0.5, truth_col="truth")
    print(res)
