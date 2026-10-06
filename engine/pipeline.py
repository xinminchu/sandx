"""End-to-end pipeline: block -> similarity -> classify -> cluster -> evaluate.

Classify (advisor's trio, from er_modular.R cluster_scores):
  tc:     connected components of pairs with score >= threshold
          (transitive closure)
  hc:     average-linkage agglomerative on 1 - score, cut at height h
  dbscan: classic DBSCAN on 1 - score; noise -> singletons

Cluster (final labeling):
  same:          keep classify labels
  threshold_cc / louvain: re-cluster the pair graph (unsupervised)
  logistic / lda / qda / knn / fellegi_sunter:
                 supervised: train on truth-labeled pairs, predict all
                 pairs, transitive-closure on predicted links
                 (mirrors ERBOT er_cluster's supervised branch)

Pairs stream; only what downstream stages need is retained.
"""
from array import array

from .blocking import block
from .cluster import (
    dbscan,
    hierarchical,
    louvain_edges,
    threshold_cc_edges,
)
from .evaluate import adjusted_rand, b3_prf, pairwise_prf
from .similarity import _clean, sim_cleaned
from .supervised import train as train_classifier

LOUVAIN_PAIR_CAP = 300_000  # networkx greedy modularity gets slow past this
HC_N_CAP = 2500

CLASSIFY_METHODS = ("tc", "hc", "dbscan")
CLUSTER_METHODS = (
    "same",
    "threshold_cc",
    "louvain",
    "logistic",
    "lda",
    "qda",
    "knn",
    "fellegi_sunter",
)
SUPERVISED_METHODS = ("logistic", "lda", "qda", "knn", "fellegi_sunter")


def _iter_none_pairs(n, max_pairs):
    count = n * (n - 1) // 2
    if count > max_pairs:
        raise ValueError(f"pair budget exceeded: {count} > {max_pairs}")
    for i in range(n):
        for j in range(i + 1, n):
            yield i, j


def _union_find_labels(links, n):
    return threshold_cc_edges(links, n)


def run(df, fields, block_method="standard", block_key=None,
        classify_method="tc", threshold=0.5,
        hc_h=0.5, dbscan_eps=0.3, dbscan_min_pts=3,
        cluster_method="same",
        truth_col=None, max_pairs=2000000,
        prefix_len=3, window=20, truth=None):
    """Run the full pipeline; return a result dict.

    `truth` is an optional list aligned with df (None = unknown record);
    it takes precedence over `truth_col`. Metrics are computed over the
    subset of records that have truth.
    """
    n = len(df)
    cols = list(fields)
    meths = [fields[c] for c in cols]
    k_fields = len(cols)
    # Pre-clean each match column once; the hot loop then skips cleaning.
    cvecs = [[_clean(r.get(c)) for r in df] for c in cols]

    if classify_method not in CLASSIFY_METHODS:
        raise ValueError(f"unknown classify method: {classify_method}")
    if cluster_method not in CLUSTER_METHODS:
        raise ValueError(f"unknown cluster method: {cluster_method}")
    if classify_method == "hc" and n > HC_N_CAP:
        raise ValueError(
            f"hierarchical clustering needs n <= {HC_N_CAP} for the demo "
            f"(got {n}); use transitive closure or DBSCAN."
        )

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
            "use transitive closure or add blocking."
        )

    need_pairs = cluster_method in ("threshold_cc", "louvain") or \
        cluster_method in SUPERVISED_METHODS
    need_features = cluster_method in SUPERVISED_METHODS
    if need_features and truth is None and truth_col is None:
        raise ValueError(
            f"{cluster_method} is supervised and needs gold truth — "
            "attach truth in step 2."
        )

    # ---- Score pairs (single streaming pass) ----
    tc_links = []
    hc_triples = [] if classify_method == "hc" else None
    db_adj = None
    if classify_method == "dbscan":
        db_cutoff = 1.0 - dbscan_eps
        db_adj = [set() for _ in range(n)]
    t_pi, t_pj, t_ps = array("i"), array("i"), array("d")
    feat_flat = array("d") if need_features else None

    n_pairs = 0
    for i, j in pair_iter:
        n_pairs += 1
        feats = []
        tot, cnt = 0.0, 0
        for cv, m in zip(cvecs, meths):
            a, b = cv[i], cv[j]
            if a is None or b is None:
                feats.append(float("nan"))
                continue
            s = sim_cleaned(a, b, m)
            feats.append(s)
            tot += s
            cnt += 1
        score = tot / cnt if cnt else 0.0

        if classify_method == "tc":
            if score >= threshold:
                tc_links.append((i, j))
        elif classify_method == "hc":
            hc_triples.append((i, j, score))
        else:  # dbscan
            if score >= db_cutoff:
                db_adj[i].add(j)
                db_adj[j].add(i)

        if need_pairs and score > 0:
            t_pi.append(i)
            t_pj.append(j)
            t_ps.append(score)
        if feat_flat is not None:
            for f in feats:
                feat_flat.append(0.0 if f != f else f)  # nan -> 0.0

    # ---- Classify -> labels0 ----
    if classify_method == "tc":
        labels0 = _union_find_labels(tc_links, n)
    elif classify_method == "hc":
        labels = hierarchical(n, hc_triples, h=hc_h)
        labels0 = labels
    else:
        # rebuild triple list for dbscan from adjacency
        triples = []
        for i in range(n):
            for j in db_adj[i]:
                if j > i:
                    triples.append((i, j, 1.0))  # score unused; adjacency only
        labels0 = dbscan(n, triples, eps=dbscan_eps, min_pts=dbscan_min_pts)

    # ---- Cluster -> final labels ----
    warnings = []
    if cluster_method == "same":
        labels = labels0
    elif cluster_method == "threshold_cc":
        links = [(int(t_pi[t]), int(t_pj[t])) for t in range(len(t_pi))
                 if t_ps[t] >= threshold]
        labels = _union_find_labels(links, n)
    elif cluster_method == "louvain":
        edges = [(int(t_pi[t]), int(t_pj[t]), t_ps[t]) for t in range(len(t_pi))]
        labels = louvain_edges(edges, n)
    else:  # supervised: warn and keep classify labels when untrainable
        try:
            labels = _supervised_labels(
                n, k_fields, feat_flat, t_pi, t_pj,
                truth if truth is not None else _truth_from_col(df, truth_col),
                cluster_method, threshold,
            )
        except ValueError as e:
            warnings.append(str(e) + " Keeping classify labels.")
            labels = labels0

    # ---- Evaluate ----
    tvec = truth
    if tvec is None and truth_col is not None:
        tvec = _truth_from_col(df, truth_col)
    metrics = None
    ari = None
    if tvec is not None:
        sub = [(t, p) for t, p in zip(tvec, labels) if t is not None]
        if len(sub) >= 2:
            tt = [t for t, _ in sub]
            pp = [p for _, p in sub]
            ari = adjusted_rand(tt, pp)
            metrics = {
                "ari": ari,
                "pairwise": pairwise_prf(tt, pp),
                "b3": b3_prf(tt, pp),
                "n_truth": len(sub),
                "n_true_clusters": len(set(tt)),
            }

    counts = {}
    for lab in labels:
        counts[lab] = counts.get(lab, 0) + 1
    return {
        "labels": labels,
        "n_records": n,
        "n_pairs": n_pairs,
        "n_links": len(tc_links) if classify_method == "tc" else None,
        "n_clusters": len(counts),
        "ari": ari,
        "metrics": metrics,
        "cluster_sizes": sorted(counts.values(), reverse=True),
        "warnings": warnings,
    }


def _truth_from_col(df, truth_col):
    tmap, tvec = {}, []
    for r in df:
        v = r.get(truth_col)
        if v not in tmap:
            tmap[v] = len(tmap)
        tvec.append(tmap[v])
    return tvec


def _supervised_labels(n, k_fields, feat_flat, t_pi, t_pj, tvec, method, threshold):
    """Train on truth-labeled pairs, predict all, transitive closure."""
    n_pairs = len(t_pi)
    # pair labels: 1 if same true cluster (both endpoints labeled)
    y = []
    lab_mask = []
    for t in range(n_pairs):
        ti = tvec[t_pi[t]]
        tj = tvec[t_pj[t]]
        if ti is None or tj is None:
            lab_mask.append(False)
            y.append(0)
        else:
            lab_mask.append(True)
            y.append(1 if ti == tj else 0)
    X_train = []
    y_train = []
    for t in range(n_pairs):
        if lab_mask[t]:
            X_train.append([feat_flat[t * k_fields + f] for f in range(k_fields)])
            y_train.append(y[t])
    if len(X_train) < 10 or len(set(y_train)) < 2:
        raise ValueError(
            f"{method}: too few truth-labeled pairs to train "
            f"({len(X_train)} usable, need >= 10 with both classes)."
        )
    clf = train_classifier(method, X_train, y_train)
    X_all = [[feat_flat[t * k_fields + f] for f in range(k_fields)]
             for t in range(n_pairs)]
    probs = clf.predict_proba(X_all)
    links = [(int(t_pi[t]), int(t_pj[t])) for t in range(n_pairs)
             if probs[t] >= threshold]
    return _union_find_labels(links, n)


if __name__ == "__main__":
    toy = [
        {"name": "apple inc", "city": "new york", "truth": 1},
        {"name": "apple incorporated", "city": "new york", "truth": 1},
        {"name": "apple corp", "city": "boston", "truth": 1},
        {"name": "banana ltd", "city": "austin", "truth": 2},
        {"name": "banana limited", "city": "austin", "truth": 2},
        {"name": "cherry co", "city": "denver", "truth": 3},
    ]
    for cm in ("tc", "hc", "dbscan"):
        res = run(toy, {"name": "jw", "city": "jw"}, block_method="none",
                  classify_method=cm, threshold=0.5, truth_col="truth")
        print(cm, {k: v for k, v in res.items() if k != "labels"})
    res = run(toy, {"name": "jw", "city": "jw"}, block_method="none",
              classify_method="tc", cluster_method="logistic", truth_col="truth")
    print("tc+logistic", {k: v for k, v in res.items() if k != "labels"})
