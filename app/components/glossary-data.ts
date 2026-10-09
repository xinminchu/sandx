export type Entry = { id: string; term: string; aka?: string; body: string };

export const SECTIONS: { id: string; title: string; intro: string; entries: Entry[] }[] = [
  {
    id: "similarity",
    title: "Similarity",
    intro:
      "How alike two field values are, scored 0 (nothing alike) to 1 (identical). Picked per match field in Studio. If either side is missing, the field scores NA — never a guessed value.",
    entries: [
      {
        id: "similarity",
        term: "similarity",
        body: "How alike two field values are, scored 0 (nothing alike) to 1 (identical), picked per match field in Studio. Comparison is case-insensitive (“Blue Fin” = “blue fin”). If either side is missing or blank, the field scores NA — never a guessed value — and the pair score averages only the fields that have values.",
      },
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
      {
        id: "cosine-distance",
        term: "cosine distance",
        body: "1 − (u·v)/(‖u‖‖v‖): one minus the cosine of the angle between two vectors. 0 means pointing the same way (identical direction), 1 means orthogonal, 2 means opposite. Used for average-linkage clustering on embedding vectors, where direction matters more than magnitude.",
      },
      {
        id: "idf",
        term: "IDF",
        aka: "Inverse document frequency",
        body: "IDF(t) = log((N+1)/(df(t)+1)) + 1, where df(t) is how many records contain term t. Common words (“the”, “inc”) get tiny weights; rare discriminative words (“Zynga”, “quinoa”) get large ones. Turns bag-of-words into a weighted cosine where the unusual words decide.",
      },
      {
        id: "nfkc",
        term: "NFKC",
        aka: "Unicode normalization",
        body: "Normalization Form Kompatibility Composition: resolves the many byte-sequences that look like the same character into one canonical form. “Müller” written with a combining umlaut (u + ¨) becomes identical to the precomposed “ü” before blocking or comparison, so visually identical keys actually match. Unicode defines four forms: NFC (canonical composition), NFD (canonical decomposition), NFKC (compatibility composition), NFKD (compatibility decomposition) — the K forms additionally map compatibility variants like fullwidth characters to their plain equivalents.",
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
        id: "blocking-general",
        term: "blocking",
        body: "Restricting pairwise comparison to a candidate set instead of all n(n−1)/2 pairs. With n = 10,000 that's ~50M pairs; blocking keeps the thousands likely to match. The eternal trade-off: skip too aggressively and true matches are lost forever (low pair completeness); block too loosely and you pay for it in compute (low reduction ratio).",
      },
      {
        id: "candidate-pair",
        term: "candidate pair",
        body: "A pair (i, j) that survived blocking and will actually be compared at the similarity stage. Everything downstream — similarity, classification, clustering — only ever sees candidate pairs, so a true match that blocking discards can never be recovered.",
      },
      {
        id: "pair-completeness",
        term: "pair completeness",
        aka: "PC · blocking recall",
        body: "PC = (true matches among candidates) / (all true matches). The recall of the blocking step: what fraction of real duplicates made it into the candidate set. If PC < 1, some true matches are gone before comparison even starts. Good blocking keeps PC near 1.0 while still cutting pairs.",
      },
      {
        id: "reduction-ratio",
        term: "reduction ratio",
        aka: "RR",
        body: "RR = 1 − (candidate pairs) / (all n(n−1)/2 pairs). The fraction of comparisons blocking saved you. RR = 0.99 means 99% of pairs were skipped. The art of blocking is maximizing RR and PC together — usually in tension.",
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
      {
        id: "transitivity",
        term: "transitivity",
        body: "If A = B and B = C then A = C: the logical rule that turns pairwise “match” links into entity clusters via connected components. Its dark side is chaining — one false link (A≈B, B≈C, but A≠C) fuses two real entities. Raising the similarity threshold is the usual antidote.",
      },
      {
        id: "consensus-clustering",
        term: "consensus clustering",
        body: "Merging several clustering results by majority vote on co-membership: a pair is co-clustered only if at least a fraction α of methods agree (α = 0.5 is majority vote; α = 1.0 demands unanimity). Trades the quirks of any single method for the wisdom of the crowd.",
      },
      {
        id: "co-membership",
        term: "co-membership",
        body: "Two records landing in the same cluster. Many ER metrics and merging rules are defined purely in terms of co-membership — which pairs are together — rather than cluster labels, because labels are arbitrary but “together or not” is not.",
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
        id: "medoid",
        term: "medoid",
        body: "The actual record minimizing the sum of distances to all other members of its cluster — the “most central” real data point. Unlike a centroid (a mean that may correspond to no real record), a medoid is always one of the records, which makes PAM's clusters explainable: “this cluster is represented by this record.”",
      },
      {
        id: "modularity",
        term: "modularity",
        aka: "Q",
        body: "Q = Σᵢⱼ [Aᵢⱼ − kᵢkⱼ/2m] δ(cᵢ,cⱼ) / 2m: edge density inside communities minus what you'd expect by chance. Louvain greedily maximizes it. Its known flaw is the resolution limit — communities smaller than ~√(2m) nodes tend to get merged — which is why Leiden and CPM exist.",
      },
      {
        id: "silhouette",
        term: "silhouette width",
        body: "s(i) = (b(i) − a(i)) / max(a(i), b(i)), where a(i) is the mean distance to its own cluster and b(i) the mean distance to the nearest other cluster. Ranges [−1, 1]: near 1 means well-placed, near 0 means on a boundary, negative means probably misassigned. Averaged over records to pick k without truth.",
      },
      {
        id: "cpm",
        term: "CPM",
        aka: "Constant Potts Model",
        body: "CPM = Σc [ec − γ·nc(nc−1)/2]: like modularity, but compares each community's internal edges against an absolute density threshold γ instead of a chance model. Because the threshold doesn't scale with graph size, CPM has no resolution limit — tiny dense communities survive. Used by the gc (graph coloring) method.",
      },
      {
        id: "chromatic-number",
        term: "chromatic number",
        aka: "χ",
        body: "The minimum colors needed so no two adjacent graph vertices share a color. ER-as-graph-coloring flips the problem: build a conflict graph (edges where similarity is LOW), and a proper coloring assigns entity labels — records that must differ get different colors.",
      },
      {
        id: "resolution-limit",
        term: "resolution limit",
        body: "Modularity's blind spot (Fortunato & Barthélemy, 2007): communities smaller than ~√(2m) nodes tend to be merged with neighbors even when they're perfectly dense. For ER data with many tiny entities (2–3 records each), this silently fuses real entities. Mitigations: raise γ, use threshold_cc, or use CPM-based gc.",
      },
      {
        id: "resolution-parameter",
        term: "resolution parameter",
        aka: "γ",
        body: "The granularity knob in Louvain/Leiden/CPM: higher γ favors smaller, tighter communities; lower γ favors larger ones. There is no universally right value — it encodes how fine-grained you believe the true entities are.",
      },
      {
        id: "cluster-ensemble",
        term: "cluster ensemble",
        body: "Combining multiple clustering results into one final partition — e.g. by consensus voting on co-membership. Different methods make different mistakes; the ensemble keeps only the agreements. See consensus clustering.",
      },
      {
        id: "spectral-embedding",
        term: "spectral embedding",
        body: "A low-dimensional representation from the leading singular vectors of the similarity matrix S ≈ UΣVᵀ, taking X = UΣ (default 50 dims via irlba). Centroidal methods (hclust, PAM) can't work on a sparse graph directly, so they work on X instead — geometry recovered from the graph.",
      },
      {
        id: "svd",
        term: "SVD",
        aka: "Singular value decomposition",
        body: "S ≈ UΣVᵀ: factors any matrix into orthogonal U, V and a diagonal Σ of singular values. Truncating to the top-d components gives the best rank-d approximation — the engine behind spectral embeddings and dimensionality reduction throughout ER.",
      },
      {
        id: "irlba",
        term: "irlba",
        body: "Implicitly Restarted Lanczos Bidiagonalization Algorithm: computes only the top-d singular vectors of a large sparse matrix without ever forming the dense matrix. What makes spectral embedding feasible at n = 10,000+.",
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
      {
        id: "nmi",
        term: "NMI",
        aka: "Normalized mutual information",
        body: "NMI = 2·I(C;K) / (H(C)+H(K)): shared information between predicted and true clusters, normalized to [0, 1]. 1 is perfect, 0 is no shared information. More stable than ARI when comparing clusterings with very different numbers of clusters.",
      },
      {
        id: "vi",
        term: "VI",
        aka: "Variation of information",
        body: "VI(C,K) = H(C|K) + H(K|C): the bits of information lost between two clusterings. 0 is perfect. Unlike ARI/NMI it is a true metric (triangle inequality holds), which makes it suitable for theoretical analysis.",
      },
      {
        id: "v-measure",
        term: "V-measure",
        body: "The harmonic mean of homogeneity and completeness: V = 2·H·C/(H+C). Like an F-score, but for cluster structure instead of pairs — it rewards clusters that are both pure and complete.",
      },
      {
        id: "homogeneity",
        term: "homogeneity",
        body: "Each cluster contains only records from a single true entity: H = 1 − H(C|K)/H(C). 1 means perfectly pure clusters. Its twin is completeness (each entity's records all land in one cluster); V-measure is their harmonic mean.",
      },
      {
        id: "entity-disjoint-split",
        term: "entity-disjoint split",
        body: "Train/test split by entity, not by record: all records of test entities are withheld from training, mimicking deployment on unseen entities. Conceptually cleaner than record-disjoint splits (which leak entity-specific patterns and inflate scores ~5–15%), but circular in practice — defining the split requires the entity labels ER is trying to discover.",
      },
      {
        id: "confusion-matrix",
        term: "confusion matrix",
        aka: "contingency table",
        body: "The k×ℓ table with mij = |Ci ∩ C′ⱼ|: how many records the predicted cluster i and the true cluster j share. Almost every clustering-comparison metric — Rand, ARI, Fowlkes–Mallows, NMI, VI — is computed from this table (or equivalently from pair counts n₁₁, n₀₀, n₁₀, n₀₁).",
      },
      {
        id: "rand-index",
        term: "Rand index",
        body: "R = 2(n₁₁+n₀₀) / n(n−1): the fraction of record pairs classified the same way by both clusterings (together or apart in both). Ranges [0, 1]. Simple but optimistic — even random clusterings score high when there are many clusters — which is why the adjusted version (ARI) corrects for chance.",
      },
      {
        id: "fowlkes-mallows",
        term: "Fowlkes–Mallows index",
        body: "FM = √(n₁₁/(n₁₁+n₁₀) · n₁₁/(n₁₁+n₀₁)): the geometric mean of pairwise precision and recall. Rewards clusterings that agree on which pairs belong together, ignoring the vast n₀₀ background of pairs apart in both. Like ARI it is usually reported against a chance-corrected baseline.",
      },
      {
        id: "mirkin-metric",
        term: "Mirkin metric",
        aka: "equivalence mismatch distance",
        body: "M = Σᵢ|Ci|² + Σⱼ|C′ⱼ|² − 2Σᵢⱼmᵢⱼ² = n(n−1)(1−R): a true metric on the space of clusterings, directly tied to the Rand index. Counts the pairs on which the two clusterings disagree — an edit distance for partitions.",
      },
      {
        id: "clustering-jaccard",
        term: "clustering Jaccard",
        body: "J = n₁₁ / (n₁₁+n₁₀+n₀₁): like the Rand index but disregards n₀₀, the pairs apart in both clusterings. Harsher than Rand when most pairs are trivially apart (the usual ER case). Not to be confused with token Jaccard, which compares word sets of two strings.",
      },
      {
        id: "van-dongen",
        term: "van Dongen measure",
        body: "D = 2n − Σᵢ maxⱼ mᵢⱼ − Σⱼ maxᵢ mᵢⱼ: for each cluster, take its largest overlap with the other clustering and sum. A metric on clusterings — but it only sees the overlaps and ignores everything outside them.",
      },
      {
        id: "maximum-match",
        term: "maximum-match measure",
        body: "Greedily match cluster pairs with the largest confusion-matrix overlap, cross them out, repeat; MM = (matched records)/n. Symmetric and intuitive (“how much of each clustering can be aligned”), but completely ignores the |k−ℓ| leftover clusters when the counts differ.",
      },
      {
        id: "clustering-entropy",
        term: "clustering entropy",
        body: "H(C) = −Σᵢ P(i) log₂ P(i), with P(i) = |Ci|/n: the uncertainty about a random record's cluster. 0 for trivial clusterings (one cluster, or all singletons — you already know the answer). The building block of all information-theoretic comparison measures.",
      },
      {
        id: "mutual-information",
        term: "mutual information",
        body: "I(C;C′) = Σᵢⱼ P(i,j) log₂(P(i,j)/(P(i)P(j))): how much knowing a record's cluster in C′ reduces uncertainty about its cluster in C. Unbounded, so it's normalized into NMI (Strehl–Ghosh: ÷√(H(C)H(C′)); Fred–Jain: ÷(H(C)+H(C′))/2) or turned into the VI distance.",
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
  {
    id: "foundations",
    title: "Foundations",
    intro: "The ideas underneath the pipeline: what an entity is, how missing data behaves, and the learning theory behind the methods.",
    entries: [
      {
        id: "entity",
        term: "entity",
        body: "A real-world object — a person, company, publication — that may appear as multiple records. ER's whole job is to recover entities from records. Not to be confused with a cluster (the pipeline's guess at an entity) or a record (one row).",
      },
      {
        id: "deduplication",
        term: "deduplication",
        body: "ER within a single dataset: which records refer to the same entity? The Studio's main mode. Its sibling is record linkage — matching across two or more datasets.",
      },
      {
        id: "record-linkage",
        term: "record linkage",
        body: "ER across two or more datasets: which record in A matches which in B? The classic Fellegi–Sunter (1969) problem. Deduplication is the single-dataset special case.",
      },
      {
        id: "both-null-artifact",
        term: "both-null artifact",
        body: "The trap of scoring two missing values as identical: sim(“”, “”) = 1 is mathematically tidy but semantically wrong — two records that both lack a field provide no evidence of being the same entity. ERBOT scores missing as NA instead, so the field is ignored for that pair rather than injecting false match signal.",
      },
      {
        id: "missing-mechanisms",
        term: "MCAR / MAR / MNAR",
        aka: "Missing-data mechanisms",
        body: "Rubin's taxonomy: MCAR (missingness independent of everything — benign), MAR (missingness depends only on observed data, e.g. source — imputable), MNAR (missingness depends on the missing value itself — the hard case). In ER, systematic missingness (a whole source lacking a field) is the dangerous pattern; per-pair NA handling absorbs it without imputation.",
      },
      {
        id: "em-algorithm",
        term: "EM algorithm",
        aka: "Expectation–Maximization",
        body: "Alternates an E-step (compute expected class memberships given current parameters) and an M-step (re-estimate parameters from those memberships) until convergence. ERBOT's Fellegi–Sunter weighting fits a 2-component Beta mixture this way — no labels needed — then sets field weights ∝ log(mk/uk).",
      },
      {
        id: "bimodality",
        term: "bimodality coefficient",
        aka: "Sarle's BC",
        body: "BC = (skewness² + 1) / (kurtosis + 3(n−1)²/((n−2)(n−3))). BC > 0.555 suggests a two-peaked distribution. A field whose pair-similarities split into “clearly match” and “clearly not” humps is discriminative — hence a weight-learning signal that needs no truth.",
      },
      {
        id: "contrastive-loss",
        term: "contrastive loss",
        body: "Pushes match-pair embeddings together and non-match embeddings apart on the unit sphere. The learned-retriever blocking trains an MLP encoder with this objective — optimized for recall@K (don't miss duplicates), not classification accuracy.",
      },
      {
        id: "infonce",
        term: "InfoNCE",
        body: "L = −log[ exp(zᵢ·zⱼ/τ) / Σₖ exp(zᵢ·zₖ/τ) ]: the contrastive loss as a softmax — the positive pair must out-score all in-batch negatives. All non-positive pairs in the batch serve as negatives, so batch size implicitly controls the negative ratio.",
      },
      {
        id: "temperature",
        term: "temperature",
        aka: "τ",
        body: "The softmax sharpness in InfoNCE. Low τ (0.1 is standard) makes the distribution peaked: the model must separate even the hardest negatives. High τ makes training easier but embeddings less discriminative.",
      },
      {
        id: "covariate-shift",
        term: "covariate shift",
        body: "When feature distributions drift between training and deployment — e.g. a retriever trained on restaurant names applied to person names. The honest held-out protocol (entity-disjoint split) is the standard guard: it measures generalization to unseen entities, not memorization of seen ones.",
      },
      {
        id: "sparse-matrix",
        term: "sparse matrix",
        body: "A matrix that stores only non-zero entries. The n×n similarity matrix is almost entirely empty (only candidate pairs have scores) — at n = 10,000 with 200,000 pairs, ~5 MB sparse vs ~800 MB dense. What makes large-n clustering feasible at all.",
      },
    ],
  },
];

const TERM_MAP: Record<string, Entry> = {};
for (const s of SECTIONS) for (const e of s.entries) TERM_MAP[e.id] = e;

export function getTerm(id: string): Entry | null {
  return TERM_MAP[id] ?? null;
}
