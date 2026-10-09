export type Entry = { id: string; term: string; aka?: string; body: string };

export const SECTIONS: { id: string; title: string; intro: string; entries: Entry[] }[] = [
  {
    id: "similarity",
    title: "Similarity",
    intro:
      "How alike two field values are, scored 0 (nothing alike) to 1 (identical). Picked per match field in Studio. If either side is missing, the field scores NA — never a guessed value.",
    entries: [
      {
        id: "jw",
        term: "jw",
        aka: "Jaro-Winkler",
        body: "String similarity that rewards shared prefixes. Good for names and places where the first few letters matter most — “Smith” vs “Smyth” scores high, while a typo at the end hurts less than one at the start.",
      },
      {
        id: "lv",
        term: "lv",
        aka: "Levenshtein",
        body: "Normalized edit distance: the smallest number of single-character insertions, deletions, or substitutions needed to turn one string into the other, rescaled to 0–1. Sensitive to spelling errors that differ by one or two letters anywhere in the string.",
      },
      {
        id: "jaccard",
        term: "jaccard",
        aka: "Token Jaccard",
        body: "Splits each value into words and measures overlap: shared words ÷ all distinct words. Word order doesn't matter, so “Bank of America” vs “America Bank” scores high. Best for longer text where words may shuffle.",
      },
    ],
  },
  {
    id: "blocking",
    title: "Blocking",
    intro:
      "Comparing every record with every other record explodes quadratically. Blocking first groups records into small buckets so only plausible pairs are compared.",
    entries: [
      {
        id: "blocking-standard",
        term: "standard",
        body: "Records sharing the exact same blocking key land in one bucket; only pairs inside a bucket are compared. Fast and strict — one character off and the pair is never compared.",
      },
      {
        id: "blocking-prefix",
        term: "prefix",
        body: "Like standard, but buckets by the first 3 characters of the blocking key. Looser: “Smith” and “Smithe” share a bucket, catching small variations the strict version would miss.",
      },
      {
        id: "blocking-sn",
        term: "sn",
        aka: "Sorted neighborhood",
        body: "Sorts all records by the blocking key, then compares each record with the next 20 in that order. Keys that are close (but not equal) still get compared — no buckets, just neighbors.",
      },
      {
        id: "blocking-none",
        term: "none",
        body: "No blocking: every pair is compared. Only feasible for small data — the pair budget will stop you before it melts the server.",
      },
      {
        id: "blocking-key",
        term: "blocking key",
        body: "The field used to form blocks. Pick something discriminating (postal code, name prefix). A unique id is useless as a key (every record gets its own bucket, zero pairs), and the truth column must never be one (that leaks the answer).",
      },
      {
        id: "pair-budget",
        term: "pair budget",
        body: "Hard cap on candidate pairs (default 2,000,000). If blocking produces more pairs than this, the run is refused up front with a suggestion to tighten blocking or sample — instead of timing out halfway.",
      },
    ],
  },
  {
    id: "classify",
    title: "Classify",
    intro:
      "Turns per-field similarity scores into a yes/no decision for each candidate pair: same entity or not.",
    entries: [
      {
        id: "tc",
        term: "tc",
        aka: "Transitive closure",
        body: "Pairs scoring above the threshold become edges; connected components become the predicted entities. If A≈B and B≈C, all three land together — even when A and C look nothing alike. Simple and fast, but one bad edge can chain a whole cluster together.",
      },
      {
        id: "hc",
        term: "hc",
        aka: "Hierarchical clustering",
        body: "Bottom-up merging: starts with every record alone and repeatedly joins the most similar pair until the similarity drops below the cut height. Produces a merge tree, so you can re-cut at a different height without recomputing.",
      },
      {
        id: "hdbscan",
        term: "hdbscan",
        aka: "HDBSCAN",
        body: "Density-based hierarchical clustering. Finds clusters of varying density, needs no similarity threshold, and labels sparse points as noise (shown as singletons here). min_pts (default 2) sets the smallest neighborhood that counts as dense.",
      },
    ],
  },
  {
    id: "clustering",
    title: "Clustering",
    intro:
      "The final grouping step. By default it keeps the classify output; the alternatives re-cluster the pair graph.",
    entries: [
      {
        id: "same",
        term: "same",
        aka: "Same as classify",
        body: "Default. The classify step's labels are the final answer — no second clustering pass.",
      },
      {
        id: "threshold-cc",
        term: "threshold_cc",
        body: "Threshold connected components: same idea as transitive closure, applied as a standalone re-clustering of the scored pair graph.",
      },
      {
        id: "louvain",
        term: "louvain",
        body: "Community detection on the pair graph, optimizing modularity. Handles large, messy graphs well; tends to split the giant chains that transitive closure sometimes produces.",
      },
      {
        id: "leiden",
        term: "leiden",
        body: "Community detection like louvain, plus a refinement step that guarantees well-connected communities. Often cleaner clusters than louvain on noisy graphs.",
      },
      {
        id: "label-prop",
        term: "label_prop",
        body: "Label propagation: every record repeatedly adopts the most common label among its similar neighbors until nothing changes. Fast and simple; can be unstable on ambiguous graphs.",
      },
      {
        id: "gc",
        term: "gc",
        body: "Graph coloring (GCMER style): records similar above the threshold form cliques, and each clique becomes one entity — so every pair inside an entity is guaranteed similar. Strict, conservative grouping.",
      },
      {
        id: "hclust-avg",
        term: "hclust_avg",
        body: "Hierarchical clustering with average linkage on 1 − similarity. The number of clusters k is picked automatically by silhouette width.",
      },
      {
        id: "hclust-ward",
        term: "hclust_ward",
        body: "Hierarchical clustering with Ward linkage, which merges the pair of clusters that increases within-cluster variance the least. Tends to produce compact, even-sized entities.",
      },
      {
        id: "pam",
        term: "pam",
        body: "Partitioning Around Medoids (k-medoids): picks k real records as centers and assigns every record to its nearest center. Robust to outliers; k picked by silhouette.",
      },
      {
        id: "supervised-classifiers",
        term: "logistic · lda · qda · knn · wknn · tree · rf · xgboost · nnet · fellegi_sunter · svm_radial",
        body: "Supervised pair classifiers — only available with gold truth. Labeled pairs train the model, which then scores every candidate pair; links above the threshold become entities. Fellegi-Sunter is the classic probabilistic record-linkage model; the rest are standard classifiers on pair features, from k-NN and trees to random forests, gradient boosting, a small neural net, and an RBF support-vector machine.",
      },
    ],
  },
  {
    id: "evaluation",
    title: "Evaluation",
    intro:
      "How good is the result? Needs gold truth. All metrics compare predicted clusters against true entities.",
    entries: [
      {
        id: "ari",
        term: "ARI",
        aka: "Adjusted Rand Index",
        body: "Agreement between predicted clusters and true entities, corrected for chance. 1 is perfect, 0 is about as good as random guessing, negative is worse than random.",
      },
      {
        id: "pairwise-prf",
        term: "Pairwise P / R / F1",
        body: "Treats “are these two in the same cluster?” as a yes/no question over all record pairs. Precision: of the pairs we grouped together, how many truly belong together. Recall: of the truly-together pairs, how many did we group. F1 balances the two.",
      },
      {
        id: "b3",
        term: "B³ P / R / F1",
        body: "B-cubed: precision and recall computed per record, then averaged. Big clusters count more than tiny ones — a complement to the pairwise view, which counts every pair equally.",
      },
      {
        id: "truth-entities",
        term: "truth entities",
        body: "How many distinct real-world entities the gold truth contains. The number your cluster count is trying to match.",
      },
      {
        id: "gold-truth",
        term: "gold truth",
        body: "The answer key used only for evaluation — never for matching. Either a column already in your data or a separate file joined by id. Using it as a match field or blocking key would be cheating; Studio forbids it.",
      },
      {
        id: "clusters",
        term: "clusters",
        body: "The predicted entities: groups of records the pipeline decided refer to the same real-world thing.",
      },
    ],
  },
  {
    id: "data",
    title: "Data",
    intro: "Terms about the input itself, mostly from the Data Profile page.",
    entries: [
      {
        id: "sampling",
        term: "sampling",
        body: "Run on a random subset first (500 / 1,000 / 2,000 records) to test settings cheaply before committing to the full data.",
      },
      {
        id: "seed",
        term: "seed",
        body: "The fixed random seed behind sampling. Same seed, same subset — results stay reproducible.",
      },
      {
        id: "complete-records",
        term: "complete records",
        body: "Records with no missing values across the selected fields. Entity resolution needs something to compare, so this is the share of your data that's fully usable.",
      },
      {
        id: "na-aware",
        term: "NA-aware",
        body: "Missing values stay missing. A blank field contributes NA to the pair score instead of an imputed guess, so absent data never fabricates similarity.",
      },
      {
        id: "column-roles",
        term: "column roles",
        body: "The Data Profile guesses each column's role: id (identifier, skipped for matching), truth (answer key, evaluation only), field (usable for matching), excluded (unsuitable for ER, e.g. all-unique values).",
      },
    ],
  },
];

const TERM_MAP: Record<string, Entry> = {};
for (const s of SECTIONS) for (const e of s.entries) TERM_MAP[e.id] = e;

export function getTerm(id: string): Entry | null {
  return TERM_MAP[id] ?? null;
}
