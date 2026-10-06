"""Generate an equivalent R script using the real erbot package."""


def _q(s):
    """Escape a value for embedding in an R double-quoted string."""
    return str(s).replace("\\", "\\\\").replace('"', '\\"')


_CLUSTER_MAP = {"threshold_cc": "threshold_cc", "louvain": "louvain"}


def r_script(cfg):
    """cfg keys: filename, fields (col->method), block_method, block_key,
    threshold, cluster_method, truth_source, truth_col, truth_filename.
    Returns the R script as one string."""
    filename = _q(cfg["filename"])
    fields = cfg["fields"]
    block_method = _q(cfg["block_method"])
    block_key = cfg.get("block_key")
    threshold = cfg["threshold"]
    cm = _CLUSTER_MAP.get(cfg["cluster_method"], cfg["cluster_method"])
    spec = ",\n  ".join(
        f'list(name="{_q(col)}", type="{_q(m)}")' for col, m in fields.items()
    )
    block_arg = f', block_key="{_q(block_key)}"' if block_key else ""
    cm = _CLUSTER_MAP.get(cfg["cluster_method"], cfg["cluster_method"])
    classify = cfg.get("classify_method") or "threshold"
    class_lines = []
    if classify == "topk":
        k = cfg.get("top_k", 3)
        class_lines = [
            "",
            "# 3b. Classification: keep top-k links per record (symmetric)",
            f"# links <- er_topk_links(pairs, er_combine(sim), k = {k})",
            "# S <- er_pairs_to_sparse(links, er_combine(sim)[links], n = nrow(df))",
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
        "",
        "# 4. Cluster",
        f'labels <- er_cluster(S, method="{cm}", threshold = {threshold})',
        "",
        *tail,
    ]) + "\n"
