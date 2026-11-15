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
  "fill": "Before this paper, duplicate elimination was an ad hoc data-cleaning chore handled inside individual applications. It filled the problem-definition gap, naming merge/purge as a research problem with its own structure.",
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
  "fill": "Before this paper, deduplication at scale relied on exact blocking keys or sorted-neighbourhood windows, which break whenever the key field is noisy. It supplied an approximate, similarity-based grouping method that tolerates noisy fields while still cutting the quadratic comparison space.",
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
  "fill": "By 2012 the indexing literature was scattered across database, statistics, and data-mining venues with incompatible terminology. The survey filled the consolidation gap for the record-linkage community, in one reference, before the learned-blocking era began.",
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
  "fill": "Blocking research had produced many key designs but no general way to clean up the output of an arbitrary blocker; redundant comparisons inside large, overlapping blocks were accepted as unavoidable. This paper filled that gap with a blocker-agnostic restructuring framework.",
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
  "fill": "Classical blocking assumed a static dataset and reasonably clean key attributes; dynamic linkage against a growing database with noisy values had no dedicated blocking treatment. This paper filled that dynamic, noise-tolerant niche.",
  "correct": "The real-time framing is validated in a workshop-paper-scale evaluation; the approach's behaviour at the multi-million-record scale ERBOT targets, and its interaction with a downstream learned matcher, remain undemonstrated, so its guarantees should be read as setting-specific.",
  "verified": true
 },
 {
  "n": 6,
  "id": "er-006",
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
  "fill": "For angular distance there was a standing gap between LSH families with optimal theoretical exponents (impractical constants) and the practical hyperplane method (suboptimal exponent). This paper filled the theory-practice gap.",
  "correct": "Optimality is asymptotic and stated for the angular-distance near-neighbour problem under the paper's model; ER data are heavily skewed (a few huge duplicate clusters, many singletons), a regime where LSH bucket-size variance, not the exponent, dominates real cost — so the optimality claim should not be read as a practical ranking over graph or IVF indexes.",
  "verified": true
 },
 {
  "n": 7,
  "id": "er-007",
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
  "fill": "Original meta-blocking was demonstrated on moderate, relatively clean collections; whether graph-based pruning survived web-scale, heterogeneous data — skewed block sizes, schema variety — was open. This paper filled that scaling gap.",
  "correct": "The enhancements still operate downstream of a conventional first-stage blocker, so the recall ceiling problem is untouched, and 'large-scale' here is demonstrated in batch settings; incremental or streaming updates to the block graph are not addressed, which matters for any deployment where data arrives continuously.",
  "verified": true
 },
 {
  "n": 8,
  "id": "er-008",
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
  "fill": "Before AutoBlock, blocking in production ER systems meant expert-written rules and keys, while learning-based work concentrated on the matching stage. It filled the automation gap at the blocking stage.",
  "correct": "Later design-space work (DeepBlocker) showed AutoBlock's particular architecture is not the strongest learned blocker and that simpler self-supervised embeddings can match or beat it; its 'hands-off' claim also quietly depends on training data drawn from the same distribution as the target data, which limits transfer to new domains.",
  "verified": true
 },
 {
  "n": 9,
  "id": "er-009",
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
  "fill": "Proximity-graph ANN methods existed but typically needed auxiliary coarse-search structures and degraded at high recall or on clustered data. HNSW filled the gap with a single self-contained hierarchical graph structure with skip-list-like scaling.",
  "correct": "HNSW's costs are memory and mutability: the graph holds many edges per vector, so billion-scale use is expensive, and deletions and updates are awkward — for ER workloads where the index must absorb corrections, an IVF-style index may age better. Its recall also depends on parameters whose good settings vary with data clustering.",
  "verified": true
 },
 {
  "n": 10,
  "id": "er-010",
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
  "fill": "By 2021, blocking research attention had shifted toward learned representations, while the algorithmic question of how to generate candidates effectively with conventional machinery at large scale remained active; BEER filled that systems-algorithm slot in the literature.",
  "correct": "Without an abstract in the record we flag the obvious scope question rather than a specific flaw: blocking-only contributions live or die by end-to-end pipeline effect, and any adoption decision for ERBOT should wait on reading its recall-versus-candidate-size curves against meta-blocking and DeepBlocker on our own data.",
  "verified": true
 },
 {
  "n": 11,
  "id": "er-011",
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
  "fill": "Nearest-neighbour search libraries topped out far below the billion-vector regime, and CPU implementations could not serve the embedding workloads that representation learning was creating. This work filled the billion-scale, GPU-accelerated similarity-search gap.",
  "correct": "FAISS optimises vector proximity, not entity resolution: it knows nothing of records, attributes, or match semantics, and its recall figures are index recall (did we find the true nearest vectors), which is an upper bound on, not a substitute for, blocking pair completeness. Treating ANN recall as ER recall is a category error we should avoid in our own reporting.",
  "verified": true
 },
 {
  "n": 12,
  "id": "er-012",
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
  "fill": "Earlier surveys treated blocking in isolation, while similarity-join and nearest-neighbour filtering work lived in separate literatures. This survey filled the unification gap, giving one map of the whole search-space-reduction problem.",
  "correct": "As a taxonomy paper it organises more than it adjudicates: readers should not treat inclusion or grouping in the survey as evidence of relative merit, since head-to-head performance depends heavily on configuration — a point the companion benchmarking work by the same group makes forcefully.",
  "verified": true
 },
 {
  "n": 13,
  "id": "er-013",
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
  "fill": "Deep learning had transformed entity matching but blocking was still mostly hand-crafted; the few DL blocking attempts each tried one simple architecture, some needing labels. This paper filled the systematic-exploration gap and showed label-free DL blocking was viable.",
  "correct": "The headline wins are on dirty and textual benchmarks; on clean structured data the DL advantage disappears, and the benchmarks used are small by production standards. The framework also leaves the retrieval step's cost largely unexamined — embedding quality is optimised, but index build and query cost at tens of millions of records is where ERBOT's problem actually lives.",
  "verified": true
 },
 {
  "n": 14,
  "id": "er-014",
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
  "fill": "Each filtering family had its own papers and its own favourable benchmarks, but nobody had run the three families head-to-head under equally tuned configurations. This study filled the comparative-evidence gap.",
  "correct": "The conclusion that nearest-neighbour methods trail is configuration- and embedding-dependent: the NN methods were tested largely with generic fastText-style embeddings rather than the task-trained representations of DeepBlocker or SC-Block, so the verdict should not be read as settling 'blocking vs ANN' for learned embeddings.",
  "verified": true
 },
 {
  "n": 15,
  "id": "er-015",
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
  "fill": "Learned blockers were usually evaluated on blocking metrics alone, on small datasets where vocabulary effects hide runtime costs, and self-supervised ones left label information unused. SC-Block filled the gap for a supervised-contrastive blocker evaluated as a pipeline component at realistic scale.",
  "correct": "The method's premise is the availability of labeled matching pairs for contrastive training — precisely what cold-start ER projects lack — so its gains over self-supervised blockers are partly a supervision effect, not purely an architecture effect; the comparison would be fairer against label-matched baselines.",
  "verified": true
 },
 {
  "n": 16,
  "id": "er-016",
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
  "fill": "Blocking research had cycled through keys, graphs, and neural embeddings while TF/IDF — the workhorse of information retrieval — had never been seriously evaluated as a blocker, and top-k (rather than threshold) blocking was underexplored. Sparkly filled both gaps and reset the baseline.",
  "correct": "The result cuts both ways: if a decades-old IR measure beats eight modern blockers, some of Sparkly's margin may come from careful engineering and per-dataset tuning of attributes and tokenizers rather than from TF/IDF itself; its advantage on short, structured records (as opposed to text-rich product data) is also less clear.",
  "verified": true
 },
 {
  "n": 17,
  "id": "er-017",
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
  "fill": "Supervised meta-blocking had existed since 2014 but was a per-dataset exercise — new collection, new labeled pairs, new model. GSM addresses the standing gap of a supervised pruning method that carries over to unseen collections.",
  "correct": "The generalization claim rests on a limited family of benchmark collections; whether the learned pruner survives strong schema heterogeneity — where the blocking keys themselves change — is the point we would test before relying on it, and labeled pairs are still needed to train the general model in the first place.",
  "verified": true
 },
 {
  "n": 18,
  "id": "er-018",
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
  "fill": "GPU acceleration in ER had targeted matching and similarity joins, while rule-based blocking — still the production default — ran on CPU frameworks. HyperBlocker filled the GPU gap for the blocking stage specifically.",
  "correct": "Speedups are reported against specific prior systems on the authors' datasets, and the approach inherits rule-based blocking's core weakness: someone must still write good rules. A 30% end-to-end gain also quietly shows blocking was not the dominant cost once a modern matcher is attached — the bottleneck moves, and so should optimisation effort.",
  "verified": true
 },
 {
  "n": 19,
  "id": "er-019",
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
  "fill": "PLM-based blocking results were accumulating paper by paper, each on its own datasets and splits, with no independent check of reproducibility or cross-dataset generalisation. This study filled the verification gap.",
  "correct": "Reproducibility studies inherit the scope of what they reproduce: a verdict on the specific PLM blockers examined should not be generalised to all embedding-based blocking, and 'generalisation' across the standard small ER benchmarks is still a narrow slice of the deployment conditions ERBOT targets.",
  "verified": true
 },
 {
  "n": 20,
  "id": "er-020",
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
  "fill": "Self-supervised dense blockers still needed training on each target domain, erasing much of their convenience advantage over rule-based blocking. UniBlocker filled the transfer gap: one pre-trained blocker intended to work across domains out of the box.",
  "correct": "'Universal' is established on the authors' own new benchmark, and 'comparable and complementary to sparse blocking' concedes that plain token blocking remains competitive — the claim should be read as 'best among label-free dense blockers', not as evidence that learned blocking has overtaken sparse methods in general.",
  "verified": true
 },
 {
  "n": 21,
  "id": "er-021",
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
  "fill": "ANN-based blocking existed in research code but not as a maintained, documented package aimed at record-linkage practitioners, who still relied on rule-based pairing tools. BlockingPy filled the packaging gap.",
  "correct": "A package paper demonstrates availability, not superiority: ANN blocking's recall depends entirely on the representation fed into the index (n-gram or embedding), and the software framing can make that dependence invisible to users. Any ERBOT comparison should benchmark its candidate quality, not its convenience.",
  "verified": true
 },
 {
  "n": 22,
  "id": "er-022",
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
  "fill": "Before this work, record-linkage methodology rested largely on the Fellegi–Sunter theory and small-scale studies; a detailed account of the methodology as applied to an actual census match, with its practical complications, was missing.",
  "correct": "Findings tuned to one census file, one country, and 1980s data quality should not be assumed to transfer to modern administrative or web data; the paper's setting is a single, well-structured source, which is the easiest case for linkage.",
  "verified": true
 },
 {
  "n": 23,
  "id": "er-023",
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
  "fill": "The original Fellegi–Sunter setup treated field comparisons as essentially binary, which wastes the information in near-miss strings (typos, abbreviations, transpositions); no standard string comparator designed for that model existed before this paper.",
  "correct": "Comparator behaviour tuned on English-language names and US address conventions may not carry over to other languages, scripts, or naming customs; the enhanced decision rules also inherit the Fellegi–Sunter assumption that field agreements are conditionally independent, which real data routinely violates.",
  "verified": true
 },
 {
  "n": 24,
  "id": "er-024",
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
  "fill": "String comparison for object identification relied on edit distances with uniform or hand-set costs; learned, transferable transformation weights that reflect which edits are actually common in real data were not available.",
  "correct": "The domain-independence claim deserves pressure: transformation frequencies are shaped by how data were generated and corrupted in specific sources, so weights learned in one setting may only be approximately portable, and the evaluation domains of the early 2000s were small and clean by current standards.",
  "verified": true
 },
 {
  "n": 25,
  "id": "er-025",
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
  "fill": "Duplicate detection previously relied on fixed, hand-chosen string metrics whose behaviour varies sharply across domains; a framework for learning the similarity measure from labelled examples was missing.",
  "correct": "Learned similarity depends on representative labelled training pairs, which are exactly what many linkage projects lack; performance claims rest on the benchmarks used, and a measure adapted to one domain's error patterns may degrade on another's.",
  "verified": true
 },
 {
  "n": 26,
  "id": "er-026",
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
  "fill": "Before this work, connecting records about the same family across routine files was manual clerical work; there was no demonstrated method for a computer to weigh identifying information and link records automatically.",
  "correct": "The approach was demonstrated on comparatively orderly vital records with rich identifying fields; its feasibility says little about linkage quality on sparse, error-ridden, or deliberately de-identified modern files, where the same identifying evidence is much weaker.",
  "verified": true
 },
 {
  "n": 27,
  "id": "er-027",
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
  "fill": "Before 1969, record linkage was a collection of ad hoc clerical and computational procedures, as in Newcombe's pioneering work, with no mathematical theory specifying optimal decision rules or controllable error rates; this paper supplied that theory.",
  "correct": "The theory's standard implementation assumes conditional independence of field agreements given match status, which real data violate (names correlate with geography, errors cluster within sources); treating the independence-based weights as exact rather than as a useful approximation is a claim we should challenge wherever ERBOT reports them.",
  "verified": true
 },
 {
  "n": 28,
  "id": "er-028",
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
  "fill": "Before this book, the field's techniques were documented mainly in scattered papers and system manuals; a single, systematic textbook treatment connecting the stages of the matching process did not exist.",
  "correct": "A 2012 reference necessarily predates the embedding, deep-learning, and LLM eras of matching, so its technique coverage should be treated as the classical baseline rather than the current frontier; some of its practical guidance also assumes dataset sizes well below what ERBOT targets.",
  "verified": true
 },
 {
  "n": 29,
  "id": "er-029",
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
  "fill": "Prior statistical linkage largely handled two files and pairwise decisions, with deduplication treated as a separate problem and no standard way to carry linkage uncertainty into the analyses that use the linked data; a unified, unsupervised multi-file framework was missing.",
  "correct": "The scalability evidence comes from survey datasets, which are orders of magnitude smaller and cleaner than the multi-million-record administrative files ERBOT aims at; MCMC over a high-dimensional latent structure may not preserve its linear-time behaviour there, and the model's assumptions about how records distort latent attributes are a further point to probe.",
  "verified": true
 },
 {
  "n": 30,
  "id": "er-030",
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
  "fill": "Mainstream statistical linkage estimated pair-level probabilities under an independence assumption known to be false, and offered no coherent way to estimate the joint matching or to express that part of it should be left undecided; this paper filled that methodological gap.",
  "correct": "The bipartite, one-to-one formulation is itself a strong assumption: real file pairs often contain within-file duplicates and many-to-one relationships that a bipartite matching cannot represent, and the demonstrated gains are on modest-sized files, so behaviour at the very large scales ERBOT targets remains unproven.",
  "verified": true
 },
 {
  "n": 31,
  "id": "er-031",
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
  "fill": "Entity resolution knowledge was scattered across statistics, computer science, and official-statistics literatures with incompatible vocabularies; a unified synthesis that a newcomer could read end-to-end was largely absent.",
  "correct": "Any 'almost all' synthesis reflects its authors' vantage point — here a statistical, Bayesian one — so algorithmic and industry-scale perspectives (streaming, web-scale engineering) should be checked for under-representation before treating the map as complete.",
  "verified": true
 },
 {
  "n": 32,
  "id": "er-032",
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
  "fill": "Entity matching research had produced many matching algorithms but little in the way of systems for building and managing the full matching workflow on standard data-science infrastructure; Magellan addressed that systems gap.",
  "correct": "With no abstract available, only the scope is clear: this is a systems contribution, so it should not be cited as evidence for matching-accuracy advances, and its management layer may be more machinery than a focused pipeline needs.",
  "verified": true
 },
 {
  "n": 33,
  "id": "er-033",
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
  "fill": "Deep learning had been applied to entity matching in isolated point designs; a systematic map of the design space showing which choices drive performance was missing.",
  "correct": "Its conclusions date from 2018 and predate pretrained language models for matching; the ranking of design choices may not survive the shift to fine-tuned transformers that followed.",
  "verified": true
 },
 {
  "n": 34,
  "id": "er-034",
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
  "fill": "Before DeepER, entity resolution ran on hand-crafted similarity features; representation learning had transformed NLP and vision but had no established tuple-level formulation for ER. DeepER filled that gap with a trainable tuple representation usable for both candidate generation and classification.",
  "correct": "Its embeddings are trained per dataset and its LSH stage offers no control over candidate recall; later design-space work (DeepBlocker) showed simpler autoencoder embeddings often beat its recurrent encoders, so its architectural choices should be treated as a starting point, not a default.",
  "verified": true
 },
 {
  "n": 35,
  "id": "er-035",
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
  "fill": "Deep learning approaches to entity linkage had uniformly followed the twin-network design; an architecture built around cross-record interaction and contrastive comparison was missing.",
  "correct": "The largest gain is reported against the best deep model on a single real-world dataset, and the paper appeared the same year as pretrained-language-model matchers such as Ditto; whether the contrastive advantage survives those stronger baselines is not addressed.",
  "verified": true
 },
 {
  "n": 36,
  "id": "er-036",
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
  "fill": "Before Ditto, deep entity matching models were trained largely from scratch with engineered features; whether off-the-shelf pretrained language models, simply fine-tuned, could beat specialized matching architectures was an open question.",
  "correct": "The benchmark results are computed on candidate pairs produced by existing blocking, so end-to-end recall of a full pipeline is not tested; per-dataset fine-tuning of a large language model is also expensive, and the gains presume labeled pairs from the target domain.",
  "verified": true
 },
 {
  "n": 37,
  "id": "er-037",
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
  "fill": "Existing entity matching benchmarks covered only pairs of structured tables sharing a schema; there was no benchmark for matching across differently structured collections, which real data-science work routinely faces.",
  "correct": "Because the seven tasks are transformations of structured benchmarks rather than natively heterogeneous data, measured performance may overstate readiness for genuinely unstructured sources.",
  "verified": true
 },
 {
  "n": 38,
  "id": "er-038",
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
  "fill": "Neural entity matching results were scattered across venues with no consolidated account of which pipeline steps neural methods had actually addressed and how they compared with traditional approaches.",
  "correct": "Published in 2021, the survey predates LLM-based matching, so its taxonomy and its assessment of how far neural methods have come should be read as a pre-LLM snapshot rather than current guidance.",
  "verified": true
 },
 {
  "n": 39,
  "id": "er-039",
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
  "fill": "Before Sudowoodo, machine-learning approaches to data integration and preparation depended on large labeled datasets and on models customized task by task; a single label-free representation framework spanning multiple integration tasks was missing.",
  "correct": "The multi-purpose claim is demonstrated on benchmark tasks within data integration; whether the representations hold up on very large, duplicate-skewed record linkage collections is not established by the reported experiments, and the approach presumes access to a large representative unlabeled corpus.",
  "verified": true
 },
 {
  "n": 40,
  "id": "er-040",
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
  "fill": "Before this paper, clustering objectives were typically tied to a pre-specified number of clusters or to distance thresholds; it supplied a formulation in which clustering is driven directly by pairwise agreement/disagreement data.",
  "correct": "The classic formulation weights all pairwise disagreements symmetrically and presumes pairwise judgments as given, whereas ER pairwise scores are probabilistic, pruned by blocking, and asymmetric in error cost — so the objective needs reweighting before it transfers to record linkage.",
  "verified": true
 },
 {
  "n": 41,
  "id": "er-041",
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
  "fill": "Before this work, ER was dominated by independent pairwise decisions; the field lacked a framework in which relationships between entities feed back into resolution decisions.",
  "correct": "Collective inference pays off only when relational structure is dense and reasonably reliable; in linkage settings where relations are sparse or themselves noisy, the gains may not transfer, and joint inference is computationally expensive at very large scale.",
  "verified": true
 },
 {
  "n": 42,
  "id": "er-042",
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
  "fill": "Standard pipelines treated blocking as a one-shot preprocessing step; this paper filled the gap of a blocking scheme that feeds matching results back into subsequent blocking rounds.",
  "correct": "Iteration can compound early errors — a wrong merge in one round contaminates later blocks — so the approach's value hinges on error control and stopping criteria that a single-pass pipeline does not need, and its cost at very large scale deserves scrutiny.",
  "verified": true
 },
 {
  "n": 43,
  "id": "er-043",
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
  "fill": "Before it, product matching evaluation relied on small and often proprietary datasets; it supplied a large public training set and gold standard drawn from real web offers.",
  "correct": "Product offers are short, attribute-rich web text; results on this benchmark may not generalize to person or organization linkage, whose error profiles differ, and a gold standard built over web-extracted data inherits extraction noise.",
  "verified": true
 },
 {
  "n": 44,
  "id": "er-044",
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
  "fill": "Although both families were established, their main representatives had rarely been compared head-to-head, so their relative performance was unknown; this paper filled that gap.",
  "correct": "A comparison in which every technique is heavily tuned is only as neutral as its tuning budget, and conclusions drawn on established, mostly modest-size datasets may not carry over to web-scale inputs where the families' cost profiles diverge.",
  "verified": true
 },
 {
  "n": 45,
  "id": "er-045",
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
  "fill": "Existing benchmarks represented single points in difficulty space or varied only one dimension such as training-set size, and no English-language benchmark tested generalization to unseen entities; WDC Products filled that gap with a multi-dimensional design.",
  "correct": "The benchmark is confined to English-language product data; its difficulty dimensions may not capture what makes person or bibliographic linkage hard (temporal drift, name variation, deliberate obfuscation), so robustness conclusions should not be generalized beyond product matching without further evidence.",
  "verified": true
 },
 {
  "n": 46,
  "id": "er-046",
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
  "fill": "Before Dedoop, deduplication systems were essentially single-machine; it supplied one of the first complete, efficiency-focused deduplication workflows for Hadoop.",
  "correct": "Built on Hadoop MapReduce, its cost model and trade-offs are dated for current in-memory and dataframe-based environments; and as a systems paper, its matching quality depends entirely on the user-supplied workflow, so its efficiency results say little about resolution accuracy.",
  "verified": true
 },
 {
  "n": 47,
  "id": "er-047",
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
  "fill": "It helped fill the gap between single-machine ER workflows and cluster execution: a worked-out mapping of the full ER process, not just pairwise comparison, onto MapReduce.",
  "correct": "The design is tied to Hadoop/MapReduce, whose batch, disk-heavy execution model has largely been superseded by in-memory engines; the partitioning lessons transfer, but its performance conclusions should not be carried over to modern runtimes.",
  "verified": true
 },
 {
  "n": 48,
  "id": "er-048",
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
  "fill": "Data cleansing research had focused on detection and repair algorithms with little attention to scale; BigDansing filled the gap of a platform-independent, scalable execution layer for cleansing rules.",
  "correct": "Its headline speedups are measured against baseline cleansing systems, not against specialized ER systems, and deduplication is only one cleansing task among several — so the results do not by themselves show it beats dedicated ER pipelines at matching.",
  "verified": true
 },
 {
  "n": 49,
  "id": "er-049",
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
  "fill": "ER methods were scattered across individual research prototypes; JedAI filled the gap of a single integrated, open system in which alternative algorithms for every stage could be combined and compared.",
  "correct": "A system integrating many algorithms inherits their combined configuration burden, and its 'giant scale' behavior rests largely on the blocking stage; results from its Java ecosystem also do not directly predict the performance of an R-based pipeline.",
  "verified": true
 },
 {
  "n": 50,
  "id": "er-050",
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
  "fill": "ER tooling before JedAI was fragmented into single-step research prototypes. JedAI filled the gap of one integrated, open system covering the entire pipeline, with both serial and parallel execution and a reproducible experimental harness.",
  "correct": "Its own experiments expose the cost of generality: on a 3.35M-entity dataset the block-based pipeline reportedly takes about 14.5 hours and 100 GB of memory where a schema-based run takes about 15 minutes — the block-size explosion is documented inside the system paper itself, and is exactly what a budget-bounded blocker must avoid.",
  "verified": true
 },
 {
  "n": 51,
  "id": "er-051",
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
  "fill": "Blocking techniques addressed static data and meta-blocking addressed pruning, but techniques that simultaneously handled streaming arrival, incremental processing and noisy data were lacking; this paper filled that combined gap.",
  "correct": "The evidence base is a handful of real-world source pairs plus one social-media case study, and the comparison is against a single state-of-the-art baseline (meta-blocking) — a narrow basis for general claims about streaming ER.",
  "verified": true
 },
 {
  "n": 52,
  "id": "er-052",
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
  "fill": "Streaming ER has mostly been handled with key-based incremental blocking; the paper speaks to the gap of embedding-based candidate generation designed for data that arrives continuously.",
  "correct": "Embedding retrieval over streams raises questions a title cannot answer — index freshness, drift in the arriving data, and the cost of embedding updates — so its claims should be checked against how it handles updates before being taken as evidence that embeddings beat incremental key-based blocking.",
  "verified": true
 },
 {
  "n": 53,
  "id": "er-053",
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
  "fill": "Linkage across organisations previously required either sharing plain identifying data or heavyweight cryptographic protocols; a practical encoding that supports approximate string comparison on encoded values, usable in routine (here, medical) linkage, was missing.",
  "correct": "The privacy claim has not aged unchallenged: later cryptanalysis showed that Bloom-filter encodings of names leak information through frequency patterns and can be partially reversed, so the encoding should be treated as obfuscation requiring hardening, not as a guarantee of anonymity.",
  "verified": true
 },
 {
  "n": 54,
  "id": "er-054",
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
  "fill": "PPRL techniques had accumulated as isolated proposals with no common classification, making it hard to compare approaches or see which combinations of privacy mechanism and linkage step were unexplored; this paper supplied the organising framework.",
  "correct": "A 2013 taxonomy freezes the field at that date: attack research against encodings and newer secure-computation approaches have since shifted which categories look safe, so the classification should be used as a map of design space, not as a current safety assessment.",
  "verified": true
 },
 {
  "n": 55,
  "id": "er-055",
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
  "fill": "By 2022 the PPRL literature was large but fragmented across venues and communities; an authoritative, consolidated definition and review in a reference work, summarising key findings and challenges in one place, was still needed.",
  "correct": "As a review it inherits the field's weakness: most PPRL evaluations it summarises use small, clean, single-country datasets and measure privacy largely by resistance to known attacks, so the reviewed conclusions should not be read as evidence that these techniques are safe or accurate at population scale.",
  "verified": true
 },
 {
  "n": 56,
  "id": "er-056",
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
  "fill": "Early LLM-based record linkage work applied the model to record pairs without a serious candidate-generation stage and suffered very large runtimes; systematic evidence on whether classical blocking still helps an LLM pipeline was missing.",
  "correct": "The finding that blocking improves accuracy is counterintuitive and may depend on the particular LLM-only baseline and datasets used; as a single study it is suggestive rather than a general law about blocking and LLMs.",
  "verified": true
 },
 {
  "n": 57,
  "id": "er-057",
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
  "fill": "Research on LLMs for entity matching had concentrated on prompt engineering and in-context learning; the behavior of fine-tuning - including what it does to generalization - was largely unexplored.",
  "correct": "The effects are model-specific and sometimes flip sign between models (the example selection methods help Llama 3.1 8B but hurt GPT-4o-mini), and the demonstrated cross-domain degradation warns against treating a fine-tuned matcher as portable across datasets.",
  "verified": true
 },
 {
  "n": 58,
  "id": "er-058",
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
  "fill": "Retrieval augmentation had been applied to entity matching only in a naive per-pair form whose retrieval calls and inflated prompts made it impractical at scale; a cost-aware, blocking-based design was missing.",
  "correct": "The benefits are demonstrated in a zero-shot setting against LLM baselines and concentrate on ambiguous or sparse datasets; on clean, distinctive records the retrieval adds cost without clear benefit, and the method presumes a suitable external knowledge graph exists.",
  "verified": true
 },
 {
  "n": 59,
  "id": "er-059",
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
  "fill": "The entity resolution literature is dominated by algorithm papers on fixed benchmarks; documented lessons from building a general-purpose, self-serve pipeline across many datasets were largely absent.",
  "correct": "The lessons come from one team's system and six benchmarks, and the bake-off remedy presumes the compute budget to train several model families per dataset - an assumption that may fail exactly at the very large scales where self-serve pipelines are most attractive.",
  "verified": true
 },
 {
  "n": 60,
  "id": "er-060",
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
  "fill": "Published guidance on entity resolution at billion-record production scale was scarce, and single-model scoring forced a choice between too weak for hard cases and too costly for easy ones; a principled difficulty-proportional cascade was missing.",
  "correct": "The evidence comes from one marketplace's proprietary catalog, and the cross-encoder is distilled from VLM consensus labels, so it inherits the teacher models' biases; the reported precision and coverage numbers may not transfer to other domains or catalogs.",
  "verified": true
 }
];
