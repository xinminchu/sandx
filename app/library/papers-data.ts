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
  "title": "Efficient SPectrAl Neighborhood blocking for entity resolution",
  "authors": [
   "Liangcai Shu",
   "Aiyou Chen",
   "Ming Xiong",
   "Weiyi Meng"
  ],
  "year": 2011,
  "venue": "2011 IEEE 27th International Conference on Data Engineering",
  "doi": "10.1109/icde.2011.5767835",
  "citations": 21,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "SPectrAl Neighborhood (SPAN) blocking applies spectral, graph-based neighbourhood ideas to candidate generation for entity resolution, presented at ICDE 2011. The record carries no abstract, so its recall and candidate-size results cannot be quoted from the metadata.",
  "borrow": "ERBOT can borrow the spectral neighbourhood idea as an alternative blocking family: grouping records by graph neighbourhood structure rather than by shared keys, useful when no single attribute is a reliable blocking key.",
  "fill": "Spectral methods are usually demonstrated at moderate scale; whether SPAN-style blocking stays tractable and effective at tens of millions of records — where eigen-style computations get expensive — is untested, and a scaled re-implementation is work we can do.",
  "correct": "Graph-spectral blocking inherits the fragility of its similarity graph: noisy attributes create misleading neighbourhoods, and the method's quality depends on graph construction choices that are easy to tune to the test data.",
  "verified": true
 },
 {
  "n": 4,
  "id": "er-004",
  "title": "Eliminating the redundancy in blocking-based entity resolution methods",
  "authors": [
   "George Papadakis",
   "Ekaterini Ioannou",
   "Claudia Niederée",
   "Themis Palpanas",
   "Wolfgang Nejdl"
  ],
  "year": 2011,
  "venue": "Proceedings of the 11th annual international ACM/IEEE joint conference on Digital libraries",
  "doi": "10.1145/1998076.1998093",
  "citations": 32,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "key-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Papadakis and co-authors analyze redundancy in blocking-based entity resolution: standard blocking places each entity description in multiple blocks, so the same pair is generated and compared many times over. The paper proposes ways to eliminate this redundant work — purging oversized blocks and filtering redundant comparisons — while keeping the candidate pairs that matter, laying groundwork for the meta-blocking line of research.",
  "borrow": "This is directly actionable for ERBOT's blocking stage: purge oversized blocks and schedule each candidate pair for comparison exactly once, using block-size statistics we already compute, before spending anything on pairwise similarity.",
  "fill": "The redundancy analysis is developed for schema-agnostic, key-based blocking of entity descriptions; it leaves open how redundancy should be defined and removed for learned and embedding-based blocking, where 'blocks' are nearest-neighbour lists with heavy overlap. We can pick that up: formalize redundancy elimination for ANN candidate generation in ERBOT.",
  "correct": "Removing redundant comparisons is safe only insofar as the retained comparison set still contains every matching pair; aggressive purging of large blocks can silently drop true matches concentrated in common-value blocks, so the efficiency claim needs a recall audit on each new dataset rather than trust in the defaults.",
  "verified": true
 },
 {
  "n": 5,
  "id": "er-005",
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
  "n": 6,
  "id": "er-006",
  "title": "A Blocking Framework for Entity Resolution in Highly Heterogeneous Information Spaces",
  "authors": [
   "George Papadakis",
   "Ekaterini Ioannou",
   "Themis Palpanas",
   "Claudia Niederee",
   "Wolfgang Nejdl"
  ],
  "year": 2013,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2012.150",
  "citations": 103,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "",
  "focus": "A paper in IEEE Transactions on Knowledge and Data Engineering (2013) presenting a blocking framework for entity resolution in highly heterogeneous information spaces, where records come without a common, aligned schema. The framework organizes blocking so that candidate generation does not depend on a fixed shared schema.",
  "borrow": "Schema-agnostic blocking — deriving blocks without assuming aligned attributes — suits ERBOT runs where input files arrive with different, unaligned schemas, which is the common case outside curated benchmarks.",
  "fill": "The framework addresses the blocking stage for heterogeneous spaces and leaves the downstream matching and clustering stages, and behaviour on truly massive files, to other work. Integrating schema-agnostic blocking into a complete R pipeline is still open for us.",
  "correct": "Heterogeneity is handled at the blocking level only; if the heterogeneity also scrambles value formats and languages, token-derived blocks can miss matches that normalization-aware blocking would retain.",
  "verified": true
 },
 {
  "n": 7,
  "id": "er-007",
  "title": "MFIBlocks: An effective blocking algorithm for entity resolution",
  "authors": [
   "Batya Kenig",
   "Avigdor Gal"
  ],
  "year": 2013,
  "venue": "Information Systems",
  "doi": "10.1016/j.is.2012.11.008",
  "citations": 54,
  "themes": [
   "blocking"
  ],
  "method": [
   "key-based",
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "MFIBlocks is a blocking algorithm for entity resolution, published in Information Systems in 2013 by Kenig and Gal. The record carries no abstract; from the title and the authors' line of work, the paper proposes a blocking method that selects frequent itemsets as blocking keys, aiming at blocks that are both effective at grouping duplicates and efficient to process.",
  "borrow": "The idea of deriving blocking keys from frequent itemsets rather than from single hand-chosen attributes is borrowable for ERBOT's blocking stage: it offers a data-driven key-selection principle for multi-attribute records where no single attribute is a reliable key.",
  "fill": "As a blocking-only contribution it leaves the downstream questions open: how its blocks interact with meta-blocking pruning, learned similarity, and clustering quality end to end. We can pick up the pipeline-level evaluation — whether itemset-based blocks still win once a modern pruning and matching stack sits behind them.",
  "correct": "Blocking papers of this period are typically evaluated on reduction ratio and pairs completeness on modest benchmark datasets; strong scores there do not by themselves show the method controls the giant-block problem on skewed, web-scale data, which is where blocking methods usually fail.",
  "verified": true
 },
 {
  "n": 8,
  "id": "er-008",
  "title": "Forest-Based Dynamic Sorted Neighborhood Indexing for Real-Time Entity Resolution",
  "authors": [
   "Banda Ramadan",
   "Peter Christen"
  ],
  "year": 2014,
  "venue": "Proceedings of the 23rd ACM International Conference on Conference on Information and Knowledge Management",
  "doi": "10.1145/2661829.2661869",
  "citations": 16,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "key-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This CIKM paper presents a forest-based dynamic sorted neighbourhood indexing method for real-time entity resolution, maintaining sorted-neighbourhood structures under insertions so that newly arriving records can be matched as they come rather than in a separate batch run.",
  "borrow": "Dynamic sorted neighbourhood is the indexing pattern for incremental ERBOT runs: adopt an updateable index structure instead of rebuilding the blocking index for every batch.",
  "fill": "Behaviour at very large scale and under heavy update rates is left open; we can stress-test dynamic indexing against periodic full rebuilds on both cost and recall to find the crossover point.",
  "correct": "Sorted neighbourhood inherits the key-choice sensitivity of all window-based methods: a dynamic data structure does not fix a bad sorting key, and recall still stands or falls with key quality.",
  "verified": true
 },
 {
  "n": 9,
  "id": "er-009",
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
  "n": 10,
  "id": "er-010",
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
  "n": 11,
  "id": "er-011",
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
  "n": 12,
  "id": "er-012",
  "title": "A Clustering-Based Framework to Control Block Sizes for Entity Resolution",
  "authors": [
   "Jeffrey Fisher",
   "Peter Christen",
   "Qing Wang",
   "Erhard Rahm"
  ],
  "year": 2015,
  "venue": "Proceedings of the 21th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining",
  "doi": "10.1145/2783258.2783396",
  "citations": 40,
  "themes": [
   "blocking",
   "clustering"
  ],
  "method": [
   "key-based",
   "ML classifier"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This KDD 2015 paper by Fisher, Christen, Wang, and Rahm presents a clustering-based framework to control block sizes for entity resolution: oversized blocks dominate blocking cost, so the framework clusters records within large blocks and splits them into smaller, more manageable sub-blocks while aiming to retain duplicate pairs. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "Block-size control is directly borrowable for ERBOT's blocking stage: a principled way to break up giant blocks — the standard failure mode of key-based blocking on skewed data — is worth more than another blocking key, and this framework targets exactly that.",
  "fill": "The framework treats block size as the problem but leaves the recall accounting open: splitting a block can separate duplicates that only the full block would have compared, and the paper's scope does not cover how splitting interacts with meta-blocking or learned blocking downstream. We can pick up the joint design — block splitting whose recall cost is measured end to end.",
  "correct": "Controlling block sizes optimizes the efficiency side of the trade-off; claims of retained effectiveness rest on the evaluation collections used, and on data whose duplicates concentrate inside the largest blocks the split can remove exactly the comparisons that matter most.",
  "verified": true
 },
 {
  "n": 13,
  "id": "er-013",
  "title": "Parallel meta-blocking: Realizing scalable entity resolution over large, heterogeneous data",
  "authors": [
   "Vasilis Efthymiou",
   "George Papadakis",
   "George Papastefanatos",
   "Kostas Stefanidis",
   "Themis Palpanas"
  ],
  "year": 2015,
  "venue": "2015 IEEE International Conference on Big Data (Big Data)",
  "doi": "10.1109/bigdata.2015.7363782",
  "citations": 20,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "graph-based",
   "key-based"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "web scale (>1M)",
  "abstract": "",
  "focus": "Efthymiou and co-authors parallelise meta-blocking — the pruning of redundant comparisons from an already-blocked collection — so entity resolution scales over large, heterogeneous data, presented at IEEE Big Data 2015. The record carries no abstract, so speedup figures cannot be quoted from the metadata.",
  "borrow": "ERBOT can borrow the parallelisation patterns for its pruning stage: meta-blocking is a natural fit for chunked, parallel execution in R, and the paper shows the approach carries to heterogeneous collections rather than one clean schema.",
  "fill": "The work targets distributed batch execution; how parallel meta-blocking interacts with learned or iterative blocking — where the block graph changes between rounds — is unaddressed, and combining them is open work for us.",
  "correct": "Meta-blocking prunes comparisons generated by an upstream blocking step, so its recall ceiling is fixed by that step; parallel speedups do not repair matches the original blocking never proposed.",
  "verified": true
 },
 {
  "n": 14,
  "id": "er-014",
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
  "n": 15,
  "id": "er-015",
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
  "n": 16,
  "id": "er-016",
  "title": "Comparative analysis of approximate blocking techniques for entity resolution",
  "authors": [
   "George Papadakis",
   "Jonathan Svirsky",
   "Avigdor Gal",
   "Themis Palpanas"
  ],
  "year": 2016,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/2947618.2947624",
  "citations": 111,
  "themes": [
   "blocking",
   "scalable",
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "Entity Resolution is a core task for merging data collections. Due to its quadratic complexity, it typically scales to large volumes of data through blocking: similar entities are clustered into blocks and pair-wise comparisons are executed only between co-occurring entities, at the cost of some missed matches. There are numerous blocking methods, and the aim of this work is to offer a comprehensive empirical survey, extending the dimensions of comparison beyond what is commonly available in the literature. We consider 17 state-of-the-art blocking methods and use 6 popular real datasets to examine the robustness of their internal configurations and their relative balance between effectiveness and time efficiency. We also investigate their scalability over a corpus of 7 established synthetic datasets that range from 10,000 to 2 million entities.",
  "focus": "This study offers a comprehensive empirical survey of approximate blocking for entity resolution, comparing 17 state-of-the-art blocking methods on 6 popular real datasets. It examines the robustness of each method's internal configurations and the balance between effectiveness and time efficiency, and additionally tests scalability on synthetic datasets ranging from 10,000 to 2 million entities.",
  "borrow": "The configuration-robustness lens is the borrow: ERBOT's blocking stage should be tested across parameter settings rather than at defaults, and the study's effectiveness-versus-efficiency reporting format is the one to adopt for our own blocking benchmarks.",
  "fill": "All 17 methods are the schema-agnostic blocking techniques of their time; learned and embedding-based blocking are outside the comparison, and the study does not say how to choose a method for a new dataset. A per-dataset blocking recommender for ERBOT is still open.",
  "correct": "Rankings rest on 6 real datasets plus synthetic ones whose duplicate structure is comparatively clean and regular; on dirtier, schema-heterogeneous files the relative order of methods may well change.",
  "verified": true
 },
 {
  "n": 17,
  "id": "er-017",
  "title": "Semantic-Aware Blocking for Entity Resolution",
  "authors": [
   "Qing Wang",
   "Mingyuan Cui",
   "Huizhi Liang"
  ],
  "year": 2016,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2015.2468711",
  "citations": 30,
  "themes": [
   "blocking"
  ],
  "method": [
   "key-based"
  ],
  "supervision": "unsupervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "This IEEE TKDE paper proposes semantic-aware blocking for entity resolution: instead of deriving blocking keys purely from surface attribute values, it uses the semantics of attribute values to place records that refer to the same entity into common blocks even when their surface forms differ. The aim is to raise blocking recall on data where purely syntactic keys split true matches apart.",
  "borrow": "ERBOT's blocking stage can borrow the core move: augment syntactic blocking keys with semantically derived keys (for example, normalized or synonym-expanded values) as additional key passes, and measure the recall gain per added pass.",
  "fill": "The paper predates modern embedding-based blocking, and leaves open how semantic keys should be generated and combined when several attributes interact, and what the candidate-set blow-up costs at very large scale. We can pick that up: implement semantic key passes in ERBOT with explicit candidate-budget accounting against DeepBlocker-style baselines.",
  "correct": "Semantic grouping trades precision of blocks for recall: semantically related but distinct entities (different people in the same profession or city) get pulled into common blocks, inflating comparison counts; the benefit depends on how discriminative the chosen semantics are on the target data, which a single-domain evaluation cannot settle.",
  "verified": true
 },
 {
  "n": 18,
  "id": "er-018",
  "title": "Parallel meta-blocking for scaling entity resolution over big heterogeneous data",
  "authors": [
   "Vasilis Efthymiou",
   "George Papadakis",
   "George Papastefanatos",
   "Kostas Stefanidis",
   "Themis Palpanas"
  ],
  "year": 2017,
  "venue": "Information Systems",
  "doi": "10.1016/j.is.2016.12.001",
  "citations": 47,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "graph-based",
   "key-based"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "web scale (>1M)",
  "abstract": "",
  "focus": "This Information Systems 2017 paper parallelizes meta-blocking — the pruning of redundant comparisons from an existing blocking collection by analysing the block graph — so that entity resolution can scale over big, heterogeneous data. The record carries no abstract, so the description rests on the title and venue: it is a scalability contribution for the comparison-pruning stage of blocking workflows.",
  "borrow": "Parallel meta-blocking belongs on ERBOT's scaling roadmap for the blocking stage: once blocks are built, graph-based pruning removes most redundant comparisons, and this paper addresses how to execute that pruning in parallel over heterogeneous collections.",
  "fill": "The paper optimizes the pruning stage in isolation; it leaves open the end-to-end accounting — how much of the total pipeline cost remains in blocking-key generation and matching after pruning is parallelized — and how pruning thresholds should be set for new collections without labels. We can pick up the end-to-end and threshold-free versions of the problem.",
  "correct": "Meta-blocking's pruning is only safe relative to the redundancy structure of the input blocks; aggressive parallel pruning tuned on benchmark collections can silently cut true matches on collections whose duplication patterns differ, so scalability numbers should not be read as quality guarantees.",
  "verified": true
 },
 {
  "n": 19,
  "id": "er-019",
  "title": "Improved suffix blocking for record linkage and entity resolution",
  "authors": [
   "Amin Allam",
   "Spiros Skiadopoulos",
   "Panos Kalnis"
  ],
  "year": 2018,
  "venue": "Data &amp; Knowledge Engineering",
  "doi": "10.1016/j.datak.2018.07.005",
  "citations": 14,
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
  "focus": "This paper improves suffix blocking — a blocking scheme that indexes records by suffixes of their key values so that records with errors near the start of a name or address still fall into the same block — for record linkage and entity resolution, published in Data & Knowledge Engineering.",
  "borrow": "Suffix keys are a cheap addition to ERBOT's blocking-key portfolio, catching leading-character typos and truncations that standard keys miss.",
  "fill": "Key-portfolio design is left open: how suffix blocking should be combined with token-based and LSH blocking under a fixed candidate budget. We can optimise the mix instead of relying on any single scheme.",
  "correct": "Suffix blocking helps one error class — corruption near the start of a value; on short or very common suffixes its candidate inflation can swamp the block set and hurt the pipeline's overall efficiency.",
  "verified": true
 },
 {
  "n": 20,
  "id": "er-020",
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
  "n": 21,
  "id": "er-021",
  "title": "A Survey on Blocking Technology of Entity Resolution",
  "authors": [
   "Bo-Han Li",
   "Yi Liu",
   "An-Man Zhang",
   "Wen-Huan Wang",
   "Shuo Wan"
  ],
  "year": 2020,
  "venue": "Journal of Computer Science and Technology",
  "doi": "10.1007/s11390-020-0350-4",
  "citations": 101,
  "themes": [
   "blocking"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "A survey of blocking technology for entity resolution, published in the Journal of Computer Science and Technology in 2020. It reviews the techniques used to group records into blocks so that pairwise comparisons stay computationally feasible.",
  "borrow": "A compact taxonomy of blocking techniques is useful as a cross-check on ERBOT's blocking menu and terminology, making sure no classical family is missing from our baseline set.",
  "fill": "The survey catalogues techniques without a fresh head-to-head benchmark on common data, and embedding-based blocking developed largely after its coverage. The comparative evidence base for blocking choice remains to be built — work ERBOT's evaluation stage can take on.",
  "correct": "Like most surveys, it inherits the original papers' self-reported results, which were obtained on different datasets and are rarely comparable; the catalogue should not be read as a ranking.",
  "verified": true
 },
 {
  "n": 22,
  "id": "er-022",
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
  "n": 23,
  "id": "er-023",
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
  "n": 24,
  "id": "er-024",
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
  "n": 25,
  "id": "er-025",
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
  "n": 26,
  "id": "er-026",
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
  "n": 27,
  "id": "er-027",
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
  "n": 28,
  "id": "er-028",
  "title": "Entity Resolution: Past, Present, and Yet-to-Come",
  "authors": [
   "George Papadakis",
   "Ekaterini Ioannou",
   "Emanouil Thanos",
   "Themis Palpanas"
  ],
  "year": 2021,
  "venue": "Synthesis Lectures on Data Management",
  "doi": "10.1007/978-3-031-01878-7_1",
  "citations": 15,
  "themes": [
   "blocking",
   "scalable"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "This Synthesis Lectures chapter surveys entity resolution from its origins to its current state and outlines directions the field has yet to take, covering the problem's main techniques and open challenges.",
  "borrow": "Its periodisation and open-problem list serve as a positioning reference: a checklist against which to state what ERBOT does and which recognised open problems it addresses.",
  "fill": "A 2021 survey predates LLM-based matching almost entirely; we can write the update — which of its 'yet-to-come' items large language models actually settled, and which remain open.",
  "correct": "The survey's framing reflects its database-community authors; statistics-community record linkage, with its own model tradition, receives thinner treatment, so its map of the field is not neutral.",
  "verified": true
 },
 {
  "n": 29,
  "id": "er-029",
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
  "n": 30,
  "id": "er-030",
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
  "n": 31,
  "id": "er-031",
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
  "n": 32,
  "id": "er-032",
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
  "n": 33,
  "id": "er-033",
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
  "n": 34,
  "id": "er-034",
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
  "n": 35,
  "id": "er-035",
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
  "n": 36,
  "id": "er-036",
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
  "n": 37,
  "id": "er-037",
  "title": "Algorithms for approximate string matching",
  "authors": [
   "Esko Ukkonen"
  ],
  "year": 1985,
  "venue": "Information and Control",
  "doi": "10.1016/s0019-9958(85)80046-2",
  "citations": 423,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "A foundational algorithms paper on approximate string matching: finding occurrences of a pattern in a text when a bounded number of edit errors is allowed. Published in Information and Control in 1985, it is one of the reference points for efficient edit-distance-based matching.",
  "borrow": "The cut-off style edit-distance computation this line of work established is what makes per-field string comparators cheap enough to run inside blocks; ERBOT's similarity stage stands directly on it.",
  "fill": "The paper is purely algorithmic: it says nothing about choosing error thresholds per field, or about how approximate matching behaves inside a full linkage pipeline. Building that comparator-selection and calibration layer is left for us in ERBOT.",
  "correct": "Its efficiency framing targets pattern-versus-text search, not the all-pairs field comparisons of record linkage, where strings are short and comparisons number in the billions; the cost picture does not transfer unchanged.",
  "verified": true
 },
 {
  "n": 38,
  "id": "er-038",
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
  "n": 39,
  "id": "er-039",
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
  "n": 40,
  "id": "er-040",
  "title": "Fast and practical approximate string matching",
  "authors": [
   "Ricardo A. Baeza-Yates",
   "Chris H. Perleberg"
  ],
  "year": 1992,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-56024-6_15",
  "citations": 40,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "This 1992 paper by Baeza-Yates and Perleberg, in Lecture Notes in Computer Science, presents a fast and practical algorithm for approximate string matching, searching text for occurrences of a pattern within a bounded number of errors. The record carries no abstract, so the description rests on the title and venue: it is a foundational string-algorithms contribution.",
  "borrow": "The borrow is algorithmic heritage for ERBOT's similarity stage: practical approximate-matching algorithms of this line are what make edit-distance-based field comparison cheap enough to run over millions of candidate pairs.",
  "fill": "The paper solves pattern search in text, not record linkage: it leaves entirely open the record-level machinery — blocking to generate candidate pairs, field weighting, and decision rules — that turns string matching into entity resolution. That machinery is precisely ERBOT's own contribution space.",
  "correct": "The algorithm's speed depends on the error rate relative to pattern length; its practical advantage degrades as errors grow, so citing it as support for fast matching in the high-typo regime of real name and address data requires the qualification its own analysis implies.",
  "verified": true
 },
 {
  "n": 41,
  "id": "er-041",
  "title": "Approximate string matching with suffix automata",
  "authors": [
   "Esko Ukkonen",
   "Derick Wood"
  ],
  "year": 1993,
  "venue": "Algorithmica",
  "doi": "10.1007/bf01769703",
  "citations": 45,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "This 1993 Algorithmica paper by Ukkonen and Wood presents algorithms for approximate string matching based on suffix automata, computing how well a pattern matches substrings of a text within a bounded number of errors. It is a string-algorithms contribution: the record carries no abstract, and the description rests on the title and venue.",
  "borrow": "Suffix-automaton matching is part of the algorithmic substrate ERBOT's similarity stage can draw on: automata-based approximate matching underlies fast edit-distance-style comparisons when candidate pairs must be scored in bulk.",
  "fill": "The paper treats pattern-versus-text matching, not record-pair comparison: it leaves open how automaton-based scores should be normalized into field-level similarities and combined across the multiple fields of a record. We can pick up that adaptation layer if we adopt automata-based comparators.",
  "correct": "Efficiency results for automata methods depend on the error bound and alphabet assumptions of the analysis; the approach's advantage narrows as the allowed error grows, so its guarantees should not be extrapolated to the high-error, short-string regime typical of name fields without re-checking.",
  "verified": true
 },
 {
  "n": 42,
  "id": "er-042",
  "title": "Approximate string matching and local similarity",
  "authors": [
   "William I. Chang",
   "Thomas G. Marr"
  ],
  "year": 1994,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-58094-8_23",
  "citations": 42,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "This 1994 paper by Chang and Marr, in Lecture Notes in Computer Science, concerns approximate string matching with an emphasis on local similarity — finding the best-matching regions between strings rather than requiring whole-string alignment. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "Local similarity is a useful comparator idea for ERBOT's similarity stage: fields such as addresses or organization names often match in a substring even when the full strings differ, and local-alignment scores capture that where global edit distance punishes it.",
  "fill": "The paper is an algorithms contribution about string pairs; it leaves open how local-similarity scores should be calibrated into field agreement weights and combined with other fields in a linkage decision. We can pick up that calibration if we adopt local-alignment comparators.",
  "correct": "Local similarity is generous by design — short common substrings occur by chance, especially in short fields — so using it as linkage evidence without length-aware normalization systematically overstates agreement for the fields where linkage evidence is weakest.",
  "verified": true
 },
 {
  "n": 43,
  "id": "er-043",
  "title": "Approximate string matching with don't care characters",
  "authors": [
   "Tatsuya Akutsu"
  ],
  "year": 1995,
  "venue": "Information Processing Letters",
  "doi": "10.1016/0020-0190(95)00111-o",
  "citations": 15,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "This is a theoretical paper on approximate string matching in which the pattern may contain don't-care (wildcard) characters, published in Information Processing Letters. It belongs to string algorithms rather than to record linkage itself.",
  "borrow": "Wildcard-tolerant matching carries one practical reminder for ERBOT: name and address fields contain genuinely unknown characters, so similarity functions should degrade gracefully on missing characters instead of scoring them as ordinary mismatches.",
  "fill": "The applied side is untouched: no connection is made to record-pair comparison. We can test whether don't-care-aware distance variants improve name matching on OCR- or typo-heavy data.",
  "correct": "Algorithmic results about pattern matching say nothing by themselves about entity resolution quality; citing this paper as ER evidence would be a category error, and its place in the library is as string-matching background only.",
  "verified": true
 },
 {
  "n": 44,
  "id": "er-044",
  "title": "A faster algorithm for approximate string matching",
  "authors": [
   "Ricardo Baeza-Yates",
   "Gonzalo Navarro"
  ],
  "year": 1996,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-61258-0_1",
  "citations": 30,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Baeza-Yates and Navarro present a faster algorithm for approximate string matching — finding occurrences of a pattern in a text within a bounded number of edit errors — improving the average-case speed of the classic bit-parallel and filtration approaches of the period. It is a foundational string-algorithms paper rather than an entity-resolution study. (Flagged in the report as a string-matching foundation; entry included as best effort.)",
  "borrow": "The borrow for ERBOT is at the comparator level: fast approximate matching routines are the inner loop of our similarity stage, and this line of work is why edit-distance checks on short name strings can be treated as nearly free compared with blocking and I/O costs.",
  "fill": "The paper addresses single-pattern search in text, leaving the many-to-many comparison structure of record linkage — indexing millions of short strings so that near-duplicates find each other — to later similarity-join work. We pick that up in ERBOT's join layer, not in the comparator itself.",
  "correct": "Its speed claims are average-case and parameter-dependent (pattern length, error ratio, alphabet); on the very short strings typical of names, fixed overheads dominate and the asymptotic advantage over simpler algorithms shrinks or reverses.",
  "verified": true
 },
 {
  "n": 45,
  "id": "er-045",
  "title": "Filtration with q-samples in approximate string matching",
  "authors": [
   "Erkki Sutinen",
   "Jorma Tarhio"
  ],
  "year": 1996,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-61258-0_4",
  "citations": 32,
  "themes": [
   "similarity"
  ],
  "method": [
   "token-based"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Sutinen and Tarhio present a filtration method for approximate string matching based on q-samples — short substrings sampled from the pattern — so that text positions that cannot possibly match within the allowed error are discarded before verification. It is a string-algorithms paper: the contribution is a filter that speeds up approximate (edit-distance) search. (Flagged in the report as a string-matching foundation rather than an entity-resolution paper; entry included as best effort.)",
  "borrow": "The filtration principle is exactly what ERBOT's similarity stage needs at scale: use cheap q-gram-based necessary conditions to reject hopeless candidate pairs before paying for full edit-distance or token similarity computations.",
  "fill": "The paper works on pattern-versus-text search, not on the all-pairs setting of record linkage; it leaves open how q-sample filtration should be indexed and tuned when millions of short, noisy attribute strings must be compared against each other. We can pick up that adaptation inside ERBOT's similarity joins.",
  "correct": "Filtration guarantees rest on the error model (a bounded number of edit errors); real name and address variation includes token swaps, abbreviations, and missing components that violate a pure edit-error bound, so the filter's no-false-dismissal property does not carry over to ER data unchanged.",
  "verified": true
 },
 {
  "n": 46,
  "id": "er-046",
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
  "n": 47,
  "id": "er-047",
  "title": "A New Indexing Method for Approximate String Matching",
  "authors": [
   "Gonzalo Navarro",
   "Ricardo Baeza-Yates"
  ],
  "year": 1999,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-48452-3_13",
  "citations": 18,
  "themes": [
   "similarity",
   "blocking"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Navarro and Baeza-Yates present a new indexing method for approximate string matching, building an index over a text collection so that patterns can be found within a bounded number of errors without scanning everything (1999). It is a string-algorithms contribution, relevant to ER through similarity-based candidate retrieval.",
  "borrow": "Error-tolerant string indexing is borrowable for ERBOT's blocking stage: an index that retrieves all strings within k errors of a query supports similarity-based candidate generation that pure key blocking misses.",
  "fill": "Classical approximate indexes are built for one text collection and one distance; ER needs them maintained over two evolving files with several string fields at once, and that engineering — plus recall measurement against key blocking — remains undone and is work we can do.",
  "correct": "Index size and query time grow steeply with the error threshold, so the method is practical only for small k; for the heavy corruption seen in real linked files, the index can degenerate toward scanning.",
  "verified": true
 },
 {
  "n": 48,
  "id": "er-048",
  "title": "Faster Approximate String Matching",
  "authors": [
   "R. Baeza-Yates and G. Navarro"
  ],
  "year": 1999,
  "venue": "Algorithmica",
  "doi": "10.1007/pl00009253",
  "citations": 111,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "An algorithms paper in Algorithmica (1999) on faster approximate string matching — locating pattern occurrences in a text within a bounded edit distance, with improved running time over earlier methods. It is part of the bit-parallel line of work on edit-distance search.",
  "borrow": "Bit-parallel approximate matching is directly relevant to ERBOT's similarity stage: comparators run inside blocks dominate total runtime, so faster edit-distance kernels translate into larger feasible block sizes.",
  "fill": "The setting is one pattern against a long text, not pairwise comparison of short fields with field-specific error patterns. Adapting bit-parallel speedups to per-field comparators with linkage-specific thresholds is work left to us.",
  "correct": "Speed claims are stated for the pattern-search setting and the hardware of the period; gains depend on alphabet size and error level, and do not automatically transfer to short name and address strings.",
  "verified": true
 },
 {
  "n": 49,
  "id": "er-049",
  "title": "Approximate String Matching over Ziv—Lempel Compressed Text",
  "authors": [
   "Juha Kärkkäinen",
   "Gonzalo Navarro",
   "Esko Ukkonen"
  ],
  "year": 2000,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-45123-4_18",
  "citations": 18,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Kärkkäinen, Navarro, and Ukkonen present algorithms for approximate string matching directly over Ziv–Lempel compressed text, searching for pattern occurrences within an edit-distance bound without fully decompressing the text (2000). It is a string-algorithms paper, relevant to ER only through fast similarity search over large text collections.",
  "borrow": "The transferable idea for ERBOT is searching compressed data in place: as record collections grow, operating on compressed representations instead of decompressing whole files is a useful direction for our similarity stage's I/O costs.",
  "fill": "The paper solves single-pattern search over one compressed stream; ER needs many-pattern, all-pairs candidate generation, and no comparable compressed-domain blocking method exists — adapting the idea to blocking is speculative but open work.",
  "correct": "Speed claims for compressed-text search depend heavily on compressibility and pattern length; on short record fields (names, street addresses) compression ratios are poor, so the approach's ER relevance is narrower than the algorithm's elegance suggests.",
  "verified": true
 },
 {
  "n": 50,
  "id": "er-050",
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
  "n": 51,
  "id": "er-051",
  "title": "Faster Bit-Parallel Approximate String Matching",
  "authors": [
   "Heikki Hyyrö",
   "Gonzalo Navarro"
  ],
  "year": 2002,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-45452-7_18",
  "citations": 21,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Hyyrö and Navarro present a faster bit-parallel algorithm for approximate string matching — finding pattern occurrences within a bounded edit distance — in a 2002 algorithms paper. It is a string-algorithms contribution rather than an entity-resolution paper, relevant to ER through the similarity-computation stage.",
  "borrow": "Bit-parallel edit-distance computation is directly borrowable for ERBOT's similarity stage: fast approximate string comparison is the inner loop of pairwise scoring, and word-level parallelism speeds it without changing semantics.",
  "fill": "The paper optimises single-pattern search; it does not address the all-pairs, many-pattern comparison workload of ER, where indexing and candidate pruning matter more than per-comparison speed — integrating bit-parallel scoring into a full comparison index remains open.",
  "correct": "Bit-parallel methods gain their speed within machine-word limits, so the advantage shrinks for long strings; headline speedups on pattern search should not be extrapolated to record-length name and address fields without re-measurement.",
  "verified": true
 },
 {
  "n": 52,
  "id": "er-052",
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
  "n": 53,
  "id": "er-053",
  "title": "String Matching with Metric Trees Using an Approximate Distance",
  "authors": [
   "Ilaria Bartolini",
   "Paolo Ciaccia",
   "Marco Patella"
  ],
  "year": 2002,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/3-540-45735-6_24",
  "citations": 20,
  "themes": [
   "similarity",
   "blocking"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Bartolini, Ciaccia, and Patella study string matching with metric trees, indexing strings in a tree structure that supports search under an approximate (edit-style) distance, in a 2002 algorithms paper. It is a similarity-search contribution rather than an entity-resolution paper, relevant to ER through candidate retrieval on string attributes.",
  "borrow": "Metric-tree indexing is borrowable for ERBOT's similarity stage as a way to retrieve near-duplicate strings without all-pairs comparison, particularly for a single high-value field such as names.",
  "fill": "The paper treats one string attribute in isolation; ER candidate generation must combine several fields with different error behaviour, and multi-field metric indexing remains comparatively undeveloped — a gap we can work in.",
  "correct": "Metric trees degrade as intrinsic dimensionality rises, and edit-distance spaces are high-dimensional in practice; index performance demonstrated on test collections may collapse on real name distributions.",
  "verified": true
 },
 {
  "n": 54,
  "id": "er-054",
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
  "n": 55,
  "id": "er-055",
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
  "n": 56,
  "id": "er-056",
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
  "n": 57,
  "id": "er-057",
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
  "n": 58,
  "id": "er-058",
  "title": "Probabilistic string similarity joins",
  "authors": [
   "Jeffrey Jestes",
   "Feifei Li",
   "Zhepeng Yan",
   "Ke Yi"
  ],
  "year": 2010,
  "venue": "Proceedings of the 2010 ACM SIGMOD International Conference on Management of data",
  "doi": "10.1145/1807167.1807204",
  "citations": 30,
  "themes": [
   "similarity",
   "probabilistic"
  ],
  "method": [
   "probabilistic",
   "token-based"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Jestes, Li, Yan, and Yi study similarity joins over probabilistic strings — strings whose characters are uncertain, represented as probability distributions — in this SIGMOD 2010 paper. The problem is to find all pairs of probabilistic strings whose similarity exceeds a threshold with sufficient probability, efficiently, extending classic string similarity joins to uncertain data.",
  "borrow": "ERBOT can borrow the uncertainty-aware framing for OCR'd or transcribed attributes: where our input strings come with per-character confidence, similarity should be computed against the distribution, not against a single guessed transcription, and this paper supplies the join machinery for that view.",
  "fill": "The work assumes character-level probabilistic strings as given; it leaves open where such distributions come from in a record-linkage pipeline and whether the join remains efficient when uncertainty is at token level (alternative spellings, abbreviations) rather than character level. We can pick up the token-level extension and wire OCR confidence into ERBOT's similarity stage.",
  "correct": "Efficiency results depend on the probabilistic string model (independent character uncertainties); correlated errors — the norm in OCR and manual transcription, where one bad read corrupts a whole token — violate that independence and can invalidate the pruning bounds.",
  "verified": true
 },
 {
  "n": 59,
  "id": "er-059",
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
  "n": 60,
  "id": "er-060",
  "title": "Trie-join: a trie-based method for efficient string similarity joins",
  "authors": [
   "Jianhua Feng",
   "Jiannan Wang",
   "Guoliang Li"
  ],
  "year": 2011,
  "venue": "The VLDB Journal",
  "doi": "10.1007/s00778-011-0252-8",
  "citations": 43,
  "themes": [
   "similarity",
   "blocking"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "Trie-join, published in the VLDB Journal in 2011, is a trie-based method for efficient string similarity joins: given two sets of strings and a similarity threshold (typically edit-distance-based), it finds all similar pairs while using a trie index to prune the search space. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "Trie-join is borrowable as a candidate-generation technique for ERBOT's similarity stage: a trie index over name or title strings can generate similar-string pairs directly, complementing key-based blocking for fields where typos dominate.",
  "fill": "The method solves the join for a single string attribute under a threshold; it leaves open multi-field records, where several string fields must be combined, and the choice of threshold per field. We can pick up the multi-field extension and threshold-setting practice if we adopt trie-based candidate generation.",
  "correct": "Trie-join's efficiency depends on the similarity threshold and string length distribution — at loose thresholds or on long strings the pruning weakens sharply — so its performance claims should be read as conditional on the tighter-threshold regime it was evaluated in.",
  "verified": true
 },
 {
  "n": 61,
  "id": "er-061",
  "title": "Cross-lingual entity matching and infobox alignment in Wikipedia",
  "authors": [
   "Daniel Rinser",
   "Dustin Lange",
   "Felix Naumann"
  ],
  "year": 2013,
  "venue": "Information Systems",
  "doi": "10.1016/j.is.2012.10.003",
  "citations": 30,
  "themes": [
   "similarity"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "",
  "focus": "Rinser, Lange, and Naumann study entity matching across language editions of Wikipedia: identifying which articles in different languages describe the same entity, and aligning their infoboxes — the structured attribute summaries attached to articles. The work treats cross-lingual matching as an entity matching problem where names, languages, and attribute conventions all differ between sources.",
  "borrow": "ERBOT can borrow the two-level stance: match entities first at the record level, then align their attributes (the infobox step), rather than assuming both sources share one schema — the same record-then-attribute alignment order suits our multi-source inputs.",
  "fill": "The setting is Wikipedia, where inter-language links and a shared category structure provide strong signals unavailable in general multi-source data; the paper leaves open how cross-lingual matching should work without such structural scaffolding. We can pick that up for ERBOT's multilingual name/address data, where no link graph exists.",
  "correct": "Results obtained on Wikipedia benefit from its unusual regularity — one article per entity per language and community-maintained cross-links — so matching quality there overstates what the same methods achieve on independently collected, unaligned sources.",
  "verified": true
 },
 {
  "n": 62,
  "id": "er-062",
  "title": "Entity Matching in Online Social Networks",
  "authors": [
   "Olga Peled",
   "Michael Fire",
   "Lior Rokach",
   "Yuval Elovici"
  ],
  "year": 2013,
  "venue": "2013 International Conference on Social Computing",
  "doi": "10.1109/socialcom.2013.53",
  "citations": 63,
  "themes": [
   "similarity"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "n/a",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "A 2013 paper on entity matching in online social networks: deciding whether accounts on different social platforms belong to the same person. It treats cross-network identity matching as an entity resolution problem over user profiles.",
  "borrow": "Cross-network matching is a reminder that when records carry relational signals — shared connections, not just attributes — ERBOT's similarity stage can exploit them as additional evidence alongside field similarity.",
  "fill": "The setting is confined to social-network profiles with platform-specific fields. Nothing in it addresses bibliographic, health, or administrative linkage, and a principled way to fuse graph evidence with attribute evidence in a general pipeline remains open for us.",
  "correct": "The approach rests on publicly visible profile attributes whose availability has shrunk since 2013 as platforms restricted access; its data assumptions no longer hold at face value, so reported feasibility overstates what the same method could do today.",
  "verified": true
 },
 {
  "n": 63,
  "id": "er-063",
  "title": "MassJoin: A mapreduce-based method for scalable string similarity joins",
  "authors": [
   "Dong Deng",
   "Guoliang Li",
   "Shuang Hao",
   "Jiannan Wang",
   "Jianhua Feng"
  ],
  "year": 2014,
  "venue": "2014 IEEE 30th International Conference on Data Engineering",
  "doi": "10.1109/icde.2014.6816663",
  "citations": 72,
  "themes": [
   "similarity",
   "scalable"
  ],
  "method": [
   "string metric",
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "A paper in ICDE 2014 presenting MassJoin, a MapReduce-based method for string similarity joins that scales the join operation across a cluster. It addresses the setting where string collections are too large for single-machine similarity join algorithms.",
  "borrow": "MassJoin's decomposition of a similarity join into distributed stages shows how ERBOT's similarity stage could be parallelized when a single machine is no longer enough, including how to partition strings so similar pairs land together.",
  "fill": "The design is Hadoop-era and confined to classical string similarity; re-expressing its partitioning on modern in-memory or data-frame tooling, and extending it to embedding similarity, is left open for us.",
  "correct": "MapReduce overhead means the method only pays off at scales where distribution costs are amortized; for moderate collections a single-machine join is simpler and faster, so scalability claims should be read with the crossover point in mind.",
  "verified": true
 },
 {
  "n": 64,
  "id": "er-064",
  "title": "Rule-based deduplication of article records from bibliographic databases",
  "authors": [
   "Yu Jiang",
   "Can Lin",
   "Weiyi Meng",
   "Clement Yu",
   "Aaron M. Cohen",
   "Neil R. Smalheiser"
  ],
  "year": 2014,
  "venue": "Database",
  "doi": "10.1093/database/bat086",
  "citations": 29,
  "themes": [
   "similarity"
  ],
  "method": [
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Jiang and co-authors present a rule-based system for deduplicating article records drawn from bibliographic databases, where the same publication appears with variant titles, author lists, and venue strings across sources. Matching decisions are made by explicit rules over the bibliographic fields rather than by a trained classifier, in the journal Database (Oxford).",
  "borrow": "ERBOT can borrow the rule-first design for bibliographic-style data: a transparent rule set over title/author/venue fields gives an auditable baseline and a labelling device for training data, before any learned matcher is introduced.",
  "fill": "Rules are necessarily written against the quirks of the databases at hand; the paper leaves open how such a rule set is maintained and ported when new sources with different conventions arrive, and how rule coverage degrades on fields the rule authors never saw. We can pick up rule-portability: version ERBOT's rule sets per source and measure transfer.",
  "correct": "Rule-based deduplication reports performance on the data the rules were tuned against; without a held-out source, precision/recall figures partly measure the rule authors' familiarity with the test data rather than the method's general accuracy.",
  "verified": true
 },
 {
  "n": 65,
  "id": "er-065",
  "title": "String similarity joins",
  "authors": [
   "Yu Jiang",
   "Guoliang Li",
   "Jianhua Feng",
   "Wen-Syan Li"
  ],
  "year": 2014,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/2732296.2732299",
  "citations": 100,
  "themes": [
   "similarity",
   "scalable"
  ],
  "method": [
   "benchmark",
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "String similarity join is an important operation in data integration and cleansing that finds similar string pairs from two collections of strings. More than ten algorithms have been proposed to address this problem in the recent two decades. However, existing algorithms have not been thoroughly compared under the same experimental framework. For example, some algorithms are tested only on specific datasets. This makes it rather difficult for practitioners to decide which algorithms should be used for various scenarios. To address this problem, in this paper we provide a comprehensive survey on a wide spectrum of existing string similarity join algorithms, classify them into different categories based on their main techniques, and compare them through extensive experiments on a variety of real-world datasets with different characteristics. We also report comprehensive findings obtained from the experiments and provide new insights about the strengths and weaknesses of existing similarity join algorithms which can guide practitioners to select appropriate algorithms for various scenarios.",
  "focus": "This paper surveys string similarity join algorithms — operations that find similar string pairs across two collections — classifying more than a decade of proposed algorithms by their main techniques. It compares them through extensive experiments on a variety of real-world datasets with different characteristics, and reports findings on the strengths and weaknesses of each family to guide practitioners in selecting an algorithm.",
  "borrow": "The algorithm-selection guidance maps onto ERBOT's similarity stage whenever joins are used to generate candidate pairs: which join technique fits which string-length and similarity characteristics is exactly the choice our pipeline faces.",
  "fill": "A similarity join returns pairs above a threshold and stops there; classification of those pairs and clustering them into entities are outside its scope, as is learned similarity. The pipeline beyond pair generation is ours to build.",
  "correct": "The comparison covers set- and edit-based string similarity only; its rankings say nothing about semantic or embedding similarity, and dataset-specific results may not transfer to fields with different error profiles.",
  "verified": true
 },
 {
  "n": 66,
  "id": "er-066",
  "title": "The stringdist Package for Approximate String Matching",
  "authors": [
   "Mark,P.J.,van,der Loo"
  ],
  "year": 2014,
  "venue": "The R Journal",
  "doi": "10.32614/rj-2014-011",
  "citations": 388,
  "themes": [
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "n/a",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "A software paper in The R Journal presenting the stringdist package, which implements a wide range of string distance and similarity metrics behind a single interface in R. It is a tooling contribution rather than a new metric.",
  "borrow": "ERBOT is R-based, so stringdist is the natural comparator library for its similarity stage: the unified interface lets us swap metrics per field (names, addresses, titles) without rewriting pipeline code.",
  "fill": "The package supplies distances but no linkage workflow: it offers no guidance on which metric suits which field type, nor on threshold calibration for match decisions. That selection layer is exactly what ERBOT still has to build on top.",
  "correct": "Making many metrics equally easy to call invites unprincipled metric shopping; the paper does not evaluate which of its metrics actually perform best on linkage tasks, so convenience should not be mistaken for evidence.",
  "verified": true
 },
 {
  "n": 67,
  "id": "er-067",
  "title": "Trends in Cleaning Relational Data: Consistency and Deduplication",
  "authors": [
   "Ihab F. Ilyas",
   "Xu Chu"
  ],
  "year": 2015,
  "venue": "Foundations and Trends® in Databases",
  "doi": "10.1561/1900000045",
  "citations": 113,
  "themes": [
   "similarity",
   "scalable"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Data quality is one of the most important problems in data management, since dirty data often leads to inaccurate data analytics results and wrong business decisions. Poor data across businesses and the government cost the U.S. economy $3.1 trillion a year, according to a report by InsightSquared in 2012.\n                  To detect data errors, data quality rules or integrity constraints (ICs) have been proposed as a declarative way to describe legal or correct data instances. Any subset of data that does not conform to the defined rules is considered erroneous, which is also referred to as a violation.\n                  Various kinds of data repairing techniques with different objectives have been introduced, where algorithms are used to detect subsets of the data that violate the declared integrity constraints, and even to suggest updates to the database such that the new database instance conforms with these constraints. While some of these algorithms aim to minimally change the database, others involve human experts or knowledge bases to verify the repairs suggested by the automatic repeating algorithms.\n                  In this paper, we discuss the main facets and directions in designing error detection and repairing techniques. We propose a taxonomy of current anomaly detection techniques, including error types, the automation of the detection process, and error propagation. We also propose a taxonomy of current data repairing techniques, including the repair target, the automation of the repair process, and the update model. We conclude by highlighting current trends in “big data” cleaning.",
  "focus": "This survey monograph reviews data cleaning for relational data, where errors are described declaratively by data quality rules or integrity constraints and violations mark erroneous subsets. It proposes taxonomies of error detection techniques (error types, automation, error propagation) and of data repairing techniques (repair target, automation, update model), with deduplication treated as one facet of the cleaning problem, and closes with trends in big data cleaning.",
  "borrow": "Its taxonomies help scope where entity resolution sits inside a wider cleaning pipeline: which inconsistencies ERBOT should treat as matching evidence, which belong to constraint checking, and which to repair.",
  "fill": "Deduplication appears as one facet among many; the survey does not deliver an entity-resolution pipeline design or a large-scale dedup evaluation. The pipeline-level treatment — blocking through clustering under a cleaning umbrella — remains for us to build and measure.",
  "correct": "The repair-centric framing presumes declared integrity constraints exist to define errors. Much real linkage data has no such constraints, so the taxonomy's grip on constraint-free deduplication is comparatively thin.",
  "verified": true
 },
 {
  "n": 68,
  "id": "er-068",
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
  "n": 69,
  "id": "er-069",
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
  "n": 70,
  "id": "er-070",
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
  "n": 71,
  "id": "er-071",
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
  "n": 72,
  "id": "er-072",
  "title": "Matching and Record Linkage",
  "authors": [
   "William E. Winkler"
  ],
  "year": 1995,
  "venue": "Wiley Series in Probability and Statistics",
  "doi": "10.1002/9781118150504.ch20",
  "citations": 58,
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
  "focus": "This is Winkler's 1995 book chapter on matching and record linkage in the Wiley Series in Probability and Statistics. With no abstract available, the record supports only that it is a reference treatment of the statistical record linkage methodology of its period, centred on the Fellegi–Sunter framework.",
  "borrow": "As a canonical statement of the Fellegi–Sunter tradition, it is a reference point for ERBOT's probabilistic classification stage: the parameter-estimation and error-rate thinking that our linkage weights should remain compatible with.",
  "fill": "A 1995 treatment predates learned blocking, embedding similarity, and modern large-scale evaluation practice, so it leaves the entire question of how classical probabilistic linkage should be combined with those components unaddressed. We can pick up exactly that: keep the Fellegi–Sunter decision structure while replacing its hand-built comparators with modern ones, and document what changes.",
  "correct": "The classical framework it represents rests on conditional independence of field comparisons given match status, an assumption known to fail on real data where fields correlate; any modern use should treat its 'optimal' decision rules as optimal only under that assumption.",
  "verified": true
 },
 {
  "n": 73,
  "id": "er-073",
  "title": "Reclink: aplicativo para o relacionamento de bases de dados, implementando o método probabilistic record linkage",
  "authors": [
   "Kenneth R. de Camargo Jr.",
   "Cláudia M. Coeli"
  ],
  "year": 2000,
  "venue": "Cadernos de Saúde Pública",
  "doi": "10.1590/s0102-311x2000000200014",
  "citations": 114,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "probabilistic",
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Apresenta-se um sistema de relacionamento de bases de dados fundamentado na técnica de relacionamento probabilístico de registros, desenvolvido na linguagem C++ com o ambiente de programação Borland C++ Builder versão 3.0. O sistema foi testado a partir de fontes de dados de diferentes tamanhos, tendo sido avaliado em tempo de processamento e sensibilidade para a identificação de pares verdadeiros. O tempo gasto com o processamento dos registros foi menor quando se empregou o programa do que ao ser realizado manualmente, em especial, quando envolveram bases de maior tamanho. As sensibilidades do processo manual e do processo automático foram equivalentes quando utilizaram bases com menor número de registros; entretanto, à medida que as bases aumentaram, percebeu-se tendência de diminuição na sensibilidade apenas no processo manual. Ainda que em fase inicial de desenvolvimento, o sistema apresentou boa performance tanto em velocidade quanto em sensibilidade. Embora a performance dos algoritmos utilizados tenha sido satisfatória, o objetivo é avaliar outras rotinas, buscando aprimorar o desempenho do sistema.",
  "focus": "The paper presents Reclink, a C++ system implementing probabilistic record linkage, and evaluates it on databases of different sizes in terms of processing time and sensitivity for identifying true pairs. Processing was faster than manual linkage, especially on larger bases; manual and automatic sensitivity were equivalent on smaller bases, but as the bases grew, sensitivity declined only in the manual process.",
  "borrow": "Its central empirical finding — automated Fellegi–Sunter linkage holds its sensitivity as files grow while manual linkage degrades — is a justification baseline for ERBOT, and its Brazilian health-data setting shows the method working beyond English-language name data.",
  "fill": "This is year-2000 desktop software: its blocking and weight-estimation routines are of their era, and there is no open, modern implementation path from it. Rebuilding that workflow openly in R, with current scalability, is precisely the gap ERBOT exists to fill.",
  "correct": "The sensitivity comparison depends on the test bases used and on the quality of the manual linkage it was compared against; equivalence on small bases may say more about how easy small files are than about the algorithm.",
  "verified": true
 },
 {
  "n": 74,
  "id": "er-074",
  "title": "Probabilistic Record Linkage: Relationships between File Sizes, Identifiers, and Match Weights",
  "authors": [
   "L. M. Olson",
   "J. M. Dean",
   "L. J. Cook"
  ],
  "year": 2001,
  "venue": "Methods of Information in Medicine",
  "doi": "10.1055/s-0038-1634155",
  "citations": 62,
  "themes": [
   "probabilistic",
   "evaluation"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Abstract:This study investigates relationships between file sizes, amounts of information contained in commonly used record linkage variables, and the amount of information needed for a successful probabilistic linkage project. We present an equation predicting the amount of information needed for a successful linkage project. Match weights for variables commonly used in record linkage are measured using artificially created databases. Linkage algorithms were successful when the sum of minimum weights for variables used in a linkage exceeded the predicted cutoff. Linkage results were acceptable when this sum was near the predicted cutoff. This technique enables researchers to determine if enough information exists to perform a successful probabilistic linkage.",
  "focus": "This study investigates how file sizes, the amount of information in commonly used record linkage variables, and the information needed for a successful probabilistic linkage project relate to each other. It presents an equation predicting the information needed for success, measures match weights for common variables on artificially created databases, and finds linkage succeeded when the sum of minimum weights for the variables used exceeded the predicted cutoff, with acceptable results near the cutoff.",
  "borrow": "The feasibility check is the borrow: before running a linkage, ERBOT can estimate whether a file pair carries enough identifying information to succeed at all, and warn users when it does not instead of failing silently downstream.",
  "fill": "The weights and cutoff were calibrated on artificially created databases with the identifiers of its period; the equation is not validated on modern messy files or on non-name identifiers. Recalibrating the feasibility test on real contemporary data is open work for us.",
  "correct": "The prediction treats the information in different variables as additive and stable across populations; correlated identifiers and population-specific name distributions can make summed weights overstate the true information, so the cutoff is optimistic in exactly the hard cases.",
  "verified": true
 },
 {
  "n": 75,
  "id": "er-075",
  "title": "Record Linkage",
  "authors": [
   "William E. Winkler"
  ],
  "year": 2001,
  "venue": "Encyclopedia of Environmetrics",
  "doi": "10.1002/9780470057339.var022",
  "citations": 48,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "survey",
   "probabilistic"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Abstract\n                  \n                    Record linkage is the methodology of identifying pairs of records associated with entities from two or more files. Entities may be persons or businesses. Record linkage also refers to finding duplicates within files. Sometimes, records are linked using unique identification numbers such as a Social Security Number. Typically, non‐unique identifiers such as names, addresses, and other information are used. These methods of record linkage are called exact matching. Methods for exact matching may be based on\n                    ad hoc\n                    rules that may be applicable in a limited number of situations. Methods may also be based on a formal mathematical model as discussed in this article.",
  "focus": "Winkler's 2001 encyclopedia entry defines record linkage as the methodology of identifying pairs of records associated with the same entities across two or more files, including finding duplicates within a single file. It distinguishes linkage via unique identifiers from the typical case of non-unique identifiers such as names and addresses, and contrasts ad hoc rule-based exact matching with methods based on a formal mathematical model.",
  "borrow": "The entry's clean problem definition and its exact-versus-model-based distinction are borrowable as framing for ERBOT's documentation: it states precisely which problem our pipeline solves and why model-based methods replaced rule lists.",
  "fill": "As a 2001 encyclopedia treatment it leaves the modern pipeline — learned blocking, embeddings, scalable clustering, privacy preservation — entirely outside its scope. The leftover for us is expository as much as technical: a current reference definition that keeps the classical framing but covers the full modern stack.",
  "correct": "The formal-model framing centres the Fellegi–Sunter tradition; readers should not take the entry's methodological centre of gravity as the field's — rule-based and later machine-learned approaches carry much of practical linkage, and the entry predates the evidence for them.",
  "verified": true
 },
 {
  "n": 76,
  "id": "er-076",
  "title": "Probabilistic record linkage and a method to calculate the positive predictive value",
  "authors": [
   "Tony Blakely",
   "Clare Salmond"
  ],
  "year": 2002,
  "venue": "International Journal of Epidemiology",
  "doi": "10.1093/ije/31.6.1246",
  "citations": 174,
  "themes": [
   "probabilistic",
   "evaluation"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "A methods paper in the International Journal of Epidemiology on probabilistic record linkage, presenting, as its title states, a method to calculate the positive predictive value of a linkage. It belongs to the Fellegi–Sunter tradition of weight-based matching.",
  "borrow": "A defensible way to estimate the positive predictive value of declared links without clerically reviewing every pair gives ERBOT's evaluation stage a shortcut for real files that have no gold standard.",
  "fill": "The paper quantifies one error direction — false matches among declared links. Estimating the missed matches, and choosing thresholds when false and missed matches carry different costs, is left open for our evaluation stage to handle.",
  "correct": "Any PPV calculation built on match weights inherits the assumptions behind those weights, including conditional independence of field agreements; where those assumptions fail, the calculated PPV is biased in the same direction.",
  "verified": true
 },
 {
  "n": 77,
  "id": "er-077",
  "title": "Data Quality and Record Linkage Techniques",
  "authors": [
   "Thomas N. Herzog",
   "Fritz J. Scheuren",
   "William E. Winkler"
  ],
  "year": 2007,
  "venue": "Springer (book)",
  "doi": "10.1007/0-387-69505-2",
  "citations": 20,
  "themes": [
   "probabilistic",
   "evaluation"
  ],
  "method": [
   "survey",
   "probabilistic"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "A book-length treatment of data quality and record linkage techniques (2007), covering the statistical methodology of linking files whose quality problems — errors, missing values, duplicates — drive the linkage design. The record carries no author list or abstract, so chapter-level content cannot be summarised from the metadata.",
  "borrow": "ERBOT can borrow the book's organising premise: linkage methods should be chosen in response to measured data-quality problems in the actual files, not applied as a fixed recipe — a checklist our pipeline diagnostics can encode.",
  "fill": "A 2007 text predates learned blocking, embedding-based matching, and modern PPRL attacks; a data-quality-first treatment updated for those methods does not exist, and SandX's documentation can fill that niche.",
  "correct": "Its methods reflect the era's computing limits and the Fellegi–Sunter-centred practice of official statistics; prescriptions about feasible file sizes and manual review should not be carried into current pipelines unexamined.",
  "verified": true
 },
 {
  "n": 78,
  "id": "er-078",
  "title": "Author name disambiguation in MEDLINE",
  "authors": [
   "Vetle I. Torvik",
   "Neil R. Smalheiser"
  ],
  "year": 2009,
  "venue": "ACM Transactions on Knowledge Discovery from Data",
  "doi": "10.1145/1552303.1552304",
  "citations": 210,
  "themes": [
   "probabilistic",
   "clustering"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "Background\n            : We recently described “Author-ity,” a model for estimating the probability that two articles in MEDLINE, sharing the same author name, were written by the same individual. Features include shared title words, journal name, coauthors, medical subject headings, language, affiliations, and author name features (middle initial, suffix, and prevalence in MEDLINE). Here we test the hypothesis that the Author-ity model will suffice to disambiguate author names for the vast majority of articles in MEDLINE.\n            Methods\n            : Enhancements include: (a) incorporating first names and their variants, email addresses, and correlations between specific last names and affiliation words; (b) new methods of generating large unbiased training sets; (c) new methods for estimating the prior probability; (d) a weighted least squares algorithm for correcting transitivity violations; and (e) a maximum likelihood based agglomerative algorithm for computing clusters of articles that represent inferred author-individuals.\n            Results\n            : Pairwise comparisons were computed for all author names on all 15.3 million articles in MEDLINE (2006 baseline), that share last name and first initial, to create Author-ity 2006, a database that has each name on each article assigned to one of 6.7 million inferred author-individual clusters. Recall is estimated at ∼98.8%. Lumping (putting two different individuals into the same cluster) affects ∼0.5% of clusters, whereas splitting (assigning articles written by the same individual to &gt;1 cluster) affects ∼2% of articles.\n            Impact\n            : The Author-ity model can be applied generally to other bibliographic databases. Author name disambiguation allows information retrieval and data integration to become\n            person-centered\n            , not just\n            document-centered\n            , setting the stage for new data mining and social network tools that will facilitate the analysis of scholarly publishing and collaboration behavior.\n            Availability:\n            The Author-ity 2006 database is available for nonprofit academic research, and can be freely queried via http://arrowsmith.psych.uic.edu.",
  "focus": "The paper extends the Author-ity model, which estimates the probability that two MEDLINE articles sharing an author name were written by the same person, using features such as shared title words, journal, coauthors, subject headings, and affiliations. Enhancements include first-name variants, new ways of generating unbiased training sets, prior estimation, correction of transitivity violations, and a maximum-likelihood agglomerative clustering. Applied to all 15.3 million articles in the 2006 MEDLINE baseline, it produced 6.7 million inferred author clusters with estimated recall around 98.8%, lumping affecting about 0.5% of clusters and splitting about 2% of articles.",
  "borrow": "Two components transfer directly to ERBOT's clustering stage: the weighted correction of transitivity violations after pairwise scoring, and the agglomerative clustering over pairwise probabilities; its method for generating large unbiased training sets is also worth copying.",
  "fill": "The model is built for one bibliographic database with rich metadata (subject headings, affiliations, emails); it does not address files with sparse identifiers or non-bibliographic entities. Adapting its feature and prior machinery to general record linkage remains open for us.",
  "correct": "The headline recall and error rates are estimates resting on the authors' own validation samples and prior estimates, and they are conditioned on MEDLINE's metadata richness; messier files with thin attributes should not expect the same numbers.",
  "verified": true
 },
 {
  "n": 79,
  "id": "er-079",
  "title": "Extending the Fellegi–Sunter probabilistic record linkage method for approximate field comparators",
  "authors": [
   "Scott L. DuVall",
   "Richard A. Kerber",
   "Alun Thomas"
  ],
  "year": 2010,
  "venue": "Journal of Biomedical Informatics",
  "doi": "10.1016/j.jbi.2009.08.004",
  "citations": 54,
  "themes": [
   "probabilistic",
   "similarity"
  ],
  "method": [
   "probabilistic",
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This paper, published in the Journal of Biomedical Informatics in 2010, extends the Fellegi–Sunter probabilistic record linkage method so that field comparisons can be approximate rather than exact: instead of a field either agreeing or disagreeing, graded comparator outcomes are folded into the probabilistic weighting scheme. The record carries no abstract, so the description rests on the title and venue: it is a methodological extension of classical probabilistic linkage for biomedical data.",
  "borrow": "The extension is directly relevant to ERBOT's classification stage: it shows how to feed graded string-similarity outcomes into Fellegi–Sunter weights in a principled way instead of thresholding similarities into binary agreement before weighting, which is the naive approach.",
  "fill": "The extension addresses comparators within the classical framework but leaves open how the required agreement probabilities should be estimated when comparators are continuous and fields are correlated, and it does not treat blocking or scale. We can pick up the estimation problem: pair the graded-comparator extension with modern unsupervised parameter estimation and test it inside a full pipeline.",
  "correct": "Folding approximate comparators into Fellegi–Sunter weights does not repair the framework's conditional-independence assumption — correlated fields with graded similarities can double-count evidence even more smoothly than binary ones, so the resulting match weights can look better calibrated than they are.",
  "verified": true
 },
 {
  "n": 80,
  "id": "er-080",
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
  "n": 81,
  "id": "er-081",
  "title": "Results from simulated data sets: probabilistic record linkage outperforms deterministic record linkage",
  "authors": [
   "Miranda Tromp",
   "Anita C. Ravelli",
   "Gouke J. Bonsel",
   "Arie Hasman",
   "Johannes B. Reitsma"
  ],
  "year": 2011,
  "venue": "Journal of Clinical Epidemiology",
  "doi": "10.1016/j.jclinepi.2010.05.008",
  "citations": 106,
  "themes": [
   "probabilistic",
   "evaluation"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "A simulation study in the Journal of Clinical Epidemiology comparing probabilistic and deterministic record linkage on simulated datasets with known match status. As its title states, its results find probabilistic linkage outperforming deterministic linkage under the simulated conditions.",
  "borrow": "The simulation design — generating files with known match status and controlled error rates so linkage methods can be scored exactly — is a template for ERBOT's own evaluation harness where real gold standards are absent.",
  "fill": "Evidence from simulation covers only the error mechanisms the authors chose to simulate. Validation on real files with unmodeled error types, such as OCR noise or transliteration variants, remains open, and ERBOT's harness can extend their design in that direction.",
  "correct": "The headline conclusion is partly baked into the simulation: probabilistic methods win when errors are generated probabilistically in the assumed way. Under error structures that match simple deterministic rules, the ranking can reverse.",
  "verified": true
 },
 {
  "n": 82,
  "id": "er-082",
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
  "n": 83,
  "id": "er-083",
  "title": "Matching and record linkage",
  "authors": [
   "William E. Winkler"
  ],
  "year": 2014,
  "venue": "WIREs Computational Statistics",
  "doi": "10.1002/wics.1317",
  "citations": 56,
  "themes": [
   "probabilistic",
   "evaluation"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "This overview gives background on a number of statistical methods that have been proven effective for record linkage. To prepare data for the main computational algorithms, we need parsing/standardization that allows us to structure the free‐form names, addresses, and other fields into corresponding components. The main parameter‐estimation methods are unsupervised methods that yield ‘optimal’ record linkage parameters. Extended methods provide estimates of false match rates in both unsupervised and, with greater accuracy, in semi‐supervised situations. Finally, the paper describes ongoing research for adjusting standard statistical analyses for linkage error.\n                    WIREs Comput Stat\n                    2014, 6:313–325. doi: 10.1002/wics.1317\n                  \n                  \n                    This article is categorized under:\n                    \n                      \n                        Statistical and Graphical Methods of Data Analysis &gt; EM Algorithm\n                      \n                      \n                        Algorithms and Computational Methods &gt; Seminumerical and Nonnumerical Methods\n                      \n                      \n                        Data: Types and Structure &gt; Data Preparation and Processing\n                      \n                      \n                        Statistical and Graphical Methods of Data Analysis &gt; Markov Chain Monte Carlo (MCMC)",
  "focus": "Winkler's 2014 overview in WIREs Computational Statistics surveys statistical methods proven effective for record linkage. It covers the parsing and standardization needed to structure free-form names and addresses, unsupervised parameter-estimation methods that yield linkage parameters, extended methods for estimating false match rates in unsupervised and semi-supervised settings, and ongoing research on adjusting statistical analyses for linkage error.",
  "borrow": "Two practices transfer directly to ERBOT: unsupervised estimation of linkage parameters as the default when no training data exists, and explicit false-match-rate estimation as part of evaluation rather than an afterthought. The parsing/standardization emphasis also belongs at the front of our pipeline.",
  "fill": "The overview is deliberately scoped to the statistical tradition: it leaves open how its parameter estimation and error-rate machinery should be combined with learned blocking and embedding-based similarity, and its treatment of adjusting analyses for linkage error is flagged as ongoing research rather than solved practice. We can pick up both: error-rate estimation for pipelines whose comparators are learned, and usable guidance on downstream adjustment.",
  "correct": "The 'optimal' parameters the unsupervised methods yield are optimal under the Fellegi–Sunter conditional-independence model; the overview's framing can understate how far real comparison vectors depart from that model, and its error-rate estimates inherit the same assumption.",
  "verified": true
 },
 {
  "n": 84,
  "id": "er-084",
  "title": "Uncertain entity resolution",
  "authors": [
   "Avigdor Gal"
  ],
  "year": 2014,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/2733004.2733068",
  "citations": 18,
  "themes": [
   "probabilistic",
   "clustering"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "Entity resolution is a fundamental problem in data integration dealing with the combination of data from different sources to a unified view of the data. Entity resolution is inherently an uncertain process because the decision to map a set of records to the same entity cannot be made with certainty unless these are identical in all of their attributes or have a common key. In the light of recent advancement in data accumulation, management, and analytics landscape (known as big data) the tutorial re-evaluates the entity resolution process and in particular looks at best ways to handle data veracity. The tutorial ties entity resolution with recent advances in probabilistic database research, focusing on sources of uncertainty in the entity resolution process.",
  "focus": "Gal's tutorial re-evaluates entity resolution as an inherently uncertain process, tying it to probabilistic database research and examining the sources of uncertainty across the resolution pipeline, with attention to data veracity in big-data settings. It argues that match decisions cannot be made with certainty unless records are identical or share a key, so uncertainty should be modelled rather than ignored.",
  "borrow": "ERBOT can borrow the uncertainty inventory: cataloguing where uncertainty enters our own pipeline (attribute errors, ambiguous matches, transitive merges) is the first step to propagating match uncertainty into the clusters we output.",
  "fill": "The tutorial maps the problem space but leaves systems work open: a pipeline that carries calibrated uncertainty from pairwise scores through clustering to the end user — in R, at scale — does not yet exist, and building it is squarely ERBOT work.",
  "correct": "Probabilistic treatments often assume uncertainty can be quantified with the probabilities the pipeline itself produces; those scores are rarely calibrated, so downstream 'uncertainty-aware' decisions may rest on numbers that do not mean what they claim.",
  "verified": true
 },
 {
  "n": 85,
  "id": "er-085",
  "title": "Probabilistic Record Linkage and Deduplication after Indexing, Blocking, and Filtering",
  "authors": [
   "Jared S. Murray"
  ],
  "year": 2015,
  "venue": "Journal of Privacy and Confidentiality",
  "doi": "10.29012/jpc.v7i1.643",
  "citations": 23,
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
  "abstract": "Probabilistic record linkage, the task of merging two or more databases in the absence of a unique identifier, is a perennial and challenging problem. It is closely related to the problem of deduplicating a single database, which can be cast as linking a single database against itself. In both cases the number of possible links grows rapidly in the size of the databases under consideration, and in most applications it is necessary to first reduce the number of record pairs that will be compared.\n\nSpurred by practical considerations, a range of methods have been developed for this task. These methods go under a variety of names, including indexing and blocking, and have seen significant development. However, methods for inferring linkage structure that account for indexing, blocking, and additional filtering steps have not seen commensurate development. In this paper we review the implications of indexing, blocking and filtering within the popular Fellegi-Sunter framework, and propose a new model to account for particular forms of indexing and filtering.",
  "focus": "Murray reviews what indexing, blocking, and filtering do to inference inside the Fellegi–Sunter framework, and proposes a model that accounts for particular forms of indexing and filtering when estimating linkage structure. The point is that the pair-reduction steps practitioners treat as neutral preprocessing in fact change the statistical problem.",
  "borrow": "ERBOT can borrow the discipline of stating, for each blocking/filtering step, what it does to the comparison population — and where feasible adjust linkage probabilities for pairs that only enter comparison because of the index design.",
  "fill": "The proposed model covers particular forms of indexing and filtering, not the adaptive, multi-pass, or learned blocking ERBOT uses; extending blocking-aware inference to iterative and embedding-based candidate generation is open work we can take up.",
  "correct": "The analysis stays inside the Fellegi–Sunter framework with its conditional-independence assumptions, so the correction it offers fixes one distortion (selection by blocking) while leaving the framework's other known distortions untouched.",
  "verified": true
 },
 {
  "n": 86,
  "id": "er-086",
  "title": "Probabilistic Record Linkage in Astronomy: Directional Cross-Identification and Beyond",
  "authors": [
   "Tamás Budavári",
   "Thomas J. Loredo"
  ],
  "year": 2015,
  "venue": "Annual Review of Statistics and Its Application",
  "doi": "10.1146/annurev-statistics-010814-020231",
  "citations": 21,
  "themes": [
   "probabilistic",
   "privacy-bayesian",
   "clustering"
  ],
  "method": [
   "Bayesian",
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "Modern astronomy increasingly relies upon systematic surveys, whose dedicated telescopes continuously observe the sky across varied wavelength ranges of the electromagnetic spectrum; some surveys also observe nonelectromagnetic messengers, such as high-energy particles or gravitational waves. Stars and galaxies look different through the eyes of different instruments, and their independent measurements have to be carefully combined to provide a complete, sound picture of the multicolor and eventful universe. The association of an object's independent detections is, however, a difficult problem scientifically, computationally, and statistically, raising varied challenges across diverse astronomical applications. The fundamental problem is finding records in survey databases with directions that match to within the direction uncertainties. Such astronomical versions of the record linkage problem are known by various terms in astronomy: cross-matching; cross-identification; and directional, positional, or spatiotemporal coincidence assessment. Astronomers have developed several statistical approaches for such problems, largely independent of related developments in other disciplines. Here, we review emerging approaches that compute (Bayesian) probabilities for the hypotheses of interest: possible associations or demographic properties of a cosmic population that depend on identifying associations. Many cross-identification tasks can be formulated within a hierarchical Bayesian partition model framework, with components that explicitly account for astrophysical effects (e.g., source brightness versus wavelength, source motion, or source extent), selection effects, and measurement error. We survey recent developments and highlight important open areas for future research.",
  "focus": "Budavári and Loredo review probabilistic record linkage for astronomy, where detections of the same object from different surveys must be associated using directional (positional) agreement within measurement uncertainties. They survey approaches that compute Bayesian probabilities for association hypotheses, many framed in a hierarchical Bayesian partition model that accounts for astrophysical effects, selection effects, and measurement error.",
  "borrow": "ERBOT can borrow the partition-model framing: astronomers treat the whole linkage as one partition to be inferred jointly, with explicit measurement-error components — a principled template for our clustering stage and for fields with known error structure.",
  "fill": "The review itself highlights open areas, and its machinery is built for continuous positional data with well-characterised errors; porting partition-model linkage to messy categorical person data, where error models must be learned rather than derived from instruments, remains open and is work we can attempt.",
  "correct": "The astronomy setting is unusually favourable — errors are quantified by instrument physics and the matching attribute is low-dimensional — so its clean Bayesian results should not be read as evidence the same formulations will behave as well on names and addresses.",
  "verified": true
 },
 {
  "n": 87,
  "id": "er-087",
  "title": "Probabilistic record linkage",
  "authors": [
   "Adrian Sayers",
   "Yoav Ben-Shlomo",
   "Ashley W Blom",
   "Fiona Steele"
  ],
  "year": 2015,
  "venue": "International Journal of Epidemiology",
  "doi": "10.1093/ije/dyv322",
  "citations": 158,
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
  "focus": "An overview of probabilistic record linkage in the International Journal of Epidemiology (2015), presenting the weight-based approach — comparing identifying fields, accumulating match weights, and applying decision thresholds — for an applied health-research audience.",
  "borrow": "Its plain-language framing of match weights, thresholds, and linkage error is a model for how ERBOT should document its probabilistic mode for users who are not linkage specialists.",
  "fill": "An introductory overview necessarily stops early: blocking at scale, the details of weight estimation on real files, and analysis of bias introduced by linkage error are outside its scope, so a practitioner-grade treatment remains to be written alongside ERBOT.",
  "correct": "Overview presentations can make threshold choice look more mechanical than it is; in practice error rates hinge on file-specific weight estimation and clerical review, which no general account can settle in advance.",
  "verified": true
 },
 {
  "n": 88,
  "id": "er-088",
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
  "n": 89,
  "id": "er-089",
  "title": "A Probabilistic Record Linkage Model for Survival Data",
  "authors": [
   "Michel H. Hof",
   "Anita C. Ravelli",
   "Aeilko H. Zwinderman"
  ],
  "year": 2017,
  "venue": "Journal of the American Statistical Association",
  "doi": "10.1080/01621459.2017.1311262",
  "citations": 18,
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
  "focus": "This paper proposes a probabilistic record linkage model tailored to survival data, published in the Journal of the American Statistical Association. It addresses the setting where linked records feed time-to-event (survival) analysis, so linkage is modelled with that downstream analysis in view.",
  "borrow": "The transferable idea is that linkage uncertainty should be modelled jointly with the downstream analysis rather than frozen in a preprocessing step — a stance ERBOT can adopt whenever its output feeds statistical models.",
  "fill": "The general problem is left open: how to propagate linkage uncertainty into downstream estimates outside the survival setting. We can test how match uncertainty changes effect estimates in other model families, such as logistic or count models.",
  "correct": "The model is built for survival data in a specific analytical context; whether the joint-modelling gain survives messier, larger, less curated files is untested by the record as given.",
  "verified": true
 },
 {
  "n": 90,
  "id": "er-090",
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
  "n": 91,
  "id": "er-091",
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
  "n": 92,
  "id": "er-092",
  "title": "A hybrid approach to record linkage using a combination of deterministic and probabilistic methodology",
  "authors": [
   "Toan C Ong",
   "Lindsey M Duca",
   "Michael G Kahn",
   "Tessa L Crume"
  ],
  "year": 2020,
  "venue": "Journal of the American Medical Informatics Association",
  "doi": "10.1093/jamia/ocz232",
  "citations": 27,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "small benchmark",
  "abstract": "Abstract\n                  \n                    Objective\n                    The disjointed healthcare system and the nonexistence of a universal patient identifier across systems necessitates accurate record linkage (RL). We aim to describe the implementation and evaluation of a hybrid record linkage method in a statewide surveillance system for congenital heart disease.\n                  \n                  \n                    Materials and Methods\n                    Clear-text personally identifiable information on individuals in the Colorado Congenital Heart Disease surveillance system was obtained from 5 electronic health record and medical claims data sources. Two deterministic methods and 1 probabilistic RL method using first name, last name, social security number, date of birth, and house number were initially implemented independently and then sequentially in a hybrid approach to assess RL performance.\n                  \n                  \n                    Results\n                    16 480 nonunique individuals with congenital heart disease were ascertained. Deterministic linkage methods, when performed independently, yielded 4505 linked pairs (consisting of 2 records linked together within or across data sources). Probabilistic RL, using 3 initial characters of last name and gender for blocking, yielded 6294 linked pairs when executed independently. Using a hybrid linkage routine resulted in 6451 linkages and an additional 18%–24% correct linked pairs as compared to the independent methods. A hybrid linkage routine resulted in higher recall and F-measure scores compared to probabilistic and deterministic methods performed independently.\n                  \n                  \n                    Discussion\n                    The hybrid approach resulted in increased linkage accuracy and identified pairs of linked record that would have otherwise been missed when using any independent linkage technique.\n                  \n                  \n                    Conclusion\n                    When performing RL within and across disparate data sources, the hybrid RL routine outperformed independent deterministic and probabilistic methods.",
  "focus": "Ong and co-authors implement and evaluate a hybrid record linkage method — deterministic rules and a probabilistic method run first independently and then sequentially in combination — for a statewide congenital heart disease surveillance system linking 16,480 individuals across five EHR and claims sources. The hybrid routine produced 6,451 linked pairs, 18–24% more correct pairs than any independent method, with higher recall and F-measure than either deterministic or probabilistic linkage alone.",
  "borrow": "This is a ready-made pipeline pattern for ERBOT: run cheap deterministic passes first to harvest exact-identifier links, then apply probabilistic matching to the residue, and report the marginal yield of each pass — the paper's independent-then-sequential evaluation design is worth copying verbatim.",
  "fill": "The evaluation is on one disease registry in one state with strong identifiers (including SSN); it leaves open how much the hybrid gains survive when identifiers are weaker or absent, and how the sequential order should be chosen for other domains. We can pick that up: ablate pass ordering and identifier strength in ERBOT on non-health data.",
  "correct": "The hybrid's advantage is partly arithmetic — running more methods finds more pairs — and the 'correct pairs' judgement rests on the study's own review process; without an external gold standard, the recall gain could include pairs the independent methods were right to reject.",
  "verified": true
 },
 {
  "n": 93,
  "id": "er-093",
  "title": "An Introduction to Probabilistic Record Linkage with a Focus on Linkage Processing for WTC Registries",
  "authors": [
   "Jana Asher",
   "Dean Resnick",
   "Jennifer Brite",
   "Robert Brackbill",
   "James Cone"
  ],
  "year": 2020,
  "venue": "International Journal of Environmental Research and Public Health",
  "doi": "10.3390/ijerph17186937",
  "citations": 27,
  "themes": [
   "probabilistic"
  ],
  "method": [
   "survey",
   "probabilistic"
  ],
  "supervision": "n/a",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "Since its post-World War II inception, the science of record linkage has grown exponentially and is used across industrial, governmental, and academic agencies. The academic fields that rely on record linkage are diverse, ranging from history to public health to demography. In this paper, we introduce the different types of data linkage and give a historical context to their development. We then introduce the three types of underlying models for probabilistic record linkage: Fellegi-Sunter-based methods, machine learning methods, and Bayesian methods. Practical considerations, such as data standardization and privacy concerns, are then discussed. Finally, recommendations are given for organizations developing or maintaining record linkage programs, with an emphasis on organizations measuring long-term complications of disasters, such as 9/11.",
  "focus": "Asher and co-authors introduce probabilistic record linkage for practitioners, with processing lessons from the World Trade Center health registries: they survey the history of linkage, the three families of underlying models (Fellegi–Sunter, machine learning, and Bayesian), and practical considerations such as data standardization and privacy. The paper is a tutorial-style guide for organizations building or maintaining linkage programs, especially for long-term disaster-health follow-up.",
  "borrow": "ERBOT can borrow the paper's practitioner checklist — standardization before linkage, explicit model choice among Fellegi–Sunter/ML/Bayesian, and governance recommendations — as the template for our own linkage-project intake and documentation.",
  "fill": "As an introduction grounded in one registry program, it leaves open quantitative guidance: how the three model families compare on the same registry-scale data, and what accuracy a new program should expect. We can pick that up by running the three families side by side within ERBOT on a registry-like dataset.",
  "correct": "Recommendations distilled from the WTC registry context — a defined cohort, US administrative data, sustained funding — may not transfer to one-off linkages on messier data with no clerical-review capacity; the paper's best practices presume an institutional setting many linkage projects lack.",
  "verified": true
 },
 {
  "n": 94,
  "id": "er-094",
  "title": "d-blink: Distributed End-to-End Bayesian Entity Resolution",
  "authors": [
   "Neil G. Marchant",
   "Andee Kaplan",
   "Daniel N. Elazar",
   "Benjamin I. P. Rubinstein",
   "Rebecca C. Steorts"
  ],
  "year": 2021,
  "venue": "Journal of Computational and Graphical Statistics",
  "doi": "10.1080/10618600.2020.1825451",
  "citations": 25,
  "themes": [
   "probabilistic",
   "scalable"
  ],
  "method": [
   "Bayesian"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "d-blink is a distributed, end-to-end Bayesian entity resolution system, published in the Journal of Computational and Graphical Statistics. It extends Bayesian record linkage so that the full resolution — with uncertainty quantification — can be carried out in a distributed fashion at scale.",
  "borrow": "End-to-end Bayesian linkage that carries posterior match uncertainty through to the output is the principled alternative to point-estimate pipelines; ERBOT can borrow the practice of reporting uncertainty with its clusters rather than only hard assignments.",
  "fill": "The operational cost is left open: distributed Bayesian inference is computationally heavy, so we can measure where end-to-end Bayesian linkage pays for itself against a fast discriminative pipeline with calibrated scores.",
  "correct": "Bayesian linkage quality leans on priors and distortion models fitted to a population; misspecified priors can bias match rates in ways that point metrics such as precision and recall do not reveal.",
  "verified": true
 },
 {
  "n": 95,
  "id": "er-095",
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
  "n": 96,
  "id": "er-096",
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
  "n": 97,
  "id": "er-097",
  "title": "Entity matching in heterogeneous databases: A logistic regression approach",
  "authors": [
   "Debabrata Dey"
  ],
  "year": 2008,
  "venue": "Decision Support Systems",
  "doi": "10.1016/j.dss.2007.10.007",
  "citations": 14,
  "themes": [
   "ml-deep",
   "probabilistic"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "multi-source",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This paper applies logistic regression to entity matching across heterogeneous databases, learning a match classifier from attribute comparisons between records of different sources, published in Decision Support Systems.",
  "borrow": "Logistic regression on comparison vectors is ERBOT's interpretable baseline: its coefficients show which attributes drive match decisions, providing a sanity reference against which any fancier matcher can be checked.",
  "fill": "It leaves open how learned weights travel across database pairs; we can test coefficient transfer and recalibration when the target pair of files differs from the pair the model was trained on.",
  "correct": "A 2008 single-model study predates modern matching benchmarks and methods, so its accuracy picture should not be read against today's techniques.",
  "verified": true
 },
 {
  "n": 98,
  "id": "er-098",
  "title": "Beyond probabilistic record linkage: Using neural networks and complex features to improve genealogical record linkage",
  "authors": [
   "D. Randall Wilson"
  ],
  "year": 2011,
  "venue": "The 2011 International Joint Conference on Neural Networks",
  "doi": "10.1109/ijcnn.2011.6033192",
  "citations": 35,
  "themes": [
   "ml-deep",
   "probabilistic"
  ],
  "method": [
   "ML classifier",
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This IJCNN 2011 paper by D. Randall Wilson applies neural networks and complex, engineered features to genealogical record linkage, aiming to improve on classical probabilistic (Fellegi–Sunter) linkage for historical census and genealogy data. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "The paper is an early, concrete demonstration that a learned classifier with rich comparison features can beat plain Fellegi–Sunter weighting on real linkage data — borrowable as evidence and as a feature-engineering reference for ERBOT's classification stage, especially for noisy historical-style records.",
  "fill": "The work is scoped to genealogical data and a 2011-vintage network; it leaves open whether its complex features generalize beyond genealogy, and it does not address blocking or scale. We can pick up the generalization test: run feature-rich learned classification against probabilistic linkage across several domains inside one pipeline.",
  "correct": "Beating a probabilistic baseline on one domain with hand-crafted complex features risks crediting the network for what the features did; without an ablation separating feature engineering from model class, the 'beyond probabilistic' claim is stronger than the design supports.",
  "verified": true
 },
 {
  "n": 99,
  "id": "er-099",
  "title": "Active sampling for entity matching",
  "authors": [
   "Kedar Bellare",
   "Suresh Iyengar",
   "Aditya G. Parameswaran",
   "Vibhor Rastogi"
  ],
  "year": 2012,
  "venue": "Proceedings of the 18th ACM SIGKDD international conference on Knowledge discovery and data mining",
  "doi": "10.1145/2339530.2339707",
  "citations": 58,
  "themes": [
   "ml-deep",
   "evaluation"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This KDD 2012 paper addresses entity matching under a limited labeling budget: rather than sampling record pairs for human labeling uniformly or by simple uncertainty, it studies how to actively sample the pairs whose labels most improve the matching model. The record carries no abstract, so the description rests on the title and venue: it is a contribution on sample selection for training entity matching classifiers.",
  "borrow": "Active sampling is directly applicable to ERBOT's classification stage: when we must build labeled training pairs for a new dataset, a principled sampling strategy beats ad hoc pair selection and reduces the labeling cost of reaching a target quality.",
  "fill": "The paper concerns which pairs to label, not the rest of the pipeline: it leaves open how active sampling interacts with blocking (the sampler can only choose among pairs blocking surfaces) and how sampling strategies should adapt when the matcher is a Fellegi–Sunter-style probabilistic model rather than a trained classifier. We can pick up the blocking-aware version of the sampling problem.",
  "correct": "Active sampling gains are typically demonstrated against weak baselines such as random sampling on a handful of benchmark datasets; the strategy that wins there may mostly be exploiting those datasets' class imbalance, so the claimed labeling savings should be re-checked on data with different match rates before being trusted.",
  "verified": true
 },
 {
  "n": 100,
  "id": "er-100",
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
  "n": 101,
  "id": "er-101",
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
  "n": 102,
  "id": "er-102",
  "title": "Active Learning for Large-Scale Entity Resolution",
  "authors": [
   "Kun Qian",
   "Lucian Popa",
   "Prithviraj Sen"
  ],
  "year": 2017,
  "venue": "Proceedings of the 2017 ACM on Conference on Information and Knowledge Management",
  "doi": "10.1145/3132847.3132949",
  "citations": 59,
  "themes": [
   "ml-deep",
   "scalable"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "A CIKM 2017 paper on active learning for large-scale entity resolution: instead of labeling record pairs at random to train a matcher, the approach selects which pairs to label so that a good classifier is reached with far fewer labeled examples. The emphasis is on making supervised entity resolution feasible when labeling is the bottleneck.",
  "borrow": "The query strategy — label the pairs the current classifier finds most informative — designs ERBOT's training-data collection directly: clerical labeling effort goes where it most improves the matcher instead of being spread uniformly.",
  "fill": "Active learning addresses classifier training only, not the blocking that must precede it at scale; matches that blocking never surfaces cannot be recovered by any labeling strategy. Coupling active learning with blocking diagnostics is left open for us.",
  "correct": "Reported gains are measured against passive labeling baselines on benchmark tasks; with the extreme class imbalance of real linkage, uncertainty-driven selection can spend the labeling budget on unrepresentative pairs, so the savings may shrink in deployment.",
  "verified": true
 },
 {
  "n": 103,
  "id": "er-103",
  "title": "ERBlox: Combining matching dependencies with machine learning for entity resolution",
  "authors": [
   "Zeinab Bahmani",
   "Leopoldo Bertossi",
   "Nikolaos Vasiloglou"
  ],
  "year": 2017,
  "venue": "International Journal of Approximate Reasoning",
  "doi": "10.1016/j.ijar.2017.01.003",
  "citations": 24,
  "themes": [
   "ml-deep",
   "clustering"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "ERBlox combines matching dependencies — declarative rules that state when records must match — with machine learning for entity resolution, published in the International Journal of Approximate Reasoning (2017). The record carries no abstract, so the specific architecture and evaluation cannot be summarised from the metadata alone.",
  "borrow": "The combination itself is the borrow: ERBOT can let declarative matching rules act as constraints or features alongside a learned classifier, so domain knowledge enters the pipeline explicitly instead of being rediscovered from labels.",
  "fill": "A rule-plus-learning hybrid from 2017 leaves the scale question open: how rule checking and dependency-driven merging behave on very large, noisy files is exactly what an R implementation at ERBOT's target scale can test and report.",
  "correct": "Matching dependencies presuppose that correct rules can be written for the domain; where rules are incomplete or slightly wrong, they can force false merges with more confidence than a purely statistical classifier would — the approach's strength is also its brittleness.",
  "verified": true
 },
 {
  "n": 104,
  "id": "er-104",
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
  "n": 105,
  "id": "er-105",
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
  "n": 106,
  "id": "er-106",
  "title": "Entity Matching with Active Monotone Classification",
  "authors": [
   "Yufei Tao"
  ],
  "year": 2018,
  "venue": "Proceedings of the 37th ACM SIGMOD-SIGACT-SIGAI Symposium on Principles of Database Systems",
  "doi": "10.1145/3196959.3196984",
  "citations": 14,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This PODS paper studies entity matching with active classification under a monotonicity assumption — that match likelihood does not decrease as similarity grows — analysing how few labelled examples are needed when that structure holds.",
  "borrow": "Monotonicity is a usable prior for ERBOT's matcher: if more similar pairs are at least as likely to match, active label requests can be concentrated where monotonicity leaves the decision ambiguous.",
  "fill": "The empirical side is left open: whether real comparison vectors are close enough to monotone for the theoretical label savings to materialise. We can audit monotonicity violations in standard benchmark data.",
  "correct": "The guarantees hinge on the monotonicity assumption itself; where attributes interact non-monotonically — one rare name outweighing several weak fields — the promised savings may vanish.",
  "verified": true
 },
 {
  "n": 107,
  "id": "er-107",
  "title": "Deep Sequence-to-Sequence Entity Matching for Heterogeneous Entity Resolution",
  "authors": [
   "Hao Nie",
   "Xianpei Han",
   "Ben He",
   "Le Sun",
   "Bo Chen",
   "Wei Zhang",
   "Suhui Wu",
   "Hao Kong"
  ],
  "year": 2019,
  "venue": "Proceedings of the 28th ACM International Conference on Information and Knowledge Management",
  "doi": "10.1145/3357384.3358018",
  "citations": 68,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "A CIKM 2019 paper that applies deep sequence-to-sequence models to entity matching for heterogeneous entity resolution, where matched records do not share a uniform attribute structure. It recasts the comparison of two records as a sequence modeling problem so a learned model can judge them despite differing schemas.",
  "borrow": "The serialization idea — turning heterogeneous records into sequences that one model can compare — is a design option for ERBOT's matching stage when sources refuse to align to a common schema.",
  "fill": "The paper contributes a matching model only: blocking to generate its candidate pairs and clustering of its pairwise decisions are out of scope, and the inference cost of sequence models at very large scale is left open — both are ours to solve in the pipeline.",
  "correct": "The approach depends on labeled training pairs, and its heterogeneity claim is bounded by the benchmark schemas it was tested on, which are milder than truly schema-free web data; transfer to unseen schemas is not established.",
  "verified": true
 },
 {
  "n": 108,
  "id": "er-108",
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
  "n": 109,
  "id": "er-109",
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
  "n": 110,
  "id": "er-110",
  "title": "Schema-Agnostic Entity Matching using Pre-trained Language Models",
  "authors": [
   "Kai-Sheng Teong",
   "Lay-Ki Soon",
   "Tin Tin Su"
  ],
  "year": 2020,
  "venue": "Proceedings of the 29th ACM International Conference on Information &amp; Knowledge Management",
  "doi": "10.1145/3340531.3412131",
  "citations": 16,
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
  "focus": "This CIKM paper presents entity matching with pre-trained language models in a schema-agnostic setting, aiming to match records without requiring their attributes to be aligned to a fixed schema in advance.",
  "borrow": "Schema-agnostic PLM matching is the fallback ERBOT needs when incoming files lack clean attribute alignment: serialise each record as text and let the model compare, instead of failing on schema mismatch.",
  "fill": "The cost question is left open: PLM inference per candidate pair is expensive, so we can work out where schema-agnostic matching pays off against schema-aware pipelines under a fixed compute budget.",
  "correct": "Schema-agnostic claims are typically demonstrated on standard entity-matching benchmarks whose schemas are still fairly regular; genuinely messy sources may break the serialisation assumptions the approach relies on.",
  "verified": true
 },
 {
  "n": 111,
  "id": "er-111",
  "title": "Entity and Relation Matching Consensus for Entity Alignment",
  "authors": [
   "Jinzhu Yang",
   "Ding Wang",
   "Wei Zhou",
   "Wanhui Qian",
   "Xin Wang",
   "Jizhong Han",
   "Songlin Hu"
  ],
  "year": 2021,
  "venue": "Proceedings of the 30th ACM International Conference on Information &amp; Knowledge Management",
  "doi": "10.1145/3459637.3482338",
  "citations": 16,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "supervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "This CIKM paper addresses entity alignment across knowledge graphs by seeking consensus between entity-level matching and relation-level matching, so that the two views of the same alignment problem reinforce each other.",
  "borrow": "The consensus principle transfers to ERBOT: require attribute similarity and relational or contextual evidence to agree before accepting a pair, reducing false matches driven by a single signal.",
  "fill": "The method presumes knowledge graphs with an explicit relation layer; tabular files have none. We can test whether a derived relational view — shared attribute values, co-occurrence structure — delivers the same consensus benefit in plain record linkage.",
  "correct": "Entity alignment assumes two curated knowledge graphs with substantial structural overlap; consensus gains measured there may not survive noisy, schema-heterogeneous sources.",
  "verified": true
 },
 {
  "n": 112,
  "id": "er-112",
  "title": "GNEM: A Generic One-to-Set Neural Entity Matching Framework",
  "authors": [
   "Runjin Chen",
   "Yanyan Shen",
   "Dongxiang Zhang"
  ],
  "year": 2021,
  "venue": "Proceedings of the Web Conference 2021",
  "doi": "10.1145/3442381.3450119",
  "citations": 18,
  "themes": [
   "ml-deep",
   "clustering"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "GNEM is a neural entity matching framework built around one-to-set matching — comparing one record against a set of candidates jointly rather than as isolated pairs — presented at The Web Conference 2021. The record carries no abstract, so its architecture and benchmark results cannot be stated from the metadata.",
  "borrow": "ERBOT can borrow the one-to-set perspective for its classification stage: scoring a record against its whole candidate set lets relative evidence (one strong candidate versus several weak ones) inform the decision, which pairwise classifiers cannot see.",
  "fill": "One-to-set matching is developed for the scoring stage with candidate sets given; how set-based scoring should feed back into clustering — where set membership itself is the output — is unresolved, and closing that loop is work we can attempt.",
  "correct": "Set-based models are sensitive to how candidate sets are constructed, so gains over pairwise baselines may partly reflect the blocking that produced the sets rather than the neural architecture itself.",
  "verified": true
 },
 {
  "n": 113,
  "id": "er-113",
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
  "n": 114,
  "id": "er-114",
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
  "n": 115,
  "id": "er-115",
  "title": "Deep entity matching with adversarial active learning",
  "authors": [
   "Jiacheng Huang",
   "Wei Hu",
   "Zhifeng Bao",
   "Qijin Chen",
   "Yuzhong Qu"
  ],
  "year": 2022,
  "venue": "The VLDB Journal",
  "doi": "10.1007/s00778-022-00745-1",
  "citations": 21,
  "themes": [
   "ml-deep",
   "evaluation"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "This VLDB Journal paper (2022) combines deep entity matching with adversarial active learning, using adversarially chosen examples to guide which pairs get labelled for training. The record carries no abstract, so its datasets and gains cannot be stated from the metadata.",
  "borrow": "ERBOT can borrow the labelling strategy: when training data must be labelled by hand, an active-learning loop that surfaces the pairs the model is most likely to get wrong gives more classifier quality per labelled pair.",
  "fill": "Adversarial selection is developed for the matching stage only; applying the same idea upstream — choosing which blocks or candidate pairs to audit for blocking recall — is untested and is a natural ERBOT extension.",
  "correct": "Actively selected training sets are deliberately unrepresentative, which can distort probability calibration and threshold choice; reported gains in label efficiency should be checked against performance on a naturally distributed test set.",
  "verified": true
 },
 {
  "n": 116,
  "id": "er-116",
  "title": "Degree aware based adversarial graph convolutional networks for entity alignment in heterogeneous knowledge graph",
  "authors": [
   "Hanchen Wang",
   "Yining Wang",
   "Jianfeng Li",
   "Tao Luo"
  ],
  "year": 2022,
  "venue": "Neurocomputing",
  "doi": "10.1016/j.neucom.2022.02.002",
  "citations": 25,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "deep learning",
   "graph-based"
  ],
  "supervision": "supervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "Wang and co-authors propose a degree-aware adversarial graph convolutional network for entity alignment in heterogeneous knowledge graphs, in Neurocomputing (2022): graph convolutional encoders embed entities from two heterogeneous graphs, degree information is incorporated because high- and low-degree entities behave differently, and adversarial training aligns the embedding spaces so counterpart entities land near each other. (Flagged in the report as knowledge-graph entity alignment — adjacent to, but not the same problem as, record linkage; entry included as best effort.)",
  "borrow": "One idea transfers to ERBOT's graph-based clustering: weight evidence by node degree — matches involving rare, low-degree entities are more informative than matches between hubs — when propagating decisions through a relation graph.",
  "fill": "The method presumes seed alignments and two pre-built knowledge graphs; it leaves open the record-linkage setting where no graph exists until we build one from noisy attributes, and where seeds must be bought with labelling effort. We can pick up the bootstrapping question: how few seed links ERBOT needs before adversarial alignment beats plain embedding similarity.",
  "correct": "Adversarial alignment of embedding spaces can align the distributions while mismatching individuals — global space alignment is not per-entity correctness — and results on curated heterogeneous KG benchmarks with supplied seeds overstate performance in seed-scarce deployments.",
  "verified": true
 },
 {
  "n": 117,
  "id": "er-117",
  "title": "LEMON: Explainable Entity Matching",
  "authors": [
   "Nils Barlaug"
  ],
  "year": 2022,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2022.3200644",
  "citations": 14,
  "themes": [
   "ml-deep",
   "evaluation"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "LEMON is a paper on explainable entity matching, providing explanations for why record pairs are classified as matches or non-matches, published in IEEE Transactions on Knowledge and Data Engineering.",
  "borrow": "Explanation output belongs in ERBOT's review workflow: clerical reviewers need reasons, not just scores, so per-pair explanations of the decisive attributes are worth adopting alongside match probabilities.",
  "fill": "It leaves open whether explanations actually improve reviewer accuracy and speed; we can run a small clerical-review comparison with and without explanations to measure the effect.",
  "correct": "Explanations of a black-box matcher can sound plausible without being faithful to the model's actual reasoning, so an explanation method's fidelity itself needs auditing before it earns trust.",
  "verified": true
 },
 {
  "n": 118,
  "id": "er-118",
  "title": "Probing the Robustness of Pre-trained Language Models for Entity Matching",
  "authors": [
   "Mehdi Akbarian Rastaghi",
   "Ehsan Kamalloo",
   "Davood Rafiei"
  ],
  "year": 2022,
  "venue": "Proceedings of the 31st ACM International Conference on Information &amp; Knowledge Management",
  "doi": "10.1145/3511808.3557673",
  "citations": 19,
  "themes": [
   "ml-deep",
   "evaluation"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "textual",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "Rastaghi, Kamalloo, and Rafiei probe the robustness of pre-trained language models for entity matching — testing how PLM-based matchers behave under perturbations and distribution shifts rather than only on clean benchmark splits — presented at CIKM 2022. The record carries no abstract, so the perturbation types and findings cannot be enumerated from the metadata.",
  "borrow": "ERBOT can borrow the robustness-probe methodology for any learned matcher we evaluate: stress tests with typos, missing attributes, and value swaps reveal failure modes that a single F1 score hides.",
  "fill": "Robustness probing diagnoses but does not repair; turning probe results into training-time defences for ER matchers (augmentation or regularisation targeted at the observed failures) is open, and ERBOT's evaluation suite is a place to build it.",
  "correct": "Synthetic perturbations are a proxy for real data dirt, which is structured — OCR confusions, formatting conventions, source-specific abbreviations — so robustness rankings under synthetic noise may not predict rankings on genuinely dirty files.",
  "verified": true
 },
 {
  "n": 119,
  "id": "er-119",
  "title": "Bi-Neighborhood Graph Neural Network for cross-lingual entity alignment",
  "authors": [
   "Xinchen Shi",
   "Bin Li",
   "Ling Chen",
   "Chao Yang"
  ],
  "year": 2023,
  "venue": "Knowledge-Based Systems",
  "doi": "10.1016/j.knosys.2023.110841",
  "citations": 15,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "deep learning",
   "graph-based"
  ],
  "supervision": "supervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper presents a graph neural network for cross-lingual entity alignment that exploits bi-neighbourhood information, aggregating context from the neighbourhoods of entities in both graphs to align entities across languages, published in Knowledge-Based Systems.",
  "borrow": "Neighbourhood aggregation reinforces a lesson ERBOT can use: context beats attributes alone, and shared-neighbour evidence can rescue pairs whose names differ — here across languages, in our case across variant recordings.",
  "fill": "Cross-lingual alignment assumes parallel knowledge graphs; the analogous tabular problem — the same person recorded in two languages or scripts across files — is left open, and we can test neighbourhood-style context features there.",
  "correct": "Alignment benchmarks are dense, curated graphs; gains measured on them may not transfer to the sparse, error-heavy relational data of operational linkage.",
  "verified": true
 },
 {
  "n": 120,
  "id": "er-120",
  "title": "Effective entity matching with transformers",
  "authors": [
   "Yuliang Li",
   "Jinfeng Li",
   "Yoshi Suhara",
   "AnHai Doan",
   "Wang-Chiew Tan"
  ],
  "year": 2023,
  "venue": "The VLDB Journal",
  "doi": "10.1007/s00778-023-00779-z",
  "citations": 45,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This VLDB Journal 2023 paper studies entity matching with transformer models, examining how pre-trained transformer architectures can be applied effectively to the pairwise matching decision. The record carries no abstract, so the description rests on the title and venue: it is a contribution on transformer-based matching, from the group behind the Magellan ecosystem.",
  "borrow": "The borrow for ERBOT is a design reference for the classification stage: how transformer matchers should be configured and where they earn their cost, which informs any decision to add a neural matcher alongside our probabilistic one.",
  "fill": "A matching-stage study leaves the rest of the pipeline open: transformers score pairs that blocking must first surface, and the paper's scope does not cover blocking for transformer matchers or their behaviour under strict compute budgets on very large collections. We can pick up the budget question — where a transformer matcher stops paying for itself inside a full pipeline.",
  "correct": "Transformer matching results are typically reported on the standard small EM benchmarks, where fine-tuned models can exploit dataset-specific regularities; effectiveness there does not establish effectiveness on dirty, heterogeneous, or much larger data, and the compute cost per pair is easy to underweight in such evaluations.",
  "verified": true
 },
 {
  "n": 121,
  "id": "er-121",
  "title": "Entity alignment for temporal knowledge graphs via adaptive graph networks",
  "authors": [
   "Jia Li",
   "Dandan Song",
   "Hao Wang",
   "Zhijing Wu",
   "Changzhi Zhou",
   "Yanru Zhou"
  ],
  "year": 2023,
  "venue": "Knowledge-Based Systems",
  "doi": "10.1016/j.knosys.2023.110631",
  "citations": 15,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "graph-based",
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper addresses entity alignment in temporal knowledge graphs using adaptive graph networks, incorporating time-aware relational structure into the alignment process, published in Knowledge-Based Systems.",
  "borrow": "Time-aware weighting — recent relations counting differently from old ones — is transferable to ERBOT's temporal linkage of people whose attributes drift over time.",
  "fill": "Tabular temporal linkage is left open: how to weight stale versus fresh attribute values when there is no explicit graph. We can port the adaptive-weighting idea to attribute histories in ordinary files.",
  "correct": "Temporal knowledge-graph benchmarks encode time cleanly as timestamped facts; real records carry missing, wrong, and coarse timestamps, which may blunt the adaptive mechanism considerably.",
  "verified": true
 },
 {
  "n": 122,
  "id": "er-122",
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
  "n": 123,
  "id": "er-123",
  "title": "A survey: knowledge graph entity alignment research based on graph embedding",
  "authors": [
   "Beibei Zhu",
   "Ruolin Wang",
   "Junyi Wang",
   "Fei Shao",
   "Kerun Wang"
  ],
  "year": 2024,
  "venue": "Artificial Intelligence Review",
  "doi": "10.1007/s10462-024-10866-4",
  "citations": 31,
  "themes": [
   "ml-deep"
  ],
  "method": [
   "survey",
   "deep learning"
  ],
  "supervision": "n/a",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "Abstract\n                  Entity alignment (EA) aims to automatically match entities in different knowledge graphs, which is beneficial to the development of knowledge-driven applications. Representation learning has powerful feature capture capability and it is widely used in the field of natural language processing. Compared with traditional EA methods, EA methods based on representation learning have better performance and efficiency. Hence, we summarize and analyze the representative EA approaches based on representation learning in this paper. We present the problem description and data preprocessing for EA and other related fundamental knowledge. We propose a new EA framework for the latest models, which includes information aggregation module, entity alignment module, and post-alignment module. Based on these three modules, the various technologies are described in detail. In the experimental part, we first explore the effect of EA direction on model performance. Then, we classify the models into different categories in terms of alignment inference strategy, noise filtering strategy, and whether additional information is utilized. To ensure fairness, we perform the comparative analysis of the performance of the models within the categories separately on different datasets. We investigate both unimodal and multimodal EA. Finally, we present future research perspectives based on the shortcomings of existing EA methods.",
  "focus": "This survey reviews entity alignment between knowledge graphs based on representation learning: matching entities that denote the same object in different knowledge graphs using graph embeddings. It organizes recent models into a framework of information aggregation, entity alignment, and post-alignment modules, compares models by alignment inference and noise-filtering strategies on standard datasets, and covers both unimodal and multimodal alignment. (Flagged in the report as knowledge-graph entity alignment — adjacent to, but not the same problem as, record linkage; entry included as best effort.)",
  "borrow": "The survey's modular decomposition is a useful map for ERBOT's learned components: separate representation (aggregation), decision (alignment), and clean-up (post-alignment) stages, and evaluate each stage's contribution rather than only end-to-end scores.",
  "fill": "By design the survey covers embedding-based alignment of curated knowledge graphs with seed alignments; it leaves open the messy-record setting — typographical errors, missing values, no seed links — that defines record linkage. We can pick up the transfer question: which of these embedding techniques survive contact with dirty tabular records in ERBOT's blocking and matching stages.",
  "correct": "The comparative conclusions rest on the standard small cross-lingual KG benchmarks (such as DBP15K-style datasets) with known train/test seed splits; performance rankings there say little about alignment quality when seed alignments are scarce or the graphs are not parallel constructions of the same source.",
  "verified": true
 },
 {
  "n": 124,
  "id": "er-124",
  "title": "Better entity matching with transformers through ensembles",
  "authors": [
   "Jwen Fai Low",
   "Benjamin C.M. Fung",
   "Pulei Xiong"
  ],
  "year": 2024,
  "venue": "Knowledge-Based Systems",
  "doi": "10.1016/j.knosys.2024.111678",
  "citations": 14,
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
  "focus": "This paper shows that ensembling transformer models improves entity matching over single transformer models, published in Knowledge-Based Systems.",
  "borrow": "An ensemble of transformers is a direct recipe for ERBOT's learned matcher in settings where accuracy matters more than inference cost.",
  "fill": "The cost frontier is left open: how ensemble size trades against latency at the pair volumes that survive blocking. We can chart accuracy gained per ensemble member at ERBOT's operating scale.",
  "correct": "Entity-matching benchmark datasets are small, so ensemble gains measured there may partly reflect variance reduction on tiny test sets rather than robust improvement.",
  "verified": true
 },
 {
  "n": 125,
  "id": "er-125",
  "title": "SETEM: Self-ensemble training with Pre-trained Language Models for Entity Matching",
  "authors": [
   "Huahua Ding",
   "Chaofan Dai",
   "Yahui Wu",
   "Wubin Ma",
   "Haohao Zhou"
  ],
  "year": 2024,
  "venue": "Knowledge-Based Systems",
  "doi": "10.1016/j.knosys.2024.111708",
  "citations": 16,
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
  "focus": "SETEM applies self-ensemble training with pre-trained language models to entity matching, combining multiple model views or predictions to make matching more robust, published in Knowledge-Based Systems.",
  "borrow": "Self-ensembling is a cheap accuracy lever for ERBOT's learned matcher: average predictions across serialisation or prompt variants instead of trusting a single model view.",
  "fill": "It leaves open whether the ensemble premium persists when labels are scarce and domains shift; we can measure the ensemble gain as a function of labelled-set size to find where it stops paying.",
  "correct": "Ensembles multiply inference cost, and gains reported on benchmark matching sets may shrink against a single well-tuned model compared at equal compute.",
  "verified": true
 },
 {
  "n": 126,
  "id": "er-126",
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
  "n": 127,
  "id": "er-127",
  "title": "Relational clustering for multi-type entity resolution",
  "authors": [
   "Indrajit Bhattacharya",
   "Lise Getoor"
  ],
  "year": 2005,
  "venue": "Proceedings of the 4th international workshop on Multi-relational mining  - MRDM '05",
  "doi": "10.1145/1090193.1090195",
  "citations": 33,
  "themes": [
   "clustering"
  ],
  "method": [
   "graph-based",
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "relational",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "Bhattacharya and Getoor present relational clustering for entity resolution over data containing multiple entity types (for example, papers, authors, and venues), where resolving one type informs the resolution of related types. Rather than clustering each type independently, the approach propagates resolution evidence through the relations between entities.",
  "borrow": "ERBOT's clustering stage can borrow the cross-type propagation idea: when linked datasets contain several entity types, feed resolved clusters of one type back as evidence for unresolved clusters of a related type instead of treating each type as a separate problem.",
  "fill": "The approach is demonstrated in a research-publication-style relational setting and leaves open how relational clustering behaves on the flat, single-type, very large record collections that are ERBOT's main case, and how errors in one type's clusters cascade into others at scale. We can pick up the cascade question: measure and bound cross-type error propagation.",
  "correct": "Joint relational inference couples the fate of all entity types: a systematic error in one type (say, venue merging) contaminates every type linked to it, whereas independent per-type resolution localizes errors. The paper's gains depend on the relations being informative rather than noisy.",
  "verified": true
 },
 {
  "n": 128,
  "id": "er-128",
  "title": "Entity Resolution in Graphs",
  "authors": [
   "Indrajit Bhattacharya",
   "Lise Getoor"
  ],
  "year": 2006,
  "venue": "Mining Graph Data",
  "doi": "10.1002/9780470073049.ch13",
  "citations": 42,
  "themes": [
   "clustering"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "This 2006 book chapter by Bhattacharya and Getoor, in the Mining Graph Data volume, presents entity resolution for data represented as graphs: identity decisions for nodes are made collectively, using the relationships among entities as evidence rather than treating each pair independently. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "The collective, graph-based stance is borrowable for ERBOT's clustering stage: where our records carry relational structure, joint resolution over the graph is the principled alternative to independent pairwise classification followed by transitive closure.",
  "fill": "The chapter frames the problem but leaves the scalability and engineering questions open: collective inference over graphs is expensive, and most of ERBOT's target data arrives as flat records from which a graph must first be built. We can pick up both — graph construction from flat records, and collective inference that survives very large collections.",
  "correct": "Collective resolution helps only when the relational evidence is itself reliable; in graphs whose edges are noisy or derived from the same uncertain attributes, joint inference can amplify a single wrong edge into a cluster of wrong merges, a failure mode independent pairwise methods do not have.",
  "verified": true
 },
 {
  "n": 129,
  "id": "er-129",
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
  "n": 130,
  "id": "er-130",
  "title": "D-Swoosh: A Family of Algorithms for Generic, Distributed Entity Resolution",
  "authors": [
   "Omar Benjelloun",
   "Hector Garcia-Molina",
   "Heng Gong",
   "Hideki Kawai",
   "Tait E. Larson",
   "David Menestrina",
   "Sutthipong Thavisomboon"
  ],
  "year": 2007,
  "venue": "27th International Conference on Distributed Computing Systems (ICDCS '07)",
  "doi": "10.1109/icdcs.2007.96",
  "citations": 19,
  "themes": [
   "clustering",
   "scalable"
  ],
  "method": [
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "web scale (>1M)",
  "abstract": "",
  "focus": "D-Swoosh extends the Swoosh family of generic entity resolution algorithms to distributed execution, merging records under match and merge functions while spreading the work across machines, presented at ICDCS 2007. The record carries no abstract, so distribution strategies and speedups cannot be quoted from the metadata.",
  "borrow": "ERBOT can borrow the generic match/merge abstraction and its distributed formulation: defining resolution through match and merge functions keeps the pipeline domain-agnostic, and D-Swoosh shows the abstraction survives parallelisation.",
  "fill": "The distributed design predates modern data-parallel frameworks and learned match functions; re-expressing Swoosh semantics with a learned matcher and contemporary parallel execution in R is unimplemented, and is a concrete ERBOT build task.",
  "correct": "Swoosh-style correctness rests on properties (idempotence, commutativity and related conditions) that real match/merge functions — especially learned ones — may violate, in which case the generic guarantees quietly stop applying.",
  "verified": true
 },
 {
  "n": 131,
  "id": "er-131",
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
  "n": 132,
  "id": "er-132",
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
  "n": 133,
  "id": "er-133",
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
  "n": 134,
  "id": "er-134",
  "title": "Effective self-training author name disambiguation in scholarly digital libraries",
  "authors": [
   "Anderson A. Ferreira",
   "Adriano Veloso",
   "Marcos André Gonçalves",
   "Alberto H.F. Laender"
  ],
  "year": 2010,
  "venue": "Proceedings of the 10th annual joint conference on Digital libraries",
  "doi": "10.1145/1816123.1816130",
  "citations": 50,
  "themes": [
   "clustering",
   "ml-deep"
  ],
  "method": [
   "ML classifier"
  ],
  "supervision": "self-supervised",
  "dataType": "relational",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This JCDL 2010 paper presents a self-training approach to author name disambiguation in scholarly digital libraries: a classifier is bootstrapped from a small amount of confident data and iteratively retrained on its own high-confidence predictions, reducing the need for manually labeled examples. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "Self-training is borrowable for ERBOT's classification stage as a label-economy strategy: seed with a small trusted labeled set (or high-precision rules), then expand training data from confident predictions when a new dataset arrives without labels.",
  "fill": "The paper is scoped to bibliographic data and leaves open the safeguards: how to detect and arrest the error amplification that self-training is prone to, and how the bootstrapping should interact with blocking and clustering rather than pairwise classification alone. We can pick up the guarded version — self-training with drift monitoring inside a full pipeline.",
  "correct": "Self-training results are sensitive to the quality of the initial seed and to the confidence threshold, and reported gains on one digital-library corpus may largely reflect that corpus's name-distribution quirks; the approach can just as plausibly entrench early mistakes as correct them.",
  "verified": true
 },
 {
  "n": 135,
  "id": "er-135",
  "title": "Large-scale collective entity matching",
  "authors": [
   "Vibhor Rastogi",
   "Nilesh Dalvi",
   "Minos Garofalakis"
  ],
  "year": 2011,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/1938545.1938546",
  "citations": 58,
  "themes": [
   "clustering",
   "scalable"
  ],
  "method": [
   "graph-based",
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "There have been several recent advancements in Machine Learning community on the Entity Matching (EM) problem. However, their lack of scalability has prevented them from being applied in practical settings on large real-life datasets. Towards this end, we propose a principled framework to scale any generic EM algorithm. Our technique consists of running multiple instances of the EM algorithm on small\n            neighborhoods\n            of the data and\n            passing messages\n            across neighborhoods to construct a global solution. We prove formal properties of our framework and experimentally demonstrate the effectiveness of our approach in scaling EM algorithms.",
  "focus": "This paper proposes a principled framework for scaling any generic entity matching algorithm to large datasets: the data is partitioned into small neighborhoods, an EM algorithm runs independently on each neighborhood, and messages are passed across neighborhoods to construct a globally consistent solution. The authors prove formal properties of the framework and experimentally demonstrate that it scales EM algorithms that otherwise do not fit practical, large real-life datasets.",
  "borrow": "The neighborhood-plus-message-passing decomposition is directly borrowable for ERBOT's clustering stage: run collective resolution locally within blocks, then reconcile cross-block decisions with explicit messages instead of attempting one global joint inference.",
  "fill": "The framework scales a given EM algorithm but does not itself supply the blocking, similarity, or classification components, and it leaves open how neighborhoods should be formed from blocking output and how reconciliation behaves when the base matcher is probabilistic rather than collective. We can pick up the integration question: couple the message-passing layer to a full blocking-to-clustering pipeline and measure where global consistency actually pays.",
  "correct": "The global solution is only as good as the local matcher's decisions that seed it, and the paper's experiments demonstrate scaling of specific EM algorithms rather than a guarantee that collective quality is preserved at scale; message passing can propagate early local errors across neighborhoods just as easily as it corrects them.",
  "verified": true
 },
 {
  "n": 136,
  "id": "er-136",
  "title": "A brief survey of automatic methods for author name disambiguation",
  "authors": [
   "Anderson A. Ferreira",
   "Marcos André Gonçalves",
   "Alberto H.F. Laender"
  ],
  "year": 2012,
  "venue": "ACM SIGMOD Record",
  "doi": "10.1145/2350036.2350040",
  "citations": 198,
  "themes": [
   "clustering"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Name ambiguity in the context of bibliographic citation records is a hard problem that affects the quality of services and content in digital libraries and similar systems. The challenges of dealing with author name ambiguity have led to a myriad of disambiguation methods. Generally speaking, the proposed methods usually attempt to group citation records of a same author by finding some similarity among them or try to directly assign them to their respective authors. Both approaches may either exploit supervised or unsupervised techniques. In this article, we propose a taxonomy for characterizing the current author name disambiguation methods described in the literature, present a brief survey of the most representative ones and discuss several open challenges.",
  "focus": "This survey addresses name ambiguity in bibliographic citation records, where the same name string can refer to many authors and one author can appear under several name forms. It proposes a taxonomy for characterizing author name disambiguation methods — which either group citation records by similarity or assign them directly to authors, using supervised or unsupervised techniques — surveys the most representative methods, and discusses open challenges.",
  "borrow": "The taxonomy's dimensions (features exploited, supervised versus unsupervised, grouping versus assignment) give ERBOT a structured way to lay out its clustering-stage options for name-heavy files such as bibliographic linkage.",
  "fill": "As a survey it characterizes methods without re-running them on shared data, and the challenges it lists, including scalability and keeping disambiguation current as new records arrive, are left for implementers; an evaluated, incremental disambiguation path in an R pipeline is still ours to build.",
  "correct": "It is explicitly a brief survey of representative methods, so coverage is selective; and its taxonomy reflects the pre-embedding era, so newer representation-based disambiguation does not fit its categories cleanly.",
  "verified": true
 },
 {
  "n": 137,
  "id": "er-137",
  "title": "Adaptive Temporal Entity Resolution on Dynamic Databases",
  "authors": [
   "Peter Christen",
   "Ross W. Gayler"
  ],
  "year": 2013,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/978-3-642-37456-2_47",
  "citations": 15,
  "themes": [
   "clustering"
  ],
  "method": [
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper addresses entity resolution on dynamic databases whose records change over time, adapting the resolution process to temporal change rather than treating each database snapshot as static, published in Lecture Notes in Computer Science.",
  "borrow": "The adaptive stance — linkage decisions and parameters that respond to how the data evolves — is the design principle for ERBOT's repeated linkage of updating registers such as electoral or patient rolls.",
  "fill": "Principled evaluation is left open: temporal ER lacks standard benchmarks with ground-truth entity evolution. We can build a versioned test harness that tracks the same entities across snapshots and scores linkage at each point in time.",
  "correct": "Adaptation tuned to one database's gradual change patterns may misfire where change is abrupt — mergers, re-registrations, system migrations — rather than gradual drift.",
  "verified": true
 },
 {
  "n": 138,
  "id": "er-138",
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
  "n": 139,
  "id": "er-139",
  "title": "A Graph Matching Method for Historical Census Household Linkage",
  "authors": [
   "Zhichun Fu",
   "Peter Christen",
   "Jun Zhou"
  ],
  "year": 2014,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/978-3-319-06608-0_40",
  "citations": 18,
  "themes": [
   "clustering",
   "probabilistic"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "relational",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "Fu, Christen, and Zhou present a graph matching method for linking households across historical censuses, using the relationships among household members as evidence for whether two households are the same (2014). The record carries no abstract, so the graph construction and accuracy results cannot be detailed from the metadata.",
  "borrow": "ERBOT can borrow relational evidence at the household level: when records describe groups (households, families, organisations), matching the group structure can resolve individuals whose own attributes are too common or too corrupted to link alone.",
  "fill": "The method is built for census households with stable membership structure; extending group-aware linkage to messier groupings — workplaces, shared addresses, co-authorships — with partial and changing membership is open, and ERBOT can generalise its clustering stage in that direction.",
  "correct": "Household linkage leans on the assumption that households persist recognisably between censuses; migration, remarriage, and household splitting violate it, so accuracy on stable populations overstates performance on mobile ones.",
  "verified": true
 },
 {
  "n": 140,
  "id": "er-140",
  "title": "Exploiting citation networks for large-scale author name disambiguation",
  "authors": [
   "Christian Schulz",
   "Amin Mazloumian",
   "Alexander M Petersen",
   "Orion Penner",
   "Dirk Helbing"
  ],
  "year": 2014,
  "venue": "EPJ Data Science",
  "doi": "10.1140/epjds/s13688-014-0011-3",
  "citations": 51,
  "themes": [
   "clustering",
   "scalable"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "relational",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This EPJ Data Science 2014 paper tackles author name disambiguation at large scale by exploiting citation networks: instead of relying only on publication attributes, it uses the structure of who cites whom as evidence for deciding which papers belong to the same author. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "The borrow for ERBOT is the evidence principle: relational structure around records (citations here; shared attributes or co-occurrence in our data) can disambiguate cases that attribute similarity alone cannot separate, and it can be added as features at the clustering stage.",
  "fill": "The method is specific to scholarly data with a usable citation graph; it leaves open how the same network-exploits transfer to linkage problems where the relational graph is sparse, noisy, or itself must be constructed from the records being linked. We can pick up the transfer question for non-bibliographic data.",
  "correct": "Citation-network evidence is unevenly available — prolific, well-cited authors generate rich networks while newcomers and low-citation fields do not — so aggregate disambiguation accuracy can hide systematic failure on exactly the sparse cases, and evaluation on one bibliographic corpus does not establish the large-scale claim generally.",
  "verified": true
 },
 {
  "n": 141,
  "id": "er-141",
  "title": "Holistic entity matching across knowledge graphs",
  "authors": [
   "Maria Pershina",
   "Mohamed Yakout",
   "Kaushik Chakrabarti"
  ],
  "year": 2015,
  "venue": "2015 IEEE International Conference on Big Data (Big Data)",
  "doi": "10.1109/bigdata.2015.7363924",
  "citations": 26,
  "themes": [
   "clustering"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "Pershina, Yakout, and Chakrabarti present holistic entity matching across knowledge graphs: instead of matching each entity pair in isolation, the approach considers the matching problem globally across the graphs, letting neighbourhood and consistency evidence influence individual match decisions. It appears in the 2015 IEEE International Conference on Big Data.",
  "borrow": "ERBOT can borrow the global-consistency stance at its clustering stage: after pairwise scoring, run a collective pass that lets strong matches support or veto neighbouring decisions, rather than accepting every above-threshold pair independently.",
  "fill": "The method is framed for knowledge graphs with rich relational structure; it leaves open how much of the holistic gain survives on flat tabular records where neighbourhoods are thin or absent, and what the global optimization costs at record-linkage scale. We can pick up both questions by porting a consistency pass into ERBOT and measuring its marginal value per data type.",
  "correct": "Global matching propagates errors as efficiently as it propagates evidence: one wrong high-confidence match can pull its neighbourhood into false merges, so holistic methods need error-containment mechanisms that pairwise methods do not.",
  "verified": true
 },
 {
  "n": 142,
  "id": "er-142",
  "title": "Efficient Record Linkage Algorithms Using Complete Linkage Clustering",
  "authors": [
   "Abdullah-Al Mamun",
   "Robert Aseltine",
   "Sanguthevar Rajasekaran"
  ],
  "year": 2016,
  "venue": "PLOS ONE",
  "doi": "10.1371/journal.pone.0154446",
  "citations": 27,
  "themes": [
   "clustering",
   "scalable"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Mamun, Aseltine, and Rajasekaran present record linkage algorithms built on complete linkage clustering, in PLOS ONE: pairwise record similarities are computed and records are grouped with a complete-linkage criterion, which requires every pair within a cluster to be sufficiently similar, favouring tight, conservative clusters. The emphasis is on making this clustering-based linkage computationally efficient.",
  "borrow": "ERBOT's clustering stage can borrow complete linkage as the conservative option: when false merges are costlier than missed links (health and administrative data), complete-linkage clusters give a defensible, precision-first default to contrast with transitive closure.",
  "fill": "Complete linkage is only as good as the pairwise similarity feeding it, and the paper leaves open how the approach interacts with the blocking stage at very large scale — cluster quality and runtime when candidate pairs number in the hundreds of millions. We can pick that up by stress-testing complete linkage behind ERBOT's production blocking.",
  "correct": "Complete linkage's tightness is also its fragility: one noisy record with mediocre similarity to all others can block a legitimate merge or force a cluster split, so its precision advantage depends on similarity scores being uniformly reliable across the dataset.",
  "verified": true
 },
 {
  "n": 143,
  "id": "er-143",
  "title": "A survey of author name disambiguation techniques: 2010–2016",
  "authors": [
   "Ijaz Hussain",
   "Sohail Asghar"
  ],
  "year": 2017,
  "venue": "The Knowledge Engineering Review",
  "doi": "10.1017/s0269888917000182",
  "citations": 53,
  "themes": [
   "clustering",
   "ml-deep"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "Abstract\n                  Digital libraries content and quality of services are badly affected by the author name ambiguity problem in the citations and it is considered as one of the hardest problems faced by the digital library researchers. Several techniques have been proposed in the literature for the author name ambiguity problem. In this paper, we reviewed some recently presented author name disambiguation techniques and give some challenges and future research directions. We analyze the recent advancements in this field and classify these techniques into supervised, unsupervised, semi-supervised, graph-based and heuristic-based techniques according to their problem formulation that is mainly used for the author name disambiguation. A few surveys have been conducted to review different techniques for the author name disambiguation. These surveys highlighted only the methodology adopted for author name disambiguation but did not critically review their shortcomings. This survey provides a detailed review of author name disambiguation techniques available in the literature, makes a comparison of these techniques at an abstract level and discusses their limitations.",
  "focus": "This survey reviews author name disambiguation techniques published between 2010 and 2016, a core entity-resolution problem in digital libraries where the same name string may denote many authors and one author may appear under many name variants. It classifies techniques as supervised, unsupervised, semi-supervised, graph-based, and heuristic-based, compares them at an abstract level, and — unlike earlier surveys — critically discusses their limitations and open challenges.",
  "borrow": "The classification scheme and the limitation analysis are borrowable as a checklist for ERBOT's own design space: author disambiguation is clustering-heavy ER, and the survey's taxonomy of supervision regimes maps onto choices we face for any new dataset.",
  "fill": "The survey's window closes in 2016, so it leaves the entire embedding- and LLM-era of disambiguation unmapped, and its comparisons are at an abstract level rather than on shared benchmarks. We can pick up both leftovers for our own reading: a post-2016 update of the taxonomy and head-to-head evaluation of representative methods on common data.",
  "correct": "A survey that compares techniques 'at an abstract level' cannot support ranking claims, and its classification by problem formulation can make methods look more distinct than they are in implementation; its challenge list should be read as an agenda, not as evidence about which techniques actually fail where.",
  "verified": true
 },
 {
  "n": 144,
  "id": "er-144",
  "title": "Incremental Multi-source Entity Resolution for Knowledge Graph Completion",
  "authors": [
   "Alieh Saeedi",
   "Eric Peukert",
   "Erhard Rahm"
  ],
  "year": 2020,
  "venue": "Lecture Notes in Computer Science",
  "doi": "10.1007/978-3-030-49461-2_23",
  "citations": 20,
  "themes": [
   "clustering",
   "scalable"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "Saeedi, Peukert, and Rahm address incremental entity resolution across multiple sources in the service of knowledge graph completion — integrating new data into an existing graph without resolving everything from scratch (2020). The record carries no abstract, so the incremental algorithm and evaluation cannot be detailed from the metadata.",
  "borrow": "ERBOT can borrow the incremental stance: production linkage is usually a new file arriving against an existing resolved collection, and designing match/merge steps that update prior decisions cheaply is more useful than another batch algorithm.",
  "fill": "Incremental methods must live with their early mistakes; how errors committed in early increments are detected and repaired later is under-treated in this line of work, and building correction passes into ERBOT's incremental mode is open work.",
  "correct": "Incremental results depend on arrival order and on the quality of the initial resolution, so comparisons against batch methods can flatter the incremental approach when the starting graph is already clean.",
  "verified": true
 },
 {
  "n": 145,
  "id": "er-145",
  "title": "Unsupervised Graph-Based Entity Resolution for Complex Entities",
  "authors": [
   "Nishadi Kirielle",
   "Peter Christen",
   "Thilina Ranbaduge"
  ],
  "year": 2023,
  "venue": "ACM Transactions on Knowledge Discovery from Data",
  "doi": "10.1145/3533016",
  "citations": 18,
  "themes": [
   "clustering"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "Entity resolution (ER) is the process of linking records that refer to the same entity. Traditionally, this process compares attribute values of records to calculate similarities and then classifies pairs of records as referring to the same entity or not based on these similarities. Recently developed graph-based ER approaches combine relationships between records with attribute similarities to improve linkage quality. Most of these approaches only consider databases containing\n            basic entities\n            that have static attribute values and static relationships, such as publications in bibliographic databases. In contrast, temporal record linkage addresses the problem where attribute values of entities can change over time. However, neither existing graph-based ER nor temporal record linkage can achieve high linkage quality on databases with\n            complex entities\n            , where an entity (such as a person) can change its attribute values over time while having different relationships with other entities at different points in time. In this article, we propose an unsupervised graph-based ER framework that is aimed at linking records of complex entities. Our framework provides five key contributions. First, we propagate positive evidence encountered when linking records to use in subsequent links by propagating attribute values that have changed. Second, we employ negative evidence by applying temporal and link constraints to restrict which candidate record pairs to consider for linking. Third, we leverage the ambiguity of attribute values to disambiguate similar records that, however, belong to different entities. Fourth, we adaptively exploit the structure of relationships to link records that have different relationships. Fifth, using graph measures, we refine matched clusters of records by removing likely wrong links between records. We conduct extensive experiments on seven real-world datasets from different domains showing that on average our unsupervised graph-based ER framework can improve precision by up to 25% and recall by up to 29% compared to several state-of-the-art ER techniques.",
  "focus": "The paper proposes an unsupervised graph-based entity resolution framework for complex entities — entities whose attribute values and relationships change over time, which neither static graph-based ER nor temporal record linkage handles well. The framework propagates positive evidence by carrying changed attribute values into later decisions, applies negative evidence through temporal and link constraints, exploits attribute-value ambiguity to separate similar records of different entities, adapts its use of relationship structure, and refines matched clusters with graph measures. On seven real-world datasets it improves precision by up to 25% and recall by up to 29% over several state-of-the-art techniques.",
  "borrow": "The evidence machinery transfers directly to ERBOT's clustering stage for person data that changes over time: propagate confirmed attribute changes as positive evidence, and use temporal and link constraints as negative evidence to prune candidate pairs.",
  "fill": "The framework is not aimed at very large scale; we can test whether its propagation and cluster-refinement steps survive million-record inputs, and find where their cost or error propagation breaks down.",
  "correct": "The headline gains are 'up to' figures — best cases across baselines and datasets — and the method leans on relationships being present and informative, which many real linkage files do not provide.",
  "verified": true
 },
 {
  "n": 146,
  "id": "er-146",
  "title": "Comparative evaluation of entity resolution approaches with FEVER",
  "authors": [
   "Hanna Köpcke",
   "Andreas Thor",
   "Erhard Rahm"
  ],
  "year": 2009,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/1687553.1687595",
  "citations": 28,
  "themes": [
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "We present FEVER, a new evaluation platform for entity resolution approaches. The modular structure of the FEVER framework supports the incorporation or reconstruction of many previously proposed approaches for entity resolution. A distinctive feature of FEVER is that it not only evaluates traditional measures such as precision and recall but also the effort for configuring (e.g., parameter tuning, training) a good entity resolution approach. FEVER thus strives for a fair comparative evaluation of different approaches by considering both the effectiveness and configuration effort.",
  "focus": "Köpcke, Thor, and Rahm present FEVER, an evaluation platform for entity resolution whose modular structure lets many previously proposed ER approaches be incorporated or reconstructed and compared in one framework. Distinctively, FEVER measures not only precision and recall but also configuration effort — parameter tuning and training — arguing that a fair comparison must price the effort needed to make each approach perform well.",
  "borrow": "ERBOT should adopt FEVER's central discipline: report configuration effort (tuning runs, labelled pairs consumed, wall-clock setup) alongside precision/recall for every method we compare, so cheap-to-configure methods get credit against marginally better but tuning-hungry ones.",
  "fill": "FEVER's reconstructed approaches and datasets are those of its period — pre-deep-learning matchers and modest benchmark sizes; it leaves open how the effort accounting extends to learned and LLM-based matchers, where 'configuration' includes prompt design and training-data curation. We can pick that up by extending effort accounting to ERBOT's learned stages.",
  "correct": "Reconstructing other people's approaches inside one framework risks comparing FEVER's reimplementations rather than the originals; where a reconstruction underperforms, the gap may be implementation fidelity, not the published method.",
  "verified": true
 },
 {
  "n": 147,
  "id": "er-147",
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
  "n": 148,
  "id": "er-148",
  "title": "Evaluation of entity resolution approaches on real-world match problems",
  "authors": [
   "Hanna Köpcke",
   "Andreas Thor",
   "Erhard Rahm"
  ],
  "year": 2010,
  "venue": "Proceedings of the VLDB Endowment",
  "doi": "10.14778/1920841.1920904",
  "citations": 304,
  "themes": [
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "Despite the huge amount of recent research efforts on entity resolution (matching) there has not yet been a comparative evaluation on the relative effectiveness and efficiency of alternate approaches. We therefore present such an evaluation of existing implementations on challenging real-world match tasks. We consider approaches both with and without using machine learning to find suitable parameterization and combination of similarity functions. In addition to approaches from the research community we also consider a state-of-the-art commercial entity resolution implementation. Our results indicate significant quality and efficiency differences between different approaches. We also find that some challenging resolution tasks such as matching product entities from online shops are not sufficiently solved with conventional approaches based on the similarity of attribute values.",
  "focus": "The paper presents a comparative evaluation of existing entity resolution implementations on challenging real-world match tasks, covering approaches with and without machine learning for parameterization and similarity combination, plus a state-of-the-art commercial system. It finds significant quality and efficiency differences between approaches, and that some tasks, such as matching product entities from online shops, are not sufficiently solved by conventional attribute-similarity approaches.",
  "borrow": "Its evaluation protocol — the same real-world tasks, quality and efficiency reported side by side — is the template for ERBOT's evaluation stage, and its product-matching failure is a standing warning about where plain attribute similarity breaks.",
  "fill": "The study is a 2010 snapshot: none of the evaluated systems use learned representations, and the product-matching task it flags as unsolved is left open. Re-running its task suite with modern matchers and embedding similarity inside ERBOT is work we can still do.",
  "correct": "The conclusions are tied to the specific implementations and parameterizations tested; the verdict on conventional approaches reflects 2010-era tooling and tuning effort, not a permanent property of similarity-based matching.",
  "verified": true
 },
 {
  "n": 149,
  "id": "er-149",
  "title": "Frameworks for entity matching: A comparison",
  "authors": [
   "Hanna Köpcke",
   "Erhard Rahm"
  ],
  "year": 2010,
  "venue": "Data &amp; Knowledge Engineering",
  "doi": "10.1016/j.datak.2009.10.003",
  "citations": 290,
  "themes": [
   "evaluation"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "n/a",
  "abstract": "",
  "focus": "A comparison of frameworks for entity matching, published in Data & Knowledge Engineering in 2010. It surveys and contrasts the entity matching systems and research frameworks of its period along their features and workflow support.",
  "borrow": "The comparison criteria — which workflow steps a framework supports, from blocking to matching to evaluation — work as a checklist for positioning ERBOT/SandX and for spotting pipeline stages we have not yet built.",
  "fill": "The compared frameworks predate learned matching and modern scalable execution, so the comparison leaves open how an R-based, embedding-aware pipeline should be structured; updating the framework map is unfinished work we can take up.",
  "correct": "Framework comparisons rest largely on feature checklists, and the companion evaluation study showed feature coverage does not predict matching quality; a framework that ticks more boxes is not thereby the better matcher.",
  "verified": true
 },
 {
  "n": 150,
  "id": "er-150",
  "title": "The Data Matching Process",
  "authors": [
   "Peter Christen"
  ],
  "year": 2012,
  "venue": "Data Matching",
  "doi": "10.1007/978-3-642-31164-2_2",
  "citations": 37,
  "themes": [
   "evaluation",
   "blocking"
  ],
  "method": [
   "survey",
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This is the process chapter of Peter Christen's 2012 book Data Matching, laying out the steps of a data matching project end to end: from data preparation and indexing through comparison, classification, and evaluation of matching quality. The record carries no abstract, so the description rests on the title and the book it belongs to.",
  "borrow": "The chapter's process decomposition is the closest published analogue to ERBOT's own pipeline structure — blocking, comparison, classification, evaluation as distinct stages with distinct quality questions — and is borrowable as the reference checklist against which our stage boundaries and evaluation points are set.",
  "fill": "A 2012 process account predates learned blocking, deep matching, and LLM-based methods, so it leaves open how the process changes when stages are learned rather than configured: where training data comes from, and how stage-wise evaluation works when errors are correlated across learned stages. We can pick up the updated process description as part of ERBOT's documentation.",
  "correct": "The staged process presentation can make the pipeline look more separable than it is: in practice blocking choices constrain everything downstream, and a process description should not be read as evidence that stages can be optimized independently.",
  "verified": true
 },
 {
  "n": 151,
  "id": "er-151",
  "title": "Better duplicate detection for systematic reviewers: evaluation of Systematic Review Assistant-Deduplication Module",
  "authors": [
   "John Rathbone",
   "Matt Carter",
   "Tammy Hoffmann",
   "Paul Glasziou"
  ],
  "year": 2015,
  "venue": "Systematic Reviews",
  "doi": "10.1186/2046-4053-4-6",
  "citations": 149,
  "themes": [
   "evaluation",
   "similarity"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "An evaluation, published in Systematic Reviews in 2015, of the Systematic Review Assistant–Deduplication Module, a tool that detects duplicate citation records in the reference sets assembled for systematic reviews. The study assesses how well the module's duplicate detection performs for that workflow.",
  "borrow": "Systematic-review citation sets are a clean, realistic deduplication test bed with known duplicates; the evaluation setup is reusable as a test corpus for ERBOT's deduplication settings on bibliographic records.",
  "fill": "The evaluation covers a single tool in a single domain. It leaves open how the module compares with general-purpose deduplication algorithms, and what to do when records come from several databases with different export formats — a cross-tool benchmark we can still run.",
  "correct": "Performance measured on review citation sets, whose duplicates are mostly near-identical records from a handful of databases, may not generalize to dirtier multi-source linkage where duplicates differ much more.",
  "verified": true
 },
 {
  "n": 152,
  "id": "er-152",
  "title": "Bias in data linkage studies",
  "authors": [
   "Megan Bohensky"
  ],
  "year": 2015,
  "venue": "Wiley Series in Probability and Statistics",
  "doi": "10.1002/9781119072454.ch4",
  "citations": 16,
  "themes": [
   "evaluation",
   "probabilistic"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This book chapter examines how errors made during data linkage introduce bias into the studies built on the linked data, published in the Wiley Series in Probability and Statistics. It addresses the consequences of false matches and missed matches for downstream statistical conclusions.",
  "borrow": "Its bias framing belongs in ERBOT's evaluation stage: report not only precision and recall but how the residual linkage error could bias the estimates a study computes from the linked file.",
  "fill": "The operational side is left open — how a linkage team should set match thresholds given a downstream bias budget. We can turn bias analysis into an explicit threshold-setting rule tied to the analysis the linked data will feed.",
  "correct": "The chapter is written for health and epidemiological linkage studies; bias magnitudes depend on the study design, so its warnings do not translate into universal error tolerances for all linkage applications.",
  "verified": true
 },
 {
  "n": 153,
  "id": "er-153",
  "title": "Cost-Effective Crowdsourced Entity Resolution",
  "authors": [
   "Chengliang Chai",
   "Guoliang Li",
   "Jian Li",
   "Dong Deng",
   "Jianhua Feng"
  ],
  "year": 2016,
  "venue": "Proceedings of the 2016 International Conference on Management of Data",
  "doi": "10.1145/2882903.2915252",
  "citations": 80,
  "themes": [
   "evaluation"
  ],
  "method": [
   "system"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "A SIGMOD 2016 paper on crowdsourced entity resolution: using paid crowd workers to resolve the pairs that automated methods cannot decide, while controlling the total cost of doing so. The contribution is framed around achieving resolution quality cost-effectively rather than crowdsourcing every uncertain pair.",
  "borrow": "The pair-selection principle transfers directly: ERBOT can maintain a verification queue ranked by expected value per review, sending only the most informative uncertain pairs to expensive human checking instead of reviewing at random.",
  "fill": "The work assumes a paid crowd platform with per-question pricing of its period; it does not cover expert reviewers, modern LLM-as-reviewer variants, or how crowd verdicts should feed back into automated clustering — all open for our pipeline design.",
  "correct": "Cost-effectiveness is computed against assumptions about crowd accuracy and pricing; noisy or adversarial workers, or tasks needing domain expertise, break the cost model that makes the approach look attractive.",
  "verified": true
 },
 {
  "n": 154,
  "id": "er-154",
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
  "n": 155,
  "id": "er-155",
  "title": "A Comprehensive Benchmark Framework for Active Learning Methods in Entity Matching",
  "authors": [
   "Venkata Vamsikrishna Meduri",
   "Lucian Popa",
   "Prithviraj Sen",
   "Mohamed Sarwat"
  ],
  "year": 2020,
  "venue": "Proceedings of the 2020 ACM SIGMOD International Conference on Management of Data",
  "doi": "10.1145/3318464.3380597",
  "citations": 50,
  "themes": [
   "evaluation",
   "ml-deep"
  ],
  "method": [
   "benchmark",
   "ML classifier"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "This SIGMOD 2020 paper provides a comprehensive benchmark framework for comparing active learning methods in entity matching: because published active learning results use incompatible setups, the framework standardizes the experimental conditions under which sampling strategies for labeling matching pairs are evaluated. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "The framework is directly borrowable for ERBOT's evaluation practice: if we adopt active sampling for building training data, this is the reference protocol for comparing sampling strategies fairly instead of trusting each paper's home-grown setup.",
  "fill": "A benchmark framework standardizes comparison but does not settle which strategy to deploy inside a live pipeline where blocking, class imbalance, and labeler cost interact; it also predates LLM-based matchers whose labeling economics differ. We can pick up the deployment question and the extension of the benchmark to modern matchers.",
  "correct": "Benchmark conclusions depend on the datasets and matchers the framework ships with; a strategy ranking established on standard EM benchmarks may invert on data with different match prevalence, so the framework's findings should be treated as conditional, not as a universal verdict on active learning methods.",
  "verified": true
 },
 {
  "n": 156,
  "id": "er-156",
  "title": "Profiling Entity Matching Benchmark Tasks",
  "authors": [
   "Anna Primpeli",
   "Christian Bizer"
  ],
  "year": 2020,
  "venue": "Proceedings of the 29th ACM International Conference on Information &amp; Knowledge Management",
  "doi": "10.1145/3340531.3412781",
  "citations": 20,
  "themes": [
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "small benchmark",
  "abstract": "",
  "focus": "Primpeli and Bizer profile entity matching benchmark tasks, examining what the standard benchmark datasets actually contain and how task characteristics differ across them, presented at CIKM 2020. The record carries no abstract, so the profiling dimensions and findings cannot be enumerated from the metadata.",
  "borrow": "ERBOT can borrow benchmark profiling as a routine: before reporting results on any dataset, profile its size, attribute quality, and duplicate structure so that numbers are interpreted against what the task actually demands.",
  "fill": "Profiling describes existing benchmarks but does not fix their coverage gaps — very large files, heavy noise, and non-English names remain under-represented; building benchmark tasks that cover those regimes is work we can contribute.",
  "correct": "A profile is only as current as the benchmark suite it examines; as new datasets appear, profiling conclusions about 'typical' EM tasks age quickly and should not be treated as permanent facts about the field.",
  "verified": true
 },
 {
  "n": 157,
  "id": "er-157",
  "title": "ORCID-linked labeled data for evaluating author name disambiguation at scale",
  "authors": [
   "Jinseok Kim",
   "Jason Owen-Smith"
  ],
  "year": 2021,
  "venue": "Scientometrics",
  "doi": "10.1007/s11192-020-03826-6",
  "citations": 28,
  "themes": [
   "evaluation",
   "clustering"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "web scale (>1M)",
  "abstract": "AbstractHow can we evaluate the performance of a disambiguation method implemented on big bibliographic data? This study suggests that the open researcher profile system, ORCID, can be used as an authority source to label name instances at scale. This study demonstrates the potential by evaluating the disambiguation performances of Author-ity2009 (which algorithmically disambiguates author names in MEDLINE) using 3 million name instances that are automatically labeled through linkage to 5 million ORCID researcher profiles. Results show that although ORCID-linked labeled data do not effectively represent the population of name instances in Author-ity2009, they do effectively capture the ‘high precision over high recall’ performances of Author-ity2009. In addition, ORCID-linked labeled data can provide nuanced details about the Author-ity2009’s performance when name instances are evaluated within and across ethnicity categories. As ORCID continues to be expanded to include more researchers, labeled data via ORCID-linkage can be improved in representing the population of a whole disambiguated data and updated on a regular basis. This can benefit author name disambiguation researchers and practitioners who need large-scale labeled data but lack resources for manual labeling or access to other authority sources for linkage-based labeling. The ORCID-linked labeled data for Author-ity2009 are publicly available for validation and reuse.",
  "focus": "Kim and Owen-Smith show that ORCID, the open researcher profile system, can serve as an authority source to label author name instances at scale for evaluating name disambiguation. Linking 3 million name instances in the Author-ity2009 disambiguation of MEDLINE against 5 million ORCID profiles, they find the ORCID-linked labels capture Author-ity2009's high-precision-over-recall behaviour and reveal performance differences within and across ethnicity categories, while not fully representing the whole population of name instances; the labelled data are publicly released.",
  "borrow": "ERBOT can borrow the labelling strategy: where an external authority file exists (ORCID for authors, business registries for organizations), link against it to manufacture large evaluation sets instead of hand-labelling, and use the released ORCID-linked data as a ready-made large-scale clustering benchmark.",
  "fill": "The authors themselves note the ORCID-linked subset does not represent the full population of name instances — ORCID registrants are a self-selected slice. That leaves open how to correct evaluation estimates for this selection bias, which we can pick up: weight or stratify ORCID-based evaluations when ERBOT reports disambiguation quality.",
  "correct": "Because the labels come from linkage to ORCID, evaluation partly measures agreement between two linkage processes; names that ORCID linkage itself gets wrong become wrong ground truth, so the method's ceiling is set by the quality of the ORCID matching it depends on.",
  "verified": true
 },
 {
  "n": 158,
  "id": "er-158",
  "title": "S2AND: A Benchmark and Evaluation System for Author Name Disambiguation",
  "authors": [
   "Shivashankar Subramanian",
   "Daniel King",
   "Doug Downey",
   "Sergey Feldman"
  ],
  "year": 2021,
  "venue": "2021 ACM/IEEE Joint Conference on Digital Libraries (JCDL)",
  "doi": "10.1109/jcdl52503.2021.00029",
  "citations": 23,
  "themes": [
   "evaluation",
   "clustering"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "supervised",
  "dataType": "relational",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "S2AND provides a benchmark and evaluation system for author name disambiguation — deciding which papers in a scholarly corpus belong to the same person — presented at JCDL 2021. The record carries no abstract, so dataset sizes and baseline results cannot be stated from the metadata.",
  "borrow": "ERBOT can borrow the benchmark discipline: a fixed, public disambiguation task with a standard evaluation harness is a model for how we should package our own test collections so results are comparable across pipeline versions.",
  "fill": "Author disambiguation benchmarks are built on scholarly metadata with rich signals (venues, co-authors, affiliations); a comparable public benchmark for plain person records without that metadata is still missing, and ERBOT's evaluation suite could supply one.",
  "correct": "Strong results on bibliographic data may not transfer: author records carry unusually informative relational signals, so benchmark rankings here should not be read as rankings for general record linkage.",
  "verified": true
 },
 {
  "n": 159,
  "id": "er-159",
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
  "n": 160,
  "id": "er-160",
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
  "n": 161,
  "id": "er-161",
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
  "n": 162,
  "id": "er-162",
  "title": "Scalable and distributed methods for entity matching, consolidation and disambiguation over linked data corpora",
  "authors": [
   "Aidan Hogan",
   "Antoine Zimmermann",
   "Jürgen Umbrich",
   "Axel Polleres",
   "Stefan Decker"
  ],
  "year": 2012,
  "venue": "Journal of Web Semantics",
  "doi": "10.1016/j.websem.2011.11.002",
  "citations": 60,
  "themes": [
   "scalable",
   "similarity"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "A Journal of Web Semantics paper (2012) on scalable, distributed methods for entity matching, consolidation, and disambiguation over linked data corpora, where entities are described in RDF and interlinked across sources. It treats the three tasks together as a distributed workflow over web-scale linked data.",
  "borrow": "Treating matching, consolidation, and disambiguation as one distributed workflow is a template for ERBOT runs where entities carry links as well as attributes: the stages share candidate generation instead of being bolted together afterwards.",
  "fill": "The linked-data setting presumes RDF data and link specifications; plain tabular files without URIs or a graph structure get nothing directly. Porting its distribution strategy to ordinary record files is open work for us.",
  "correct": "Matching quality in this setting hinges on hand-written link specifications, so the scalability story does not remove the specification bottleneck; and its evidence comes from linked-data benchmarks of the period, not from general record linkage.",
  "verified": true
 },
 {
  "n": 163,
  "id": "er-163",
  "title": "Entity resolution for big data",
  "authors": [
   "Lise Getoor",
   "Ashwin Machanavajjhala"
  ],
  "year": 2013,
  "venue": "Proceedings of the 19th ACM SIGKDD international conference on Knowledge discovery and data mining",
  "doi": "10.1145/2487575.2506179",
  "citations": 66,
  "themes": [
   "scalable",
   "clustering"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "",
  "focus": "This KDD 2013 paper presents entity resolution for big data, surveying the challenges that arise when resolving entities at large scale and the techniques developed to meet them.",
  "borrow": "Its framing of ER as a graph and clustering problem over noisy pairwise evidence remains a useful mental model for ERBOT's clustering stage.",
  "fill": "A 2013 big-data view predates embeddings and large language models; we can re-examine which of its scalability bottlenecks modern approximate-nearest-neighbour blocking actually removed.",
  "correct": "Tutorial-style breadth means shallow treatment of evaluation, and its optimism about scaling out should be checked against the recall losses that distributed blocking incurs in practice.",
  "verified": true
 },
 {
  "n": 164,
  "id": "er-164",
  "title": "Incremental entity resolution on rules and data",
  "authors": [
   "Steven Euijong Whang",
   "Hector Garcia-Molina"
  ],
  "year": 2013,
  "venue": "The VLDB Journal",
  "doi": "10.1007/s00778-013-0315-0",
  "citations": 35,
  "themes": [
   "scalable"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This VLDB Journal paper studies incremental entity resolution: when the underlying data changes, or when the matching rules themselves are revised, previously computed resolution results should be updated incrementally rather than recomputed from scratch. It addresses both dimensions of change — new or modified records and new or modified rules — within one framework.",
  "borrow": "The rules-and-data duality transfers directly to ERBOT: our pipeline is rule- and threshold-driven, so when a user tweaks a blocking key or a threshold we should invalidate and recompute only the affected blocks and clusters, following this paper's incremental maintenance stance.",
  "fill": "The work is framed for rule-based resolution over relational data; it leaves open how incremental maintenance works when the matching components are learned models (embeddings, classifiers) whose parameters shift with new data. We can pick that up: define incremental update semantics for ERBOT's learned stages, not just its rule-based ones.",
  "correct": "Incremental maintenance pays off only when changes are small relative to the dataset; the paper's framing does not by itself show the approach wins when rule changes are frequent or sweeping, in which case bookkeeping overhead can approach full recomputation.",
  "verified": true
 },
 {
  "n": 165,
  "id": "er-165",
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
  "n": 166,
  "id": "er-166",
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
  "n": 167,
  "id": "er-167",
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
  "n": 168,
  "id": "er-168",
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
  "n": 169,
  "id": "er-169",
  "title": "A partial-order-based framework for cost-effective crowdsourced entity resolution",
  "authors": [
   "Chengliang Chai",
   "Guoliang Li",
   "Jian Li",
   "Dong Deng",
   "Jianhua Feng"
  ],
  "year": 2018,
  "venue": "The VLDB Journal",
  "doi": "10.1007/s00778-018-0509-6",
  "citations": 34,
  "themes": [
   "scalable",
   "clustering"
  ],
  "method": [
   "system"
  ],
  "supervision": "supervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This VLDB Journal paper tackles crowdsourced entity resolution, where human workers verify candidate pairs at a cost per question. It introduces a partial-order-based framework that orders and selects the questions put to the crowd so that answers to some pairs imply answers to others, reducing the total number of paid questions needed to resolve a dataset.",
  "borrow": "ERBOT can borrow the question-selection logic for its human-in-the-loop step: instead of sending uncertain pairs to a reviewer in arbitrary order, exploit transitivity and partial order so each human judgement settles as many implied pairs as possible.",
  "fill": "The framework optimizes which pairs to ask about, but leaves the quality of crowd answers themselves — worker error, disagreement, and adversarial answers — largely to the side. We can pick that up by coupling partial-order question selection with an answer-noise model and measuring end-to-end cluster quality, not just question count.",
  "correct": "Cost savings are measured in number of questions, which presumes each question costs the same and that implied answers are as reliable as direct ones; a wrong crowd answer propagates through the partial order to every pair it implies, so the framework's savings can amplify single errors.",
  "verified": true
 },
 {
  "n": 170,
  "id": "er-170",
  "title": "An Overview of End-to-End Entity Resolution for Big Data",
  "authors": [
   "Vassilis Christophides",
   "Vasilis Efthymiou",
   "Themis Palpanas",
   "George Papadakis",
   "Kostas Stefanidis"
  ],
  "year": 2020,
  "venue": "ACM Computing Surveys",
  "doi": "10.1145/3418896",
  "citations": 212,
  "themes": [
   "scalable",
   "blocking"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "mixed",
  "scale": "web scale (>1M)",
  "abstract": "One of the most critical tasks for improving data quality and increasing the reliability of data analytics is\n                    Entity Resolution\n                    (ER), which aims to identify different descriptions that refer to the same real-world entity. Despite several decades of research, ER remains a challenging problem. In this survey, we highlight the novel aspects of resolving Big Data entities when we should satisfy more than one of the Big Data characteristics simultaneously (i.e., Volume and Velocity with Variety). We present the basic concepts, processing steps, and execution strategies that have been proposed by database, semantic Web, and machine learning communities in order to cope with the loose\n                    structuredness\n                    , extreme\n                    diversity\n                    , high\n                    speed,\n                    and large\n                    scale\n                    of entity descriptions used by real-world applications. We provide an end-to-end view of ER workflows for Big Data, critically review the pros and cons of existing methods, and conclude with the main open research directions.",
  "focus": "This survey presents an end-to-end view of entity resolution for Big Data, covering the basic concepts, processing steps, and execution strategies proposed by the database, semantic Web, and machine learning communities. It emphasises the difficulty of satisfying several Big Data characteristics at once — volume and velocity together with variety — given the loose structure, extreme diversity, high speed, and large scale of real entity descriptions, critically reviews the pros and cons of existing methods, and concludes with open research directions.",
  "borrow": "Its end-to-end workflow decomposition, with per-step pros and cons, is an architecture checklist for ERBOT's pipeline design at scale.",
  "fill": "Published in 2020, the survey predates LLM-based matchers and the maturation of learned blocking; we can reassess its stated open directions against post-2023 methods and mark which have closed and which remain.",
  "correct": "The Big Data framing weights volume and velocity, but many real linkage projects are small yet dirty; the survey's priorities can misdirect effort for that common case.",
  "verified": true
 },
 {
  "n": 171,
  "id": "er-171",
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
  "n": 172,
  "id": "er-172",
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
  "n": 173,
  "id": "er-173",
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
  "n": 174,
  "id": "er-174",
  "title": "Privacy-preserving electronic health record linkage using pseudonym identifiers",
  "authors": [
   "Bandar Alhaqbani",
   "Colin Fidge"
  ],
  "year": 2008,
  "venue": "HealthCom 2008 - 10th International Conference on e-health Networking, Applications and Services",
  "doi": "10.1109/health.2008.4600120",
  "citations": 25,
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
  "focus": "Alhaqbani and Fidge present a privacy-preserving approach to linking electronic health records based on pseudonym identifiers: records carry derived pseudonyms instead of direct identifiers, so records belonging to the same patient can be linked across providers without exposing the patient's identity in the linked data. The work appears in the HealthCom 2008 e-health conference.",
  "borrow": "ERBOT can borrow the pseudonym layer as an architectural pattern: assign stable pseudonyms at the source, link on pseudonyms centrally, and keep the identity mapping with the data custodian — a simple governance shape for health-data users.",
  "fill": "Pseudonym linkage works when the same pseudonym is reliably derived for the same patient everywhere; the paper leaves open the hard part of real linkage — typographical errors and changed demographics mean exact pseudonym matching misses the very records probabilistic linkage exists to catch. We can pick up the combination: pseudonyms for the clean majority, encoded probabilistic matching for the residue.",
  "correct": "A stable pseudonym is itself a long-lived identifier: anyone obtaining linked pseudonymized records can track a patient across sources and time, and a breached mapping table re-identifies everything at once, so the privacy claim rests entirely on key management rather than on the linkage design.",
  "verified": true
 },
 {
  "n": 175,
  "id": "er-175",
  "title": "Privacy Preserving Record Linkage Using Phonetic Codes",
  "authors": [
   "Alexandros Karakasidis",
   "Vassilios S. Verykios"
  ],
  "year": 2009,
  "venue": "2009 Fourth Balkan Conference in Informatics",
  "doi": "10.1109/bci.2009.29",
  "citations": 34,
  "themes": [
   "privacy-bayesian",
   "similarity"
  ],
  "method": [
   "phonetic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper presents a privacy-preserving record linkage approach that encodes names with phonetic codes, so that records from different databases can be compared and linked on the encoded values without exchanging the raw names. It applies the idea to the common case where name variation is largely phonetic (spelling variants that sound alike).",
  "borrow": "Phonetic encoding is a cheap, explainable privacy layer ERBOT can offer for name attributes: encode with a phonetic algorithm before any cross-source comparison when raw names cannot leave a data custodian.",
  "fill": "The approach covers phonetic name variation only; it leaves open how to combine phonetic codes with the other quasi-identifiers (dates, addresses) a real linkage needs, and how much linkage quality survives when several attributes are encoded at once. We can pick up the multi-attribute encoded-linkage design and measure the quality cost in ERBOT.",
  "correct": "Phonetic codes are many-to-one by design and the code space for names is small, so the encoding offers weak privacy against frequency analysis — common codes map to common names. Treating phonetic encoding as sufficient privacy protection, rather than a light obfuscation, overstates the guarantee.",
  "verified": true
 },
 {
  "n": 176,
  "id": "er-176",
  "title": "Privacy preserving record linkage approaches",
  "authors": [
   "Vassilios S. Verykios",
   "Alexandros Karakasidis",
   "Vassilios K. Mitrogiannis"
  ],
  "year": 2009,
  "venue": "International Journal of Data Mining, Modelling and Management",
  "doi": "10.1504/ijdmmm.2009.026076",
  "citations": 18,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This is a survey of approaches to privacy-preserving record linkage, reviewing the techniques proposed for linking records across databases without revealing the underlying personal data, published in the International Journal of Data Mining, Modelling and Management.",
  "borrow": "As an early map of the PPRL design space, the survey gives us a checklist of approach families to consider when scoping ERBOT's privacy options.",
  "fill": "A 2009 survey predates both the cryptanalysis of Bloom filter encodings and modern secure-computation results; we can re-examine its approach families against current attack knowledge and record which ones remain defensible.",
  "correct": "Its coverage and any comparative judgements are a 2009 snapshot that predates most empirical PPRL evaluation, so treating its taxonomy as current guidance would mislead a modern design.",
  "verified": true
 },
 {
  "n": 177,
  "id": "er-177",
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
  "n": 178,
  "id": "er-178",
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
  "n": 179,
  "id": "er-179",
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
  "n": 180,
  "id": "er-180",
  "title": "Approximate Two-Party Privacy-Preserving String Matching with Linear Complexity",
  "authors": [
   "Martin Beck",
   "Florian Kerschbaum"
  ],
  "year": 2013,
  "venue": "2013 IEEE International Congress on Big Data",
  "doi": "10.1109/bigdata.congress.2013.14",
  "citations": 15,
  "themes": [
   "privacy-bayesian",
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper presents a protocol by which two parties can compute approximate string matching privately, with linear complexity, so that similarity between their strings can be assessed without either side revealing the strings themselves, presented at the IEEE International Congress on Big Data.",
  "borrow": "This is a concrete secure-computation option for ERBOT's comparison step when one data holder cannot share raw values: private approximate matching instead of exchanging the strings.",
  "fill": "Integration is left open: private pairwise matching is only one step. Blocking and clustering under the same privacy constraints remain to be assembled into a full private pipeline, which we can prototype.",
  "correct": "Linear complexity in string length still carries heavy cryptographic constants, so practical throughput at record-linkage scale — millions of pairs — remains the standing doubt about such protocols.",
  "verified": true
 },
 {
  "n": 181,
  "id": "er-181",
  "title": "An Evaluation Framework for Privacy-Preserving Record Linkage",
  "authors": [
   "Dinusha Vatsalan",
   "Peter Christen",
   "Christine M. O'Keefe",
   "Vassilios S. Verykios"
  ],
  "year": 2014,
  "venue": "Journal of Privacy and Confidentiality",
  "doi": "10.29012/jpc.v6i1.636",
  "citations": 35,
  "themes": [
   "privacy-bayesian",
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "n/a",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "Privacy-preserving record linkage (PPRL) addresses the problem of identifying matching records from different databases that correspond to the same real-world entities using quasi-identifying attributes (in the absence of unique entity identifiers), while preserving privacy of these entities. Privacy is being preserved by not revealing any information that could be used to infer the actual values about the records that are not reconciled to the same entity (non-matches), and any confidential or sensitive information (that is not agreed upon by the data custodians) about the records that were reconciled to the same entity (matches) during or after the linkage process. The PPRL process often involves three main challenges, which are scalability to large databases, high linkage quality in the presence of data quality errors, and sufficient privacy guarantees. While many solutions have been developed for the PPRL problem over the past two decades, an evaluation and comparison framework of PPRL solutions with standard numerical measures defined for all three properties (scalability, linkage quality, and privacy) of PPRL has so far not been presented in the literature. We propose a general framework with normalized measures to practically evaluate and compare PPRL solutions in the face of linkage attack methods that are based on an external global dataset. We conducted experiments of several existing PPRL solutions on real-world databases using our proposed evaluation framework, and the results show that our framework provides an extensive and comparative evaluation of PPRL solutions in terms of the three properties.",
  "focus": "The paper proposes a general evaluation framework for privacy-preserving record linkage (PPRL) that defines normalized measures for all three properties a PPRL solution must balance: scalability, linkage quality, and privacy, where privacy is assessed against linkage attacks based on an external global dataset. The authors apply the framework to several existing PPRL solutions on real-world databases and show it yields an extensive, comparative picture of the three properties.",
  "borrow": "ERBOT/SandX can adopt the three-way evaluation discipline: whenever we test a privacy-preserving variant, report scalability, linkage quality, and resistance to attack side by side with normalized measures, instead of reporting linkage quality alone.",
  "fill": "The framework is demonstrated on existing PPRL solutions and real-world databases of its period; it leaves open how the measures behave at the very large scales ERBOT targets, and it does not itself supply a linkage method that scores well on all three axes. We can pick up both: re-run the framework on modern encodings at 100K+ scale and use its measures as the acceptance test for our own PPRL stage.",
  "correct": "Its privacy assessment is tied to a specific threat model — linkage attacks using an external global dataset — so a solution that scores well here is not shown to be safe against other adversaries (for example, insiders or frequency attacks with different background knowledge); the normalized scores should not be read as general privacy guarantees.",
  "verified": true
 },
 {
  "n": 182,
  "id": "er-182",
  "title": "Cryptanalysis of Basic Bloom Filters Used for Privacy Preserving Record Linkage",
  "authors": [
   "Frank Niedermeyer",
   "Simone Steinmetzer",
   "Martin Kroll",
   "Rainer Schnell"
  ],
  "year": 2014,
  "venue": "Journal of Privacy and Confidentiality",
  "doi": "10.29012/jpc.v6i2.640",
  "citations": 38,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "hashing/LSH",
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Bloom filter encoded identifiers are increasingly used for privacy preserving record linkage applications, because they allow for errors in encrypted identifiers. However, little research on the security of Bloom filters has been published so far. In this paper, we formalize a successful attack on Bloom filters composed of bigrams. It has previously been assumed in the literature that an attacker knows the global data set from which a sample is drawn. In contrast, we suppose that an attacker does not know this global data set. Instead, we assume the adversary knows a publicly available list of the most frequent attributes. The attack is based on subtle filtering and elementary statistical analysis of encrypted bigrams. The attack described in this paper can be used for the deciphering of a whole database instead of only a small subset of the most frequent names, as in previous research. We illustrate our proposed method with an attack on a database of encrypted surnames. Finally, we describe modifications of the Bloom filters for preventing similar attacks.",
  "focus": "This paper formalizes a successful attack on the basic Bloom filters widely used to encode identifiers for privacy-preserving record linkage. Unlike earlier work, the attacker is not assumed to know the global dataset; knowing only a public list of the most frequent attributes, the attack uses filtering and elementary statistical analysis of encrypted bigrams to decipher an entire encoded database, illustrated on encrypted surnames. The paper closes with modifications to Bloom filter encoding intended to prevent such attacks.",
  "borrow": "The attack is borrowable as a mandatory security check for SandX's privacy work: any Bloom-filter-based PPRL design we consider should first be tested against this cryptanalysis, and the paper's suggested hardening modifications are the starting point for a defensible encoding.",
  "fill": "The paper breaks the basic construction and sketches countermeasures, but it leaves the hardened encodings' linkage quality unmeasured: whether the modifications preserve blocking and matching accuracy at scale is exactly the open question. We can pick it up — evaluate hardened Bloom filter encodings for both attack resistance and end-to-end linkage quality.",
  "correct": "The attack's assumptions still matter: it leans on frequency information about attributes and on bigram structure, so its success rate on encodings with different parameters, alphabets, or attribute distributions will vary; the result condemns the basic construction, not every Bloom-filter variant equally.",
  "verified": true
 },
 {
  "n": 183,
  "id": "er-183",
  "title": "Scalable Privacy-Preserving Record Linkage for Multiple Databases",
  "authors": [
   "Dinusha Vatsalan",
   "Peter Christen"
  ],
  "year": 2014,
  "venue": "Proceedings of the 23rd ACM International Conference on Conference on Information and Knowledge Management",
  "doi": "10.1145/2661829.2661875",
  "citations": 38,
  "themes": [
   "privacy-bayesian",
   "scalable"
  ],
  "method": [
   "probabilistic",
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This CIKM 2014 paper by Vatsalan and Christen addresses privacy-preserving record linkage across more than two databases, scaling PPRL beyond the pairwise two-party setting so that multiple data holders can link their records without exposing plaintext identifiers. The record carries no abstract, so the description rests on the title and venue.",
  "borrow": "The multi-party framing is borrowable for SandX's privacy dimension: real linkage projects often involve several data holders, and this paper is a reference design for extending two-party PPRL protocols to that setting.",
  "fill": "The paper leaves the trust and collusion questions that multi-party settings raise — what happens when some parties pool their views — and the quality comparison against two-party protocols at scale remains open. We can pick up both: a collusion-aware evaluation and quality benchmarks for multi-party PPRL inside a full pipeline.",
  "correct": "Scalability claims for PPRL are usually made against other PPRL protocols, not against plaintext linkage; the privacy machinery's cost in recall and runtime relative to ordinary linkage is the comparison that decides practicality, and it is the one such papers least emphasize.",
  "verified": true
 },
 {
  "n": 184,
  "id": "er-184",
  "title": "A hybrid private record linkage scheme: Separating differentially private synopses from matching records",
  "authors": [
   "Jianneng Cao",
   "Fang-Yu Rao",
   "Elisa Bertino",
   "Murat Kantarcioglu"
  ],
  "year": 2015,
  "venue": "2015 IEEE 31st International Conference on Data Engineering",
  "doi": "10.1109/icde.2015.7113352",
  "citations": 20,
  "themes": [
   "privacy-bayesian",
   "blocking"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Cao, Rao, Bertino, and Kantarcioglu propose a hybrid private record linkage scheme that separates differentially private synopses from the matching records themselves, presented at ICDE 2015. The record carries no abstract, so the protocol details and privacy parameters cannot be stated from the metadata.",
  "borrow": "The separation design is borrowable for SandX: publish or exchange a differentially private synopsis for candidate generation while keeping the records used for final matching apart, so privacy budget is spent only where it buys utility.",
  "fill": "Hybrid schemes still need an end-to-end accounting of what the synopsis leaks across repeated linkages of the same files; longitudinal privacy accounting for operational PPRL is undeveloped, and we can work on it.",
  "correct": "Differential privacy guarantees depend on the chosen epsilon and on correct implementation of the noise mechanism; a scheme described as differentially private can still leak substantially if parameters are set for utility rather than protection.",
  "verified": true
 },
 {
  "n": 185,
  "id": "er-185",
  "title": "An LSH-Based Blocking Approach with a Homomorphic Matching Technique for Privacy-Preserving Record Linkage",
  "authors": [
   "Dimitrios Karapiperis",
   "Vassilios S. Verykios"
  ],
  "year": 2015,
  "venue": "IEEE Transactions on Knowledge and Data Engineering",
  "doi": "10.1109/tkde.2014.2349916",
  "citations": 51,
  "themes": [
   "privacy-bayesian",
   "blocking"
  ],
  "method": [
   "hashing/LSH",
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This IEEE TKDE 2015 paper combines two techniques for privacy-preserving record linkage: locality-sensitive hashing is used to block encoded records so that candidate pairs can be found without decryption, and a homomorphic matching technique allows similarity to be computed over encrypted values. The record carries no abstract, so the description rests on the title and venue: it is a PPRL method joining LSH-based blocking with encrypted-domain matching.",
  "borrow": "The combination is borrowable for SandX's privacy dimension: LSH blocking over encoded data plus a matching step that never requires plaintext is a concrete architecture for linkage across parties that cannot share raw identifiers.",
  "fill": "The paper leaves the security-versus-quality accounting incomplete: LSH blocking on encoded values leaks similarity structure by design, and the record gives no basis for judging how its recall compares with plaintext blocking at scale. We can pick up the measurement task — quantify the recall and leakage cost of the LSH-plus-homomorphic stack inside a full PPRL pipeline.",
  "correct": "Homomorphic matching protects values during computation but the blocking step itself reveals which records are similar enough to share buckets; presenting the combination as privacy-preserving without a stated adversary model overstates what the cryptography guarantees.",
  "verified": true
 },
 {
  "n": 186,
  "id": "er-186",
  "title": "Application of Privacy-Preserving Techniques in Operational Record Linkage Centres",
  "authors": [
   "James H. Boyd",
   "Sean M. Randall",
   "Anna M. Ferrante"
  ],
  "year": 2015,
  "venue": "Medical Data Privacy Handbook",
  "doi": "10.1007/978-3-319-23633-9_11",
  "citations": 21,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "system"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Boyd, Randall, and Ferrante describe how privacy-preserving techniques are applied inside operational record linkage centres — the units that link health and administrative data as a routine service — as a chapter in the Medical Data Privacy Handbook (2015). The record carries no abstract, so the chapter's specific protocols cannot be detailed from the metadata.",
  "borrow": "The operational perspective is the borrow: SandX can take its PPRL design cues from centres that run linkage under real governance constraints — separation of identifiers from content, audited workflows — rather than from purely cryptographic papers.",
  "fill": "Centre-based practice assumes a trusted linkage unit exists; decentralised settings where no party may see identifiers at all are outside its scope, and adapting centre workflows to a no-trusted-third-party design is open work for us.",
  "correct": "Operational acceptance is not the same as demonstrated security: techniques adopted because they fit centre workflows may carry known attack risks that a deployment-focused account can understate.",
  "verified": true
 },
 {
  "n": 187,
  "id": "er-187",
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
  "n": 188,
  "id": "er-188",
  "title": "Distance-Aware Encoding of Numerical Values for Privacy-Preserving Record Linkage",
  "authors": [
   "Dimitrios Karapiperis",
   "Aris Gkoulalas-Divanis",
   "Vassilios S. Verykios"
  ],
  "year": 2017,
  "venue": "2017 IEEE 33rd International Conference on Data Engineering (ICDE)",
  "doi": "10.1109/icde.2017.58",
  "citations": 19,
  "themes": [
   "privacy-bayesian",
   "similarity"
  ],
  "method": [
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Karapiperis, Gkoulalas-Divanis, and Verykios present an encoding for numerical values in privacy-preserving record linkage that preserves distance information, so similarity on numbers (such as ages or dates) can be computed on encoded data, presented at ICDE 2017. The record carries no abstract, so the encoding construction cannot be described from the metadata.",
  "borrow": "SandX can borrow distance-aware numeric encoding directly: most PPRL encodings handle strings, while dates and ages are often the most discriminating fields — an encoding that keeps numeric distances usable fills a real gap in our privacy pipeline.",
  "fill": "Preserving distances is precisely what an attacker exploits, and the privacy analysis of numeric encodings under auxiliary-information attacks is thinner than for Bloom filters; quantifying that leakage on realistic distributions is work we can do.",
  "correct": "There is an inherent tension the title states plainly: the more faithfully an encoding preserves distance, the more it reveals about the underlying values, so utility claims should always be read alongside the encoding's information leakage.",
  "verified": true
 },
 {
  "n": 189,
  "id": "er-189",
  "title": "Privacy-Preserving Record Linkage for Big Data: Current Approaches and Research Challenges",
  "authors": [
   "Dinusha Vatsalan",
   "Ziad Sehili",
   "Peter Christen",
   "Erhard Rahm"
  ],
  "year": 2017,
  "venue": "Handbook of Big Data Technologies",
  "doi": "10.1007/978-3-319-49340-4_25",
  "citations": 108,
  "themes": [
   "privacy-bayesian",
   "scalable"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "",
  "focus": "A handbook chapter surveying privacy-preserving record linkage for big data: approaches that let parties link records about the same individuals without revealing the underlying identifying values, together with the research challenges the area faces. It is a map of the field as of 2017 rather than a new method.",
  "borrow": "Its organization of PPRL approaches and challenges structures the privacy dimension of SandX/ERBOT: which encoding and matching techniques pair with which threat models, and what each choice costs in linkage quality.",
  "fill": "The chapter is a snapshot that names scalability of PPRL and the security of popular encodings as open challenges; an implemented, evaluated big-data PPRL path in R is still missing, and prototyping one inside ERBOT is work left for us.",
  "correct": "A survey cannot settle the privacy–quality trade-off quantitatively, and later cryptanalysis of widely used encodings has weakened confidence in some approaches the chapter presents in neutral terms; its safety picture should be re-checked against newer attack results.",
  "verified": true
 },
 {
  "n": 190,
  "id": "er-190",
  "title": "Secure pseudonymisation for privacy-preserving probabilistic record linkage",
  "authors": [
   "D. Smith"
  ],
  "year": 2017,
  "venue": "Journal of Information Security and Applications",
  "doi": "10.1016/j.jisa.2017.01.002",
  "citations": 18,
  "themes": [
   "privacy-bayesian",
   "probabilistic"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper presents a secure pseudonymisation approach intended to support privacy-preserving probabilistic record linkage, published in the Journal of Information Security and Applications. It addresses how records can be pseudonymised so that probabilistic matching can proceed without exposing the underlying identifying values.",
  "borrow": "Pseudonymisation as a separable privacy layer is a concrete design pattern for ERBOT: keep identifiers behind pseudonyms and run the probabilistic machinery on the pseudonymised side.",
  "fill": "The record leaves open how much linkage quality the pseudonymisation costs at scale; we can measure precision and recall of pseudonymised versus plain probabilistic linkage on the same files to price the privacy layer.",
  "correct": "Pseudonymisation alone does not make linkage privacy-preserving: pseudonyms remain vulnerable to frequency and linkage attacks, so the paper's framing should not be read as a complete privacy guarantee.",
  "verified": true
 },
 {
  "n": 191,
  "id": "er-191",
  "title": "Parallel Privacy-preserving Record Linkage using LSH-based Blocking",
  "authors": [
   "Martin Franke",
   "Ziad Sehili",
   "Erhard Rahm"
  ],
  "year": 2018,
  "venue": "Proceedings of the 3rd International Conference on Internet of Things, Big Data and Security",
  "doi": "10.5220/0006682701950203",
  "citations": 17,
  "themes": [
   "privacy-bayesian",
   "blocking",
   "scalable"
  ],
  "method": [
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "This paper presents a parallel privacy-preserving record linkage approach that uses locality-sensitive hashing (LSH) based blocking to generate candidate pairs over encoded data, targeting scalability in the blocking step of PPRL.",
  "borrow": "LSH blocking over encoded values is exactly the pattern for a privacy mode in ERBOT at scale: block on hashes first, and only spend comparison effort inside buckets.",
  "fill": "The privacy accounting of the blocking step itself is left open: LSH buckets leak similarity structure by construction. We can quantify what bucket co-membership reveals and whether it enables the re-identification attacks catalogued in the PPRL attack literature.",
  "correct": "Parallel LSH blocking trades recall against speed and privacy through parameters that must be tuned per dataset, so its effectiveness on any new file is not guaranteed by the approach alone.",
  "verified": true
 },
 {
  "n": 192,
  "id": "er-192",
  "title": "Privacy-preserving record linkage in large databases using secure multiparty computation",
  "authors": [
   "Peeter Laud",
   "Alisa Pankova"
  ],
  "year": 2018,
  "venue": "BMC Medical Genomics",
  "doi": "10.1186/s12920-018-0400-8",
  "citations": 27,
  "themes": [
   "privacy-bayesian",
   "scalable"
  ],
  "method": [
   "probabilistic"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "large (100K-1M)",
  "abstract": "",
  "focus": "Laud and Pankova present privacy-preserving record linkage for large databases based on secure multiparty computation (SMC), in BMC Medical Genomics: instead of exchanging encoded identifiers, the parties run a joint cryptographic protocol that computes the linkage without any party seeing the others' raw records. The work targets the health-data setting, where legal constraints rule out sharing identifying attributes.",
  "borrow": "ERBOT can borrow the threat-model upgrade: SMC defines the strong end of the privacy spectrum against which our cheaper encodings (Bloom filters, phonetic codes) should be positioned, so users can choose a point on the privacy/cost curve knowingly.",
  "fill": "SMC protocols are computationally heavy, and the paper leaves open the practical scaling envelope — how linkage quality and runtime hold up as databases grow toward millions of records with realistic error rates. We can pick up that measurement for the specific case where ERBOT users must link health data across institutions.",
  "correct": "Cryptographic privacy during computation does not settle privacy of the output: the linked result itself, and match patterns revealed to participants, can still leak information, so 'privacy-preserving' here covers the protocol phase only, not the disclosure risk of the delivered linkage.",
  "verified": true
 },
 {
  "n": 193,
  "id": "er-193",
  "title": "Semantic privacy-preserving framework for electronic health record linkage",
  "authors": [
   "Yang Lu",
   "Richard O. Sinnott"
  ],
  "year": 2018,
  "venue": "Telematics and Informatics",
  "doi": "10.1016/j.tele.2017.06.007",
  "citations": 16,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "system"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper proposes a semantic privacy-preserving framework for linking electronic health records, using semantic representations to support the linkage process while protecting patient privacy, published in Telematics and Informatics.",
  "borrow": "The semantic-layer idea is a design option for ERBOT's health-data cases: link on meaning-level representations rather than raw identifiers where regulation forbids sharing the identifiers themselves.",
  "fill": "The empirical privacy question is left open: whether semantic representations actually resist re-identification. We can attack-test such a representation before trusting it in a real linkage.",
  "correct": "Semantic abstraction can strip exactly the discriminating detail that linkage needs, so a framework demonstrated for feasibility may carry a recall cost that only shows up on difficult, error-heavy records.",
  "verified": true
 },
 {
  "n": 194,
  "id": "er-194",
  "title": "Efficient Pattern Mining Based Cryptanalysis for Privacy-Preserving Record Linkage",
  "authors": [
   "Anushka Vidanage",
   "Thilina Ranbaduge",
   "Peter Christen",
   "Rainer Schnell"
  ],
  "year": 2019,
  "venue": "2019 IEEE 35th International Conference on Data Engineering (ICDE)",
  "doi": "10.1109/icde.2019.00176",
  "citations": 28,
  "themes": [
   "privacy-bayesian",
   "evaluation"
  ],
  "method": [
   "benchmark"
  ],
  "supervision": "unsupervised",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "",
  "focus": "Vidanage, Ranbaduge, Christen, and Schnell present an efficient pattern-mining-based cryptanalysis of privacy-preserving record linkage encodings at ICDE 2019. The attack mines frequent patterns in encoded values (of the Bloom-filter type widely used in PPRL) to re-identify the underlying plain-text values, demonstrating that popular encodings leak more than assumed.",
  "borrow": "ERBOT should borrow this attack as a standard pre-deployment test: before any encoded linkage leaves our hands, run a pattern-mining cryptanalysis against our own encodings and report what fraction of values an attacker can recover.",
  "fill": "The paper demonstrates the attack; it leaves open the constructive side — which encoding parameterizations or hardening steps (salting, balancing, record-level perturbation) actually withstand pattern-mining attacks at acceptable linkage quality. We can pick that up: use the attack as the scoring function in a hardening study inside ERBOT's PPRL work.",
  "correct": "Attack success depends on the attacker's background knowledge and on the encoding parameters of the target datasets; a demonstrated break of specific configurations should not be generalized to all Bloom-filter PPRL, just as resistance on one dataset would not prove safety on another.",
  "verified": true
 },
 {
  "n": 195,
  "id": "er-195",
  "title": "Secure Approximate String Matching for Privacy-Preserving Record Linkage",
  "authors": [
   "Aleksander Essex"
  ],
  "year": 2019,
  "venue": "IEEE Transactions on Information Forensics and Security",
  "doi": "10.1109/tifs.2019.2903651",
  "citations": 20,
  "themes": [
   "privacy-bayesian",
   "similarity"
  ],
  "method": [
   "string metric"
  ],
  "supervision": "unsupervised",
  "dataType": "textual",
  "scale": "n/a",
  "abstract": "",
  "focus": "Essex presents secure approximate string matching protocols for privacy-preserving record linkage, so parties can compute string similarity without revealing the underlying strings, in IEEE Transactions on Information Forensics and Security (2019). The record carries no abstract, so protocol costs and security models cannot be stated from the metadata.",
  "borrow": "SandX can borrow the protocol pattern for the comparison step: secure similarity computation complements encoded blocking, letting two parties score candidate pairs without exchanging plaintext names.",
  "fill": "Cryptographic string matching is usually priced per comparison and demonstrated on small inputs; making it affordable across the millions of candidate pairs a real linkage generates — by composing it with private blocking — is the open engineering problem we can take on.",
  "correct": "Security proofs hold within a stated adversary model (typically semi-honest parties); deployments where a party may deviate from the protocol fall outside the guarantee, a caveat that matters for real data-sharing agreements.",
  "verified": true
 },
 {
  "n": 196,
  "id": "er-196",
  "title": "Incremental clustering techniques for multi-party Privacy-Preserving Record Linkage",
  "authors": [
   "Dinusha Vatsalan",
   "Peter Christen",
   "Erhard Rahm"
  ],
  "year": 2020,
  "venue": "Data &amp; Knowledge Engineering",
  "doi": "10.1016/j.datak.2020.101809",
  "citations": 17,
  "themes": [
   "privacy-bayesian",
   "clustering"
  ],
  "method": [
   "graph-based"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "",
  "focus": "This paper develops incremental clustering techniques for privacy-preserving record linkage involving more than two parties, so that clusters of matching records across several encoded databases can be built and updated incrementally rather than recomputed from scratch, published in Data & Knowledge Engineering.",
  "borrow": "Incremental multi-party clustering is the missing piece if ERBOT ever links more than two sources privately: adopt its update-instead-of-recompute stance for cluster maintenance.",
  "fill": "It leaves open how incremental cluster quality drifts as many updates accumulate compared with a full recomputation; we can measure that drift and define refresh triggers for when an incremental cluster set must be rebuilt.",
  "correct": "Multi-party PPRL assumes all parties follow the protocol honestly and that encodings are comparable across parties — assumptions that real multi-agency linkage, with heterogeneous data quality, often violates.",
  "verified": true
 },
 {
  "n": 197,
  "id": "er-197",
  "title": "Securing Bloom Filters for Privacy-preserving Record Linkage",
  "authors": [
   "Thilina Ranbaduge",
   "Rainer Schnell"
  ],
  "year": 2020,
  "venue": "Proceedings of the 29th ACM International Conference on Information &amp; Knowledge Management",
  "doi": "10.1145/3340531.3412105",
  "citations": 20,
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
  "focus": "Ranbaduge and Schnell address the security of Bloom filters used in privacy-preserving record linkage, examining how the standard encoding can be attacked and how it can be hardened, presented at CIKM 2020. The record carries no abstract, so the specific attacks and defences cannot be detailed from the metadata.",
  "borrow": "SandX can borrow the hardening checklist directly: any Bloom-filter encoding we ship should be assessed against the published frequency and constraint-satisfaction attacks before deployment, not after.",
  "fill": "Hardening measures are typically evaluated one attack at a time; a combined evaluation — linkage quality, attack resistance, and cost measured together on the same encodings — is still rare, and ERBOT's PPRL testbed can provide it.",
  "correct": "Defences tuned against known attacks offer no guarantee against the next attack class; presenting hardened Bloom filters as 'secure' rather than 'resistant to these specific attacks' overstates what the evidence shows.",
  "verified": true
 },
 {
  "n": 198,
  "id": "er-198",
  "title": "Blockchain-based Privacy-Preserving Record Linkage: enhancing data privacy in an untrusted environment",
  "authors": [
   "Thiago Nóbrega",
   "Carlos Eduardo S. Pires",
   "Dimas Cassimiro Nascimento"
  ],
  "year": 2021,
  "venue": "Information Systems",
  "doi": "10.1016/j.is.2021.101826",
  "citations": 32,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "hashing/LSH"
  ],
  "supervision": "unsupervised",
  "dataType": "multi-source",
  "scale": "n/a",
  "abstract": "",
  "focus": "This Information Systems paper proposes privacy-preserving record linkage built on blockchain technology, aimed at settings where the parties performing the linkage cannot be fully trusted. The blockchain serves as the shared, tamper-evident infrastructure through which encoded records are exchanged and linkage steps are coordinated without a trusted central linkage unit.",
  "borrow": "For multi-party SandX scenarios, the borrowable idea is the audit trail: an append-only, tamper-evident log of which encoded records were compared and linked, which gives custodians verifiable accountability even if the matching itself happens elsewhere.",
  "fill": "The paper leaves open the performance question that decides practicality: blockchain throughput and latency against linkage workloads of millions of records, and how linkage quality compares with conventional Bloom-filter PPRL on standard benchmarks. We can pick up the benchmark: run the architecture (or its log layer) against ERBOT's PPRL baseline at scale.",
  "correct": "A blockchain guarantees integrity of the log, not confidentiality of what is logged: encoded record data placed on a shared ledger is exposed to every participant and persists indefinitely, which can weaken rather than strengthen privacy if the encodings are later attacked. 'Untrusted environment' claims should be read as integrity claims, not privacy proofs.",
  "verified": true
 },
 {
  "n": 199,
  "id": "er-199",
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
  "n": 200,
  "id": "er-200",
  "title": "Taxonomy of Attacks on Privacy-Preserving Record Linkage",
  "authors": [
   "Anushka Vidanage",
   "Thilina Ranbaduge",
   "Peter Christen",
   "Rainer Schnell"
  ],
  "year": 2022,
  "venue": "Journal of Privacy and Confidentiality",
  "doi": "10.29012/jpc.764",
  "citations": 18,
  "themes": [
   "privacy-bayesian"
  ],
  "method": [
   "survey"
  ],
  "supervision": "n/a",
  "dataType": "structured",
  "scale": "n/a",
  "abstract": "Record linkage is the process of identifying records that corresponds to the same real-world entities across different databases. Due to the absence of unique entity identifiers, record linkage is often based on quasi-identifying values of entities (individuals) such as their names and addresses. However, regulatory ethical and legal obligations can limit the use of such personal information in the linkage process in order to protect the privacy and confidentiality of entities. Privacy-preserving record linkage (PPRL) aims to develop techniques that enable the linkage of records without revealing any sensitive or confidential information about the entities that are represented by these records. Over the past two decades various PPRL techniques have been proposed to securely link records between different databases by encrypting and/or encoding sensitive values. However, some PPRL techniques, such as popular Bloom filter encoding, have shown to be susceptible to privacy attacks. These attacks exploit the weaknesses of PPRL techniques by trying to reidentify encrypted and/or encoded sensitive values. In this paper we propose a taxonomy for analysing such attacks on PPRL where we categorise attacks across twelve dimensions, including different types of adversaries, different attack types, assumed knowledge of the adversary, the vulnerabilities of encoded and/or encrypted values exploited by an attack, and assessing the success of attacks. Our taxonomy can be used by data custodians to analyse the privacy risks associated with different PPRL techniques in terms of existing as well as potential future attacks on PPRL.",
  "focus": "The paper proposes a taxonomy for analysing attacks on privacy-preserving record linkage (PPRL), categorising attacks across twelve dimensions including adversary types, attack types, the adversary's assumed knowledge, the vulnerabilities of encoded or encrypted values that an attack exploits, and how attack success is assessed. It is motivated by the demonstrated susceptibility of popular techniques such as Bloom filter encoding to re-identification attacks, and is intended to help data custodians analyse the privacy risks of PPRL techniques against existing and potential future attacks.",
  "borrow": "The twelve-dimension attack taxonomy is a ready-made audit grid: before ERBOT adopts any encoding for a privacy-preserving mode, we can score the encoding against each dimension instead of relying on informal assurances.",
  "fill": "The taxonomy classifies attacks but does not empirically benchmark which encodings survive them on realistic data; we can build an attack test-suite that runs representative attacks against the encodings ERBOT might use and reports measured re-identification rates.",
  "correct": "A taxonomy is descriptive rather than evaluative: placing an attack in a category says nothing about how likely or damaging it is, and the dimension set may age as new attack classes appear that the twelve dimensions do not anticipate.",
  "verified": true
 },
 {
  "n": 201,
  "id": "er-201",
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
  "n": 202,
  "id": "er-202",
  "title": "Entity Alignment with Noisy Annotations from Large Language Models",
  "authors": [
   "Shengyuan Chen",
   "Qinggang Zhang",
   "Junnan Dong",
   "Wen Hua",
   "Qing Li",
   "Xiao Huang"
  ],
  "year": 2024,
  "venue": "Advances in Neural Information Processing Systems 37",
  "doi": "10.52202/079017-0482",
  "citations": 20,
  "themes": [
   "llm",
   "ml-deep"
  ],
  "method": [
   "LLM",
   "deep learning"
  ],
  "supervision": "supervised",
  "dataType": "relational",
  "scale": "n/a",
  "abstract": "",
  "focus": "Chen and co-authors study entity alignment — matching entities across knowledge graphs — when the annotations used for training come from large language models and are therefore noisy, presented at NeurIPS 2024. The record carries no abstract, so the denoising method and results cannot be stated from the metadata.",
  "borrow": "ERBOT can borrow the premise that LLM annotations are usable training signal if treated as noisy labels: LLM-labelled pairs could bootstrap our classifiers provided the pipeline models label error instead of trusting the annotations.",
  "fill": "The setting is knowledge-graph alignment with graph structure to lean on; whether noisy LLM annotations help for flat record linkage — and how to audit them without gold labels — is untested, and ERBOT can run that test.",
  "correct": "LLM annotation errors are correlated with exactly the hard cases (rare names, ambiguous pairs), so naive training on them can entrench the model's worst mistakes; noise-robust claims need evaluation on the hard tail, not just average accuracy.",
  "verified": true
 },
 {
  "n": 203,
  "id": "er-203",
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
  "n": 204,
  "id": "er-204",
  "title": "Active in-context learning for cross-domain entity resolution",
  "authors": [
   "Ziheng Zhang",
   "Weixin Zeng",
   "Jiuyang Tang",
   "Hongbin Huang",
   "Xiang Zhao"
  ],
  "year": 2025,
  "venue": "Information Fusion",
  "doi": "10.1016/j.inffus.2024.102816",
  "citations": 16,
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
  "abstract": "",
  "focus": "This paper combines active learning with in-context learning for cross-domain entity resolution, selecting informative labelled examples to place in a large language model's prompt so it adapts to a new domain with few labels, published in Information Fusion.",
  "borrow": "The example-selection strategy is directly reusable: when ERBOT moves an LLM matcher to a new dataset, actively choose which labelled pairs go into the prompt rather than sampling them at random.",
  "fill": "The budget frontier is left open — how few actively chosen examples suffice per domain, and at what point fine-tuning beats in-context learning. We can map that trade-off on our own datasets.",
  "correct": "Cross-domain claims rest on the particular domains tested, and in-context learning is prompt-sensitive, so the reported label savings may not replicate under different phrasing, example order, or a different model.",
  "verified": true
 },
 {
  "n": 205,
  "id": "er-205",
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
  "n": 206,
  "id": "er-206",
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
  "n": 207,
  "id": "er-207",
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
  "n": 208,
  "id": "er-208",
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
  "n": 209,
  "id": "er-209",
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
