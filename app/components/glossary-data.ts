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
        id: "blocking-embed",
        term: "embed",
        aka: "Learned retriever",
        body: "A small neural network learns record embeddings from truth-labeled duplicates, trained to rank duplicates at the top (recall@K, not classification). Each record's top-K nearest neighbors become the candidate pairs; K comes from the pair budget alone, so truth never tunes it. Without truth it falls back to plain n-gram cosine retrieval.",
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
        id: "clf-logistic",
        term: "logistic",
        aka: "Logistic regression",
        body: "Models the match probability as P(y=1|x) = σ(w·x + b) = 1/(1+e^(−(w·x+b))), a linear score squashed through the sigmoid. The decision boundary is a hyperplane; with L2 regularization the weights stay small and probabilities stay calibrated. Strengths: fast, interpretable (each weight says how much a field's similarity moves the log-odds), solid baseline. Weakness: cannot learn interactions between fields (e.g. “name matches AND address matches” matters more than the sum).",
      },
      {
        id: "clf-lda",
        term: "lda",
        aka: "Linear discriminant analysis",
        body: "Generative cousin of logistic regression: models each class (match / non-match) as a Gaussian with its own mean μc but a shared covariance Σ. A pair is classified by the discriminant δc(x) = xᵀΣ⁻¹μc − ½μcᵀΣ⁻¹μc + log πc, picking the class with the larger score — again a linear boundary. Works well when pair-feature distributions are roughly bell-shaped; needs less data than logistic to fit stably.",
      },
      {
        id: "clf-qda",
        term: "qda",
        aka: "Quadratic discriminant analysis",
        body: "Like LDA, but each class gets its own covariance Σc, so the discriminant gains a quadratic term −½log|Σc| − ½(x−μc)ᵀΣc⁻¹(x−μc) and the boundary becomes curved. More flexible than LDA/logistic — it can carve out a “high-similarity corner” of feature space — but estimates more parameters, so it wants more labeled pairs to avoid overfitting.",
      },
      {
        id: "clf-knn",
        term: "knn",
        aka: "k-nearest neighbors",
        body: "Non-parametric: a candidate pair takes the majority label of its k nearest labeled pairs in feature space (Euclidean on the similarity vector). No model is fit — the training data IS the model. Simple and makes no distributional assumptions, but slow at prediction time (every candidate scans the training set) and sensitive to the choice of k and to irrelevant features.",
      },
      {
        id: "clf-wknn",
        term: "wknn",
        aka: "Weighted k-nearest neighbors",
        body: "kNN with distance-weighted votes: neighbor i contributes weight 1/(dᵢ+ε) to its class instead of one equal vote. Near-identical training pairs dominate the decision while far ones barely count, which smooths kNN's jagged boundaries and usually beats plain kNN on pair data where a few very close neighbors are highly informative.",
      },
      {
        id: "clf-tree",
        term: "tree",
        aka: "Decision tree",
        body: "Recursively splits pairs on one feature at a time (“name similarity > 0.8?”), choosing each split to minimize impurity — Gini = 1 − Σc pc² or entropy −Σc pc log pc — until leaves are pure or a depth limit hits. Captures field interactions naturally (the classic “name AND address” rule falls out of two splits) and is fully interpretable as a rule list, but a single tree overfits: small data changes reshuffle the splits.",
      },
      {
        id: "clf-rf",
        term: "rf",
        aka: "Random forest",
        body: "Bagging over trees: train B trees on bootstrap resamples of the labeled pairs, each split considering only a random subset of features, then majority-vote. If one tree has variance σ², the average of B nearly-independent trees has variance ≈ σ²/B — the ensemble keeps the tree's ability to learn interactions while washing out its instability. Usually the strongest off-the-shelf choice; the out-of-bag error even gives a free honesty check.",
      },
      {
        id: "clf-xgboost",
        term: "xgboost",
        aka: "Gradient-boosted trees",
        body: "Boosting instead of bagging: build trees sequentially, each new tree hₘ fitting the residual errors of the ensemble so far, Fₘ(x) = Fₘ₋₁(x) + γₘ·hₘ(x), minimizing a regularized loss Σᵢ ℓ(yᵢ, F(xᵢ)) + Ω(h). Later trees fix what earlier ones got wrong, so it often squeezes out the last point of accuracy — at the cost of more hyperparameters (depth, learning rate, rounds) to tune honestly.",
      },
      {
        id: "clf-nnet",
        term: "nnet",
        aka: "Small neural network",
        body: "A multilayer perceptron: one hidden layer z = tanh(W₁x + b₁), output P(y=1|x) = σ(w₂·z + b₂), trained by backpropagation on the labeled pairs. A universal approximator — it can learn any smooth boundary given enough data — but on the small labeled sets typical in ER it is the most data-hungry and seed-sensitive of the eleven; treat its scores as one opinion among many.",
      },
      {
        id: "clf-fellegi-sunter",
        term: "fellegi_sunter",
        aka: "Fellegi–Sunter",
        body: "The classic 1969 probabilistic record-linkage model, and the only one here designed for ER rather than borrowed from general ML. For each field it estimates mᵢ = P(agreement | match) and uᵢ = P(agreement | non-match); a pair's match weight is the log-likelihood ratio Σᵢ log(mᵢ/uᵢ) (+ log prior odds). Fields where agreement is rare among non-matches (a rare surname) contribute large positive weights; agreement on common fields counts for little. This implementation bins continuous similarities and uses Laplace smoothing. Interpretable, principled, and still competitive — the baseline every ER paper compares against.",
      },
      {
        id: "clf-svm-radial",
        term: "svm_radial",
        aka: "RBF support-vector machine",
        body: "Finds the maximum-margin hyperplane in an implicit high-dimensional space via the kernel trick: K(x,x′) = exp(−γ‖x−x′‖²) makes similarity itself the feature, so the decision f(x) = Σᵢ αᵢyᵢK(xᵢ,x) + b depends only on the support vectors (the ambiguous pairs near the boundary). The RBF kernel bends the boundary around clusters of matching pairs; γ controls how local that bending is. Strong on clean numeric features, but probabilities need an extra calibration step and it scales worse than forests on large pair sets.",
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
