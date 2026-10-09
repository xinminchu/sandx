"""End-to-end pipeline: block -> similarity -> classify -> cluster -> evaluate.

Classify (advisor's trio, from er_modular.R cluster_scores):
  tc:     connected components of pairs with score >= threshold
          (transitive closure)
  hc:     average-linkage agglomerative on 1 - score, cut at height h
  hdbscan: HDBSCAN on 1 - score (no eps); noise -> singletons

Cluster (final labeling):
  same:          keep classify labels
  threshold_cc / louvain / leiden / label_prop / gc: re-cluster the pair
                 graph (unsupervised)
  hclust_avg / hclust_ward / pam: dense-distance methods on 1 - score,
                 k tuned by silhouette (mirrors er_cluster)
  logistic / lda / qda / knn / wknn / tree / rf / xgboost / nnet /
  fellegi_sunter / svm_radial:
                 supervised: train on truth-labeled pairs, predict all
                 pairs, transitive-closure on predicted links
                 (mirrors ERBOT er_cluster's supervised branch)

Pairs stream; only what downstream stages need is retained.
"""
from array import array

from .blocking import block
from .cluster import (
    _hdbscan_matrix,
    gc,
    hclust_avg,
    hclust_ward,
    hierarchical,
    label_prop,
    leiden,
    louvain_edges,
    pam,
    threshold_cc_edges,
)
from .evaluate import adjusted_rand, b3_prf, pairwise_prf
from .similarity import _clean, sim_cleaned
from .supervised import train as train_classifier

LOUVAIN_PAIR_CAP = 300_000  # networkx greedy modularity gets slow past this
HC_N_CAP = 2500
DENSE_N_CAP = 1500  # hclust/pam need a dense n x n distance matrix

CLASSIFY_METHODS = ("tc", "hc", "hdbscan")
GRAPH_METHODS = ("threshold_cc", "louvain", "leiden", "label_prop", "gc")
DENSE_METHODS = ("hclust_avg", "hclust_ward", "pam")
CLUSTER_METHODS = (
    "same",
    "threshold_cc",
    "louvain",
    "leiden",
    "label_prop",
    "gc",
    "hclust_avg",
    "hclust_ward",
    "pam",
    "logistic",
    "lda",
    "qda",
    "knn",
    "wknn",
    "tree",
    "rf",
    "xgboost",
    "nnet",
    "fellegi_sunter",
    "svm_radial",
)
SUPERVISED_METHODS = ("logistic", "lda", "qda", "knn", "wknn", "tree", "rf",
                      "xgboost", "nnet", "fellegi_sunter", "svm_radial")


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
        hc_h=0.5, hdbscan_min_pts=3,
        cluster_method="same",
        truth_col=None, max_pairs=2000000,
        prefix_len=3, window=20, truth=None, held_out=False,
        time_budget=45):
    """Run the full pipeline; return a result dict.

    `truth` is an optional list aligned with df (None = unknown record);
    it takes precedence over `truth_col`. Metrics are computed over the
    subset of records that have truth.
    `time_budget` caps wall-clock seconds; exceeding it raises TimeoutError
    with a user-actionable message instead of being killed silently.
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
            f"(got {n}); use transitive closure or HDBSCAN."
        )

    if block_method == "none":
        pair_iter = _iter_none_pairs(n, max_pairs)
        n_pairs_expected = n * (n - 1) // 2
    else:
        pairs = block(df, block_method, key=block_key, prefix_len=prefix_len,
                      window=window, max_pairs=max_pairs)
        pair_iter = iter(pairs)
        n_pairs_expected = len(pairs)

    if cluster_method in ("louvain", "leiden") and \
            n_pairs_expected > LOUVAIN_PAIR_CAP:
        raise ValueError(
            f"{cluster_method} on {n_pairs_expected:,} pairs is too heavy for "
            "the demo; use transitive closure or add blocking."
        )
    if cluster_method in DENSE_METHODS and n > DENSE_N_CAP:
        raise ValueError(
            f"{cluster_method} needs a dense distance matrix "
            f"(n <= {DENSE_N_CAP} for the demo, got {n}); use transitive "
            "closure, louvain, or run a sample first."
        )

    need_pairs = cluster_method in GRAPH_METHODS + DENSE_METHODS or \
        cluster_method in SUPERVISED_METHODS
    need_features = cluster_method in SUPERVISED_METHODS
    if need_features and truth is None and truth_col is None:
        raise ValueError(
            f"{cluster_method} is supervised and needs gold truth — "
            "attach truth in step 2."
        )

    # ---- Score pairs (single streaming pass) ----
    import numpy as np
    import time as _time
    _t0 = _time.monotonic()
    _next_check = 50000

    def _check_budget(where):
        if _time.monotonic() - _t0 > time_budget:
            raise TimeoutError(
                f"run timed out after {time_budget}s during {where} "
                f"({n_pairs:,} pairs scored). Try: blocking instead of "
                "'none', fewer match fields, or run a sample first."
            )

    tc_links = []
    hc_triples = [] if classify_method == "hc" else None
    hdb_D = None
    if classify_method == "hdbscan":
        hdb_D = np.full((n, n), 1.0, dtype=np.float64)
    t_pi, t_pj, t_ps = array("i"), array("i"), array("d")
    feat_flat = array("d") if need_features else None

    n_pairs = 0
    for i, j in pair_iter:
        n_pairs += 1
        if n_pairs >= _next_check:
            _next_check += 50000
            _check_budget("pair scoring")
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
        else:  # hdbscan
            d = 1.0 - score
            if d < hdb_D[i, j]:
                hdb_D[i, j] = d
                hdb_D[j, i] = d

        if need_pairs and score > 0:
            t_pi.append(i)
            t_pj.append(j)
            t_ps.append(score)
        if feat_flat is not None:
            for f in feats:
                feat_flat.append(0.0 if f != f else f)  # nan -> 0.0

    # ---- Classify -> labels0 ----
    _check_budget("classification")
    if classify_method == "tc":
        labels0 = _union_find_labels(tc_links, n)
    elif classify_method == "hc":
        labels = hierarchical(n, hc_triples, h=hc_h)
        labels0 = labels
    else:  # hdbscan
        labels0 = _hdbscan_matrix(n, hdb_D, min_pts=hdbscan_min_pts)

    # ---- Cluster -> final labels ----
    warnings = []
    train_entities = None
    test_entities = None
    held_out_active = False
    if cluster_method == "same":
        labels = labels0
    elif cluster_method == "threshold_cc":
        links = [(int(t_pi[t]), int(t_pj[t])) for t in range(len(t_pi))
                 if t_ps[t] >= threshold]
        labels = _union_find_labels(links, n)
    elif cluster_method == "louvain":
        edges = [(int(t_pi[t]), int(t_pj[t]), t_ps[t]) for t in range(len(t_pi))]
        labels = louvain_edges(edges, n)
    elif cluster_method == "leiden":
        pl = [int(t_pi[t]) for t in range(len(t_pi))]
        pj = [int(t_pj[t]) for t in range(len(t_pi))]
        ps = [float(t_ps[t]) for t in range(len(t_pi))]
        labels = leiden(list(zip(pl, pj)), ps, n)
    elif cluster_method == "label_prop":
        pl = [int(t_pi[t]) for t in range(len(t_pi))]
        pj = [int(t_pj[t]) for t in range(len(t_pi))]
        ps = [float(t_ps[t]) for t in range(len(t_pi))]
        labels = label_prop(list(zip(pl, pj)), ps, n)
    elif cluster_method == "gc":
        pl = [int(t_pi[t]) for t in range(len(t_pi))]
        pj = [int(t_pj[t]) for t in range(len(t_pi))]
        ps = [float(t_ps[t]) for t in range(len(t_pi))]
        labels = gc(list(zip(pl, pj)), ps, n, threshold=threshold)
    elif cluster_method in DENSE_METHODS:
        triples = [(int(t_pi[t]), int(t_pj[t]), float(t_ps[t]))
                   for t in range(len(t_pi))]
        if cluster_method == "hclust_avg":
            labels = hclust_avg(n, triples)
        elif cluster_method == "hclust_ward":
            labels = hclust_ward(n, triples)
        else:  # pam
            labels = pam(n, triples)
    else:  # supervised: warn and keep classify labels when untrainable
        tvec_sup = truth if truth is not None else _truth_from_col(df, truth_col)
        if held_out and tvec_sup is not None:
            train_entities, test_entities = _entity_split(tvec_sup)
            if train_entities is not None:
                held_out_active = True
            else:
                warnings.append(
                    "Held-out requested but too few truth entities "
                    "(need >= 10); evaluated in-sample instead."
                )
        try:
            labels = _supervised_labels(
                n, k_fields, feat_flat, t_pi, t_pj,
                tvec_sup,
                cluster_method, threshold,
                train_entities=train_entities,
                deadline=_t0 + time_budget,
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
        if held_out_active:
            sub = [(t, p) for t, p in zip(tvec, labels)
                   if t is not None and t in test_entities]
        else:
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
                "held_out": held_out_active,
            }
            if held_out_active:
                metrics["n_train_entities"] = len(train_entities)
                metrics["n_test_entities"] = len(test_entities)

    counts = {}
    for lab in labels:
        counts[lab] = counts.get(lab, 0) + 1

    # ---- Classify-stage snapshot (so users can judge "same as classify") ----
    classify_n_clusters = len(set(labels0))
    classify_metrics = None
    if tvec is not None and cluster_method != "same":
        if held_out_active:
            csub = [(t, p) for t, p in zip(tvec, labels0)
                    if t is not None and t in test_entities]
        else:
            csub = [(t, p) for t, p in zip(tvec, labels0) if t is not None]
        if len(csub) >= 2:
            ctt = [t for t, _ in csub]
            cpp = [p for _, p in csub]
            classify_metrics = {
                "ari": adjusted_rand(ctt, cpp),
                "pairwise": pairwise_prf(ctt, cpp),
                "b3": b3_prf(ctt, cpp),
            }

    return {
        "labels": labels,
        "n_records": n,
        "n_pairs": n_pairs,
        "n_links": len(tc_links) if classify_method == "tc" else None,
        "n_clusters": len(counts),
        "ari": ari,
        "metrics": metrics,
        "classify_n_clusters": classify_n_clusters,
        "classify_metrics": classify_metrics,
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


def _supervised_labels(n, k_fields, feat_flat, t_pi, t_pj, tvec, method, threshold,
                      train_entities=None, deadline=None):
    """Train on truth-labeled pairs, predict all, transitive closure.

    train_entities: optional set of truth-entity ids to train on (held-out).
    When given, only pairs with both endpoints in train_entities are used
    for training; prediction still covers all pairs.
    deadline: optional monotonic timestamp; exceeding it raises TimeoutError.
    """
    import time as _time

    def _check(where):
        if deadline is not None and _time.monotonic() > deadline:
            raise TimeoutError(
                f"run timed out during supervised {method} {where}. Try: "
                "blocking instead of 'none', fewer match fields, or a sample."
            )
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
        if not lab_mask[t]:
            continue
        if train_entities is not None:
            ti = tvec[t_pi[t]]
            tj = tvec[t_pj[t]]
            if ti not in train_entities or tj not in train_entities:
                continue
        X_train.append([feat_flat[t * k_fields + f] for f in range(k_fields)])
        y_train.append(y[t])
    if len(X_train) < 10 or len(set(y_train)) < 2:
        raise ValueError(
            f"{method}: too few truth-labeled pairs to train "
            f"({len(X_train)} usable, need >= 10 with both classes)."
        )
    _check("training")
    clf = train_classifier(method, X_train, y_train)
    X_all = [[feat_flat[t * k_fields + f] for f in range(k_fields)]
             for t in range(n_pairs)]
    _check("prediction")
    probs = clf.predict_proba(X_all)
    links = [(int(t_pi[t]), int(t_pj[t])) for t in range(n_pairs)
             if probs[t] >= threshold]
    return _union_find_labels(links, n)


def _entity_split(tvec, train_frac=0.7, seed=42):
    """Split truth entities into train/test sets (entity-disjoint).

    Returns (train_entities, test_entities) as sets of entity ids, or
    (None, None) when there are too few entities for a meaningful split.
    """
    import random
    entities = sorted({t for t in tvec if t is not None})
    if len(entities) < 10:
        return None, None
    rng = random.Random(seed)
    shuffled = entities[:]
    rng.shuffle(shuffled)
    n_train = max(1, int(len(shuffled) * train_frac))
    train = set(shuffled[:n_train])
    test = set(shuffled[n_train:])
    if not test:
        return None, None
    return train, test


if __name__ == "__main__":
    toy = [
        {"name": "apple inc", "city": "new york", "truth": 1},
        {"name": "apple incorporated", "city": "new york", "truth": 1},
        {"name": "apple corp", "city": "boston", "truth": 1},
        {"name": "banana ltd", "city": "austin", "truth": 2},
        {"name": "banana limited", "city": "austin", "truth": 2},
        {"name": "cherry co", "city": "denver", "truth": 3},
    ]
    for cm in ("tc", "hc", "hdbscan"):
        res = run(toy, {"name": "jw", "city": "jw"}, block_method="none",
                  classify_method=cm, threshold=0.5, truth_col="truth")
        print(cm, {k: v for k, v in res.items() if k != "labels"})
    res = run(toy, {"name": "jw", "city": "jw"}, block_method="none",
              classify_method="tc", cluster_method="logistic", truth_col="truth")
    print("tc+logistic", {k: v for k, v in res.items() if k != "labels"})
