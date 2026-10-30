"""Generate an equivalent R script using the real erbot package."""


def _q(s):
    """Escape a value for embedding in an R double-quoted string."""
    return str(s).replace("\\", "\\\\").replace('"', '\\"')


_CLUSTER_MAP = {"tc": "threshold_cc"}
_SUPERVISED_R = ("logistic", "lda", "qda", "knn", "wknn", "tree", "rf",
                 "xgboost", "nnet", "fellegi_sunter", "svm_radial")


def r_script(cfg):
    """cfg keys: filename, fields (col->method), block_method, block_key,
    threshold, classify_method, cluster_method, truth_source, truth_col,
    truth_filename.
    Returns the R script as one string."""
    filename = _q(cfg["filename"])
    fields = cfg["fields"]
    block_method = _q(cfg["block_method"])
    block_key = cfg.get("block_key")
    threshold = cfg["threshold"]
    block_arg = f', block_key="{_q(block_key)}"' if block_key else ""
    spec = ",\n  ".join(
        f'list(name="{_q(col)}", type="{_q(m)}")' for col, m in fields.items()
    )
    # ---- 3. Classify: pairs -> links (M) ----
    classify = cfg.get("classify_method") or "threshold"
    class_lines = []
    if classify == "threshold":
        class_lines = [
            "",
            "# 3. Classify: thresholded links (unsupervised)",
            f'M <- er_classify(S, method = "threshold", threshold = {threshold})',
        ]
    else:  # supervised pair classifier
        ts = cfg.get("truth_source") or "none"
        if ts == "column" and cfg.get("truth_col"):
            tv_line = f'truth_vec <- df[["{_q(cfg["truth_col"])}"]]'
        else:
            tv_line = ("truth_vec <- truth$cluster[match(df$id, truth$id)]"
                       "  # from gold-truth file")
        class_lines = [
            "",
            f"# 3. Classify: supervised pair classifier ({classify}),",
            "#    trained on gold-truth pairs; links = P(match) >= threshold",
        ]
        if cfg.get("held_out"):
            class_lines += [
                "#    Held-out: train on 70% of entities (er_split), evaluate on",
                "#    the other 30% — see er_protocol_b() for the honest protocol",
            ]
        class_lines += [
            tv_line,
            f'M <- er_classify(S, method = "{_q(classify)}", pairs = pairs,',
            f"                     sim_list = sim, truth_vec = truth_vec,",
            f"                     threshold = {threshold})",
        ]
    # ---- 4. Cluster: links -> entity labels ----
    cluster = cfg.get("cluster_method") or "tc"
    cm = _CLUSTER_MAP.get(cluster, cluster)
    tail_cluster = [
        "",
        "# 4. Cluster: group links into entities",
        f'labels <- er_cluster(M, method = "{_q(cm)}"',
    ]
    if cluster == "hc":
        tail_cluster[-1] += f", h = {cfg.get('hc_h', 0.5)})"
    elif cluster == "hdbscan":
        tail_cluster[-1] += f", minPts = {cfg.get('hdbscan_min_pts', 3)})"
    else:
        tail_cluster[-1] += ")"
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
