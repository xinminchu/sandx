export type Paper = {
  n: number;
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  citations: number | null;
  themes: string[];
  method: string[];
  supervision: string;
  dataType: string;
  scale: string;
  abstract: string;
  focus: string;
  borrow: string;
  fill: string;
  correct: string;
  verified: boolean;
  verifyNote?: string;
};

export const THEMES: { id: string; name: string; blurb: string }[] = [
  { id: "blocking", name: "Blocking & candidate generation", blurb: "Deciding which pairs are worth comparing at all." },
  { id: "similarity", name: "Similarity & string metrics", blurb: "Measuring how alike two values or records look." },
  { id: "probabilistic", name: "Probabilistic matching", blurb: "The Fellegi–Sunter lineage: weights, thresholds, EM estimation." },
  { id: "ml-deep", name: "ML & deep matching", blurb: "Learned matchers, from feature classifiers to transformers." },
  { id: "clustering", name: "Clustering & transitive closure", blurb: "Turning pairwise decisions into entities." },
  { id: "evaluation", name: "Evaluation, benchmarks & datasets", blurb: "How the field measures itself — and the data it measures on." },
  { id: "scalable", name: "Scalable, distributed & streaming ER", blurb: "Entity resolution at millions of records and beyond." },
  { id: "privacy-bayesian", name: "Privacy-preserving & Bayesian ER", blurb: "Linking without seeing the data; linkage as posterior inference." },
  { id: "llm", name: "LLM-era ER", blurb: "What changes when the matcher is a large language model." },
];

export const PAPERS: Paper[] = [
 {
  "n": 1,
  "id": "er-001",
  "title": "The merge/purge problem for large databases",
  "authors": [
   "Mauricio A. Hernández",
   "Salvatore J. Stolfo"
  ],
  "year": 1995,
  "venue": "ACM SIGMOD Record",
  "doi": "10.1145/568271.223807",
  "citations": 213,
  "themes": [
   "blocking",
   "similarity"
  ],
  "method": [
   "key-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "The founding statement of the merge/purge problem: detecting and merging duplicate records that refer to the same entity across (or within) large databases, where duplicates differ through errors and format variation, so exact matching fails. Published in ACM SIGMOD Record in 1995, it framed deduplication as a first-class database problem and is the historical root of the blocking-then-matching pipeline (its sorted-neighbourhood line of work).",
  "borrow": "Historical anchor and vocabulary: ERBOT's documentation can trace its pipeline shape — sort/group first, compare within neighbourhoods, then merge — to this paper, and its problem framing (duplicates created by error and heterogeneity, not by malice) still describes our input data accurately.",
  "fill": "The 1995 framing names the problem but works with hand-built rules and sorted orders: it says nothing about how to choose comparisons under a budget, or how merge errors propagate when transitive merging chains across millions of records. That is precisely the space ERBOT's budget-bounded, learned pipeline can claim — keep the paper's pipeline shape, supply the comparison budgeting and error control it never had.",
  "correct": "The 1995 framing assumes duplicates are detectable from the records' own fields with hand-built rules and sorted orders; it predates learned representations, privacy constraints, and web-scale volumes, so its implicit claim — that careful rule engineering suffices — is exactly what three decades of ER research, including the learned-blocking line in this batch, have had to qualify.",
  "verified": true
 },
 {
  "n": 2,
  "id": "er-002",
  "title": "Efficient clustering of high-dimensional data sets with application to reference matching",
  "authors": [
   "Andrew McCallum",
   "Kamal Nigam",
   "Lyle H. Ungar"
  ],
  "year": 2000,
  "venue": "Proceedings of the sixth ACM SIGKDD international conference on Knowledge discovery and data mining",
  "doi": "10.1145/347090.347123",
  "citations": 1271,
  "themes": [
   "blocking"
  ],
  "method": [
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Introduces canopy clustering as a cheap pre-clustering step for high-dimensional data: a fast, approximate distance first groups records into overlapping canopies, and expensive comparisons are then restricted to records sharing a canopy. The paper is framed around reference matching (bibliographic deduplication), making it one of the founding statements of blocking as approximate clustering rather than exact key equality.",
  "borrow": "The two-tier cost idea — a very cheap first-pass grouping that bounds where expensive similarity computation may happen — maps directly onto ERBOT's blocking stage as a design principle: spend compute in proportion to promise, not uniformly.",
  "fill": "The paper leaves its two canopy distance thresholds to hand-tuning, with no procedure for choosing them to hit a target recall. We can automate threshold selection against a recall budget inside ERBOT and test whether canopy pre-clustering still earns its place next to token blocking and learned retrieval at multi-million-record scale.",
  "correct": "Canopy quality hinges on two hand-set distance thresholds and on record order, and the paper offers no principled way to choose them for a target recall; on modern ER benchmarks the method's recall is fragile compared with token blocking plus meta-blocking or learned retrieval, so its specific algorithm should be treated as a historical baseline, not a default.",
  "verified": true
 },
 {
  "n": 3,
  "id": "er-003",
  "title": "A Survey of Indexing Techniques for Scalable Record Linkage and Deduplication",
  "authors": [
   "Peter Christen"
  ],
  "year": 2012,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2011.127",
  "citations": 780,
  "themes": [
   "blocking",
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "A survey of indexing (blocking) techniques for scalable record linkage and deduplication, organising the classical repertoire — standard blocking, sorted neighbourhood, q-gram and suffix-array indexing, canopy clustering, and related approaches — and discussing their efficiency and effectiveness trade-offs.",
  "borrow": "This is the taxonomy ERBOT's blocking documentation should align with: it gives the standard vocabulary and the expected strengths and failure modes of each classical index, which is exactly the baseline menu a new blocking method must compare against.",
  "fill": "The survey stops at the classical repertoire and bases its efficiency/effectiveness trade-offs on the small, clean datasets of its period, so re-testing its taxonomy against learned and ANN-based indexing at tens of millions of records — and turning the results into ERBOT's blocking defaults — is left for us.",
  "correct": "The survey predates embedding-based and learned blocking entirely, and its effectiveness discussion rests on the relatively small, clean datasets typical of that period; its comparative guidance should not be extrapolated to web-scale or semantically noisy data without re-checking against post-2020 benchmarks.",
  "verified": true
 },
 {
  "n": 4,
  "id": "er-004",
  "title": "Meta-Blocking: Taking Entity Resolutionto the Next Level",
  "authors": [
   "George Papadakis",
   "Georgia Koutrika",
   "Themis Palpanas",
   "Wolfgang Nejdl"
  ],
  "year": 2014,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2013.54",
  "citations": 143,
  "themes": [
   "blocking"
  ],
  "method": [
   "graph-based",
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "Introduces meta-blocking: instead of designing a new blocking key, take the block collection produced by any existing blocking method, model it as a graph whose edges are weighted by co-occurrence evidence, and prune the redundant and superfluous comparisons before matching. The goal is to raise blocking efficiency (fewer comparisons) without sacrificing pair completeness.",
  "borrow": "Meta-blocking is a drop-in post-processing layer for ERBOT: whatever first-stage blocker we run, a graph-pruning pass over its blocks can cut the candidate set before the expensive classification stage, and its weighting schemes give a principled knob for the recall/efficiency trade-off.",
  "fill": "Meta-blocking only prunes what the first-stage blocker produced and its pruning thresholds are tuned per dataset by hand; it was also designed around key-based blocks. What it leaves for us is an R-native meta-blocking layer with automatic, budget-driven pruning — and a test of whether the same graph pruning works on top of learned, embedding-based blocks, not just classical ones.",
  "correct": "Meta-blocking can only prune what the initial blocking produced — it inherits the first stage's recall ceiling and cannot recover matches the original keys never co-located. Its pruning thresholds are also typically tuned per dataset, so the claimed generality should be read as 'general framework, dataset-specific settings'.",
  "verified": true
 },
 {
  "n": 5,
  "id": "er-005",
  "title": "Noise-Tolerant Approximate Blocking for Dynamic Real-Time Entity Resolution",
  "authors": [
   "Huizhi Liang",
   "Yanzhe Wang",
   "Peter Christen",
   "Ross Gayler"
  ],
  "year": 2014,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/978-3-319-06605-9_37",
  "citations": 22,
  "themes": [
   "blocking"
  ],
  "method": [
   "key-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Addresses blocking for dynamic, real-time entity resolution, where records arrive continuously and contain noise, so exact blocking keys fail and the index must be maintained incrementally. It proposes an approximate blocking approach designed to tolerate noisy attribute values while supporting the dynamic setting.",
  "borrow": "ERBOT is batch-oriented today; this paper is the batch's reminder that blocking keys should degrade gracefully under typos and missing values — approximate, noise-tolerant key design is worth borrowing even in batch mode, because real input fields are noisy.",
  "fill": "The paper stays at workshop scale in a streaming setting and never shows how noise-tolerant approximate keys behave on millions of static records or in front of a learned matcher. That leaves us the batch version: build approximate, typo-tolerant blocking into ERBOT's pipeline for very large noisy datasets and measure the recall cost against exact keys.",
  "correct": "The real-time framing is validated in a workshop-paper-scale evaluation; the approach's behaviour at the multi-million-record scale ERBOT targets, and its interaction with a downstream learned matcher, remain undemonstrated, so its guarantees should be read as setting-specific.",
  "verified": true
 },
 {
  "n": 6,
  "id": "er-006",
  "title": "Supervised meta-blocking",
  "authors": [
   "George Papadakis",
   "George Papastefanatos",
   "Georgia Koutrika"
  ],
  "year": 2014,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/2733085.2733098",
  "citations": 48,
  "themes": [
   "blocking"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This PVLDB paper brings supervised learning to meta-blocking, the step that prunes redundant comparisons inside blocks before matching. Instead of relying on unsupervised pruning heuristics, it learns which comparisons to keep from labeled data, exploiting both the content of the records and schema information.",
  "borrow": "ERBOT can borrow the learned pruning step: a trained comparison-pruner between blocking and similarity scoring would cut the number of pairs the expensive later stages must process on very large datasets.",
  "fill": "The paper treats pruning as a self-contained step trained on labeled pairs; it leaves open how the pruner should interact with the downstream classifier and clustering stages, and how little labeled data it can get away with — integration questions we can take up inside ERBOT's end-to-end pipeline.",
  "correct": "The supervised framing assumes labeled match and non-match pairs are available for training, yet producing such labels is one of the main costs large-scale ER tries to avoid; the paper's gains should be weighed against that labeling effort.",
  "verified": true
 },
 {
  "n": 7,
  "id": "er-007",
  "title": "Practical and Optimal LSH for Angular Distance",
  "authors": [
   "Alexandr Andoni",
   "Piotr Indyk",
   "Thijs Laarhoven",
   "Ilya Razenshteyn",
   "Ludwig Schmidt"
  ],
  "year": 2015,
  "venue": "arXiv:1509.02897",
  "doi": null,
  "citations": null,
  "themes": [
   "blocking"
  ],
  "method": [
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "We show the existence of a Locality-Sensitive Hashing (LSH) family for the angular distance that yields an approximate Near Neighbor Search algorithm with the asymptotically optimal running time exponent. Unlike earlier algorithms with this property (e.g., Spherical LSH [Andoni, Indyk, Nguyen, Razenshteyn 2014], [Andoni, Razenshteyn 2015]), our algorithm is also practical, improving upon the well-studied hyperplane LSH [Charikar, 2002] in practice. We also introduce a multiprobe version of this algorithm, and conduct experimental evaluation on real and synthetic data sets. We complement the above positive results with a fine-grained lower bound for the quality of any LSH family for angular distance. Our lower bound implies that the above LSH family exhibits a trade-off between evaluation time and quality that is close to optimal for a natural class of LSH functions.",
  "focus": "Gives a locality-sensitive hashing family for angular (cosine) distance whose approximate near-neighbour search achieves the asymptotically optimal running-time exponent, while — unlike earlier optimal constructions — remaining practical, improving on the classic hyperplane LSH in experiments. A multiprobe variant and a matching lower bound for LSH families round out the theory-practice picture.",
  "borrow": "LSH is the hashing ancestor of ERBOT's approximate candidate generation: its collision-probability mathematics is the right language for reasoning about why similar records land together, and cross-polytope-style hashing remains a candidate when we need a CPU-friendly, index-light blocker.",
  "fill": "The optimality result is proved for angular near-neighbour search in the abstract, but the method is never tried on entity-resolution data, where a few huge duplicate clusters and many singletons make hash-bucket sizes wildly uneven. We can evaluate cross-polytope and multiprobe LSH as ERBOT blockers on skewed real files and measure the recall-versus-cost trade-off the theory does not predict.",
  "correct": "Optimality is asymptotic and stated for the angular-distance near-neighbour problem under the paper's model; ER data are heavily skewed (a few huge duplicate clusters, many singletons), a regime where LSH bucket-size variance, not the exponent, dominates real cost — so the optimality claim should not be read as a practical ranking over graph or IVF indexes.",
  "verified": true
 },
 {
  "n": 8,
  "id": "er-008",
  "title": "Boosting the Efficiency of Large-Scale Entity Resolution with Enhanced Meta-Blocking",
  "authors": [
   "George Papadakis",
   "George Papastefanatos",
   "Themis Palpanas",
   "Manolis Koubarakis"
  ],
  "year": 2016,
  "venue": "Big Data Research",
  "doi": "10.1016/j.bdr.2016.08.002",
  "citations": 8,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "graph-based",
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "Extends the meta-blocking framework with enhanced weighting and pruning schemes aimed at large-scale, heterogeneous entity collections, where block sizes and redundancy grow much worse than in the curated benchmarks of the original meta-blocking work. The contribution is efficiency: keeping meta-blocking's recall while pushing it to substantially larger and messier data.",
  "borrow": "For ERBOT's very-large-dataset target, this is the reference point for how block-graph pruning behaves when blocks number in the millions: its enhanced schemes are the ones to benchmark our blocking stage against before inventing new pruning rules.",
  "fill": "The pruning schemes only remove comparisons — they cannot recover pairs the first-stage blocker already missed, so the recall ceiling is set before meta-blocking starts, and the whole design is batch-mode, with no way to update the block graph as records arrive. That leaves us two openings: pair meta-blocking with a learned first-stage blocker whose recall we control, and build the incremental block-graph update for streaming data that this line of work never attempts.",
  "correct": "The enhancements still operate downstream of a conventional first-stage blocker, so the recall ceiling problem is untouched, and 'large-scale' here is demonstrated in batch settings; incremental or streaming updates to the block graph are not addressed, which matters for any deployment where data arrives continuously.",
  "verified": true
 },
 {
  "n": 9,
  "id": "er-009",
  "title": "Accelerating Large-Scale Inference with Anisotropic Vector Quantization",
  "authors": [
   "Ruiqi Guo",
   "Philip Sun",
   "Erik Lindgren",
   "Quan Geng",
   "David Simcha",
   "Felix Chern",
   "Sanjiv Kumar"
  ],
  "year": 2019,
  "venue": "arXiv:1908.10396",
  "doi": null,
  "citations": null,
  "themes": [
   "blocking"
  ],
  "method": [
   "embedding/ANN"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "Quantization based techniques are the current state-of-the-art for scaling maximum inner product search to massive databases. Traditional approaches to quantization aim to minimize the reconstruction error of the database points. Based on the observation that for a given query, the database points that have the largest inner products are more relevant, we develop a family of anisotropic quantization loss functions. Under natural statistical assumptions, we show that quantization with these loss functions leads to a new variant of vector quantization that more greatly penalizes the parallel component of a datapoint's residual relative to its orthogonal component. The proposed approach achieves state-of-the-art results on the public benchmarks available at \\url{ann-benchmarks.com}.",
  "focus": "This paper improves quantization-based maximum inner product search, the retrieval core of large-scale nearest-neighbor systems. Observing that only the database points with the largest inner products to a query matter, it defines anisotropic quantization loss functions that penalize error in the component of a datapoint's residual parallel to the datapoint more heavily than the orthogonal component, and reports state-of-the-art results on the ann-benchmarks suite.",
  "borrow": "ERBOT can borrow anisotropic quantization as the index behind embedding-based blocking: candidate pairs for a record can be retrieved by inner-product search over record embeddings instead of materializing all pairs.",
  "fill": "The paper evaluates generic maximum-inner-product accuracy and speed on ANN benchmarks and never addresses entity resolution — no blocking recall targets, no record embeddings, no downstream matching. Measuring anisotropic quantization specifically as a blocking stage, where a missed pair is a lost match, is left for us to do.",
  "correct": "Its state-of-the-art claim rests on public ANN benchmarks and on the statistical assumptions about query and data distributions stated in the paper; embeddings of messy real-world records may not satisfy those assumptions, so the benchmark gains need not transfer to blocking recall.",
  "verified": true
 },
 {
  "n": 10,
  "id": "er-010",
  "title": "AutoBlock: A Hands-off Blocking Framework for Entity Matching",
  "authors": [
   "Wei Zhang",
   "Hao Wei",
   "Bunyamin Sisman",
   "Xin Luna Dong",
   "Christos Faloutsos",
   "Davd Page"
  ],
  "year": 2020,
  "venue": "Proceedings of the 13th International Conference on Web Search and Data Mining",
  "doi": "10.1145/3336191.3371813",
  "citations": 42,
  "themes": [
   "blocking",
   "ml-deep"
  ],
  "method": [
   "deep learning",
   "embedding/ANN"
  ],
  "supervision": "self-supervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "Presents AutoBlock, a hands-off blocking framework for entity matching that removes the need to hand-craft blocking rules: neural network ensembles learn record representations used to retrieve candidate pairs automatically. It is an early demonstration that blocking itself, not just matching, can be learned end to end.",
  "borrow": "The hands-off premise is the borrowable idea: ERBOT's learned retriever follows the same bet that a trained representation plus nearest-neighbour retrieval can replace hand-maintained blocking rules, and AutoBlock is the baseline that bet must beat.",
  "fill": "AutoBlock's learned blocker quietly depends on training data drawn from the same distribution as the target data, and the paper offers no recall guarantee or budget control over the candidate set it returns. What it leaves for us is the transfer question — train a blocker on one collection and block a different one — plus explicit recall-versus-budget control, which ERBOT's learned retriever is positioned to test.",
  "correct": "Later design-space work (DeepBlocker) showed AutoBlock's particular architecture is not the strongest learned blocker and that simpler self-supervised embeddings can match or beat it; its 'hands-off' claim also quietly depends on training data drawn from the same distribution as the target data, which limits transfer to new domains.",
  "verified": true
 },
 {
  "n": 11,
  "id": "er-011",
  "title": "Efficient and Robust Approximate Nearest Neighbor Search Using Hierarchical Navigable Small World Graphs",
  "authors": [
   "Yu A. Malkov",
   "D. A. Yashunin"
  ],
  "year": 2020,
  "venue": "IEEE Transactions on Pattern Analysis and Machine Intelligence",
  "doi": "10.1109/tpami.2018.2889473",
  "citations": 2983,
  "themes": [
   "blocking"
  ],
  "method": [
   "embedding/ANN",
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "large (100K-1M)",
  "abstract": "We present a new approach for the approximate K-nearest neighbor search based on navigable small world graphs with controllable hierarchy (Hierarchical NSW, HNSW). The proposed solution is fully graph-based, without any need for additional search structures (typically used at the coarse search stage of the most proximity graph techniques). Hierarchical NSW incrementally builds a multi-layer structure consisting of a hierarchical set of proximity graphs (layers) for nested subsets of the stored elements. The maximum layer in which an element is present is selected randomly with an exponentially decaying probability distribution. This allows producing graphs similar to the previously studied Navigable Small World (NSW) structures while additionally having the links separated by their characteristic distance scales. Starting the search from the upper layer together with utilizing the scale separation boosts the performance compared to NSW and allows a logarithmic complexity scaling. Additional employment of a heuristic for selecting proximity graph neighbors significantly increases performance at high recall and in case of highly clustered data. Performance evaluation has demonstrated that the proposed general metric space search index is able to strongly outperform previous opensource state-of-the-art vector-only approaches. Similarity of the algorithm to the skip list structure allows straightforward balanced distributed implementation.",
  "focus": "Presents HNSW, a graph-based approximate nearest-neighbour index that builds a multi-layer hierarchy of proximity graphs over nested subsets of the data, with elements assigned to layers by an exponentially decaying distribution, giving logarithmic search scaling. A neighbour-selection heuristic improves performance at high recall and on clustered data, and benchmarks show it outperforming prior open-source vector search approaches.",
  "borrow": "HNSW is the default ANN index candidate for ERBOT's embedding blocking at moderate-to-large scale: its recall/latency trade-off is tunable through two intuitive parameters, and the R ecosystem already has bindings (hnswlib), which matters for an R-based pipeline.",
  "fill": "HNSW leaves updates and deletions awkward and its memory footprint grows steeply with graph degree, so making it serve an ER index that must absorb corrections — and mapping its parameters to blocking recall rather than generic search recall — is open work for us.",
  "correct": "HNSW's costs are memory and mutability: the graph holds many edges per vector, so billion-scale use is expensive, and deletions and updates are awkward — for ER workloads where the index must absorb corrections, an IVF-style index may age better. Its recall also depends on parameters whose good settings vary with data clustering.",
  "verified": true
 },
 {
  "n": 12,
  "id": "er-012",
  "title": "BEER: Blocking for Effective Entity Resolution",
  "authors": [
   "Sainyam Galhotra",
   "Donatella Firmani",
   "Barna Saha",
   "Divesh Srivastava"
  ],
  "year": 2021,
  "venue": "Proceedings of the 2021 International Conference on Management of Data",
  "doi": "10.1145/3448016.3452747",
  "citations": 8,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "Presents BEER, a blocking method for entity resolution published at SIGMOD 2021, aimed at making candidate generation both effective and efficient for large databases. (The record carries no abstract; the contribution is a blocking algorithm rather than a matching model.)",
  "borrow": "BEER belongs on ERBOT's baseline list for the blocking stage: a SIGMOD-grade, effectiveness-focused blocker is the kind of strong classical competitor our learned retriever must be compared against on equal candidate budgets.",
  "fill": "BEER is a blocking-only contribution, so what its candidate sets do to end-to-end match quality is not settled by the paper itself; measuring that against meta-blocking and learned retrievers on ERBOT's own large datasets remains for us to do.",
  "correct": "Without an abstract in the record we flag the obvious scope question rather than a specific flaw: blocking-only contributions live or die by end-to-end pipeline effect, and any adoption decision for ERBOT should wait on reading its recall-versus-candidate-size curves against meta-blocking and DeepBlocker on our own data.",
  "verified": true
 },
 {
  "n": 13,
  "id": "er-013",
  "title": "Billion-Scale Similarity Search with GPUs",
  "authors": [
   "Jeff Johnson",
   "Matthijs Douze",
   "Herve Jegou"
  ],
  "year": 2021,
  "venue": "IEEE Transactions on Big Data",
  "doi": "10.1109/tbdata.2019.2921572",
  "citations": 3100,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "embedding/ANN",
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "",
  "focus": "Presents the GPU similarity-search work behind FAISS: exact and approximate k-nearest-neighbour search over embedding vectors, engineered to scale to billions of vectors on GPU hardware. It is the systems foundation that makes embedding-based candidate generation computationally plausible at web scale.",
  "borrow": "This is the retrieval engine layer for ERBOT's learned blocking at very large scale: once records are embedded, an index of this class (FAISS and its IVF/PQ machinery) is what turns 'find each record's nearest neighbours' from an O(n^2) fantasy into a routine step, and its recall/speed knobs map onto our candidate-budget choices.",
  "fill": "FAISS stops at vector proximity: it reports index recall, not the blocking pair completeness an ER pipeline actually lives or dies by, and the engineering is GPU-centric while our pipeline is R-based and often CPU-only. The open work for us is the translation layer — measuring how index recall maps to real pair completeness on linkage data, and wrapping this class of index so an R pipeline can use it with ER-level recall reporting.",
  "correct": "FAISS optimises vector proximity, not entity resolution: it knows nothing of records, attributes, or match semantics, and its recall figures are index recall (did we find the true nearest vectors), which is an upper bound on, not a substitute for, blocking pair completeness. Treating ANN recall as ER recall is a category error we should avoid in our own reporting.",
  "verified": true
 },
 {
  "n": 14,
  "id": "er-014",
  "title": "Blocking and Filtering Techniques for Entity Resolution: A Survey",
  "authors": [
   "George Papadakis",
   "Dimitrios Skoutas",
   "Emmanouil Thanos",
   "Themis Palpanas"
  ],
  "year": 2021,
  "venue": "ACM Computing Surveys",
  "doi": "10.1145/3377455",
  "citations": 238,
  "themes": [
   "blocking",
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "Entity Resolution (ER), a core task of Data Integration, detects different entity profiles that correspond to the same real-world object. Due to its inherently quadratic complexity, a series of techniques accelerate it so that it scales to voluminous data. In this survey, we review a large number of relevant works under two different but related frameworks: Blocking and Filtering. The former restricts comparisons to entity pairs that are more likely to match, while the latter identifies quickly entity pairs that are likely to satisfy predetermined similarity thresholds. We also elaborate on hybrid approaches that combine different characteristics. For each framework we provide a comprehensive list of the relevant works, discussing them in the greater context. We conclude with the most promising directions for future work in the field.",
  "focus": "Surveys the techniques that make entity resolution scale, under two frameworks: blocking, which restricts comparisons to likely-matching pairs grouped by signatures, and filtering, which quickly identifies pairs satisfying a similarity threshold, plus hybrid approaches combining both. It organises a large body of work in each framework and closes with directions for future research.",
  "borrow": "The blocking-versus-filtering distinction is directly useful for ERBOT's architecture: our pipeline should state explicitly which stages block (group) and which filter (threshold), and the survey's catalogue is a checklist of candidate techniques for each slot.",
  "fill": "The survey catalogues the blocking and filtering families but runs no head-to-head comparison under a single harness, and its map stops at 2021, before learned embedding blockers matured. We can supply the missing empirical layer: implement the main techniques in ERBOT, benchmark them on the same large datasets, and extend the comparison to the learned blockers the survey could not cover.",
  "correct": "As a taxonomy paper it organises more than it adjudicates: readers should not treat inclusion or grouping in the survey as evidence of relative merit, since head-to-head performance depends heavily on configuration — a point the companion benchmarking work by the same group makes forcefully.",
  "verified": true
 },
 {
  "n": 15,
  "id": "er-015",
  "title": "Deep learning for blocking in entity matching: a design space exploration",
  "authors": [
   "Saravanan Thirumuruganathan",
   "Han Li",
   "Nan Tang",
   "Mourad Ouzzani",
   "Yash Govind",
   "Derek Paulsen",
   "Glenn Fung",
   "AnHai Doan"
  ],
  "year": 2021,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/3476249.3476294",
  "citations": 134,
  "themes": [
   "blocking",
   "ml-deep"
  ],
  "method": [
   "deep learning",
   "embedding/ANN"
  ],
  "supervision": "self-supervised",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Entity matching (EM) finds data instances that refer to the same real-world entity. Most EM solutions perform blocking then matching. Many works have applied deep learning (DL) to matching, but far fewer works have applied DL to blocking. These blocking works are also limited in that they consider only a simple form of DL and some of them require labeled training data. In this paper, we develop the DeepBlocker framework that significantly advances the state of the art in applying DL to blocking for EM. We first define a large space of DL solutions for blocking, which contains solutions of varying complexity and subsumes most previous works. Next, we develop eight representative solutions in this space. These solutions do not require labeled training data and exploit recent advances in DL (e.g., sequence modeling, transformer, self supervision). We empirically determine which solutions perform best on what kind of datasets (structured, textual, or dirty). We show that the best solutions (among the above eight) outperform the best existing DL solution and the best existing non-DL solutions (including a state-of-the-art industrial non-DL solution), on dirty and textual data, and are comparable on structured data. Finally, we show that the combination of the best DL and non-DL solutions can perform even better, suggesting a new venue for research.",
  "focus": "Develops DeepBlocker, a framework that defines a large design space of deep-learning blocking solutions — varying sequence encoders, tuple representation, and training objectives — and implements eight representative solutions that need no labeled training data. Experiments show the best solutions beat prior DL and non-DL blockers on dirty and textual data, are comparable on structured data, and that combining the best DL and non-DL solutions does better still.",
  "borrow": "Two things transfer directly: the design-space discipline (vary encoder, aggregation, and objective separately instead of proposing one monolithic model) for ERBOT's learned-blocking experiments, and the empirical finding that a hybrid of learned and traditional blocking beats either alone — an argument for keeping our classical blockers as ensemble members.",
  "fill": "The paper ends by showing that the best DL and non-DL blockers combined do better still, but leaves that hybrid unbuilt, and it never measures index build and query cost at tens of millions of records — implementing and costing the hybrid inside an R pipeline is work we can pick up.",
  "correct": "The headline wins are on dirty and textual benchmarks; on clean structured data the DL advantage disappears, and the benchmarks used are small by production standards. The framework also leaves the retrieval step's cost largely unexamined — embedding quality is optimised, but index build and query cost at tens of millions of records is where ERBOT's problem actually lives.",
  "verified": true
 },
 {
  "n": 16,
  "id": "er-016",
  "title": "How to reduce the search space of Entity Resolution: with Blocking or Nearest Neighbor search?",
  "authors": [
   "George Papadakis",
   "Marco Fisichella",
   "Franziska Schoger",
   "George Mandilaras",
   "Nikolaus Augsten",
   "Wolfgang Nejdl"
  ],
  "year": 2022,
  "venue": "arXiv:2202.12521",
  "doi": null,
  "citations": null,
  "themes": [
   "blocking",
   "evaluation"
  ],
  "method": [
   "benchmark",
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "large (100K-1M)",
  "abstract": "Entity Resolution suffers from quadratic time complexity. To increase its time efficiency, three kinds of filtering techniques are typically used for restricting its search space: (i) blocking workflows, which group together entity profiles with identical or similar signatures, (ii) string similarity join algorithms, which quickly detect entities more similar than a threshold, and (iii) nearest-neighbor methods, which convert every entity profile into a vector and quickly detect the closest entities according to the specified distance function. Numerous methods have been proposed for each type, but the literature lacks a comparative analysis of their relative performance. As we show in this work, this is a non-trivial task, due to the significant impact of configuration parameters on the performance of each filtering technique. We perform the first systematic experimental study that investigates the relative performance of the main methods per type over 10 real-world datasets. For each method, we consider a plethora of parameter configurations, optimizing it with respect to recall and precision. For each dataset, we consider both schema-agnostic and schema-based settings. The experimental results provide novel insights into the effectiveness and time efficiency of the considered techniques, demonstrating the superiority of blocking workflows and string similarity joins.",
  "focus": "Performs the first systematic experimental comparison of the three families of ER search-space reduction — blocking workflows, string similarity joins, and nearest-neighbour methods — over 10 real-world datasets in both schema-agnostic and schema-based settings, optimising each method's parameters for recall and precision. The results show blocking workflows and string similarity joins outperforming nearest-neighbour methods overall.",
  "borrow": "This is the reference experimental design for ERBOT's own comparisons: per-method parameter optimisation before comparison, both schema-agnostic and schema-based conditions, and recall/precision reported jointly. Its headline result is also a standing warning against assuming ANN retrieval is automatically the best blocker.",
  "fill": "The comparison pits blocking workflows against nearest-neighbour methods that use largely generic embeddings, so the contest between classical blocking and task-trained retrieval is still unsettled. We can rerun that head-to-head inside ERBOT with trained embeddings (DeepBlocker/SC-Block style) and with hybrid block-then-ANN pipelines that the study did not include.",
  "correct": "The conclusion that nearest-neighbour methods trail is configuration- and embedding-dependent: the NN methods were tested largely with generic fastText-style embeddings rather than the task-trained representations of DeepBlocker or SC-Block, so the verdict should not be read as settling 'blocking vs ANN' for learned embeddings.",
  "verified": true
 },
 {
  "n": 17,
  "id": "er-017",
  "title": "SC-Block: Supervised Contrastive Blocking within Entity Resolution Pipelines",
  "authors": [
   "Alexander Brinkmann",
   "Roee Shraga",
   "Christian Bizer"
  ],
  "year": 2023,
  "venue": "arXiv:2303.03132",
  "doi": null,
  "citations": null,
  "themes": [
   "blocking",
   "ml-deep"
  ],
  "method": [
   "deep learning",
   "embedding/ANN"
  ],
  "supervision": "supervised",
  "dataType": "textual",
  "scale": "large (100K-1M)",
  "abstract": "The goal of entity resolution is to identify records in multiple datasets that represent the same real-world entity. However, comparing all records across datasets can be computationally intensive, leading to long runtimes. To reduce these runtimes, entity resolution pipelines are constructed of two parts: a blocker that applies a computationally cheap method to select candidate record pairs, and a matcher that afterwards identifies matching pairs from this set using more expensive methods. This paper presents SC-Block, a blocking method that utilizes supervised contrastive learning for positioning records in the embedding space, and nearest neighbour search for candidate set building. We benchmark SC-Block against eight state-of-the-art blocking methods. In order to relate the training time of SC-Block to the reduction of the overall runtime of the entity resolution pipeline, we combine SC-Block with four matching methods into complete pipelines. For measuring the overall runtime, we determine candidate sets with 99.5% pair completeness and pass them to the matcher. The results show that SC-Block is able to create smaller candidate sets and pipelines with SC-Block execute 1.5 to 2 times faster compared to pipelines with other blockers, without sacrificing F1 score. Blockers are often evaluated using relatively small datasets which might lead to runtime effects resulting from a large vocabulary size being overlooked. In order to measure runtimes in a more challenging setting, we introduce a new benchmark dataset that requires large numbers of product offers to be blocked. On this large-scale benchmark dataset, pipelines utilizing SC-Block and the best-performing matcher execute 8 times faster than pipelines utilizing another blocker with the same matcher reducing the runtime from 2.5 hours to 18 minutes, clearly compensating for the 5 minutes required for training SC-Block.",
  "focus": "Presents SC-Block, which uses supervised contrastive learning to position records in an embedding space so that matching records are near each other, then builds candidate sets by nearest-neighbour search. Benchmarked against eight blocking methods and combined with four matchers into full pipelines, SC-Block produces smaller candidate sets at 99.5% pair completeness and pipelines run 1.5–2x faster (8x on the paper's new large product-offer benchmark) without losing F1.",
  "borrow": "The evaluation practice is the main borrow: fix pair completeness (99.5%), then compare candidate-set size and end-to-end pipeline runtime with real matchers attached. ERBOT's blocking experiments should adopt exactly this protocol instead of reporting blocking metrics in isolation.",
  "fill": "SC-Block assumes a supply of labeled matching pairs for its contrastive training and never addresses the label-scarce cold start that most real ER projects face. We can pick up that open problem — a self-supervised warm start plus a small, actively chosen label set — and check whether its pipeline speedups survive at ERBOT's multi-million-record scale.",
  "correct": "The method's premise is the availability of labeled matching pairs for contrastive training — precisely what cold-start ER projects lack — so its gains over self-supervised blockers are partly a supervision effect, not purely an architecture effect; the comparison would be fairer against label-matched baselines.",
  "verified": true
 },
 {
  "n": 18,
  "id": "er-018",
  "title": "Sparkly: A Simple yet Surprisingly Strong TF/IDF Blocker for Entity Matching",
  "authors": [
   "Derek Paulsen",
   "Yash Govind",
   "AnHai Doan"
  ],
  "year": 2023,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/3583140.3583163",
  "citations": 56,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "large (100K-1M)",
  "abstract": "Blocking is a major task in entity matching. Numerous blocking solutions have been developed, but as far as we can tell, blocking using the well-known tf/idf measure has received virtually no attention. Yet, when we experimented with tf/idf blocking using Lucene, we found it did quite well. So in this paper we examine tf/idf blocking in depth. We develop Sparkly, which uses Lucene to perform top-k tf/idf blocking in a distributed share-nothing fashion on a Spark cluster. We develop techniques to identify good attributes and tokenizers that can be used to block on, making Sparkly completely automatic. We perform extensive experiments showing that Sparkly outperforms 8 state-of-the-art blockers. Finally, we provide an in-depth analysis of Sparkly's performance, regarding both recall/output size and runtime. Our findings suggest that (a) tf/idf blocking needs more attention, (b) Sparkly forms a strong baseline that future blocking work should compare against, and (c) future blocking work should seriously consider top-k blocking, which helps improve recall, and a distributed share-nothing architecture, which helps improve scalability, predictability, and extensibility.",
  "focus": "Examines TF/IDF blocking — long ignored despite the maturity of the measure — and builds Sparkly, which performs top-k TF/IDF blocking with Lucene in a distributed, share-nothing Spark architecture, with automatic selection of blocking attributes and tokenizers. In extensive experiments Sparkly outperforms eight state-of-the-art blockers on recall, output size, and runtime.",
  "borrow": "Sparkly is the baseline ERBOT cannot skip: before claiming any learned blocker is better, compare it against top-k TF/IDF blocking at the same candidate budget. Its automatic attribute and tokenizer selection is also a practical pattern for making classical blocking hands-off.",
  "fill": "Sparkly's strength is demonstrated inside a Lucene/Spark stack, mostly on text-rich product data; whether top-k TF/IDF blocking wins on short, structured records like names and addresses is left open. That is our opening: implement top-k TF/IDF blocking natively in R as ERBOT's reference baseline and test it exactly where the paper is silent — short structured fields at scale.",
  "correct": "The result cuts both ways: if a decades-old IR measure beats eight modern blockers, some of Sparkly's margin may come from careful engineering and per-dataset tuning of attributes and tokenizers rather than from TF/IDF itself; its advantage on short, structured records (as opposed to text-rich product data) is also less clear.",
  "verified": true
 },
 {
  "n": 19,
  "id": "er-019",
  "title": "GSM: A generalized approach to Supervised Meta-blocking for scalable entity resolution",
  "authors": [
   "Luca Gagliardelli",
   "George Papadakis",
   "Giovanni Simonini",
   "Sonia Bergamaschi",
   "Themis Palpanas"
  ],
  "year": 2024,
  "venue": "Information Systems",
  "doi": "10.1016/j.is.2023.102307",
  "citations": 8,
  "themes": [
   "blocking",
   "ml-deep"
  ],
  "method": [
   "graph-based",
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "GSM (Generalized Supervised Meta-blocking) revisits supervised meta-blocking with transfer as the goal: instead of training a comparison-pruning model for one collection at a time, it learns a supervised pruning approach designed to generalize across datasets, and evaluates it for scalable entity resolution.",
  "borrow": "A pruning policy that transfers across collections fits ERBOT's budget framing well: the comparison budget could be allocated by a learned, reusable pruner rather than by per-dataset hand-tuned thresholds.",
  "fill": "GSM's transfer evidence covers a limited family of benchmark collections and it still needs labelled pairs to train the general pruner, so testing whether its pruning survives strong schema heterogeneity — and cutting the labelling it demands — is open work for us.",
  "correct": "The generalization claim rests on a limited family of benchmark collections; whether the learned pruner survives strong schema heterogeneity — where the blocking keys themselves change — is the point we would test before relying on it, and labeled pairs are still needed to train the general model in the first place.",
  "verified": true
 },
 {
  "n": 20,
  "id": "er-020",
  "title": "HyperBlocker: Accelerating Rule-Based Blocking in Entity Resolution Using GPUs",
  "authors": [
   "Xiaoke Zhu",
   "Min Xie",
   "Ting Deng",
   "Qi Zhang"
  ],
  "year": 2024,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/3705829.3705847",
  "citations": 6,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "key-based",
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "This paper studies rule-based blocking in Entity Resolution (ER). We propose HyperBlocker, a GPU-accelerated system for blocking in ER. As opposed to previous blocking algorithms and parallel blocking solvers, HyperBlocker employs a pipelined architecture to overlap data transfer and GPU operations. It generates a data-aware and rule-aware execution plan on CPUs, for specifying how rules are evaluated, and develops a number of hardware-aware optimizations to achieve massive parallelism on GPUs.\n Using real-life datasets, we show that HyperBlocker is at least 6.8× and 9.1× faster than prior CPU-powered distributed systems and GPU-based ER solvers, respectively. Better still, by combining HyperBlocker with the state-of-the-art ER matcher, we can speed up the overall ER process by at least 30% with comparable accuracy.",
  "focus": "Studies rule-based blocking and proposes HyperBlocker, a GPU-accelerated blocking system with a pipelined architecture that overlaps data transfer and GPU computation, plus a data- and rule-aware execution plan generated on CPU and hardware-aware parallelisation. On real datasets it is at least 6.8x faster than prior CPU distributed systems and 9.1x faster than GPU-based ER solvers, and speeds a full ER pipeline with a state-of-the-art matcher by at least 30% at comparable accuracy.",
  "borrow": "The borrowable lesson is that classical rule-based blocking is not inherently slow — it was under-parallelised. If ERBOT's key-based blockers become the bottleneck, HyperBlocker's pipelining and rule-aware planning show how much headroom hardware-aware execution gives before switching algorithms.",
  "fill": "HyperBlocker accelerates rule-based blocking on GPUs but still needs hand-written rules, and its own numbers show blocking is only part of end-to-end cost once a modern matcher is attached. It leaves us two things: hardware-aware, vectorised execution of blocking on ordinary CPU/R setups where no GPU is available, and automatic generation of the blocking rules it assumes someone writes.",
  "correct": "Speedups are reported against specific prior systems on the authors' datasets, and the approach inherits rule-based blocking's core weakness: someone must still write good rules. A 30% end-to-end gain also quietly shows blocking was not the dominant cost once a modern matcher is attached — the bottleneck moves, and so should optimisation effort.",
  "verified": true
 },
 {
  "n": 21,
  "id": "er-021",
  "title": "Pre-trained Language Models for Entity Blocking: A Reproducibility Study",
  "authors": [
   "Runhui Wang",
   "Yongfeng Zhang"
  ],
  "year": 2024,
  "venue": "Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)",
  "doi": "10.18653/v1/2024.naacl-long.483",
  "citations": 0,
  "themes": [
   "blocking",
   "llm"
  ],
  "method": [
   "deep learning",
   "embedding/ANN"
  ],
  "supervision": "supervised",
  "dataType": "textual",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "A reproducibility and generalisation study of entity blocking with pre-trained language models: it re-implements and re-evaluates PLM-based blocking approaches to test whether their reported gains hold up and how well they generalise across datasets and settings. (The record carries no abstract; description follows the title and venue, NAACL 2024.)",
  "borrow": "The study's protocol is the borrow: before ERBOT adopts any PLM-based blocker, re-run it under a generalisation lens — cross-dataset transfer, not just in-dataset recall — since blocking papers routinely overfit their benchmark suite.",
  "fill": "The study checks generalisation only across the standard small ER benchmarks and delivers a verdict rather than a blocker, so running the same cross-dataset protocol on production-scale data — and turning the findings into an actual PLM blocking component for ERBOT — is left to us.",
  "correct": "Reproducibility studies inherit the scope of what they reproduce: a verdict on the specific PLM blockers examined should not be generalised to all embedding-based blocking, and 'generalisation' across the standard small ER benchmarks is still a narrow slice of the deployment conditions ERBOT targets.",
  "verified": true
 },
 {
  "n": 22,
  "id": "er-022",
  "title": "Towards Universal Dense Blocking for Entity Resolution",
  "authors": [
   "Tianshu Wang",
   "Hongyu Lin",
   "Xianpei Han",
   "Xiaoyang Chen",
   "Boxi Cao",
   "Le Sun"
  ],
  "year": 2024,
  "venue": "arXiv:2404.14831",
  "doi": null,
  "citations": null,
  "themes": [
   "blocking",
   "ml-deep"
  ],
  "method": [
   "deep learning",
   "embedding/ANN"
  ],
  "supervision": "self-supervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "Blocking is a critical step in entity resolution, and the emergence of neural network-based representation models has led to the development of dense blocking as a promising approach for exploring deep semantics in blocking. However, previous advanced self-supervised dense blocking approaches require domain-specific training on the target domain, which limits the benefits and rapid adaptation of these methods. To address this issue, we propose UniBlocker, a dense blocker that is pre-trained on a domain-independent, easily-obtainable tabular corpus using self-supervised contrastive learning. By conducting domain-independent pre-training, UniBlocker can be adapted to various downstream blocking scenarios without requiring domain-specific fine-tuning. To evaluate the universality of our entity blocker, we also construct a new benchmark covering a wide range of blocking tasks from multiple domains and scenarios. Our experiments show that the proposed UniBlocker, without any domain-specific learning, significantly outperforms previous self- and unsupervised dense blocking methods and is comparable and complementary to the state-of-the-art sparse blocking methods.",
  "focus": "Proposes UniBlocker, a dense blocker pre-trained with self-supervised contrastive learning on a domain-independent tabular corpus, so it can be applied to new blocking tasks without domain-specific training or fine-tuning. On a new multi-domain blocking benchmark it significantly outperforms previous self-supervised and unsupervised dense blockers and is comparable and complementary to state-of-the-art sparse blocking.",
  "borrow": "The pre-train-once, apply-anywhere model is the borrowable direction for ERBOT: a single pre-trained retriever that a user can run on a new dataset with zero training would remove the biggest usability cost of learned blocking.",
  "fill": "UniBlocker shows a pre-trained dense blocker is comparable and complementary to sparse blocking, but it stops at the blocking step — nobody has built the hybrid it points to. It leaves us the combination: run a pre-trained dense retriever alongside token blocking inside ERBOT, test the pair on our large datasets, and measure what the union does to downstream matching.",
  "correct": "'Universal' is established on the authors' own new benchmark, and 'comparable and complementary to sparse blocking' concedes that plain token blocking remains competitive — the claim should be read as 'best among label-free dense blockers', not as evidence that learned blocking has overtaken sparse methods in general.",
  "verified": true
 },
 {
  "n": 23,
  "id": "er-023",
  "title": "Blockingpy: Approximate Nearest Neighbours for Blocking of Records for Entity Resolution",
  "authors": [
   "Tymoteusz Strojny",
   "Maciej Beręsewicz"
  ],
  "year": 2025,
  "venue": "Elsevier BV",
  "doi": "10.2139/ssrn.5193658",
  "citations": 0,
  "themes": [
   "blocking"
  ],
  "method": [
   "embedding/ANN"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Presents BlockingPy, a software package that implements blocking for entity resolution and record linkage using modern approximate nearest neighbour search (with graph-based post-processing) instead of hand-written blocking rules, aimed at the official-statistics and deduplication community. (The record carries no abstract; description follows the title and venue, SoftwareX.)",
  "borrow": "BlockingPy is the closest existing analogue to what ERBOT's learned blocking does, in productionised form: its API choices — feed in records, get candidate pairs/blocks from an ANN index — are a usability reference for how we expose the same capability in R.",
  "fill": "BlockingPy is a Python package that demonstrates availability, not candidate quality — it leaves unmeasured how much the representation fed into the index (n-grams versus embeddings) drives recall, and there is no maintained equivalent in the R ecosystem. ERBOT can fill both: be the R-side ANN blocking tool, and publish the representation comparison this package paper does not run.",
  "correct": "A package paper demonstrates availability, not superiority: ANN blocking's recall depends entirely on the representation fed into the index (n-gram or embedding), and the software framing can make that dependence invisible to users. Any ERBOT comparison should benchmark its candidate quality, not its convenience.",
  "verified": true
 },
 {
  "n": 24,
  "id": "er-024",
  "title": "Advances in Record-Linkage Methodology as Applied to Matching the 1985 Census of Tampa, Florida",
  "authors": [
   "Matthew A. Jaro"
  ],
  "year": 1989,
  "venue": "Journal of the American Statistical Association",
  "doi": "10.1080/01621459.1989.10478785",
  "citations": 1612,
  "themes": [
   "similarity",
   "probabilistic"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Jaro reports methodological advances in record linkage developed and tested while matching the 1985 Census of Tampa, Florida. It is an early example of linkage methodology being worked out on a real, operational census-matching task rather than on synthetic data.",
  "borrow": "A documented case of linkage methodology being tuned against a real census file is a useful reference point for ERBOT's evaluation stage: it shows how methodological choices were validated on operational data at population scale.",
  "fill": "The methodological advances are worked out on one 1985 census file, and the paper does not test whether its settings transfer to other populations, eras, or data qualities. We can treat its choices as hypotheses and validate or replace them across the varied modern datasets in ERBOT's benchmark suite.",
  "correct": "Findings tuned to one census file, one country, and 1980s data quality should not be assumed to transfer to modern administrative or web data; the paper's setting is a single, well-structured source, which is the easiest case for linkage.",
  "verified": true
 },
 {
  "n": 25,
  "id": "er-025",
  "title": "String Comparator Metrics and Enhanced Decision Rules in the Fellegi-Sunter Model of Record Linkage.",
  "authors": [
   "W. Winkler"
  ],
  "year": 1990,
  "venue": "",
  "doi": null,
  "citations": 1148,
  "themes": [
   "similarity",
   "probabilistic"
  ],
  "method": [
   "string metric",
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Winkler introduces string comparator metrics designed to feed the Fellegi–Sunter model, so that name and address comparisons contribute graded agreement weights rather than binary agree/disagree outcomes. The paper also proposes enhanced decision rules for classifying pairs within that framework.",
  "borrow": "Graded string comparators inside a probabilistic weighting scheme are directly reusable in ERBOT's similarity-to-classification hand-off: comparator scores become the evidence that the Fellegi–Sunter-style weights aggregate.",
  "fill": "Winkler's comparators were tuned on English names and US address conventions, and the enhanced decision rules keep the Fellegi–Sunter conditional-independence assumption untouched. What remains for us is to recalibrate graded string comparators for other languages, scripts, and naming customs, and to test them as evidence inside a modern classifier rather than only inside F-S weights.",
  "correct": "Comparator behaviour tuned on English-language names and US address conventions may not carry over to other languages, scripts, or naming customs; the enhanced decision rules also inherit the Fellegi–Sunter assumption that field agreements are conditionally independent, which real data routinely violates.",
  "verified": true
 },
 {
  "n": 26,
  "id": "er-026",
  "title": "An Efficient Domain-Independent Algorithm for Detecting Approximately Duplicate Database Records",
  "authors": [
   "Alvaro E. Monge",
   "C. Elkan"
  ],
  "year": 1997,
  "venue": "Workshop on Research Issues on Data Mining and Knowledge Discovery",
  "doi": null,
  "citations": 456,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This 1997 workshop paper proposes a domain-independent algorithm for detecting approximately duplicate records in a database. Records are compared field by field using string-matching techniques, so the method does not depend on rules written for one particular domain.",
  "borrow": "ERBOT's similarity stage can borrow the field-wise comparison design: compute a separate similarity score for each field and combine the scores, rather than comparing whole records as single strings.",
  "fill": "The paper predates both modern blocking and learned classification; it leaves open how its field-matching scores should feed a trainable match classifier, and how the comparison step survives datasets too large for exhaustive pairing — precisely the stages ERBOT adds around it.",
  "correct": "The domain-independence claim deserves pressure: one generic field comparator cannot capture fields whose matching logic is inherently domain-specific, such as identifiers, dates, or coded values, so generality is bought with accuracy exactly where domains differ.",
  "verified": true
 },
 {
  "n": 27,
  "id": "er-027",
  "title": "A guided tour to approximate string matching",
  "authors": [
   "Gonzalo Navarro"
  ],
  "year": 2001,
  "venue": "ACM Computing Surveys",
  "doi": "10.1145/375360.375365",
  "citations": 1804,
  "themes": [
   "similarity"
  ],
  "method": [
   "survey",
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "This ACM Computing Surveys article is a guided tour of approximate string matching: finding occurrences of a pattern in a text while allowing a limited number of errors. It organizes the main algorithmic approaches to the problem and their trade-offs.",
  "borrow": "ERBOT can borrow the survey's map of approximate-matching algorithms when choosing string-similarity implementations, matching the algorithm to the error model and the field lengths of the data at hand.",
  "fill": "The survey treats string matching in isolation and stops at the string level; how string scores should be aggregated into record-level match decisions, and how these algorithms behave as one stage of a large-scale ER pipeline, are questions it does not take up and that we still need to work out.",
  "correct": "Its framing is asymmetric — a short pattern searched in a long text — whereas ER compares two short, equally weighted fields; conclusions drawn from the pattern-versus-text setting should not be carried over to record-pair similarity without re-examination.",
  "verified": true
 },
 {
  "n": 28,
  "id": "er-028",
  "title": "Learning domain-independent string transformation weights for high accuracy object identification",
  "authors": [
   "Sheila Tejada",
   "Craig A. Knoblock",
   "Steven Minton"
  ],
  "year": 2002,
  "venue": "Proceedings of the eighth ACM SIGKDD international conference on Knowledge discovery and data mining",
  "doi": "10.1145/775047.775099",
  "citations": 322,
  "themes": [
   "similarity",
   "ml-deep"
  ],
  "method": [
   "string metric",
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Tejada, Knoblock, and Minton learn weights for string transformations (such as substitutions, deletions, and abbreviations) in a domain-independent way, and use the weighted transformations to identify matching objects with high accuracy. The aim is a string comparison whose parameters do not have to be re-derived for every new domain.",
  "borrow": "A reusable library of weighted string transformations is a concrete asset for ERBOT's similarity stage: transformation weights learned once can serve as default comparator settings across datasets, with per-dataset fine-tuning on top.",
  "fill": "The learned transformation weights are claimed to be domain-independent but were validated only on the small, clean domains available in 2002. We can ship such a weight library as ERBOT's default comparator and measure how far the weights actually travel across modern datasets — and how much per-dataset fine-tuning on top of them adds.",
  "correct": "The domain-independence claim deserves pressure: transformation frequencies are shaped by how data were generated and corrupted in specific sources, so weights learned in one setting may only be approximately portable, and the evaluation domains of the early 2000s were small and clean by current standards.",
  "verified": true
 },
 {
  "n": 29,
  "id": "er-029",
  "title": "Adaptive duplicate detection using learnable string similarity measures",
  "authors": [
   "Mikhail Bilenko",
   "Raymond J. Mooney"
  ],
  "year": 2003,
  "venue": "Proceedings of the ninth ACM SIGKDD international conference on Knowledge discovery and data mining",
  "doi": "10.1145/956750.956759",
  "citations": 1175,
  "themes": [
   "similarity",
   "ml-deep"
  ],
  "method": [
   "string metric",
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Bilenko and Mooney address duplicate detection in which the string similarity measures themselves are learned from data rather than fixed in advance, so the comparison function adapts to the domain at hand. The learned measures are then used to decide which record pairs are duplicates.",
  "borrow": "The idea that string similarity should be trained, not hand-picked, fits ERBOT's similarity stage: transformation costs and comparator parameters can be estimated per dataset instead of relying on one universal metric.",
  "fill": "The learned measures still depend on representative labelled training pairs and are fitted one domain at a time, so label-efficient ways to train similarity measures — and carrying the same learn-the-comparator idea into ERBOT's other comparison stages — remain open for us.",
  "correct": "Learned similarity depends on representative labelled training pairs, which are exactly what many linkage projects lack; performance claims rest on the benchmarks used, and a measure adapted to one domain's error patterns may degrade on another's.",
  "verified": true
 },
 {
  "n": 30,
  "id": "er-030",
  "title": "A Primitive Operator for Similarity Joins in Data Cleaning",
  "authors": [
   "S. Chaudhuri",
   "V. Ganti",
   "R. Kaushik"
  ],
  "year": 2006,
  "venue": "22nd International Conference on Data Engineering (ICDE'06)",
  "doi": "10.1109/icde.2006.9",
  "citations": 403,
  "themes": [
   "similarity",
   "scalable"
  ],
  "method": [
   "system",
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This ICDE paper argues that similarity joins belong inside the database engine as a primitive operator, so that data-cleaning tasks can express fuzzy matching in queries instead of relying on external programs. It presents such an operator for set-based similarity joins and discusses how a query engine can execute it efficiently.",
  "borrow": "ERBOT can borrow the operator mindset: implement candidate generation and similarity scoring as composable, reusable primitives with clear inputs and outputs, rather than as one-off scripts written per dataset.",
  "fill": "The work is set inside a relational DBMS and covers set-similarity joins; it leaves open equivalent primitives for data-frame workflows like ERBOT's in R, and for the embedding-based similarity that has become central since — an implementation gap we can close.",
  "correct": "The benefits of a built-in operator presuppose that the data and the cleaning logic live inside a database system with a query optimizer; pipelines that run outside that architecture, as many ER workflows do, cannot take the claimed convenience for granted.",
  "verified": true
 },
 {
  "n": 31,
  "id": "er-031",
  "title": "Duplicate Record Detection: A Survey",
  "authors": [
   "Ahmed K. Elmagarmid",
   "Panagiotis G. Ipeirotis",
   "Vassilios S. Verykios"
  ],
  "year": 2007,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2007.250581",
  "citations": 1118,
  "themes": [
   "similarity",
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This TKDE survey reviews the duplicate record detection literature, covering the similarity measures used to compare records, the algorithms proposed for detecting duplicates efficiently, and techniques for improving detection accuracy.",
  "borrow": "ERBOT can borrow the survey's taxonomy as a completeness checklist: the similarity measures and detection algorithms it catalogs are the classic repertoire that the similarity and classification stages of a general ER pipeline should cover.",
  "fill": "Appearing in 2007, the survey predates embedding-based blocking, deep-learning matchers, and LLM-based methods altogether. Extending its taxonomy to learned and neural ER, and benchmarking the classic methods it catalogs against those newer ones, is work that remains for us.",
  "correct": "A survey necessarily reports each method largely on its own terms and benchmarks, which in this literature are typically small and clean; the resulting picture makes duplicate detection look more settled than it is on messy data at very large scale.",
  "verified": true
 },
 {
  "n": 32,
  "id": "er-032",
  "title": "Scaling up all pairs similarity search",
  "authors": [
   "Roberto J. Bayardo",
   "Yiming Ma",
   "Ramakrishnan Srikant"
  ],
  "year": 2007,
  "venue": "Proceedings of the 16th international conference on World Wide Web",
  "doi": "10.1145/1242572.1242591",
  "citations": 484,
  "themes": [
   "similarity",
   "scalable"
  ],
  "method": [
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This WWW paper studies the all-pairs similarity search problem: given a collection of sets and a similarity threshold, find every pair whose cosine similarity exceeds the threshold. It shows how indexing and pruning make this computation feasible at scales where scoring all pairs is not.",
  "borrow": "ERBOT can borrow its pruning principle for token-based candidate generation: index tokens so that pairs which cannot possibly reach the similarity threshold are never scored in the similarity stage.",
  "fill": "The paper solves thresholded set similarity as a standalone retrieval problem; it does not consider multi-field records, learned match decisions, or clustering of the pairs it returns. Adapting all-pairs pruning to weighted, multi-field ER records inside a full pipeline remains for us to do.",
  "correct": "Everything hinges on one similarity function and one global threshold. Matching evidence in ER is spread unevenly across fields, so pairs that a single cosine threshold discards can still be true matches — the pruning is exact only relative to a similarity notion ER does not fully trust.",
  "verified": true
 },
 {
  "n": 33,
  "id": "er-033",
  "title": "Efficient similarity joins for near-duplicate detection",
  "authors": [
   "Chuan Xiao",
   "Wei Wang",
   "Xuemin Lin",
   "Jeffrey Xu Yu",
   "Guoren Wang"
  ],
  "year": 2011,
  "venue": "ACM Transactions on Database Systems",
  "doi": "10.1145/2000824.2000825",
  "citations": 260,
  "themes": [
   "similarity",
   "scalable"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This TODS paper develops efficient similarity joins for near-duplicate detection: self-joining a collection to find all pairs of strings or records whose similarity passes a threshold, using filtering and indexing techniques that avoid comparing every pair.",
  "borrow": "ERBOT can borrow similarity-join filtering as a candidate-generation route for string-valued fields — an alternative to blocking keys when duplicates differ by small edits rather than by key values.",
  "fill": "The paper optimizes the join operation itself; it leaves open how join results from several fields should be combined into a single match decision, and how thresholds should be chosen per dataset rather than set by hand — pipeline questions we still have to answer in ERBOT.",
  "correct": "Near-duplicate detection under a single similarity threshold is a narrower problem than entity resolution: real duplicates often agree weakly across many fields instead of strongly on one, so a thresholded join systematically misses exactly the hard pairs ER cares about.",
  "verified": true
 },
 {
  "n": 34,
  "id": "er-034",
  "title": "Automatic Linkage of Vital Records: Computers can be used to extract \"follow-up\" statistics of families from files of routine records",
  "authors": [
   "H. B. Newcombe",
   "J. M. Kennedy",
   "S. J. Axford",
   "A. P. James"
  ],
  "year": 1959,
  "venue": "Science",
  "doi": "10.1126/science.130.3381.954",
  "citations": 867,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Newcombe and co-authors demonstrate that computers can automatically link vital records, using routine record files to extract follow-up statistics on families. Published in Science in 1959, it is the founding demonstration that record linkage can be mechanised.",
  "borrow": "The paper's framing — linkage justified by the downstream statistics it enables — is a template for how ERBOT should present its own value: the pipeline exists to make population-level follow-up analysis possible, not as an end in itself.",
  "fill": "Newcombe's demonstration rests on orderly vital records rich in identifying fields; linkage when identifiers are sparse, error-ridden, or deliberately removed is entirely outside its scope. That is the space left to us: make ERBOT work, and quantify its error rates, on modern files where the identifying evidence is weak by design.",
  "correct": "The approach was demonstrated on comparatively orderly vital records with rich identifying fields; its feasibility says little about linkage quality on sparse, error-ridden, or deliberately de-identified modern files, where the same identifying evidence is much weaker.",
  "verified": true
 },
 {
  "n": 35,
  "id": "er-035",
  "title": "A Theory for Record Linkage",
  "authors": [
   "Ivan P. Fellegi",
   "Alan B. Sunter"
  ],
  "year": 1969,
  "venue": "Journal of the American Statistical Association",
  "doi": "10.1080/01621459.1969.10501049",
  "citations": 3174,
  "themes": [
   "probabilistic",
   "blocking"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Fellegi and Sunter present the formal theory of record linkage: a decision framework in which record pairs are classified as matches, non-matches, or possible matches requiring further review, based on the likelihood ratio of their comparison pattern. It remains the theoretical foundation on which most statistical linkage methodology is built.",
  "borrow": "ERBOT's classification stage inherits this framework directly: likelihood-ratio weighting of field comparisons, explicit error-level control, and a three-way decision with a clerical-review band are design commitments worth keeping explicit in the pipeline.",
  "fill": "The theory's weights rest on conditional independence of field agreements, which real data violate, and its third decision — clerical review — does not scale to millions of candidate pairs. Left open for us: dependence-aware estimation of the match weights inside an otherwise Fellegi–Sunter pipeline, and an automated replacement for the review band that keeps the theory's explicit error-level control.",
  "correct": "The theory's standard implementation assumes conditional independence of field agreements given match status, which real data violate (names correlate with geography, errors cluster within sources); treating the independence-based weights as exact rather than as a useful approximation is a claim we should challenge wherever ERBOT reports them.",
  "verified": true
 },
 {
  "n": 36,
  "id": "er-036",
  "title": "Record Linkage: Statistical Models for Matching Computer Records",
  "authors": [
   "J. B. Copas",
   "F. J. Hilton"
  ],
  "year": 1990,
  "venue": "Journal of the Royal Statistical Society. Series A (Statistics in Society)",
  "doi": "10.2307/2982975",
  "citations": 81,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This JRSS paper develops statistical models for matching computer records, giving the Fellegi-Sunter decision framework a likelihood-based treatment for estimating match weights and the associated error rates.",
  "borrow": "Its likelihood-based treatment of match weights is a reference point for ERBOT's classification stage: how agreement patterns across fields should be combined into a single match score with estimable error rates.",
  "fill": "The models target the classical setting of two files with comparable fields; many-to-many linkage, more than two sources, and text-heavy records — settings our pipeline must handle — are left open, and carrying their estimation approach over to those settings is work we can do.",
  "correct": "Like other Fellegi-Sunter-era models, the treatment leans on conditional independence between field comparisons given match status, an assumption routinely violated by correlated fields such as city and postcode, which biases the resulting match weights.",
  "verified": true
 },
 {
  "n": 37,
  "id": "er-037",
  "title": "A Method for Calibrating False-Match Rates in Record Linkage",
  "authors": [
   "Thomas R. Belin",
   "Donald B. Rubin"
  ],
  "year": 1995,
  "venue": "Journal of the American Statistical Association",
  "doi": "10.1080/01621459.1995.10476563",
  "citations": 98,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This JASA paper presents a method for calibrating false-match rates in record linkage — estimating how many of the links a Fellegi-Sunter-style procedure declares are actually wrong, a quantity such procedures need but do not directly provide.",
  "borrow": "False-match-rate calibration is exactly what ERBOT's evaluation stage needs when ground truth is scarce: a principled way to attach an estimated error rate to the links our classification stage declares.",
  "fill": "The method calibrates error rates within classical probabilistic linkage; it does not address calibrating the scores of modern learned or LLM matchers, whose outputs are notoriously miscalibrated. Extending calibration to those scores is open work for us.",
  "correct": "The calibration rests on the Fellegi-Sunter framework's assumptions, notably conditional independence of field agreements given match status; where that assumption fails, the calibrated false-match rate inherits the bias.",
  "verified": true
 },
 {
  "n": 38,
  "id": "er-038",
  "title": "The RecordLinkage Package: Detecting Errors in Data",
  "authors": [
   "Murat Sariyar",
   "Andreas Borg"
  ],
  "year": 2010,
  "venue": "The R Journal",
  "doi": "10.32614/rj-2010-017",
  "citations": 77,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "probabilistic",
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This R Journal paper presents the RecordLinkage package, an R toolkit implementing classical record linkage methodology — in the Fellegi-Sunter tradition — aimed at detecting errors in data through deduplication and linkage.",
  "borrow": "As a fellow R package, RecordLinkage is ERBOT's most direct predecessor: its classical workflow defines the R baseline for probabilistic linkage against which our pipeline should be benchmarked.",
  "fill": "The package documents the classical toolkit; very large datasets, learned or embedding-based matching, and modern evaluation practices are outside its scope — exactly the space ERBOT is being built to occupy, starting from this baseline.",
  "correct": "A 2010 classical toolkit inherits the limits of its era: pairwise Fellegi-Sunter classification with hand-chosen string comparisons, and no treatment of the blocking and scalability problems that dominate linkage quality on large, messy data.",
  "verified": true
 },
 {
  "n": 39,
  "id": "er-039",
  "title": "Data Matching: Concepts and Techniques for Record Linkage, Entity Resolution, and Duplicate Detection",
  "authors": [
   "Peter Christen"
  ],
  "year": 2012,
  "venue": "Springer Berlin Heidelberg",
  "doi": "10.1007/978-3-642-31164-2",
  "citations": 723,
  "themes": [
   "probabilistic",
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "Christen's book is a comprehensive reference on data matching, covering the concepts and techniques for record linkage, entity resolution, and duplicate detection across the full process. It is the standard textbook-length treatment of the field's classical pipeline.",
  "borrow": "The book's end-to-end organisation of the classical pipeline — indexing, comparison, classification, evaluation — is the reference structure against which ERBOT's stage design can be audited, and its evaluation guidance is a sound default for the pipeline's final stage.",
  "fill": "As a 2012 reference, the book's stage-by-stage treatment stops before embeddings, deep matchers, and LLM-based matching exist, and its practical guidance assumes dataset sizes well below ours. The opening for us is to extend its audit structure — indexing, comparison, classification, evaluation — to the learned pipeline and to very large data, which is effectively the design document ERBOT still needs.",
  "correct": "A 2012 reference necessarily predates the embedding, deep-learning, and LLM eras of matching, so its technique coverage should be treated as the classical baseline rather than the current frontier; some of its practical guidance also assumes dataset sizes well below what ERBOT targets.",
  "verified": true
 },
 {
  "n": 40,
  "id": "er-040",
  "title": "A Bayesian Approach to Graphical Record Linkage and Deduplication",
  "authors": [
   "Rebecca C. Steorts",
   "Rob Hall",
   "Stephen E. Fienberg"
  ],
  "year": 2016,
  "venue": "Journal of the American Statistical Association",
  "doi": "10.1080/01621459.2015.1105807",
  "citations": 164,
  "themes": [
   "probabilistic",
   "privacy-bayesian"
  ],
  "method": [
   "Bayesian",
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "ABSTRACT We propose an unsupervised approach for linking records across arbitrarily many files, while simultaneously detecting duplicate records within files. Our key innovation involves the representation of the pattern of links between records as a bipartite graph, in which records are directly linked to latent true individuals, and only indirectly linked to other records. This flexible representation of the linkage structure naturally allows us to estimate the attributes of the unique observable people in the population, calculate transitive linkage probabilities across records (and represent this visually), and propagate the uncertainty of record linkage into later analyses. Our method makes it particularly easy to integrate record linkage with post-processing procedures such as logistic regression, capture–recapture, etc. Our linkage structure lends itself to an efficient, linear-time, hybrid Markov chain Monte Carlo algorithm, which overcomes many obstacles encountered by previously record linkage approaches, despite the high-dimensional parameter space. We illustrate our method using longitudinal data from the National Long Term Care Survey and with data from the Italian Survey on Household and Wealth, where we assess the accuracy of our method and show it to be better in terms of error rates and empirical scalability than other approaches in the literature. Supplementary materials for this article are available online.",
  "focus": "Steorts, Hall, and Fienberg propose an unsupervised Bayesian approach that links records across arbitrarily many files while simultaneously deduplicating within files. Records are linked to latent true individuals through a bipartite graph, which yields transitive linkage probabilities, estimates of the latent individuals' attributes, and a route to propagate linkage uncertainty into downstream analyses; a linear-time hybrid MCMC algorithm is evaluated on National Long Term Care Survey and Italian household-wealth data, with lower error rates and better empirical scalability than earlier approaches.",
  "borrow": "The latent-entity graph is essentially the object ERBOT's clustering stage tries to produce, and this paper shows how to attach probabilities and uncertainty to it; its practice of propagating linkage uncertainty into post-linkage analysis (regression, capture–recapture) is an evaluation discipline worth adopting.",
  "fill": "The method is demonstrated only on survey files orders of magnitude smaller than the administrative datasets ERBOT targets, so its MCMC sampler's behaviour at multi-million-record scale is unknown. We can pick up the scalable version of its two best ideas — a latent-entity graph with linkage probabilities attached, and propagation of linkage uncertainty into downstream analysis — using inference that survives large files.",
  "correct": "The scalability evidence comes from survey datasets, which are orders of magnitude smaller and cleaner than the multi-million-record administrative files ERBOT aims at; MCMC over a high-dimensional latent structure may not preserve its linear-time behaviour there, and the model's assumptions about how records distort latent attributes are a further point to probe.",
  "verified": true
 },
 {
  "n": 41,
  "id": "er-041",
  "title": "Bayesian Estimation of Bipartite Matchings for Record Linkage",
  "authors": [
   "Mauricio Sadinle"
  ],
  "year": 2017,
  "venue": "Journal of the American Statistical Association",
  "doi": "10.1080/01621459.2016.1148612",
  "citations": 101,
  "themes": [
   "probabilistic",
   "privacy-bayesian"
  ],
  "method": [
   "Bayesian"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "ABSTRACT The bipartite record linkage task consists of merging two disparate datafiles containing information on two overlapping sets of entities. This is nontrivial in the absence of unique identifiers and it is important for a wide variety of applications given that it needs to be solved whenever we have to combine information from different sources. Most statistical techniques currently used for record linkage are derived from a seminal article by Fellegi and Sunter in 1969. These techniques usually assume independence in the matching statuses of record pairs to derive estimation procedures and optimal point estimators. We argue that this independence assumption is unreasonable and instead target a bipartite matching between the two datafiles as our parameter of interest. Bayesian implementations allow us to quantify uncertainty on the matching decisions and derive a variety of point estimators using different loss functions. We propose partial Bayes estimates that allow uncertain parts of the bipartite matching to be left unresolved. We evaluate our approach to record linkage using a variety of challenging scenarios and show that it outperforms the traditional methodology. We illustrate the advantages of our methods merging two datafiles on casualties from the civil war of El Salvador. Supplementary materials for this article are available online.",
  "focus": "Sadinle argues that the pairwise independence assumption underlying Fellegi–Sunter-derived techniques is unreasonable, and instead takes the bipartite matching between two files as the parameter of interest. The Bayesian formulation quantifies uncertainty over matchings, supports point estimators under different loss functions, and offers partial estimates that leave uncertain parts of the matching unresolved; it outperforms the traditional methodology on challenging scenarios and is illustrated on El Salvador civil-war casualty files.",
  "borrow": "Two ideas transfer directly: treating the matching as a joint object rather than independent pair decisions speaks to ERBOT's clustering stage, and partial estimates — deliberately leaving uncertain links unresolved — are a principled alternative to forcing every pair into match or non-match.",
  "fill": "The method is confined to one-to-one bipartite matching between two files and is demonstrated on modest-sized data, so extending joint, uncertainty-aware matching to within-file duplicates and many-to-one links — and making it run at ERBOT's scale — is left for us.",
  "correct": "The bipartite, one-to-one formulation is itself a strong assumption: real file pairs often contain within-file duplicates and many-to-one relationships that a bipartite matching cannot represent, and the demonstrated gains are on modest-sized files, so behaviour at the very large scales ERBOT targets remains unproven.",
  "verified": true
 },
 {
  "n": 42,
  "id": "er-042",
  "title": "fastLink: Fast Probabilistic Record Linkage with Missing Data",
  "authors": [
   "Ted Enamorado",
   "Ben Fifield",
   "Kosuke Imai"
  ],
  "year": 2017,
  "venue": "CRAN: Contributed Packages",
  "doi": "10.32614/cran.package.fastlink",
  "citations": 6,
  "themes": [
   "probabilistic",
   "scalable"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "fastLink implements fast probabilistic record linkage in R; as its full title — 'Fast Probabilistic Record Linkage with Missing Data' — indicates, it extends the Fellegi-Sunter framework with an explicit treatment of missing field values.",
  "borrow": "As an R package for probabilistic linkage, fastLink is ERBOT's closest neighbour: its handling of missing values in match-weight estimation speaks directly to our classification stage, and it is a natural baseline to compare against.",
  "fill": "fastLink covers the probabilistic matching step rather than the full pipeline: blocking strategies for very large data, learned matchers, and post-linkage clustering and evaluation are outside its scope, leaving the integrated pipeline — our contribution — open.",
  "correct": "Its speed and missing-data treatment remain inside the Fellegi-Sunter independence framework; where field agreements are strongly correlated, the resulting match probabilities can be badly calibrated despite the computational gains.",
  "verified": true
 },
 {
  "n": 43,
  "id": "er-043",
  "title": "(Almost) all of entity resolution",
  "authors": [
   "Olivier Binette",
   "Rebecca C. Steorts"
  ],
  "year": 2022,
  "venue": "Science Advances",
  "doi": "10.1126/sciadv.abi8021",
  "citations": 89,
  "themes": [
   "probabilistic",
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "Binette and Steorts offer a synthesis that aims to cover (almost) the whole of entity resolution — its problem formulations, methodology, and practice — in a single account. It serves as a map of the field rather than a report of one new method.",
  "borrow": "A single map of the field is useful for positioning ERBOT: its taxonomy of problem variants (linkage, deduplication, multi-file) helps check that the pipeline's stages and terminology line up with how the wider field carves up the problem.",
  "fill": "The synthesis maps the field from a statistical, Bayesian vantage point and offers no runnable system; web-scale engineering and streaming variants are described rather than demonstrated. It leaves us the implementation side of its own map: a tested, very-large-scale pipeline (ERBOT) that covers the problem variants the paper only taxonomises, so its claims can be checked empirically at scale.",
  "correct": "Any 'almost all' synthesis reflects its authors' vantage point — here a statistical, Bayesian one — so algorithmic and industry-scale perspectives (streaming, web-scale engineering) should be checked for under-representation before treating the map as complete.",
  "verified": true
 },
 {
  "n": 44,
  "id": "er-044",
  "title": "Splink: Free software for probabilistic record linkage at scale.",
  "authors": [
   "Robin Linacre",
   "Sam Lindsay",
   "Theodore Manassis",
   "Zoe Slade",
   "Tom Hepworth"
  ],
  "year": 2022,
  "venue": "International Journal of Population Data Science",
  "doi": "10.23889/ijpds.v7i3.1794",
  "citations": 24,
  "themes": [
   "probabilistic",
   "scalable"
  ],
  "method": [
   "probabilistic",
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This paper describes Splink, free software for probabilistic record linkage at scale: a Fellegi-Sunter-style linkage implementation with unsupervised estimation of match weights, engineered to run on large datasets.",
  "borrow": "Splink is the obvious production baseline for ERBOT's probabilistic mode: its unsupervised training of match weights and its scalability engineering — explicit blocking rules over a database backend — are practices we can mirror and benchmark against.",
  "fill": "Splink stays within the Fellegi-Sunter paradigm: it offers neither learned or LLM-based matching nor learned blocking. A hybrid that keeps its scalable probabilistic core but adds embedding-based candidate generation is a gap we can fill.",
  "correct": "Its core inherits the Fellegi-Sunter conditional-independence assumption across comparison fields; 'at scale' speaks to computational scale, not to the model misspecification that dominates linkage error on messy real-world fields.",
  "verified": true
 },
 {
  "n": 45,
  "id": "er-045",
  "title": "CrowdER: Crowdsourcing Entity Resolution",
  "authors": [
   "Jiannan Wang",
   "Tim Kraska",
   "Michael J. Franklin",
   "Jianhua Feng"
  ],
  "year": 2012,
  "venue": "arXiv:1208.1927",
  "doi": null,
  "citations": null,
  "themes": [
   "ml-deep",
   "evaluation"
  ],
  "method": [
   "system"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Entity resolution is central to data integration and data cleaning. Algorithmic approaches have been improving in quality, but remain far from perfect. Crowdsourcing platforms offer a more accurate but expensive (and slow) way to bring human insight into the process. Previous work has proposed batching verification tasks for presentation to human workers but even with batching, a human-only approach is infeasible for data sets of even moderate size, due to the large numbers of matches to be tested. Instead, we propose a hybrid human-machine approach in which machines are used to do an initial, coarse pass over all the data, and people are used to verify only the most likely matching pairs. We show that for such a hybrid system, generating the minimum number of verification tasks of a given size is NP-Hard, but we develop a novel two-tiered heuristic approach for creating batched tasks. We describe this method, and present the results of extensive experiments on real data sets using a popular crowdsourcing platform. The experiments show that our hybrid approach achieves both good efficiency and high accuracy compared to machine-only or human-only alternatives.",
  "focus": "CrowdER proposes a hybrid human-machine approach to entity resolution in which machines make an initial coarse pass over the data and people verify only the most likely matching pairs. It shows that generating the minimum number of batched verification tasks of a given size is NP-hard, develops a two-tiered heuristic for creating the batches, and reports experiments on real datasets using a crowdsourcing platform in which the hybrid approach beats machine-only and human-only alternatives on efficiency and accuracy.",
  "borrow": "The hybrid design maps onto ERBOT directly: route only the most uncertain, highest-value pairs to human or LLM verification instead of checking everything, and use its batching heuristics to package those verification tasks efficiently.",
  "fill": "CrowdER covers the verification step only; blocking, automated matching, and final clustering are left to other components, and its experiments rely on a paid crowdsourcing platform. Adapting the verification budget to LLM judges, tying it to our clustering stage, and choosing which uncertainty signal should trigger verification remain open for us.",
  "correct": "The accuracy claims rest on crowd workers from one platform and on the machine pre-filter surfacing the right candidate pairs: matches the coarse pass never surfaces cannot be recovered by verification, so end-to-end recall is bounded by a component the paper does not itself evaluate.",
  "verified": true
 },
 {
  "n": 46,
  "id": "er-046",
  "title": "Magellan: toward building entity matching management systems over data science stacks",
  "authors": [
   "Pradap Konda",
   "Sanjib Das",
   "Paul Suganthan G. C.",
   "AnHai Doan",
   "Adel Ardalan",
   "Jeffrey R. Ballard",
   "Han Li",
   "Fatemah Panahi",
   "Haojun Zhang",
   "Jeff Naughton",
   "Shishir Prasad",
   "Ganesh Krishnan",
   "Rohit Deep",
   "Vijay Raghavendra"
  ],
  "year": 2016,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/3007263.3007314",
  "citations": 73,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Magellan presents an entity matching management system built over data science stacks, framing entity matching as an end-to-end workflow to be built and managed with general data-science tooling rather than as a single matching algorithm.",
  "borrow": "The architectural stance transfers directly: ERBOT/SandX can treat entity resolution as a managed pipeline layered on a general data stack (in our case R), with workflow support around the algorithms instead of a monolithic matcher.",
  "fill": "Magellan builds its management layer on Python data-science stacks and does not itself advance matching accuracy, so providing the equivalent workflow management around an R-based pipeline like ERBOT/SandX is a gap it leaves for us.",
  "correct": "With no abstract available, only the scope is clear: this is a systems contribution, so it should not be cited as evidence for matching-accuracy advances, and its management layer may be more machinery than a focused pipeline needs.",
  "verified": true
 },
 {
  "n": 47,
  "id": "er-047",
  "title": "Deep Learning for Entity Matching: A Design Space Exploration",
  "authors": [
   "Sidharth Mudgal",
   "Han Li",
   "Theodoros Rekatsinas",
   "AnHai Doan",
   "Youngchoon Park",
   "Ganesh Krishnan",
   "Rohit Deep",
   "Esteban Arcaute",
   "Vijay Raghavendra"
  ],
  "year": 2018,
  "venue": "Proceedings of the 2018 International Conference on Management of Data",
  "doi": "10.1145/3183713.3196926",
  "citations": 777,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This paper systematically explores the design space of deep learning approaches to entity matching, examining which modeling choices matter for matching quality on benchmark tasks.",
  "borrow": "Its design-space discipline is reusable: decompose any learned matcher ERBOT adopts into explicit choices and ablate them, instead of importing a single architecture wholesale.",
  "fill": "The design-space map stops in 2018, before pretrained language models changed what a learned matcher looks like, so none of its rankings cover transformer-era choices. We can redo the exploration inside ERBOT's classification stage, ablating PLM-based design choices the way the paper ablated RNN-era ones.",
  "correct": "Its conclusions date from 2018 and predate pretrained language models for matching; the ranking of design choices may not survive the shift to fine-tuned transformers that followed.",
  "verified": true
 },
 {
  "n": 48,
  "id": "er-048",
  "title": "Distributed representations of tuples for entity resolution",
  "authors": [
   "Muhammad Ebraheem",
   "Saravanan Thirumuruganathan",
   "Shafiq Joty",
   "Mourad Ouzzani",
   "Nan Tang"
  ],
  "year": 2018,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/3236187.3236198",
  "citations": 178,
  "themes": [
   "ml-deep",
   "blocking"
  ],
  "method": [
   "deep learning",
   "hashing/LSH"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "DeepER learns distributed representations of tuples for entity resolution: attributes are encoded separately with recurrent networks over word embeddings and composed into a single tuple vector, locality-sensitive hashing over the vectors supplies candidate pairs, and a classifier decides matches. It was among the first end-to-end deep-learning designs covering both the blocking and the matching step.",
  "borrow": "The pattern — per-attribute encoders composed into one record vector, then ANN/LSH retrieval for candidates — is a direct blueprint for ERBOT's learned retriever, and a reminder to keep attribute structure instead of flattening records into one string.",
  "fill": "DeepER trains its tuple embeddings per dataset and its LSH candidate stage offers no control over how many true matches are lost. It leaves us a learned retriever with a recall dial: tuple embeddings inside ERBOT whose candidate generation is governed by an explicit comparison budget, so recall can be traded against cost deliberately instead of being whatever the hash buckets happen to give.",
  "correct": "Its embeddings are trained per dataset and its LSH stage offers no control over candidate recall; later design-space work (DeepBlocker) showed simpler autoencoder embeddings often beat its recurrent encoders, so its architectural choices should be treated as a starting point, not a default.",
  "verified": true
 },
 {
  "n": 49,
  "id": "er-049",
  "title": "CorDEL: A Contrastive Deep Learning Approach for Entity Linkage",
  "authors": [
   "Zhengyang Wang",
   "Bunyamin Sisman",
   "Hao Wei",
   "Xin Luna Dong",
   "Shuiwang Ji"
  ],
  "year": 2020,
  "venue": "2020 IEEE International Conference on Data Mining (ICDM)",
  "doi": "10.1109/icdm50108.2020.00171",
  "citations": 23,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Entity linkage (EL) is a critical problem in data cleaning and integration. In the past several decades, EL has typically been done by rule-based systems or traditional machine learning models with hand-curated features, both of which heavily depend on manual human inputs. With the ever-increasing growth of new data, deep learning (DL) based approaches have been proposed to alleviate the high cost of EL associated with the traditional models. Existing exploration of DL models for EL strictly follows the well-known twin-network architecture. However, we argue that the twin-network architecture is sub-optimal to EL, leading to inherent drawbacks of existing models. In order to address the drawbacks, we propose a novel and generic contrastive DL framework for EL. The proposed framework is able to capture both syntactic and semantic matching signals and pays attention to subtle but critical differences. Based on the framework, we develop a contrastive DL approach for EL, CorDEL, with a simple yet powerful variant called CorDEL-Sum. We evaluate CorDEL with extensive experiments conducted on both public benchmark datasets and a real-world dataset. CorDEL outperforms previous state-of-the-art models by 5.2% on public benchmark datasets. Moreover, CorDEL yields a 29.4% improvement over the current best DL model on the real-world dataset, while reducing the number of training parameters by 96.8%.",
  "focus": "CorDEL argues that the twin-network architecture used by earlier deep entity linkage models is suboptimal, and proposes a contrastive framework that compares two records jointly, capturing syntactic and semantic signals while attending to subtle but critical differences. It reports gains of 5.2% over prior state of the art on public benchmarks and 29.4% over the best deep model on a real-world dataset, with 96.8% fewer training parameters in its compact variant.",
  "borrow": "The joint-comparison idea is worth borrowing for ERBOT's classification stage: score a pair by letting the model compare the two records directly and focus on their differing attributes, rather than embedding each record in isolation.",
  "fill": "CorDEL never faces the pretrained-language-model matchers that appeared alongside it, and its joint cross-record comparison is exactly the kind of scoring that gets expensive as candidate sets grow. It leaves us the scaling question: test contrastive joint scoring against PLM matchers inside ERBOT and find how much of its gain survives when the comparison budget is tightly capped.",
  "correct": "The largest gain is reported against the best deep model on a single real-world dataset, and the paper appeared the same year as pretrained-language-model matchers such as Ditto; whether the contrastive advantage survives those stronger baselines is not addressed.",
  "verified": true
 },
 {
  "n": 50,
  "id": "er-050",
  "title": "Deep entity matching with pre-trained language models",
  "authors": [
   "Yuliang Li",
   "Jinfeng Li",
   "Yoshihiko Suhara",
   "AnHai Doan",
   "Wang-Chiew Tan"
  ],
  "year": 2020,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/3421424.3421431",
  "citations": 613,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "large (100K-1M)",
  "abstract": "We present Ditto, a novel entity matching system based on pre-trained Transformer-based language models. We fine-tune and cast EM as a sequence-pair classification problem to leverage such models with a simple architecture. Our experiments show that a straight-forward application of language models such as BERT, DistilBERT, or RoBERTa pre-trained on large text corpora already significantly improves the matching quality and outperforms previous state-of-the-art (SOTA), by up to 29% of F1 score on benchmark datasets. We also developed three optimization techniques to further improve Ditto's matching capability. Ditto allows domain knowledge to be injected by highlighting important pieces of input information that may be of interest when making matching decisions. Ditto also summarizes strings that are too long so that only the essential information is retained and used for EM. Finally, Ditto adapts a SOTA technique on data augmentation for text to EM to augment the training data with (difficult) examples. This way, Ditto is forced to learn \"harder\" to improve the model's matching capability. The optimizations we developed further boost the performance of Ditto by up to 9.8%. Perhaps more surprisingly, we establish that Ditto can achieve the previous SOTA results with at most half the number of labeled data. Finally, we demonstrate Ditto's effectiveness on a real-world large-scale EM task. On matching two company datasets consisting of 789K and 412K records, Ditto achieves a high F1 score of 96.5%.",
  "focus": "Ditto casts entity matching as sequence-pair classification and fine-tunes pretrained Transformer language models on serialized record pairs. With three optimizations - highlighting domain knowledge in the input, summarizing over-long strings, and data augmentation with difficult examples - it outperforms prior state of the art by up to 29% F1 on benchmarks, matches prior state of the art with at most half the labeled data, and reaches 96.5% F1 matching company datasets of 789K and 412K records.",
  "borrow": "The serialization recipe is directly borrowable for ERBOT's classification stage: render a record pair as a structured token sequence with important attributes highlighted, and use summarization plus augmentation to stretch small labeled sets.",
  "fill": "Ditto is evaluated on candidate pairs handed to it by existing blocking, so end-to-end recall of a full pipeline is never measured, and each new dataset still needs its own fine-tuning run and labeled pairs. We can take the open half: put a Ditto-style classifier behind ERBOT's learned blocking, measure the whole pipeline's recall, and test how far the labeled-data requirement can be pushed down at our scale.",
  "correct": "The benchmark results are computed on candidate pairs produced by existing blocking, so end-to-end recall of a full pipeline is not tested; per-dataset fine-tuning of a large language model is also expensive, and the gains presume labeled pairs from the target domain.",
  "verified": true
 },
 {
  "n": 51,
  "id": "er-051",
  "title": "Machamp: A Generalized Entity Matching Benchmark",
  "authors": [
   "Jin Wang",
   "Yuliang Li",
   "Wataru Hirota"
  ],
  "year": 2021,
  "venue": "Proceedings of the 30th ACM International Conference on Information &amp; Knowledge Management",
  "doi": "10.1145/3459637.3482008",
  "citations": 45,
  "themes": [
   "ml-deep",
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Entity Matching (EM) refers to the problem of determining whether two different data representations refer to the same real-world entity. It has been a long-standing interest of the data management community. Many efforts have been paid in creating benchmark tasks as well as in developing advanced matching techniques for EM. However, existing benchmark tasks for EM are limited to the case where the two data collections of entities are structured tables with the same schema. Meanwhile, the tables in data collections for matching could be structured, semi-structured, or unstructured in real-world scenarios of data science. In this paper, we come up with a new research problem - Generalized Entity Matching to satisfy this requirement and create a benchmark Machamp for it. Machamp consists of seven tasks having diverse characteristics and thus provides good coverage of use cases in real applications. We summarize existing EM benchmark tasks for structured tables and conduct a series of processing and cleaning efforts to transform them into matching tasks between tables with different structures. Based on that, we further conduct comprehensive profiling of the proposed tasks and evaluate several popular entity matching approaches on them. With the help of Machamp, it is the first time that researchers can evaluate EM techniques between data collections with different structures. It is public available via link: https://github.com/megagonlabs/machamp.",
  "focus": "Machamp introduces generalized entity matching - matching between collections that may be structured, semi-structured, or unstructured rather than two same-schema tables - and provides a benchmark of seven tasks built by transforming existing structured benchmarks into cross-structure tasks. The paper profiles the tasks and evaluates several popular matching approaches on them.",
  "borrow": "The benchmark and its profiling give ERBOT's evaluation stage cross-structure test cases, guarding against matchers that only look good on clean same-schema tables.",
  "fill": "Machamp's seven tasks are manufactured by transforming structured benchmarks, so matching over natively heterogeneous sources remains untested, and the benchmark scores pairwise classification rather than a full blocking-to-clustering pipeline. We can build large-scale cross-structure tasks from genuinely semi-structured and unstructured data and run ERBOT end to end on them.",
  "correct": "Because the seven tasks are transformations of structured benchmarks rather than natively heterogeneous data, measured performance may overstate readiness for genuinely unstructured sources.",
  "verified": true
 },
 {
  "n": 52,
  "id": "er-052",
  "title": "Neural Networks for Entity Matching: A Survey",
  "authors": [
   "Nils Barlaug",
   "Jon Atle Gulla"
  ],
  "year": 2021,
  "venue": "ACM Transactions on Knowledge Discovery from Data",
  "doi": "10.1145/3442200",
  "citations": 167,
  "themes": [
   "ml-deep",
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "Entity matching is the problem of identifying which records refer to the same real-world entity. It has been actively researched for decades, and a variety of different approaches have been developed. Even today, it remains a challenging problem, and there is still generous room for improvement. In recent years, we have seen new methods based upon deep learning techniques for natural language processing emerge. In this survey, we present how neural networks have been used for entity matching. Specifically, we identify which steps of the entity matching process existing work have targeted using neural networks, and provide an overview of the different techniques used at each step. We also discuss contributions from deep learning in entity matching compared to traditional methods, and propose a taxonomy of deep neural networks for entity matching.",
  "focus": "This survey reviews how neural networks have been used for entity matching, organizing the literature by which step of the matching process neural methods target and by the techniques used at each step. It compares deep learning contributions against traditional methods and proposes a taxonomy of deep neural networks for entity matching.",
  "borrow": "The step-by-step taxonomy works as a planning map for ERBOT: it shows where learned components can enter the pipeline (for example blocking or matching) and what each insertion point is known to cost and deliver.",
  "fill": "Published in 2021, the survey's taxonomy stops before LLM-based matching entirely, so extending its step-by-step map to LLM and hybrid methods — and using the updated map to decide where learned components enter ERBOT — is work it leaves open for us.",
  "correct": "Published in 2021, the survey predates LLM-based matching, so its taxonomy and its assessment of how far neural methods have come should be read as a pre-LLM snapshot rather than current guidance.",
  "verified": true
 },
 {
  "n": 53,
  "id": "er-053",
  "title": "Sudowoodo: Contrastive Self-supervised Learning for Multi-purpose Data Integration and Preparation",
  "authors": [
   "Runhui Wang",
   "Yuliang Li",
   "Jin Wang"
  ],
  "year": 2023,
  "venue": "2023 IEEE 39th International Conference on Data Engineering (ICDE)",
  "doi": "10.1109/icde55515.2023.00391",
  "citations": 72,
  "themes": [
   "ml-deep",
   "blocking"
  ],
  "method": [
   "deep learning",
   "embedding/ANN"
  ],
  "supervision": "self-supervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "Machine learning (ML) is playing an increasingly important role in data management tasks, particularly in Data Integration and Preparation (DI&P). The success of ML-based approaches, however, heavily relies on the availability of large-scale, high-quality labeled datasets for different tasks. Moreover, the wide variety of DI&P tasks and pipelines oftentimes requires customizing ML solutions at a significant cost for model engineering and experimentation. These factors inevitably hold back the adoption of ML-based approaches to new domains and tasks.In this paper, we propose Sudowoodo, a multi-purpose DI&P framework based on contrastive representation learning. Sudowoodo features a unified, matching-based problem definition capturing a wide range of DI&P tasks including Entity Matching (EM) in data integration, error correction in data cleaning, semantic type detection in data discovery, and more. Contrastive learning enables Sudowoodo to learn similarity-aware data representations from a large corpus of data items (e.g., entity entries, table columns) without using any labels. The learned representations can later be either directly used or facilitate fine-tuning with only a few labels to support different DI&P tasks. Our experiment results show that Sudowoodo achieves multiple state-of-the-art results on different levels of supervision and outperforms previous best specialized blocking or matching solutions for EM. Sudowoodo also achieves promising results in data cleaning and column matching tasks showing its versatility in DI&P applications.",
  "focus": "Sudowoodo is a contrastive self-supervised learning framework that learns similarity-aware representations of data items (entity entries, table columns) from a large unlabeled corpus, under a unified matching-based formulation covering entity matching, error correction, semantic type detection, and more. The learned representations can be used directly or fine-tuned with only a few labels, and the paper reports state-of-the-art results at several supervision levels, outperforming previous specialized blocking and matching solutions for entity matching.",
  "borrow": "Its label-free contrastive embeddings can serve both of ERBOT's early stages: the same pretrained representations can generate blocking candidates and feed pairwise classification when labeled pairs are scarce.",
  "fill": "Sudowoodo's results are on benchmark data-integration tasks and presume a large, representative unlabeled corpus; whether its contrastive representations survive very large, duplicate-skewed record collections — and work as blocking input rather than just matching features — is untested. We can pick that up directly: run its style of label-free embeddings through ERBOT's blocking stage on million-record linkage data and measure candidate quality at scale.",
  "correct": "The multi-purpose claim is demonstrated on benchmark tasks within data integration; whether the representations hold up on very large, duplicate-skewed record linkage collections is not established by the reported experiments, and the approach presumes access to a large representative unlabeled corpus.",
  "verified": true
 },
 {
  "n": 54,
  "id": "er-054",
  "title": "Correlation clustering",
  "authors": [
   "N. Bansal",
   "A. Blum",
   "S. Chawla"
  ],
  "year": 2003,
  "venue": "The 43rd Annual IEEE Symposium on Foundations of Computer Science, 2002. Proceedings.",
  "doi": "10.1109/sfcs.2002.1181947",
  "citations": 95,
  "themes": [
   "clustering"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper introduces correlation clustering: given pairwise information about which items are similar and which are dissimilar, partition the items so as to maximize agreement with those pairwise labels, with the number of clusters emerging from the data rather than fixed in advance. It is a theoretical computer science paper (FOCS proceedings) that formalizes this objective; it is not an entity-resolution system paper.",
  "borrow": "ERBOT's clustering stage can borrow the correlation-clustering objective — minimizing disagreements with pairwise match/non-match decisions — as a principled alternative to plain transitive closure over classifier output.",
  "fill": "The classic objective weights every pairwise disagreement symmetrically and takes the pairwise judgments as given; ER instead produces probabilistic scores, asymmetric error costs, and only the sparse pair set blocking leaves behind. Adapting correlation clustering to that input — reweighted, cost-asymmetric, and runnable at linkage scale — is unfinished work our clustering stage can do.",
  "correct": "The classic formulation weights all pairwise disagreements symmetrically and presumes pairwise judgments as given, whereas ER pairwise scores are probabilistic, pruned by blocking, and asymmetric in error cost — so the objective needs reweighting before it transfers to record linkage.",
  "verified": true
 },
 {
  "n": 55,
  "id": "er-055",
  "title": "Collective entity resolution in relational data",
  "authors": [
   "Indrajit Bhattacharya",
   "Lise Getoor"
  ],
  "year": 2007,
  "venue": "ACM Transactions on Knowledge Discovery from Data",
  "doi": "10.1145/1217299.1217304",
  "citations": 740,
  "themes": [
   "clustering"
  ],
  "method": [
   "probabilistic",
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper studies entity resolution that exploits relationships between records: rather than deciding each candidate pair independently, resolution decisions are made collectively, so relational evidence (such as shared collaborators or venues) informs and propagates across decisions. Published in ACM Transactions on Knowledge Discovery from Data, it is a foundational reference for relational, collective ER.",
  "borrow": "ERBOT can borrow the collective idea at its clustering stage: let already-resolved entities and their relations serve as evidence for unresolved pairs, instead of treating independent pairwise classification as the final word.",
  "fill": "Collective inference here presumes relational evidence dense enough to propagate, and its joint optimisation is computationally expensive, so scaling collective resolution to very large datasets — and making it degrade gracefully when relations are sparse or noisy — is left for us.",
  "correct": "Collective inference pays off only when relational structure is dense and reasonably reliable; in linkage settings where relations are sparse or themselves noisy, the gains may not transfer, and joint inference is computationally expensive at very large scale.",
  "verified": true
 },
 {
  "n": 56,
  "id": "er-056",
  "title": "Entity resolution with iterative blocking",
  "authors": [
   "Steven Euijong Whang",
   "David Menestrina",
   "Georgia Koutrika",
   "Martin Theobald",
   "Hector Garcia-Molina"
  ],
  "year": 2009,
  "venue": "Proceedings of the 2009 ACM SIGMOD International Conference on Management of data",
  "doi": "10.1145/1559845.1559870",
  "citations": 249,
  "themes": [
   "clustering",
   "blocking"
  ],
  "method": [
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This SIGMOD paper proposes iterative blocking: instead of running blocking once before matching, blocking and matching are interleaved, so entities resolved in early rounds are merged and re-blocked, letting later rounds exploit cleaner, merged records to find matches a single blocking pass would miss.",
  "borrow": "ERBOT can borrow the iterate–merge–reblock loop: after a first clustering pass, collapse clusters into composite records and re-run blocking to recover matches that single-pass blocking separated.",
  "fill": "The paper interleaves blocking and matching but leaves the production questions open: how to stop early merges from contaminating later rounds, when to stop iterating, and what the loop costs at very large scale. We can implement iterate–merge–reblock in ERBOT with merge-confidence gates and explicit stopping rules, and measure where iteration stops paying on multi-million-record files.",
  "correct": "Iteration can compound early errors — a wrong merge in one round contaminates later blocks — so the approach's value hinges on error control and stopping criteria that a single-pass pipeline does not need, and its cost at very large scale deserves scrutiny.",
  "verified": true
 },
 {
  "n": 57,
  "id": "er-057",
  "title": "Framework for evaluating clustering algorithms in duplicate detection",
  "authors": [
   "Oktie Hassanzadeh",
   "Fei Chiang",
   "Hyun Chul Lee",
   "Renée J. Miller"
  ],
  "year": 2009,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/1687627.1687771",
  "citations": 152,
  "themes": [
   "clustering",
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This PVLDB paper proposes a framework for evaluating clustering algorithms used in duplicate detection, addressing how the clusterings produced at the end of an ER pipeline should be measured and compared.",
  "borrow": "Its evaluation framework is directly relevant to ERBOT's final stage: a principled way to score and compare the clusterings our clustering step produces, beyond pairwise precision and recall alone.",
  "fill": "The framework evaluates clustering output but does not provide the clustering algorithms themselves, and it assumes evaluation data to score against; extending clustering evaluation to the partial- or no-ground-truth settings typical of our very large datasets is left for us.",
  "correct": "A 2009 framework predates the learned-embedding era: cluster-quality measures designed around rule-based duplicate detection may not discriminate well between modern embedding-based clusterings, so its criteria need re-validation on current methods.",
  "verified": true
 },
 {
  "n": 58,
  "id": "er-058",
  "title": "Swoosh: a generic approach to entity resolution",
  "authors": [
   "Omar Benjelloun",
   "Hector Garcia-Molina",
   "David Menestrina",
   "Qi Su",
   "Steven Euijong Whang",
   "Jennifer Widom"
  ],
  "year": 2009,
  "venue": "The VLDB Journal",
  "doi": "10.1007/s00778-008-0098-x",
  "citations": 299,
  "themes": [
   "clustering",
   "ml-deep"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "This VLDB Journal paper presents Swoosh, a generic approach to entity resolution: rather than proposing one more matching algorithm, it formulates ER generically, so that resolution algorithms can be built and compared within a common framework.",
  "borrow": "The generic formulation is a useful design discipline for ERBOT: it separates the match and merge decisions from the order in which pairs are processed, which maps cleanly onto our blocking-to-clustering pipeline stages.",
  "fill": "Swoosh treats match and merge as given black-box functions; it does not itself supply learned matchers, blocking strategies, or a way to evaluate clustering quality. Filling those slots with modern learned components inside its generic framework is open work for us.",
  "correct": "A 2009 generic framework predates learned matchers and distributed execution: it assumes user-supplied match and merge functions in a single-system setting, so it offers no guidance on the two problems that dominate modern ER — learning the matcher and scaling the computation.",
  "verified": true
 },
 {
  "n": 59,
  "id": "er-059",
  "title": "Pay-As-You-Go Entity Resolution",
  "authors": [
   "Steven Euijong Whang",
   "David Marmaros",
   "Hector Garcia-Molina"
  ],
  "year": 2013,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2012.43",
  "citations": 102,
  "themes": [
   "clustering",
   "scalable"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This TKDE paper studies pay-as-you-go entity resolution: instead of resolving an entire dataset before any output is usable, resolution proceeds progressively, so that partial effort yields partial, usable results that improve as more work is done.",
  "borrow": "The progressive-results principle fits ERBOT's large-dataset setting: structure the pipeline so users can inspect and use early, high-confidence clusters while the remaining pairs are still being processed, rather than waiting for a full run.",
  "fill": "The paper addresses progressive computation within a single ER run; it leaves open how pay-as-you-go interacts with learned and LLM-based matchers, and how a user should allocate the next unit of effort across blocking, matching, and clustering — a budgeting policy we still need to build.",
  "correct": "A progressive scheme necessarily commits to some matches early, and early merge errors can propagate through later rounds; the benefit therefore hinges on the ordering strategy putting correct matches first, which is workload-dependent and not guaranteed by the pay-as-you-go framing itself.",
  "verified": true
 },
 {
  "n": 60,
  "id": "er-060",
  "title": "Evaluating entity resolution results",
  "authors": [
   "David Menestrina",
   "Steven Euijong Whang",
   "Hector Garcia-Molina"
  ],
  "year": 2010,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/1920841.1920871",
  "citations": 44,
  "themes": [
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This PVLDB paper studies how entity resolution results should be evaluated, examining the measures used to judge the quality of the entity groupings that an ER system produces.",
  "borrow": "Its analysis of evaluation measures informs ERBOT's evaluation stage directly: which quality measures to report for our clustering output, and how misleading some commonly used ones can be.",
  "fill": "The paper scrutinises evaluation measures but leaves practitioners without a settled standard, and it predates learned and LLM-based matchers; validating evaluation measures for modern, LLM-assisted pipelines — including how they behave with partial ground truth — is unfinished work we can take up.",
  "correct": "The evaluation problem it formalises assumes a known gold-standard clustering; in real deployments ground truth is partial or contested, so its measures address a cleaner problem than the one practitioners actually face.",
  "verified": true
 },
 {
  "n": 61,
  "id": "er-061",
  "title": "The WDC Training Dataset and Gold Standard for Large-Scale Product Matching",
  "authors": [
   "Anna Primpeli",
   "Ralph Peeters",
   "Christian Bizer"
  ],
  "year": 2019,
  "venue": "Companion Proceedings of The 2019 World Wide Web Conference",
  "doi": "10.1145/3308560.3316609",
  "citations": 58,
  "themes": [
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "supervised",
  "dataType": "multi-source",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This paper presents a large-scale training dataset and gold standard for product matching built from the Web Data Commons product corpus, intended for training and evaluating matchers on product offers extracted from many web shops.",
  "borrow": "ERBOT can use the WDC product-matching data as an external, large, real-world benchmark for its textual and multi-source pipeline stages, complementing the small classic benchmarks.",
  "fill": "The WDC benchmark covers product offers only, and its gold standard inherits web-extraction noise; person and organisation linkage at comparable scale still has no equivalent public testbed. That leaves us the evaluation gap: build or adopt a large, real-world non-product benchmark so ERBOT's stages can be validated where error profiles differ completely from product data.",
  "correct": "Product offers are short, attribute-rich web text; results on this benchmark may not generalize to person or organization linkage, whose error profiles differ, and a gold standard built over web-extracted data inherits extraction noise.",
  "verified": true
 },
 {
  "n": 62,
  "id": "er-062",
  "title": "Benchmarking Filtering Techniques for Entity Resolution",
  "authors": [
   "George Papadakis",
   "Marco Fisichella",
   "Franziska Schoger",
   "George Mandilaras",
   "Nikolaus Augsten",
   "Wolfgang Nejdl"
  ],
  "year": 2023,
  "venue": "2023 IEEE 39th International Conference on Data Engineering (ICDE)",
  "doi": "10.1109/icde55515.2023.00389",
  "citations": 21,
  "themes": [
   "evaluation",
   "blocking"
  ],
  "method": [
   "benchmark",
   "embedding/ANN"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "Entity Resolution is the task of identifying pairs of entity profiles that represent the same real-world object. To avoid checking a quadratic number of entity pairs, various filtering techniques have been proposed that fall into two main categories: (i) blocking workflows group together entity profiles with identical or similar signatures, and (ii) nearest-neighbor methods convert all entity profiles into vectors and identify the closest ones to every query entity. Unfortunately, the main techniques from these two categories have rarely been compared in the literature and, thus, their relative performance is unknown. We perform the first systematic experimental study that investigates the relative performance of the main representatives per category over numerous established datasets. Comparing techniques from different categories turns out to be a non-trivial task due to the various configuration parameters that are hard to fine-tune, but have a significant impact on performance. We consider a plethora of parameter configurations, optimizing each technique with respect to recall and precision targets. Both schema-agnostic and schema-based settings are evaluated. The experimental results provide novel insights into the effectiveness, the time efficiency and the scalability of the considered techniques.",
  "focus": "This paper performs the first systematic experimental study comparing the two filtering families for ER — blocking workflows, which group entity profiles by identical or similar signatures, and nearest-neighbor methods, which embed profiles as vectors and retrieve the closest ones — across numerous established datasets in both schema-agnostic and schema-based settings. Because configuration parameters strongly affect outcomes, each technique is tuned over a plethora of configurations against recall and precision targets. The results provide new insights into the effectiveness, time efficiency and scalability of each family.",
  "borrow": "ERBOT can borrow the study's tuning protocol: benchmark its blocking stage against nearest-neighbor filtering under matched recall/precision targets with per-technique parameter optimization, instead of comparing default configurations.",
  "fill": "The comparison runs on established, mostly modest-size datasets with heavy per-technique tuning, so repeating it at web scale — and extracting the untuned, out-of-the-box settings a pipeline like ERBOT should ship as defaults — remains for us.",
  "correct": "A comparison in which every technique is heavily tuned is only as neutral as its tuning budget, and conclusions drawn on established, mostly modest-size datasets may not carry over to web-scale inputs where the families' cost profiles diverge.",
  "verified": true
 },
 {
  "n": 63,
  "id": "er-063",
  "title": "WDC Products: A Multi-Dimensional Entity Matching Benchmark",
  "authors": [
   "Ralph Peeters",
   "Reng Chiz Der",
   "Christian Bizer"
  ],
  "year": 2023,
  "venue": "arXiv:2301.09521",
  "doi": null,
  "citations": null,
  "themes": [
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "supervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "The difficulty of an entity matching task depends on a combination of multiple factors such as the amount of corner-case pairs, the fraction of entities in the test set that have not been seen during training, and the size of the development set. Current entity matching benchmarks usually represent single points in the space along such dimensions or they provide for the evaluation of matching methods along a single dimension, for instance the amount of training data. This paper presents WDC Products, an entity matching benchmark which provides for the systematic evaluation of matching systems along combinations of three dimensions while relying on real-world data. The three dimensions are (i) amount of corner-cases (ii) generalization to unseen entities, and (iii) development set size (training set plus validation set). Generalization to unseen entities is a dimension not covered by any of the existing English-language benchmarks yet but is crucial for evaluating the robustness of entity matching systems. Instead of learning how to match entity pairs, entity matching can also be formulated as a multi-class classification task that requires the matcher to recognize individual entities. WDC Products is the first benchmark that provides a pair-wise and a multi-class formulation of the same tasks. We evaluate WDC Products using several state-of-the-art matching systems, including Ditto, HierGAT, and R-SupCon. The evaluation shows that all matching systems struggle with unseen entities to varying degrees. It also shows that for entity matching contrastive learning is more training data efficient compared to cross-encoders.",
  "focus": "WDC Products is an entity matching benchmark built from real-world product data that varies three difficulty dimensions systematically: the amount of corner-case pairs, generalization to entities not seen during training, and development set size. It is the first benchmark to offer both a pairwise and a multi-class formulation of the same tasks. Experiments with Ditto, HierGAT and R-SupCon show that all systems struggle with unseen entities to varying degrees, and that contrastive learning is more training-data-efficient than cross-encoders.",
  "borrow": "ERBOT can borrow the unseen-entity dimension as an explicit evaluation axis — hold out entire entities, not just pairs, from training — and the corner-case fraction as a difficulty control when reporting results.",
  "fill": "The benchmark shows every tested system struggling with unseen entities but proposes no method that handles them, and its difficulty dimensions exist only for English product data. Two openings for us: use its unseen-entity split to measure ERBOT's generalization honestly, and build the analogous dimensioned benchmark for person and bibliographic linkage, where no equivalent exists.",
  "correct": "The benchmark is confined to English-language product data; its difficulty dimensions may not capture what makes person or bibliographic linkage hard (temporal drift, name variation, deliberate obfuscation), so robustness conclusions should not be generalized beyond product matching without further evidence.",
  "verified": true
 },
 {
  "n": 64,
  "id": "er-064",
  "title": "Dedoop: efficient deduplication with Hadoop",
  "authors": [
   "Lars Kolb",
   "Andreas Thor",
   "Erhard Rahm"
  ],
  "year": 2012,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/2367502.2367527",
  "citations": 165,
  "themes": [
   "scalable"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This VLDB paper introduces Dedoop, a system that executes deduplication workflows efficiently on Hadoop: blocking and matching are mapped onto MapReduce jobs so that the workload scales on a cluster, with attention to carrying out the whole workflow — not just the comparison step — efficiently.",
  "borrow": "ERBOT can borrow Dedoop's workflow-level view: treat blocking, matching and merging as one optimizable pipeline whose data movement is planned jointly, rather than optimizing each stage in isolation.",
  "fill": "Dedoop's workflow-level optimisation is welded to Hadoop MapReduce, a cost model few would choose today, and it says nothing about matching accuracy. It leaves us the same idea on modern footing: jointly plan data movement across blocking, matching, and merging inside ERBOT's in-memory R pipeline, with no cluster required.",
  "correct": "Built on Hadoop MapReduce, its cost model and trade-offs are dated for current in-memory and dataframe-based environments; and as a systems paper, its matching quality depends entirely on the user-supplied workflow, so its efficiency results say little about resolution accuracy.",
  "verified": true
 },
 {
  "n": 65,
  "id": "er-065",
  "title": "Parallel Entity Resolution with Dedoop",
  "authors": [
   "Lars Kolb",
   "Erhard Rahm"
  ],
  "year": 2013,
  "venue": "Datenbank-Spektrum",
  "doi": "10.1007/s13222-012-0110-x",
  "citations": 0,
  "themes": [
   "scalable",
   "blocking"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This article presents Dedoop's approach to executing entity resolution in parallel on Hadoop/MapReduce: the ER workflow of blocking, matching and merging is mapped onto distributed jobs so that large datasets can be deduplicated on a cluster. It is the journal-length presentation of the Dedoop system in Datenbank-Spektrum.",
  "borrow": "ERBOT can borrow Dedoop's decomposition of the ER pipeline into distributable stages — in particular how blocking and matching work is partitioned across workers — as a design reference for scaling beyond a single machine.",
  "fill": "Dedoop's decomposition of the ER workflow into parallel stages is worked out only for Hadoop/MapReduce, an execution model the field has largely abandoned. We can carry its partitioning and load-balancing ideas into a modern data-parallel backend driven from R and check whether the design still wins at today's dataset sizes.",
  "correct": "The design is tied to Hadoop/MapReduce, whose batch, disk-heavy execution model has largely been superseded by in-memory engines; the partitioning lessons transfer, but its performance conclusions should not be carried over to modern runtimes.",
  "verified": true
 },
 {
  "n": 66,
  "id": "er-066",
  "title": "Incremental record linkage",
  "authors": [
   "Anja Gruenheid",
   "Xin Luna Dong",
   "Divesh Srivastava"
  ],
  "year": 2014,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/2732939.2732943",
  "citations": 83,
  "themes": [
   "scalable",
   "blocking"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This PVLDB paper addresses incremental record linkage: as new records arrive, they must be linked against an already-linked dataset without redoing the linkage of the whole collection. It presents techniques for updating linkage results incrementally instead of recomputing them from scratch.",
  "borrow": "ERBOT can borrow the append-and-link pattern: users whose datasets grow over time should be able to link new batches against existing entities instead of paying for a complete re-linkage on every update.",
  "fill": "The paper concentrates on updating linkage results efficiently; how cluster quality should be audited after many incremental rounds, and how incremental updates compose with learned blocking and classification in a general-purpose tool, are left open for us.",
  "correct": "Incremental linkage treats the existing linkage as settled ground to build on, so early false merges and false splits are inherited by every later update; quality can drift over time in ways that an evaluation of a single incremental step will not reveal.",
  "verified": true
 },
 {
  "n": 67,
  "id": "er-067",
  "title": "BigDansing: A System for Big Data Cleansing",
  "authors": [
   "Zuhair Khayyat",
   "Ihab F. Ilyas",
   "Alekh Jindal",
   "Samuel Madden",
   "Mourad Ouzzani",
   "Paolo Papotti",
   "Jorge-Arnulfo Quiané-Ruiz",
   "Nan Tang",
   "Si Yin"
  ],
  "year": 2015,
  "venue": "Proceedings of the 2015 ACM SIGMOD International Conference on Management of Data",
  "doi": "10.1145/2723372.2747646",
  "citations": 187,
  "themes": [
   "scalable"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "relational",
  "scale": "large (100K-1M)",
  "abstract": "Data cleansing approaches have usually focused on detecting and fixing errors with little attention to scaling to big datasets. This presents a serious impediment since data cleansing often involves costly computations such as enumerating pairs of tuples, handling inequality joins, and dealing with user-defined functions. In this paper, we present BigDansing, a Big Data Cleansing system to tackle efficiency, scalability, and ease-of-use issues in data cleansing. The system can run on top of most common general purpose data processing platforms, ranging from DBMSs to MapReduce-like frameworks. A user-friendly programming interface allows users to express data quality rules both declaratively and procedurally, with no requirement of being aware of the underlying distributed platform. BigDansing takes these rules into a series of transformations that enable distributed computations and several optimizations, such as shared scans and specialized joins operators. Experimental results on both synthetic and real datasets show that BigDansing outperforms existing baseline systems up to more than two orders of magnitude without sacrificing the quality provided by the repair algorithms.",
  "focus": "BigDansing is a system for data cleansing at big-data scale: users express data quality rules declaratively or procedurally without awareness of the underlying platform, and the system compiles the rules into distributed computations with optimizations such as shared scans and specialized join operators, running on platforms from DBMSs to MapReduce-like frameworks. On synthetic and real datasets it outperforms existing baseline systems by up to more than two orders of magnitude without sacrificing repair quality.",
  "borrow": "ERBOT can borrow the rule-compilation idea: express duplicate-detection and repair rules once and let a system layer translate them into distributed execution with shared scans, instead of hand-parallelizing each ER job.",
  "fill": "BigDansing targets DBMS and MapReduce-era platforms and treats deduplication as one cleansing task among many, so rebuilding its rule-compilation idea as a specialised ER layer on a modern stack — and benchmarking it against dedicated ER pipelines — is left for us.",
  "correct": "Its headline speedups are measured against baseline cleansing systems, not against specialized ER systems, and deduplication is only one cleansing task among several — so the results do not by themselves show it beats dedicated ER pipelines at matching.",
  "verified": true
 },
 {
  "n": 68,
  "id": "er-068",
  "title": "JedAI: The Force Behind Entity Resolution",
  "authors": [
   "George Papadakis",
   "Leonidas Tsekouras",
   "Emmanouil Thanos",
   "George Giannakopoulos",
   "Themis Palpanas",
   "Manolis Koubarakis"
  ],
  "year": 2017,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/978-3-319-70407-4_30",
  "citations": 15,
  "themes": [
   "scalable",
   "blocking"
  ],
  "method": [
   "system",
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "web scale (>1M)",
  "abstract": "",
  "focus": "This paper presents JedAI, an open-source system that assembles established algorithms for each stage of entity resolution — blocking, matching and clustering — into configurable end-to-end workflows, aimed at very large ('giant') datasets and presented at ESWC 2017.",
  "borrow": "ERBOT can borrow JedAI's modular workbench design: interchangeable algorithms per pipeline stage behind a common evaluation harness, which closely parallels ERBOT's own staged architecture.",
  "fill": "JedAI integrates the stages but leaves the user a large configuration burden — which algorithm and settings per stage is expert work — and it lives in the Java ecosystem. An R-native workbench with the same modularity, plus automatic per-stage configuration instead of hand tuning, is open ground ERBOT's staged architecture can take.",
  "correct": "A system integrating many algorithms inherits their combined configuration burden, and its 'giant scale' behavior rests largely on the blocking stage; results from its Java ecosystem also do not directly predict the performance of an R-based pipeline.",
  "verified": true
 },
 {
  "n": 69,
  "id": "er-069",
  "title": "Three-dimensional Entity Resolution with JedAI",
  "authors": [
   "George Papadakis",
   "George Mandilaras",
   "Luca Gagliardelli",
   "Giovanni Simonini",
   "Emmanouil Thanos",
   "George Giannakopoulos",
   "Sonia Bergamaschi",
   "Themis Palpanas",
   "Manolis Koubarakis"
  ],
  "year": 2020,
  "venue": "Information Systems",
  "doi": "10.1016/j.is.2020.101565",
  "citations": 48,
  "themes": [
   "scalable",
   "blocking"
  ],
  "method": [
   "system",
   "graph-based"
  ],
  "supervision": "n/a",
  "dataType": "multi-source",
  "scale": "web scale (>1M)",
  "abstract": "",
  "focus": "The journal-length account of JedAI, an open-source entity-resolution system that runs the full pipeline — blocking, meta-blocking, matching, clustering — across three execution modes, from a single machine to Apache Spark. It reports experiments on ten real and seven synthetic datasets ranging from thousands to millions of entities.",
  "borrow": "JedAI is the reference open-source baseline for end-to-end ER at scale; its block-processing workflow and Spark execution mode are the natural comparison point for ERBOT's scaling claims and its budget-based candidate generation.",
  "fill": "JedAI's own numbers document the unsolved problem: on a 3.35M-entity dataset its block-based mode takes roughly 14.5 hours and 100 GB where a schema-based run takes 15 minutes, so the integrated pipeline still explodes at the blocking stage. A budget-bounded blocker that keeps candidate growth controlled inside an end-to-end system is the missing piece — and the natural head-to-head benchmark for ERBOT's approach.",
  "correct": "Its own experiments expose the cost of generality: on a 3.35M-entity dataset the block-based pipeline reportedly takes about 14.5 hours and 100 GB of memory where a schema-based run takes about 15 minutes — the block-size explosion is documented inside the system paper itself, and is exactly what a budget-bounded blocker must avoid.",
  "verified": true
 },
 {
  "n": 70,
  "id": "er-070",
  "title": "Incremental Entity Blocking over Heterogeneous Streaming Data",
  "authors": [
   "Tiago Brasileiro Araújo",
   "Kostas Stefanidis",
   "Carlos Eduardo Santos Pires",
   "Jyrki Nummenmaa",
   "Thiago Pereira da Nóbrega"
  ],
  "year": 2022,
  "venue": "Information",
  "doi": "10.3390/info13120568",
  "citations": 6,
  "themes": [
   "scalable",
   "blocking"
  ],
  "method": [
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "Web systems have become a valuable source of semi-structured and streaming data. In this sense, Entity Resolution (ER) has become a key solution for integrating multiple data sources or identifying similarities between data items, namely entities. To avoid the quadratic costs of the ER task and improve efficiency, blocking techniques are usually applied. Beyond the traditional challenges faced by ER and, consequently, by the blocking techniques, there are also challenges related to streaming data, incremental processing, and noisy data. To address them, we propose a schema-agnostic blocking technique capable of handling noisy and streaming data incrementally through a distributed computational infrastructure. To the best of our knowledge, there is a lack of blocking techniques that address these challenges simultaneously. This work proposes two strategies (attribute selection and top-n neighborhood entities) to minimize resource consumption and improve blocking efficiency. Moreover, this work presents a noise-tolerant algorithm, which minimizes the impact of noisy data (e.g., typos and misspellings) on blocking effectiveness. In our experimental evaluation, we use real-world pairs of data sources, including a case study that involves data from Twitter and Google News. The proposed technique achieves better results regarding effectiveness and efficiency compared to the state-of-the-art technique (metablocking). More precisely, the application of the two strategies over the proposed technique alone improves efficiency by 56%, on average.",
  "focus": "This paper proposes a schema-agnostic blocking technique that handles noisy, heterogeneous streaming data incrementally on a distributed infrastructure, including a noise-tolerant algorithm that limits the impact of typos and misspellings on blocking effectiveness. Two strategies — attribute selection and top-n neighborhood entities — reduce resource consumption; in experiments on real-world source pairs, including a Twitter/Google News case study, the technique outperforms meta-blocking in effectiveness and efficiency, and the two strategies improve efficiency by 56% on average over the base technique.",
  "borrow": "ERBOT can borrow the top-n neighborhood strategy as a budget control for its own blocking stage, and the incremental design as a blueprint if SandX ever needs to block records that arrive as a stream rather than as a static file.",
  "fill": "The technique is validated on a handful of source pairs against a single baseline and lives on a distributed streaming infrastructure far from an R pipeline. We can lift its two resource-saving strategies — attribute selection and top-n neighbourhoods — into ERBOT's batch blocker and test them at large scale against the full range of blocking baselines, not just meta-blocking.",
  "correct": "The evidence base is a handful of real-world source pairs plus one social-media case study, and the comparison is against a single state-of-the-art baseline (meta-blocking) — a narrow basis for general claims about streaming ER.",
  "verified": true
 },
 {
  "n": 71,
  "id": "er-071",
  "title": "Entity Resolution for Streaming Data with Embeddings",
  "authors": [
   "Zhongwei Ma",
   "Philippe Roose",
   "Jiefu Song"
  ],
  "year": 2026,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/978-3-032-02215-8_8",
  "citations": 0,
  "themes": [
   "scalable",
   "llm"
  ],
  "method": [
   "embedding/ANN"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper tackles entity resolution for streaming data by representing records as embeddings, so that matching candidates for newly arriving records can be retrieved by vector similarity rather than by static blocking keys. It appears in Lecture Notes in Computer Science (2026).",
  "borrow": "ERBOT can borrow the framing of streaming ER as an embedding-retrieval problem, which aligns with its learned-blocking direction: maintain an index over resolved entities and match arrivals against their nearest neighbors.",
  "fill": "The paper raises embedding-based retrieval for streams but leaves the hard operational questions — index freshness, drift in arriving data, and the cost of updating embeddings — unanswered. Those are ours to pick up: implement embedding retrieval with explicit staleness and update policies in ERBOT and measure how much drift actually costs in match quality.",
  "correct": "Embedding retrieval over streams raises questions a title cannot answer — index freshness, drift in the arriving data, and the cost of embedding updates — so its claims should be checked against how it handles updates before being taken as evidence that embeddings beat incremental key-based blocking.",
  "verified": true
 },
 {
  "n": 72,
  "id": "er-072",
  "title": "Privacy-preserving record linkage using Bloom filters",
  "authors": [
   "Rainer Schnell",
   "Tobias Bachteler",
   "Jörg Reiher"
  ],
  "year": 2009,
  "venue": "BMC Medical Informatics and Decision Making",
  "doi": "10.1186/1472-6947-9-41",
  "citations": 261,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Schnell, Bachteler, and Reiher present a privacy-preserving record linkage method in which identifying attributes are encoded into Bloom filters, so that records can be compared and linked without exchanging the underlying personal values in plain form.",
  "borrow": "Bloom-filter encoding is the reference design for any privacy layer in SandX: if linkage must run across organisations that cannot share identifiers, encoded comparison of this kind is the starting point, and its similarity computations on bit arrays are cheap to implement.",
  "fill": "The paper's encoding was later shown to leak through frequency patterns in the Bloom filters, and it offers no hardening and no measurement of what protection costs in linkage accuracy. That leaves us the practical version: implement hardened Bloom-filter comparison in SandX's privacy layer and quantify both attack resistance and the accuracy loss, at scales beyond the medical datasets used here.",
  "correct": "The privacy claim has not aged unchallenged: later cryptanalysis showed that Bloom-filter encodings of names leak information through frequency patterns and can be partially reversed, so the encoding should be treated as obfuscation requiring hardening, not as a guarantee of anonymity.",
  "verified": true
 },
 {
  "n": 73,
  "id": "er-073",
  "title": "A hierarchical Bayesian approach to record linkage and population size problems",
  "authors": [
   "Andrea Tancredi",
   "Brunero Liseo"
  ],
  "year": 2011,
  "venue": "The Annals of Applied Statistics",
  "doi": "10.1214/10-aoas447",
  "citations": 92,
  "themes": [
   "privacy-bayesian",
   "probabilistic"
  ],
  "method": [
   "Bayesian"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This paper develops a hierarchical Bayesian approach that treats record linkage and population size estimation jointly, so that uncertainty about which records match propagates into the estimate of how many distinct individuals a population contains.",
  "borrow": "The joint-modelling idea is borrowable for ERBOT's evaluation: instead of reporting a single deduplicated count, propagate linkage uncertainty into the downstream counts and estimates our users compute from resolved entities.",
  "fill": "The approach is framed for population-size problems on comparatively small files; scaling hierarchical Bayesian linkage to very large datasets and integrating it with a blocking-based pipeline is left undone — and that is precisely our setting.",
  "correct": "Full Bayesian linkage of this kind is computationally expensive and sensitive to prior choices; the paper's setting does not show that the machinery stays feasible, or its uncertainty estimates well calibrated, at the scale and field counts of modern administrative or web data.",
  "verified": true
 },
 {
  "n": 74,
  "id": "er-074",
  "title": "A taxonomy of privacy-preserving record linkage techniques",
  "authors": [
   "Dinusha Vatsalan",
   "Peter Christen",
   "Vassilios S. Verykios"
  ],
  "year": 2013,
  "venue": "Information Systems",
  "doi": "10.1016/j.is.2012.11.005",
  "citations": 317,
  "themes": [
   "privacy-bayesian",
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Vatsalan, Christen, and Verykios organise the techniques of privacy-preserving record linkage into a taxonomy, classifying approaches so that their privacy and linkage-quality trade-offs can be compared. It is a structuring contribution rather than a new linkage method.",
  "borrow": "The taxonomy gives SandX a checklist for its privacy dimension: any PPRL design choice can be located in the classification, and the stated trade-offs help decide what to implement first and what to defer.",
  "fill": "The taxonomy freezes PPRL in 2013, before later cryptanalysis of popular encodings and newer secure-computation approaches, so reclassifying the techniques by their current safety — and implementing the options that survive for SandX — is work it leaves to us.",
  "correct": "A 2013 taxonomy freezes the field at that date: attack research against encodings and newer secure-computation approaches have since shifted which categories look safe, so the classification should be used as a map of design space, not as a current safety assessment.",
  "verified": true
 },
 {
  "n": 75,
  "id": "er-075",
  "title": "Randomized Response and Balanced Bloom Filters for Privacy Preserving Record Linkage",
  "authors": [
   "Rainer Schnell",
   "Christian Borgs"
  ],
  "year": 2016,
  "venue": "2016 IEEE 16th International Conference on Data Mining Workshops (ICDMW)",
  "doi": "10.1109/icdmw.2016.0038",
  "citations": 38,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This ICDMW paper combines randomized response with balanced Bloom filters for privacy-preserving record linkage, hardening the standard Bloom-filter encoding of identifying attributes against frequency-based attacks while keeping linkage on the encodings feasible.",
  "borrow": "Balanced Bloom filters plus randomized response form a concrete, implementable privacy layer for ERBOT when records cannot leave their owners: encode locally, link on the encodings, with a tunable level of plausible deniability.",
  "fill": "The paper hardens the encoding step but leaves the end-to-end question open: how much linkage quality is lost across a full pipeline — blocking, comparison, clustering — under its privacy settings, measured on realistic data. Producing that privacy-utility trade-off curve is ours to do.",
  "correct": "Randomized response buys privacy with injected noise, so a privacy-utility trade-off is intrinsic to the design; a workshop-scale evaluation cannot by itself establish that the protection survives re-identification attacks that combine information across several encoded fields.",
  "verified": true
 },
 {
  "n": 76,
  "id": "er-076",
  "title": "Privacy-Preserving Record Linkage",
  "authors": [
   "Dinusha Vatsalan",
   "Dimitrios Karapiperis",
   "Vassilios S. Verykios"
  ],
  "year": 2022,
  "venue": "Encyclopedia of Big Data Technologies",
  "doi": "10.1007/978-3-319-63962-8_17-2",
  "citations": 3,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Given several databases containing person-specific data held by different organizations, Privacy-Preserving Record Linkage (PPRL) aims to identify and link records that correspond to the same entity/individual across different databases based on the matching of personal identifying attributes, such as name and address, without revealing the actual values in these attributes due to privacy concerns. This reference work entry defines the PPRL problem, reviews the literature and key findings, and discusses applications and research challenges.",
  "focus": "This encyclopedia entry defines the privacy-preserving record linkage problem — linking records about the same individual across databases held by different organisations by matching personal identifying attributes such as name and address, without revealing the attribute values. It reviews the literature and key findings, and discusses applications and open research challenges.",
  "borrow": "Its problem definition and challenge list are a ready-made scoping document for SandX's privacy-preserving ambitions: they state precisely which threat model and constraints a PPRL feature must declare before any implementation begins.",
  "fill": "As a reference entry it defines the PPRL problem and lists open challenges but implements nothing, and most techniques it reviews are validated only on small, clean files. We can build the missing practical artifact: a Bloom-filter PPRL mode for ERBOT, evaluated for both linkage accuracy and resistance to attack at population scale.",
  "correct": "As a review it inherits the field's weakness: most PPRL evaluations it summarises use small, clean, single-country datasets and measure privacy largely by resistance to known attacks, so the reviewed conclusions should not be read as evidence that these techniques are safe or accurate at population scale.",
  "verified": true
 },
 {
  "n": 77,
  "id": "er-077",
  "title": "Entity Matching using Large Language Models",
  "authors": [
   "Ralph Peeters",
   "Aaron Steiner",
   "Christian Bizer"
  ],
  "year": 2023,
  "venue": "arXiv:2310.11244",
  "doi": null,
  "citations": null,
  "themes": [
   "llm"
  ],
  "method": [
   "LLM"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Entity matching is the task of deciding whether two entity descriptions refer to the same real-world entity. Entity matching is a central step in most data integration pipelines. Many state-of-the-art entity matching methods rely on pre-trained language models (PLMs) such as BERT or RoBERTa. Two major drawbacks of these models for entity matching are that (i) the models require significant amounts of task-specific training data and (ii) the fine-tuned models are not robust concerning out-of-distribution entities. This paper investigates using generative large language models (LLMs) as a less task-specific training data-dependent and more robust alternative to PLM-based matchers. The study covers hosted and open-source LLMs which can be run locally. We evaluate these models in a zero-shot scenario and a scenario where task-specific training data is available. We compare different prompt designs and the prompt sensitivity of the models. We show that there is no single best prompt but that the prompt needs to be tuned for each model/dataset combination. We further investigate (i) the selection of in-context demonstrations, (ii) the generation of matching rules, as well as (iii) fine-tuning LLMs using the same pool of training data. Our experiments show that the best LLMs require no or only a few training examples to perform comparably to PLMs that were fine-tuned using thousands of examples. LLM-based matchers further exhibit higher robustness to unseen entities. We show that GPT4 can generate structured explanations for matching decisions and can automatically identify potential causes of matching errors by analyzing explanations of wrong decisions. We demonstrate that the model can generate meaningful textual descriptions of the identified error classes, which can help data engineers to improve entity matching pipelines.",
  "focus": "The paper evaluates generative LLMs, hosted and open-source, as entity matchers in zero-shot and low-training-data scenarios, comparing prompt designs, in-context demonstration selection, matching-rule generation, and fine-tuning against fine-tuned pre-trained language model matchers. It finds that the best LLMs need no or only a few training examples to perform comparably to PLMs fine-tuned on thousands of examples, are more robust to out-of-distribution entities, and that GPT-4 can produce structured explanations of decisions and identify error classes from wrong decisions.",
  "borrow": "Two things transfer directly to ERBOT: its prompt-design and demonstration-selection findings for an LLM matching stage, and the use of structured explanations plus error-class analysis of wrong decisions as a diagnostic tool in our evaluation stage.",
  "fill": "The experiments study the matcher in isolation on benchmark candidate pairs; the paper does not embed LLM matching in a full pipeline with blocking at very large scale, nor does it solve the cost and latency budgeting of LLM calls across millions of pairs — that integration and budgeting is left for us.",
  "correct": "Its own finding that there is no single best prompt — prompts must be tuned for each model/dataset combination — undercuts the 'less task-specific' framing, since prompt tuning is itself a form of per-task adaptation; the zero-shot advantage also depends on the particular PLM baselines and datasets chosen.",
  "verified": true
 },
 {
  "n": 78,
  "id": "er-078",
  "title": "Match, Compare, or Select? An Investigation of Large Language Models for Entity Matching",
  "authors": [
   "Tianshu Wang",
   "Xiaoyang Chen",
   "Hongyu Lin",
   "Xuanang Chen",
   "Xianpei Han",
   "Hao Wang",
   "Zhenyu Zeng",
   "Le Sun"
  ],
  "year": 2024,
  "venue": "arXiv:2405.16884",
  "doi": null,
  "citations": null,
  "themes": [
   "llm",
   "evaluation"
  ],
  "method": [
   "LLM"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Entity matching (EM) is a critical step in entity resolution (ER). Recently, entity matching based on large language models (LLMs) has shown great promise. However, current LLM-based entity matching approaches typically follow a binary matching paradigm that ignores the global consistency among record relationships. In this paper, we investigate various methodologies for LLM-based entity matching that incorporate record interactions from different perspectives. Specifically, we comprehensively compare three representative strategies: matching, comparing, and selecting, and analyze their respective advantages and challenges in diverse scenarios. Based on our findings, we further design a compound entity matching framework (ComEM) that leverages the composition of multiple strategies and LLMs. ComEM benefits from the advantages of different sides and achieves improvements in both effectiveness and efficiency. Experimental results on 8 ER datasets and 10 LLMs verify the superiority of incorporating record interactions through the selecting strategy, as well as the further cost-effectiveness brought by ComEM.",
  "focus": "The paper compares three strategies for LLM-based entity matching that incorporate record interactions — matching, comparing, and selecting — instead of the usual binary paradigm that ignores global consistency among record relationships. It finds the selecting strategy most effective and builds ComEM, a compound framework that composes multiple strategies and LLMs, improving both effectiveness and efficiency on 8 ER datasets across 10 LLMs.",
  "borrow": "ERBOT can borrow the selecting formulation — present a record together with its candidate set and let the model pick the match — as an alternative mode for an LLM matching stage, along with ComEM's idea of composing several strategies rather than relying on a single prompt pattern.",
  "fill": "The study evaluates LLM strategies on benchmark datasets with candidate pairs already supplied; it leaves open how the selecting strategy behaves inside a full pipeline at very large scale, where candidate sets come from our own blocking and can be large, noisy, and unbalanced — integrating and stress-testing it there is work we can pick up.",
  "correct": "Its comparisons rest on benchmarks whose candidate pairs are given, so the claimed superiority of selecting may shrink once blocking errors dominate end-to-end quality; and ComEM's cost-effectiveness depends on the specific LLMs and prices tested, which date quickly.",
  "verified": true
 },
 {
  "n": 79,
  "id": "er-079",
  "title": "Efficient Record Linkage in the Age of Large Language Models: The Critical Role of Blocking",
  "authors": [
   "Nidhibahen Shah",
   "Sreevar Patiyara",
   "Joyanta Basak",
   "Sartaj Sahni",
   "Anup Mathur",
   "Krista Park",
   "Sanguthevar Rajasekaran"
  ],
  "year": 2025,
  "venue": "Algorithms",
  "doi": "10.3390/a18110723",
  "citations": 3,
  "themes": [
   "llm",
   "blocking"
  ],
  "method": [
   "LLM"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "Record linkage is an essential task in data integration in the fields of healthcare, law enforcement, fraud detection, transportation, biology, and supply chain management. The problem of record linkage is to cluster records from various sources such that each cluster belongs to a single entity. Scalability in record linking is limited by the large number of pairwise comparisons required. Blocking addresses this challenge by partitioning data into smaller parts, substantially reducing the computational cost. With the advancement of Large Language Models (LLMs), there are several possibilities to improve record linkage by leveraging their semantic understanding of textual attributes. LLM-based record linkage algorithms in the literature have very large runtimes. In this paper, we show that the employment of blocking can result in significant improvements not only in the runtime but also in the accuracy. Specifically, we propose a record linkage algorithm that combines LLMs with blocking. Experimental evaluation demonstrates that our algorithm achieves lower runtimes while simultaneously improving F1 scores compared to the approaches relying solely on LLMs. These findings demonstrate the importance of blocking even in the era of advanced machine learning models.",
  "focus": "This paper proposes a record linkage algorithm that combines large language models with blocking, and shows experimentally that adding blocking not only reduces runtime but also improves F1 compared with LLM-only linkage. It argues that blocking remains critical even as semantic LLM matchers become available.",
  "borrow": "It is direct evidence for ERBOT's architecture: keep a strong blocking stage in front of any expensive matcher, and evaluate blocking as an accuracy component of the pipeline, not merely a speed filter.",
  "fill": "This is a single study on one LLM pipeline: it shows blocking helps, but not which blocking method or candidate budget an LLM matcher actually needs, and the per-pair LLM cost remains. It leaves us the systematic version — inside ERBOT, vary the blocker and the budget in front of an LLM matcher at large scale and find how small the candidate set can get before recall, not just runtime, starts to fall.",
  "correct": "The finding that blocking improves accuracy is counterintuitive and may depend on the particular LLM-only baseline and datasets used; as a single study it is suggestive rather than a general law about blocking and LLMs.",
  "verified": true
 },
 {
  "n": 80,
  "id": "er-080",
  "title": "Fine-Tuning Large Language Models for Entity Matching",
  "authors": [
   "Aaron Steiner",
   "Ralph Peeters",
   "Christian Bizer"
  ],
  "year": 2025,
  "venue": "2025 IEEE 41st International Conference on Data Engineering Workshops (ICDEW)",
  "doi": "10.1109/icdew67478.2025.00006",
  "citations": 44,
  "themes": [
   "llm",
   "ml-deep"
  ],
  "method": [
   "LLM"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Generative large language models (LLMs) are a promising alternative to pre-trained language models for entity matching due to their high zero-shot performance and ability to generalize to unseen entities. Existing research on using LLMs for entity matching has focused on prompt engineering and in-context learning. This paper explores the potential of fine-tuning LLMs for entity matching. We analyze fine-tuning along two dimensions: 1) the representation of training examples, where we experiment with adding different types of LLM-generated explanations to the training set, and 2) the selection and generation of training examples using LLMs. In addition to the matching performance on the source dataset, we investigate how fine-tuning affects the model's ability to generalize to other in-domain datasets as well as across topical domains. Our experiments show that fine-tuning significantly improves the performance of the smaller models while the results for the larger models are mixed. Fine-tuning also improves the generalization to in-domain datasets while hurting cross-domain transfer. We show that adding structured explanations to the training set has a positive impact on the performance of three out of four LLMs, while the proposed example selection and generation methods, only improve the performance of Llama 3.1 8B while decreasing the performance of GPT-4o-mini.",
  "focus": "This study explores fine-tuning large language models for entity matching along two dimensions: how training examples are represented (including LLM-generated explanations added to the training set) and how training examples are selected or generated. Fine-tuning significantly improves smaller models but gives mixed results for larger ones, improves generalization to in-domain datasets while hurting cross-domain transfer, and structured explanations help three of the four models tested.",
  "borrow": "Concrete guidance if ERBOT adds an LLM matcher: fine-tune a smaller open model rather than prompting a large one, and include structured explanations in the fine-tuning examples.",
  "fill": "The fine-tuning effects flip sign between models and fine-tuning actively hurts cross-domain transfer, so the paper ends without a predictable recipe for when to fine-tune. The open work is exactly that decision rule: test fine-tuned small matchers behind ERBOT's blocking across domains — including record linkage rather than only product data — and find when the fine-tuned matcher stays portable.",
  "correct": "The effects are model-specific and sometimes flip sign between models (the example selection methods help Llama 3.1 8B but hurt GPT-4o-mini), and the demonstrated cross-domain degradation warns against treating a fine-tuned matcher as portable across datasets.",
  "verified": true
 },
 {
  "n": 81,
  "id": "er-081",
  "title": "Cost-Efficient RAG for Entity Matching with LLMs: A Blocking-based Batch Processing Framework",
  "authors": [
   "Chuangtao Ma",
   "Zeyu Zhang",
   "Arijit Khan",
   "Sebastian Schelter",
   "Paul Groth"
  ],
  "year": 2026,
  "venue": "arXiv:2602.05708",
  "doi": null,
  "citations": null,
  "themes": [
   "llm",
   "blocking"
  ],
  "method": [
   "LLM"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Large language models (LLMs) offer a compelling approach to entity matching (EM) in label-scarce settings, yet their matching quality is sensitive to records with ambiguous or sparse attributes due to the absence of external factual grounding. Retrieval-augmented generation (RAG) directly addresses this grounding gap by retrieving and injecting relevant external knowledge. However, naively applying RAG to large-scale EM is expensive due to per-pair retrieval calls over large knowledge graphs (KGs) and the increase in input tokens caused by enriching prompts with retrieved contextual knowledge. To address the above limitation, we introduce a CE-RAG4EM (Cost-Efficient RAG for Entity Matching) framework that reduces overhead through blocking-based batch retrieval and generation. We investigate the benefits of this framework through a systematic analysis of RAG systems for entity matching, focusing on blocking-aware batch optimizations and retrieval granularity. Extensive experiments on nine widely used real-world entity matching benchmark datasets show that CE-RAG4EM under a zero-shot setting achieves comparable or improved matching quality while substantially reducing end-to-end overhead. The results demonstrate that our CE-RAG4EM closes the knowledge grounding gap of the LLM-EM baseline and yields significant improvements in F1 scores on datasets with ambiguous or numerically sparse attributes, while its batch retrieval and inference substantially reduce the overhead and maintain competitive matching quality compared to naive RAG4EM. Our analysis identifies clear performance-overhead trade-offs across blocking-based batch sizes and retrieval granularity, showing how matching quality and computational cost shift with each design choice. These findings offer concrete guidance for building scalable, efficient RAG systems for entity matching that balance accuracy and cost.",
  "focus": "CE-RAG4EM reduces the cost of retrieval-augmented entity matching by replacing per-pair retrieval and generation with blocking-based batch retrieval and batch inference. In zero-shot experiments on nine benchmark datasets it achieves comparable or better matching quality than naive RAG for entity matching at substantially lower end-to-end overhead, with the clearest F1 gains on datasets whose records are ambiguous or numerically sparse.",
  "borrow": "The batching principle transfers to ERBOT: organize any expensive scoring or retrieval step by block so context and retrieval results are shared across pairs, instead of paying full cost pair by pair.",
  "fill": "The framework presumes a suitable external knowledge graph exists and pays off mainly on ambiguous or sparse records, so retrieval grounded in the dataset itself when no KG is available — plus a principled rule for when retrieval is worth its cost — is left for us to work out.",
  "correct": "The benefits are demonstrated in a zero-shot setting against LLM baselines and concentrate on ambiguous or sparse datasets; on clean, distinctive records the retrieval adds cost without clear benefit, and the method presumes a suitable external knowledge graph exists.",
  "verified": true
 },
 {
  "n": 82,
  "id": "er-082",
  "title": "Entity Resolution in Practice: Lessons from a Self-Serve Pipeline",
  "authors": [
   "Kaushik Pavani",
   "Ganga Aluri",
   "Pravin Jadhav",
   "Neeraj Prasad",
   "Kiran Sanka"
  ],
  "year": 2026,
  "venue": "arXiv:2607.26298",
  "doi": null,
  "citations": null,
  "themes": [
   "llm",
   "scalable"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "We built and evaluated a self-serve entity resolution (ER) system on six benchmarks spanning 864 to 5M records, and three lessons emerged that are absent from existing ER literature. (1) No single matching algorithm wins everywhere - a self-serve pipeline cannot predict its next dataset, so we recommend training several algorithm families per dataset and letting an automatic bake-off pick the winner. (2) Precision and recall need separate fixes, not a shared threshold - precision needs hard rule-based vetoes, recall needs more diverse candidate retrieval. (3) One false-positive link can silently merge unrelated entities - assuming \"A matches B\" and \"B matches C\" implies \"A matches C\" lets a single bad link chain hundreds of records together, so every cross-group merge must be actively re-verified. We hope these lessons save practitioners the months of dead-end experiments that led us to them.",
  "focus": "Drawing on a self-serve entity resolution system evaluated on six benchmarks ranging from 864 to 5M records, this paper reports three lessons: no single matching algorithm wins everywhere, so a pipeline should train several algorithm families and let an automatic bake-off choose; precision and recall need separate fixes (rule-based vetoes for precision, more diverse candidate retrieval for recall); and transitive merging is dangerous, because one false-positive link can chain hundreds of records together unless cross-group merges are re-verified.",
  "borrow": "All three lessons are actionable for ERBOT/SandX: per-dataset algorithm bake-offs, a rule-based veto layer for precision kept separate from the scorer, and mandatory re-verification of cross-cluster merges in the clustering stage.",
  "fill": "The paper's remedies assume you can afford to train several algorithm families per dataset and re-verify merges — assumptions that get shakiest exactly at the largest scales, and its lessons come from a single system. It leaves us the follow-through: implement the bake-off, the rule-based veto layer, and merge re-verification in ERBOT, test whether the lessons hold beyond 5M records, and find a cheap way to predict the winning family instead of running the full bake-off.",
  "correct": "The lessons come from one team's system and six benchmarks, and the bake-off remedy presumes the compute budget to train several model families per dataset - an assumption that may fail exactly at the very large scales where self-serve pipelines are most attractive.",
  "verified": true
 },
 {
  "n": 83,
  "id": "er-083",
  "title": "Retrieve, Match, Escalate: Accurate and Scalable Product Linking with VLM-Distilled Cross-Encoders and Agentic VLMs",
  "authors": [
   "Jian Wang",
   "Steven Xu",
   "Sanjyot Thete",
   "Maryam Barouti",
   "Tom Tang",
   "Elaine Wu",
   "Charu Sareen",
   "Kyle MacDonald"
  ],
  "year": 2026,
  "venue": "arXiv:2608.25037",
  "doi": null,
  "citations": null,
  "themes": [
   "llm",
   "scalable"
  ],
  "method": [
   "LLM",
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "Product linking, the entity-resolution task of mapping merchant product records to canonical catalog products, consolidates fragmented listings so downstream search, recommendation, and advertising see one clean entry per product. At marketplace scale, billions of noisy, multi-category records must be resolved against tens of millions of canonical products, where scoring every candidate with a single model is either too weak for the hard cases or too costly for the easy ones. We present a production retrieve-then-match cascade that spends computation in proportion to difficulty: retrieval surfaces plausible matches, a lightweight text cross-encoder auto-resolves the high-confidence majority, and an agentic multimodal vision-language model settles the ambiguous remainder by inspecting product images and issuing web searches for evidence that is in neither record. The cross-encoder is distilled from millions of dual-VLM-consensus labels, retiring human annotation from the training set, and is calibrated to auto-accept links at a 98% precision bar validated against a smaller operator-certified audit. The agent is a self-hosted open-weight model that reaches a closed frontier VLM's precision at a four-point recall cost (88% versus 92%) for roughly one-seventh the per-pair cost, with no fine-tuning. Per-pair cost spans nearly five orders of magnitude from the cheap cross-encoder to the frontier VLM, so escalating only the hard tail to the agent raises end-to-end link coverage from the cheap stage's 68% to 77%.",
  "focus": "This paper presents a production cascade for product linking at marketplace scale, where billions of merchant records are resolved against tens of millions of canonical products. Retrieval surfaces candidates, a lightweight text cross-encoder distilled from dual-VLM consensus labels auto-resolves the high-confidence majority at a calibrated 98% precision bar, and an agentic vision-language model settles the ambiguous remainder using product images and web searches, raising link coverage from 68% to 77%.",
  "borrow": "The cascade economics are directly applicable to ERBOT's classification stage: spend model capacity in proportion to pair difficulty, auto-accept only above an explicit calibrated precision bar, and escalate just the hard tail to the expensive model.",
  "fill": "The cascade is demonstrated only inside one marketplace, on proprietary data, with product images and VLM teachers that most ER projects do not have. We can rebuild the difficulty-proportional design for text-only records in ERBOT — cheap classifier auto-accepting above a calibrated precision bar, expensive model escalated only the hard tail — and measure how much of the coverage gain survives on open data.",
  "correct": "The evidence comes from one marketplace's proprietary catalog, and the cross-encoder is distilled from VLM consensus labels, so it inherits the teacher models' biases; the reported precision and coverage numbers may not transfer to other domains or catalogs.",
  "verified": true
 }
];
