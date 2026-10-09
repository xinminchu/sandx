"""Generate an equivalent R script using the real erbot package."""


def _q(s):
    """Escape a value for embedding in an R double-quoted string."""
    return str(s).replace("\\", "\\\\").replace('"', '\\"')


_CLUSTER_MAP = {"threshold_cc": "threshold_cc", "louvain": "louvain",
                "leiden": "leiden", "label_prop": "label_prop", "gc": "gc",
                "hclust_avg": "hclust_avg", "hclust_ward": "hclust_ward",
                "pam": "pam",
                "same": "same (keep classify labels)"}
_SUPERVISED_R = ("logistic", "lda", "qda", "knn", "wknn", "tree", "rf",
                 "xgboost", "nnet", "fellegi_sunter", "svm_radial")


def r_script(cfg):
    """cfg keys: filename, fields (col->method), block_method, block_key,
    threshold, cluster_method, truth_source, truth_col, truth_filename.
    Returns the R script as one string."""
    filename = _q(cfg["filename"])
    fields = cfg["fields"]
    block_method = _q(cfg["block_method"])
    block_key = cfg.get("block_key")
    threshold = cfg["threshold"]
    block_arg = f', block_key="{_q(block_key)}"' if block_key else ""
    cm = _CLUSTER_MAP.get(cfg["cluster_method"], cfg["cluster_method"])
    spec = ",\n  ".join(
        f'list(name="{_q(col)}", type="{_q(m)}")' for col, m in fields.items()
    )
    supervised = cfg.get("cluster_method") in _SUPERVISED_R
    if cfg.get("cluster_method") == "same":
        tail_cluster = [
            "",
            "# 4. Cluster: same labels as classification (no separate step)",
        ]
    elif supervised:
        ts = cfg.get("truth_source") or "none"
        if ts == "column" and cfg.get("truth_col"):
            tv_line = f'truth_vec <- df[["{_q(cfg["truth_col"])}"]]'
        else:
            tv_line = ("truth_vec <- truth$cluster[match(df$id, truth$id)]"
                       "  # from gold-truth file")
        tail_cluster = [
            "",
            "# 4. Cluster: supervised pair classifier trained on gold truth,",
            "#    then transitive closure over predicted links",
        ]
        if cfg.get("held_out"):
            tail_cluster += [
                "#    Held-out: train on 70% of entities (er_split), evaluate on",
                "#    the other 30% — see er_protocol_b() for the honest protocol",
            ]
        tail_cluster += [
            tv_line,
            f'labels <- er_cluster(S, method="{cm}", sim_list = sim, '
            f"pairs = pairs,",
            f'                     truth_vec = truth_vec, threshold = {threshold})',
        ]
    else:
        tail_cluster = [
            "",
            "# 4. Cluster",
            f'labels <- er_cluster(S, method="{cm}", threshold = {threshold})',
        ]
    classify = cfg.get("classify_method") or "tc"
    same = cfg.get("cluster_method") == "same"
    labvar = "labels" if same else "labs"
    class_lines = []
    if classify == "hc":
        class_lines = [
            "",
            "# 3b. Classification: hierarchical clustering (average linkage)",
            f"{labvar} <- cutree(hclust(as.dist(1 - as.matrix(S)),",
            f'               method = "average"), h = {cfg.get("hc_h", 0.5)})',
        ]
    elif classify == "hdbscan":
        class_lines = [
            "",
            "# 3b. Classification: HDBSCAN on 1 - similarity",
            f"{labvar} <- dbscan::hdbscan(as.dist(1 - as.matrix(S)),",
            f"               minPts = {cfg.get('hdbscan_min_pts', 3)})$cluster",
            "# noise (0) -> singletons, never one giant noise cluster",
            f"{labvar}[{labvar} == 0] <- max({labvar}) + "
            f"seq_len(sum({labvar} == 0))",
        ]
    else:
        class_lines = [
            "",
            "# 3b. Classification: transitive closure over thresholded links",
            f"M <- er_classify(S, method = \"threshold\", threshold = {threshold})",
            f"{labvar} <- er_cluster(M, method = \"threshold_cc\", "
            f"threshold = {threshold})",
        ]
    tail = ["# 5. Inspect", "print(table(labels))"]
    ts = cfg.get("truth_source") or "none"
    if ts == "column" and cfg.get("truth_col"):
        tail += [
            "",
            f"# 6. Evaluate against gold truth (column \"{_q(cfg['truth_col'])}\")",
            "# ev <- er_evaluate(labels, df[[\"%s\"]])" % _q(cfg["truth_col"]),
            "# print(ev$ari)",
        ]
    elif ts == "file":
        tf = _q(cfg.get("truth_filename") or "truth.csv")
        tail += [
            "",
            "# 6. Evaluate against a separate gold-truth file",
            f"# truth <- read.csv(\"{tf}\", stringsAsFactors = FALSE)",
            "# ev <- er_evaluate(labels, truth$cluster[match(df$id, truth$id)])",
            "# print(ev$ari)",
        ]
    return "\n".join([
        "# Equivalent run with the real erbot R package",
        "# install: remotes::install_github('xinminchu/erbot')",
        "library(erbot)",
        "",
        f'df <- read.csv("{filename}", stringsAsFactors = FALSE)',
        "",
        "# 1. Blocking: candidate pairs",
        f'pairs <- er_block(df, method="{block_method}"{block_arg})',
        "",
        "# 2. Per-field NA-aware similarities",
        "spec <- list(",
        f"  {spec}",
        ")",
        "sim <- er_similarity(df, pairs, spec = spec)",
        "",
        "# 3. Combine into one sparse similarity matrix",
        "S <- er_pairs_to_sparse(pairs, er_combine(sim), n = nrow(df))",
        *class_lines,
        *tail_cluster,
        "",
        *tail,
    ]) + "\n"
