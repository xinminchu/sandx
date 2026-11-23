# E1 v5 (2026-11-22): split-protocol robustness -- random record split.
# IDENTICAL to v4 (E1-R: Louvain partition + degeneracy gate) except
# (a) the split SEED is taken from the second command-line argument
# (default 20261012, so a no-arg-2 run reproduces v4 exactly), (b) a
# third command-line argument selects the split mode (default
# "entity" = v4 behaviour, byte-identical split code; "random" =
# random RECORD split), and (c) this header:
#   Rscript experiments/exp-e1-collective-blocking-v5.R cora 20261021 random
# QUESTION (the only one this file asks): does the certified E1-R
# community effect (frozen split: dPC = +0.1744, permutation p =
# 0.005) survive a change of split protocol? The archived protocol
# splits 70/30 over ENTITIES; that presupposes complete gold truth --
# without gold labels an entity-disjoint split cannot even be
# constructed, and on unlabelled registry data it is unavailable.
# v5 re-runs the full, unchanged E1-R protocol under a RANDOM split
# of records: with the same SEED stream, floor(0.7 * n_records)
# records are drawn at random into train, the rest form test.
# Tuning, the partition health check, the degeneracy gate, the
# native / G / W arms, the permutation design and the kill line are
# unchanged.
# CALIBRE NOTE (stated up front): under a random split the train side
# contains other records of test entities, so tuning sees sibling
# records of test entities. That is not a coding leak; it is the
# deployment condition on unlabelled data. Gold labels are still
# used ONLY to score the test split, exactly as before.
# PRE-REGISTERED READING (fixed before any v5 run):
#   * The certified claim "holds" under the random split for a seed
#     iff dPC > 0 AND permutation p < 0.05 -- the script's own kill
#     line, the same rule as v4.
#   * All four seeds (20261012, 20261021, 20261022, 20261023 -- the
#     frozen seed plus the E2 robustness set) are reported whatever
#     happens, next to the entity-disjoint numbers. No seed dropped,
#     none added after seeing results.
# SELF-CHECK (must pass before any random-split number is trusted):
# entity mode with SEED 20261012 must reproduce v4 exactly --
# baseline 24,267 pairs / PC 0.7050; native 21,164 pairs / PC 0.7298;
# aligned treatment 24,267 pairs / PC 0.8794; dPC +0.1744.
#
# ---- v4 header follows, unchanged ----
# E1 v4 / E1-R (2026-11-22): E1 rerun with a non-degenerate partition.
#
# Why this file exists. v3 (run today, results/e1-v3-cora-2026-11-22.md)
# kept v2's protocol untouched and only added attribution diagnostics.
# The diagnostics found that v2's E1 never actually ran as designed:
# on the cora TEST split the treatment partition at the tuned res* = 1
# was 729 communities for 729 records -- every record its own community
# (max size 1). Native therefore contained ZERO within-community pairs;
# all 2,543 native pairs were the per-record top-5 cross-community
# "insurance" pairs, and the archived +0.2835 was entirely global pool
# padding (21,724 of the 24,267 aligned pairs). The v2 permutation null
# was degenerate (sd = 0.0000, p = 1.0000) for the same mechanical
# reason: shuffling the labels of an all-singleton partition changes
# nothing.
#
# Mechanism (verified in the v3 environment, igraph 2.3.4):
# er_cluster(..., "leiden", resolution = res) calls igraph's
# cluster_leiden() with its DEFAULT objective, which is CPM. At CPM
# resolution 1.0 with edge weights <= 1 the optimum is all singletons.
# The community layer exists at other settings (CPM @ res 0.5, and the
# modularity objective @ res 1, both return 67 communities, max size
# 153, on the test graph), but train tuning selected res* = 1 precisely
# because the degenerate setting reduces the treatment to insurance
# pairs + global top-B, which scores highest after alignment.
#
# v4 changes ONLY the partition step and the tuning rule. Seeds, the
# entity-disjoint split, the candidate pool, pairs_from_partition(),
# align_budget(), align_budget_within() and the kill lines are
# byte-identical to v2/v3.
#
#   1. PARTITION METHOD: Louvain instead of Leiden. Tuning and the
#      test split now partition with
#      er_cluster(S, method = "louvain", resolution = res)
#      (package-native; the res grid is unchanged: c(0.5, 1.0, 1.5)).
#      Louvain and Leiden are both modularity-family community
#      detection (Leiden is a refinement of Louvain). The reason for
#      the switch is NOT a claim that Louvain is the better algorithm;
#      it is that the package's leiden path runs igraph's
#      cluster_leiden() under its default CPM objective, whose
#      resolution parameter degenerates as described above, while the
#      louvain path optimises modularity with a resolution parameter --
#      the objective the res grid was always meant to scan.
#   2. PARTITION HEALTH CHECK (new logging). Every candidate
#      partition -- all three tuning resolutions on train and the
#      final partition on test -- is printed and recorded with:
#      number of communities, number of singleton communities,
#      singleton rate (= share of RECORDS sitting in a community of
#      size 1), and maximum community size.
#   3. DEGENERACY GATE (pre-registered here, before the v4 run).
#      A partition with singleton rate > 0.90 is DEGENERATE and is
#      ineligible to be selected as res*, no matter how high its
#      aligned PC. res* is chosen among the non-degenerate partitions
#      by aligned PC, exactly as in v2. If all three resolutions are
#      degenerate on train, the run stops and reports; the gate is
#      NOT relaxed.
#   4. TEST SECTION. v3's section-5b diagnostics are kept in full
#      (native pair count, native-only PC, G-arm retained/padded
#      decomposition, W-arm pair count / PC / shortfall), and the
#      community-label permutation test (R = 199, global alignment,
#      same protocol as v2/v3) is rerun on the corrected partition.
#      This time the partition is real, so the null should NOT be
#      degenerate; its mean / sd / p are reported as they come out.
#
# Pre-registered reading (written before the v4 run):
#   - dPC > 0 AND permutation p < 0.05
#       -> community structure is supported for the first time.
#   - dPC <= 0 OR permutation p >= 0.05
#       -> E1 is dead by its own kill line -- and this time it is
#          dead AFTER ACTUALLY RUNNING, strictly distinguished from
#          v2's "never ran" (a degenerate partition that tuning
#          mistook for a treatment).
#
# Note on section 5's end-to-end block: run_e2e() clusters the
# candidate-similarity graph as a DOWNSTREAM diagnostic; it is not
# the treatment partition. It is left byte-identical to v2/v3 so the
# e2e diagnostics (pair-set Jaccard, cluster counts, partition
# identity) remain comparable with the archive.
#
# Usage: Rscript experiments/exp-e1-collective-blocking-v4.R cora
# (Only cora is run for v4; the dataset shims are inherited from v2.)
#
# ======================================================================
# Original v2 header follows.
#
# E1 FULL PROTOCOL v2: collective blocking vs per-record top-k
#
# Changes vs the 2026-10-20 prototype (exp-e1-collective-blocking.R), following
# the pre-registered full protocol from the prototype's own verdict line:
#   1. TWO-SIDED budget alignment. The prototype only trimmed an over-budget
#      treatment; on cora the treatment therefore ran 12.8% UNDER budget
#      (21,164 vs 24,267 pairs). v2 pads an under-budget treatment with the
#      best remaining BoW-cosine pairs so both arms use exactly B pairs
#      (deviation printed; must be 0.00% unless the pad pool is exhausted).
#   2. Permutation test for the community claim: shuffle the treatment's
#      community labels (community sizes preserved), regenerate pairs through
#      the identical pipeline, align to the same budget, recompute PC.
#      R = 199 reps; empirical p reported next to the kill line.
#      Null: community identity carries no information beyond pair count.
#   3. End-to-end diagnostics: the prototype printed byte-identical e2e
#      metrics for both arms. Code audit (2026-10-20) found no bug --
#      er_cluster() really uses the edges/weights and er_evaluate() aligns
#      by id -- so v2 prints the pair-set Jaccard, both cluster counts and
#      an explicit partitions-identical check to settle it with data.
#
# Usage (from the erbot package root, on a machine with R + package deps):
#   Rscript experiments/exp-e1-collective-blocking-v2.R cora
#   Rscript experiments/exp-e1-collective-blocking-v2.R d10k
#   Rscript experiments/exp-e1-collective-blocking-v2.R musicbrainz20k
# (d10k: records from data/10Kfull.csv via er_load(); gold derived from
#  data/10Kduplicates.csv pairs by the section-0 shim. musicbrainz20k: run
#  experiments/build-musicbrainz20k.R once first to build the data files.)
# v2.2 (2026-10-20): section-0 dataset shims (d10k gold from duplicate
# pairs; musicbrainz20k from builder output). Cora path unchanged from v2.1.
#
# Honesty discipline (unchanged): entity-disjoint 70/30 split, hyperparams
# tuned on TRAIN entities only, TEST reported once, kill line at the end.

args <- commandArgs(trailingOnly = TRUE)
dataset <- if (length(args) >= 1L) args[1L] else "cora"
SEED <- if (length(args) >= 2L) as.integer(args[2L]) else 20261012L   # v5: CLI arg 2 (default = v4 SEED, so no-arg-2 == v4)
SPLIT_MODE <- if (length(args) >= 3L) args[3L] else "entity"          # v5: CLI arg 3 ("entity" = v4 split; "random" = random record split)
if (!SPLIT_MODE %in% c("entity", "random"))
  stop("split mode (arg 3) must be 'entity' or 'random', got: ", SPLIT_MODE)
R_PERM <- 199L
DEGEN_RATE <- 0.90   # v4 degeneracy gate: singleton rate above this = degenerate

if (requireNamespace("pkgload", quietly = TRUE)) {
  suppressPackageStartupMessages(pkgload::load_all(".", quiet = TRUE))
} else {
  for (f in list.files("R", pattern = "\\.[rR]$", full.names = TRUE)) source(f)
}
suppressPackageStartupMessages({
  library(Matrix)
})

message("== E1 v4 (E1-R: Louvain partition + degeneracy gate) | dataset: ", dataset, " ==")
message("== v5 split-protocol robustness | SEED: ", SEED, " | split mode: ", SPLIT_MODE, " ==")

## ---------- 0. load data + gold, align -------------------------------
# v2.2 dataset shims. The package loaders do not cover every dataset:
# er_load_gold() supports only cora/restaurant/dblp_acm, and er_load() has
# no musicbrainz20k key (there is no er_build_musicbrainz() in the package).
#   d10k           records via er_load(); gold derived here from the
#                  duplicate-PAIRS file data/10Kduplicates.csv (Entity1|Entity2)
#                  as connected components; unpaired records are singletons.
#   musicbrainz20k records + gold from data/musicbrainz20k.csv and
#                  data/musicbrainz20k_gold.csv, built once by
#                  experiments/build-musicbrainz20k.R.
#   anything else  package loaders, unchanged (cora path identical to v2.1).
find_data_file <- function(fname) {
  for (p in c(file.path("data", fname), file.path("inst", "extdata", fname)))
    if (file.exists(p)) return(p)
  stop("data file not found: ", fname, " (looked in data/ and inst/extdata/)")
}
gold_from_pairs <- function(pairs_path, all_ids) {
  pr <- utils::read.delim(pairs_path, sep = "|", colClasses = "character",
                          quote = "", comment.char = "")
  e1 <- trimws(pr[[1]]); e2 <- trimws(pr[[2]])
  parent <- new.env(hash = TRUE, parent = emptyenv())
  find_root <- function(x) {
    r <- x
    while (!identical(parent[[r]], r)) r <- parent[[r]]
    while (!identical(parent[[x]], r)) {
      nxt <- parent[[x]]; parent[[x]] <- r; x <- nxt
    }
    r
  }
  for (id in all_ids) parent[[id]] <- id
  for (i in seq_along(e1)) {
    a <- e1[i]; b <- e2[i]
    if (is.null(parent[[a]])) parent[[a]] <- a
    if (is.null(parent[[b]])) parent[[b]] <- b
    ra <- find_root(a); rb <- find_root(b)
    if (!identical(ra, rb)) parent[[rb]] <- ra
  }
  roots <- vapply(all_ids, find_root, character(1))
  tibble::tibble(id = all_ids, cluster_id = as.integer(factor(roots)))
}
load_records <- function(dataset) {
  if (identical(dataset, "musicbrainz20k")) {
    df <- tibble::as_tibble(data.table::fread(
      find_data_file("musicbrainz20k.csv"), showProgress = FALSE))
    names(df) <- tolower(names(df))
    return(df)
  }
  er_load(dataset)
}
load_gold <- function(dataset, all_ids) {
  if (identical(dataset, "d10k"))
    return(gold_from_pairs(find_data_file("10Kduplicates.csv"), all_ids))
  if (identical(dataset, "musicbrainz20k")) {
    g <- tibble::as_tibble(data.table::fread(
      find_data_file("musicbrainz20k_gold.csv"), showProgress = FALSE))
    names(g) <- tolower(names(g))
    return(g)
  }
  er_load_gold(dataset)
}
df   <- tryCatch(load_records(dataset), error = function(e)
  stop("loading records for '", dataset, "' failed: ", conditionMessage(e),
       " -- check the dataset files exist (see header)."))
n    <- nrow(df)
row_ids <- if ("id" %in% names(df)) as.character(df$id) else as.character(seq_len(n))
gold <- tryCatch(load_gold(dataset, row_ids), error = function(e)
  stop("loading gold for '", dataset, "' failed: ", conditionMessage(e)))
gvec <- setNames(as.integer(gold$cluster_id), as.character(gold$id))
crow <- unname(gvec[row_ids])
keep <- !is.na(crow)
if (!all(keep)) message("dropping ", sum(!keep), " unlabeled rows")
df <- df[keep, , drop = FALSE]; crow <- crow[keep]; row_ids <- row_ids[keep]
n <- nrow(df)
message("n = ", n, ", entities = ", length(unique(crow)))

## ---------- 1. text + shingles ----------------------------------------
txt_cols <- names(df)[vapply(df, function(c) is.character(c) || is.factor(c), logical(1L))]
txt_cols <- setdiff(txt_cols, c("id", "truth"))
texts <- vapply(seq_len(n), function(i) {
  paste(vapply(txt_cols, function(cn) {
    v <- df[[cn]][i]; if (is.na(v)) "" else as.character(v)
  }, character(1L)), collapse = " ")
}, character(1L))
texts <- tolower(texts)

shingles_of <- function(s) {
  s <- gsub("[^a-z0-9 ]", " ", s)
  s <- gsub("\\s+", " ", s)
  chars <- strsplit(s, "")[[1L]]
  L <- length(chars)
  if (L < 3L) return(if (L == 0L) character(0L) else s)
  unique(vapply(seq_len(L - 2L), function(i) paste(chars[i:(i + 2L)], collapse = ""),
                character(1L)))
}
sh_list <- lapply(texts, shingles_of)

## sparse 3-gram DTM (for cosine baseline)
all_sh <- unique(unlist(sh_list))
sh_id <- setNames(seq_along(all_sh), all_sh)
ii <- rep(seq_len(n), times = vapply(sh_list, length, integer(1L)))
jj <- unlist(lapply(sh_list, function(s) unname(sh_id[s])))
X <- Matrix::sparseMatrix(i = ii, j = jj, x = 1, dims = c(n, length(all_sh)))
rs <- sqrt(Matrix::rowSums(X ^ 2)); rs[rs == 0] <- 1
Xn <- Matrix::Diagonal(x = 1 / rs) %*% X   # L2-normalized rows

pair_cosine <- function(Xn, pairs) {
  Matrix::rowSums(Xn[pairs$idx1, , drop = FALSE] * Xn[pairs$idx2, , drop = FALSE])
}

bow_topk <- function(Xn, k, chunk = NULL) {
  n <- nrow(Xn)
  if (is.null(chunk)) chunk <- if (n > 5000L) 500L else n
  i1 <- integer(0); i2 <- integer(0); ww <- numeric(0)
  starts <- seq(1L, n, by = chunk)
  for (s in starts) {
    e <- min(s + chunk - 1L, n)
    C <- as.matrix(Xn[s:e, , drop = FALSE] %*% Matrix::t(Xn))
    for (r in seq_len(nrow(C))) {
      row <- C[r, ]; row[s + r - 1L] <- -Inf   # exclude self
      tk <- order(row, decreasing = TRUE)[seq_len(min(k, n - 1L))]
      gi <- s + r - 1L
      i1 <- c(i1, rep(gi, length(tk))); i2 <- c(i2, tk); ww <- c(ww, row[tk])
    }
  }
  tibble::tibble(idx1 = i1, idx2 = i2, w = ww)
}
undirect <- function(p) {
  a <- pmin(p$idx1, p$idx2); b <- pmax(p$idx1, p$idx2)
  p$idx1 <- a; p$idx2 <- b
  p[!duplicated(paste(a, b, sep = "_")), , drop = FALSE]
}

## ---------- 2. split (v5: entity-disjoint or random record split) -------
# entity mode: v4 code, byte-identical (70/30 over entities, no entity on
# both sides). random mode: same SEED stream, but the draw is over RECORDS:
# floor(0.7 * n) records into train, the rest into test. Under random mode
# an entity may sit on both sides; tuning then sees sibling records of test
# entities -- the deployment condition on unlabelled data (see the v5
# header). Gold is still used only for scoring.
set.seed(SEED)
if (SPLIT_MODE == "entity") {
  ents <- unique(crow)
  train_ents <- sample(ents, size = floor(0.7 * length(ents)))
  tr_idx <- which(crow %in% train_ents)
  te_idx <- which(!crow %in% train_ents)
} else {
  draw <- sample(seq_len(n), size = floor(0.7 * n))
  tr_idx <- sort(draw)
  te_idx <- sort(setdiff(seq_len(n), draw))
}
message("train rows: ", length(tr_idx), " | test rows: ", length(te_idx))

gold_tbl <- tibble::tibble(id = row_ids, cluster_id = crow)

## ---------- 3. TUNE on train -------------------------------------------
sub_topk <- function(idxs, k) {
  # per-record top-k restricted to a row subset (indices are LOCAL to subset)
  Xs <- Xn[idxs, , drop = FALSE]
  p <- undirect(bow_topk(Xs, k))
  p
}
pc_of <- function(pairs, idxs) {
  st <- er_block_stats(pairs, n = length(idxs), truth = gold_tbl[idxs, , drop = FALSE],
                       id_vec = row_ids[idxs])
  st$pair_completeness
}

message("-- tuning baseline k on train --")
k_grid <- c(10L, 20L, 50L)
pc_k <- vapply(k_grid, function(k) pc_of(sub_topk(tr_idx, k), tr_idx), numeric(1L))
k_star <- k_grid[which.max(pc_k)]
message("k* = ", k_star, " (PC: ", paste(round(pc_k, 4), collapse = ", "), ")")

## ---------- 4. treatment machinery (refactored from prototype) ---------
# mh_setup: MinHash signatures + LSH candidate graph + BoW top-200 pool.
# Computed ONCE per row subset and shared by tuning, final and permutation,
# so the permutation null differs from the treatment ONLY in the labels.
mh_setup <- function(idxs, P = 128L, bands = 16L) {
  Xs <- Xn[idxs, , drop = FALSE]
  ns <- length(idxs)
  sh_sub <- sh_list[idxs]
  ush <- unique(unlist(sh_sub))
  hb <- t(vapply(ush, function(s) {
    b <- as.integer(charToRaw(s)); w <- seq_along(b)
    c(sum(b * w) %% 2147483647, sum(rev(b) * w) %% 2147483647)
  }, numeric(2L)))
  rownames(hb) <- ush
  set.seed(SEED)
  A <- sample.int(1e6, P); Bp <- sample.int(1e6, P); Cc <- sample.int(1e6, P)
  M <- 2147483647
  PV <- (outer(A, hb[, 1]) + outer(Bp, hb[, 2]) + Cc) %% M   # P x U
  shmat <- lapply(sh_sub, function(s) match(s, ush))
  sig <- vapply(shmat, function(cols) {
    if (!length(cols)) return(rep(M, P))
    apply(PV[, cols, drop = FALSE], 1L, min)
  }, numeric(P))                                                    # P x ns
  sig <- t(sig)                                                     # ns x P
  rows_per_band <- P %/% bands
  cand <- list()
  for (b in seq_len(bands)) {
    cols <- ((b - 1L) * rows_per_band + 1L):(b * rows_per_band)
    key <- apply(sig[, cols, drop = FALSE], 1L, paste, collapse = "|")
    bk <- split(seq_len(ns), key)
    for (members in bk) {
      if (length(members) < 2L) next
      if (length(members) > 300L) members <- sample(members, 300L)  # anti-blowup cap
      gr <- utils::combn(members, 2L)
      cand[[length(cand) + 1L]] <- gr
    }
  }
  tk200 <- bow_topk(Xs, 200L)
  if (!length(cand)) {
    message("mh_setup: no LSH candidates; graph will be empty")
    S <- Matrix::sparseMatrix(i = integer(), j = integer(), x = numeric(),
                              dims = c(ns, ns))
    return(list(sig = sig, S = S, tk200 = tk200))
  }
  CM <- do.call(cbind, cand)
  i1 <- pmin(CM[1L, ], CM[2L, ]); i2 <- pmax(CM[1L, ], CM[2L, ])
  key <- paste(i1, i2, sep = "_"); dup <- duplicated(key)
  i1 <- i1[!dup]; i2 <- i2[!dup]
  w <- vapply(seq_along(i1), function(t) mean(sig[i1[t], ] == sig[i2[t], ]), numeric(1L))
  S <- Matrix::sparseMatrix(i = c(i1, i2), j = c(i2, i1), x = c(w, w), dims = c(ns, ns))
  list(sig = sig, S = S, tk200 = tk200)
}

# pairs_from_partition: within-community pairs (cap per record for big
# communities) + cross-community insurance (per-record top-ins_k by BoW
# cosine). Identical code path for the real partition and permuted ones.
pairs_from_partition <- function(memb, sig, tk200, cap = 200L, ins_k = 5L) {
  ns <- length(memb)
  comps <- split(seq_len(ns), memb)
  pi1 <- integer(0); pi2 <- integer(0); pw <- numeric(0)
  for (members in comps) {
    m <- length(members)
    if (m < 2L) next
    if (m <= cap) {
      gr <- utils::combn(members, 2L)
      a <- gr[1L, ]; b <- gr[2L, ]
      pi1 <- c(pi1, a); pi2 <- c(pi2, b)
      pw <- c(pw, vapply(seq_along(a), function(t) mean(sig[a[t], ] == sig[b[t], ]), numeric(1L)))
    } else {
      for (r in members) {
        nbrs <- setdiff(members, r)
        ww <- vapply(nbrs, function(q) mean(sig[r, ] == sig[q, ]), numeric(1L))
        o <- order(ww, decreasing = TRUE)[seq_len(min(cap, length(nbrs)))]
        pi1 <- c(pi1, rep(r, length(o))); pi2 <- c(pi2, nbrs[o])
        pw <- c(pw, ww[o])
      }
    }
  }
  ins <- tk200[!(paste(pmin(tk200$idx1, tk200$idx2), pmax(tk200$idx1, tk200$idx2), sep = "_") %in%
                   paste(pmin(pi1, pi2), pmax(pi1, pi2), sep = "_")), , drop = FALSE]
  ins <- ins[memb[ins$idx1] != memb[ins$idx2], , drop = FALSE]
  ins <- ins[order(ins$idx1, -ins$w), , drop = FALSE]
  ins_keep <- unlist(lapply(split(seq_len(nrow(ins)), ins$idx1),
                            function(rr) head(rr, ins_k)))
  ins <- ins[ins_keep, , drop = FALSE]
  pairs <- tibble::tibble(idx1 = c(pi1, ins$idx1), idx2 = c(pi2, ins$idx2),
                          w = c(pw, ins$w))
  undirect(pairs)
}

# align_budget: TWO-SIDED. Trim lowest-w when over B; pad with the best
# remaining pool pairs (BoW cosine) when under B. Target: exactly B.
align_budget <- function(pairs, pool_src, B) {
  if (nrow(pairs) > B) {
    pairs <- pairs[order(pairs$w, decreasing = TRUE)[seq_len(B)], , drop = FALSE]
  } else if (nrow(pairs) < B) {
    pool <- undirect(pool_src)
    have <- paste(pairs$idx1, pairs$idx2, sep = "_")
    pool <- pool[!(paste(pool$idx1, pool$idx2, sep = "_") %in% have), , drop = FALSE]
    pool <- pool[order(pool$w, decreasing = TRUE), , drop = FALSE]
    add <- head(pool, B - nrow(pairs))
    pairs <- undirect(rbind(pairs[, c("idx1", "idx2", "w")],
                            add[, c("idx1", "idx2", "w")]))
  }
  pairs
}

# align_budget_within (v3 addition, unchanged): the W arm. Same native pairs
# and same target B as align_budget(), but padding may ONLY come from pool
# pairs whose endpoints share a community label (memb, local to the row
# subset), best pool weight w first. If the within-community pool runs out
# before B is reached, the shortfall is reported, never silently filled
# globally. (If native is already over B, trimming is identical to
# align_budget().)
align_budget_within <- function(pairs, pool_src, memb, B) {
  n0 <- nrow(pairs)
  if (n0 >= B) {
    out <- pairs[order(pairs$w, decreasing = TRUE)[seq_len(B)], , drop = FALSE]
    return(list(pairs = out, achieved = nrow(out), shortfall = 0L))
  }
  pool <- undirect(pool_src)
  have <- paste(pairs$idx1, pairs$idx2, sep = "_")
  pool <- pool[!(paste(pool$idx1, pool$idx2, sep = "_") %in% have), , drop = FALSE]
  pool <- pool[memb[pool$idx1] == memb[pool$idx2], , drop = FALSE]
  pool <- pool[order(pool$w, decreasing = TRUE), , drop = FALSE]
  add <- head(pool, B - n0)
  out <- undirect(rbind(pairs[, c("idx1", "idx2", "w")],
                        add[, c("idx1", "idx2", "w")]))
  list(pairs = out, achieved = nrow(out), shortfall = B - nrow(out))
}

# partition_health (v4 addition): the partition health check. Singleton
# rate = share of RECORDS sitting in a community of size 1 (each singleton
# community holds exactly one record, so n_single counts both the
# singleton communities and the singleton records).
partition_health <- function(memb) {
  sz <- table(memb)
  list(n_comm = length(sz), n_single = sum(sz == 1L),
       singleton_rate = sum(sz == 1L) / length(memb), max_size = max(sz))
}

# run_treatment (v4): partition by LOUVAIN (see header for why), health
# check on every candidate, degeneracy gate on selection. Everything
# downstream of the partition (pairs_from_partition, align_budget, pc_of)
# is v2/v3 verbatim.
run_treatment <- function(idxs, res_grid, B) {
  st <- mh_setup(idxs)
  best <- NULL
  for (res in res_grid) {
    memb <- er_cluster(st$S, method = "louvain", resolution = res)
    hh <- partition_health(memb)
    message(sprintf(paste0("partition health [res=%.1f]: communities=%d | ",
                           "singletons=%d (rate %.3f) | max size=%d"),
                    res, hh$n_comm, hh$n_single, hh$singleton_rate, hh$max_size))
    if (hh$singleton_rate > DEGEN_RATE) {
      message(sprintf(paste0("  -> DEGENERATE (singleton rate %.3f > %.2f): ",
                             "ineligible for selection, whatever its aligned PC."),
                      hh$singleton_rate, DEGEN_RATE))
      next
    }
    pairs_nat <- pairs_from_partition(memb, st$sig, st$tk200)
    pairs <- align_budget(pairs_nat, st$tk200, B)
    pc <- pc_of(pairs[, c("idx1", "idx2")], idxs)
    if (is.null(best) || pc > best$pc)
      best <- list(pc = pc, res = res, pairs = pairs, pairs_native = pairs_nat,
                   memb = memb, sig = st$sig, tk200 = st$tk200, health = hh)
  }
  if (is.null(best))
    stop("run_treatment: every candidate partition on this split is ",
         "degenerate (singleton rate > ", DEGEN_RATE, "). Stopping per ",
         "the pre-registered degeneracy gate; the gate is NOT relaxed.")
  best
}

message("-- tuning treatment (louvain resolution) on train --")
B_train_pairs <- nrow(sub_topk(tr_idx, k_star))
tune <- run_treatment(tr_idx, res_grid = c(0.5, 1.0, 1.5), B = B_train_pairs)
message(sprintf(paste0("res* = %.1f | train PC(treatment) = %.4f | ",
                       "train partition: communities=%d singletons=%d ",
                       "(rate %.3f) max size=%d"),
                tune$res, tune$pc, tune$health$n_comm, tune$health$n_single,
                tune$health$singleton_rate, tune$health$max_size))

## ---------- 5. FINAL: test split, once ----------------------------------
message("-- final on TEST split --")
base_pairs <- sub_topk(te_idx, k_star)
B_test <- nrow(base_pairs)
treat <- run_treatment(te_idx, res_grid = tune$res, B = B_test)
message(sprintf(paste0("TEST partition health [res*=%.1f]: communities=%d | ",
                       "singletons=%d (rate %.3f) | max size=%d"),
                tune$res, treat$health$n_comm, treat$health$n_single,
                treat$health$singleton_rate, treat$health$max_size))
message(sprintf("budget check: treatment pairs=%d vs B=%d (deviation %+.2f%%)",
                nrow(treat$pairs), B_test,
                100 * (nrow(treat$pairs) - B_test) / B_test))

st_b <- er_block_stats(base_pairs, n = length(te_idx), truth = gold_tbl[te_idx, , drop = FALSE],
                       id_vec = row_ids[te_idx])
st_t <- er_block_stats(treat$pairs[, c("idx1", "idx2")], n = length(te_idx),
                       truth = gold_tbl[te_idx, , drop = FALSE], id_vec = row_ids[te_idx])
message(sprintf("BASELINE  k=%d pairs=%d PC=%.4f RR=%.4f",
                k_star, st_b$n_candidate_pairs, st_b$pair_completeness, st_b$reduction_ratio))
message(sprintf("TREATMENT res=%.1f pairs=%d PC=%.4f RR=%.4f",
                tune$res, st_t$n_candidate_pairs, st_t$pair_completeness, st_t$reduction_ratio))

## ---------- 5b. v4 diagnostics: native pairs + W arm (TEST only) -------
# (Section 5b is v3's diagnostic suite, unchanged; see the v4 header.)
message("-- v4 diagnostics on TEST: native (pre-alignment) + within-community padding --")
nat <- treat$pairs_native
pc_nat <- pc_of(nat[, c("idx1", "idx2")], te_idx)
key_nat <- paste(nat$idx1, nat$idx2, sep = "_")
key_al  <- paste(treat$pairs$idx1, treat$pairs$idx2, sep = "_")
n_retained <- length(intersect(key_al, key_nat))
n_padded   <- length(key_al) - n_retained
message(sprintf("NATIVE (pre-alignment): pairs=%d PC=%.4f", nrow(nat), pc_nat))
message(sprintf(paste0("G arm (v2 global alignment): pairs=%d PC=%.4f | ",
                       "retained from native=%d, padded from global pool=%d"),
                nrow(treat$pairs), st_t$pair_completeness, n_retained, n_padded))
w_arm <- align_budget_within(nat, treat$tk200, treat$memb, B_test)
pc_w <- pc_of(w_arm$pairs[, c("idx1", "idx2")], te_idx)
message(sprintf(paste0("W arm (within-community padding only): pairs=%d ",
                       "(target B=%d, shortfall=%d) PC=%.4f"),
                nrow(w_arm$pairs), B_test, w_arm$shortfall, pc_w))
if (w_arm$shortfall > 0L) {
  message("W arm SHORTFALL: within-community pool exhausted ", w_arm$shortfall,
          " pairs before B; NO global padding was used to fill it.")
}

## end-to-end: leiden on candidate similarities -> ARI (+ diagnostics)
# (Downstream diagnostic only -- NOT the treatment partition; byte-identical
# to v2/v3 so the e2e diagnostics stay comparable with the archive.)
run_e2e <- function(pairs, idxs, tag) {
  Xs <- Xn[idxs, , drop = FALSE]
  w <- pair_cosine(Xs, pairs)
  S <- Matrix::sparseMatrix(i = c(pairs$idx1, pairs$idx2), j = c(pairs$idx2, pairs$idx1),
                            x = c(w, w), dims = c(length(idxs), length(idxs)))
  memb <- er_cluster(S, method = "leiden", resolution = 1)
  ev <- er_evaluate(memb, truth = gold_tbl[idxs, , drop = FALSE], id_vec = row_ids[idxs])
  message("-- end-to-end ", tag, " --"); print(ev)
  list(ev = ev, memb = memb, nclust = length(unique(memb)))
}
e2e_b <- run_e2e(base_pairs, te_idx, "baseline")
e2e_t <- run_e2e(treat$pairs[, c("idx1", "idx2")], te_idx, "treatment")
key_b <- paste(base_pairs$idx1, base_pairs$idx2, sep = "_")
key_t <- paste(treat$pairs$idx1, treat$pairs$idx2, sep = "_")
jac <- length(intersect(key_b, key_t)) / length(union(key_b, key_t))
message(sprintf(paste0("e2e diagnostics: pair-set Jaccard = %.3f | clusters ",
                       "baseline = %d, treatment = %d | partitions identical = %s"),
                jac, e2e_b$nclust, e2e_t$nclust,
                identical(e2e_b$memb, e2e_t$memb)))
if (identical(e2e_b$memb, e2e_t$memb)) {
  message("NOTE: partitions identical despite different pair sets. Expected ",
          "explanation: both graphs share the same strong-edge skeleton and ",
          "Leiden (res = 1) converges to the same optimum; the differing ",
          "edges are low-weight. Check the Jaccard above: it should be < 1.")
}

## ---------- 6. permutation test: community labels -----------------------
message("-- permutation test: shuffling community labels (R = ", R_PERM, ") --")
set.seed(SEED + 1L)
pc_null <- numeric(R_PERM)
for (r in seq_len(R_PERM)) {
  memb_p <- sample(treat$memb)                 # sizes preserved, identity destroyed
  pp <- pairs_from_partition(memb_p, treat$sig, treat$tk200)
  pp <- align_budget(pp, treat$tk200, B_test)
  pc_null[r] <- pc_of(pp[, c("idx1", "idx2")], te_idx)
  if (r %% 50L == 0L) message("  perm ", r, " / ", R_PERM)
}
pc_obs <- st_t$pair_completeness
p_perm <- (1 + sum(pc_null >= pc_obs)) / (1 + R_PERM)
message(sprintf("permutation null: mean PC = %.4f (sd %.4f) | observed PC = %.4f | empirical p = %.4f",
                mean(pc_null), stats::sd(pc_null), pc_obs, p_perm))

## ---------- 7. kill line --------------------------------------------------
dpc <- st_t$pair_completeness - st_b$pair_completeness
message(sprintf("== KILL LINE: dPC (treatment - baseline) = %+.4f ==", dpc))
if (is.na(dpc) || dpc <= 0) {
  message("VERDICT: idea dead on this dataset (treatment PC <= baseline PC).")
} else if (p_perm >= 0.05) {
  message("VERDICT: dPC positive BUT permutation p = ", round(p_perm, 4),
          " >= 0.05 -- community structure is not distinguishable from ",
          "label noise at this budget. Treat the E1 claim as WEAK on ",
          dataset, "; do not report as established.")
} else {
  message("VERDICT: signal alive AND permutation-supported (p = ",
          round(p_perm, 4), ") at +-0% budget alignment on ", dataset, ".")
}
