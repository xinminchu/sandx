const STAGES = [
  {
    n: "01 · Load",
    fn: "er_load()",
    d: "Reads CSVs and parses ground truth into a canonical record table. Text is normalized once, upstream of everything — so every downstream stage sees the same strings.",
  },
  {
    n: "02 · Diagnose",
    fn: "er_diagnose()",
    d: "Profiles each field: type, missingness, cardinality. Recommends blocking keys and warns about fields that will never discriminate (e.g. 98% missing).",
  },
  {
    n: "03 · Block",
    fn: "er_block()",
    d: "Generates candidate pairs without the O(n²) blowup: standard blocking, prefix blocking, or sorted-neighborhood. Missing keys become singletons — never silently paired.",
  },
  {
    n: "04 · Similarity",
    fn: "er_similarity()",
    d: "missing-value-aware per-field scores — Jaro-Winkler, Levenshtein, token Jaccard, bag-of-words, categorical, numeric. If either side is missing, the field contributes NA, never an imputed guess.",
  },
  {
    n: "05 · Combine",
    fn: "er_combine()",
    d: "Fuses per-field similarities into one pair score with missing-value-aware weighting: fields that are missing simply don't vote. No leakage from imputation.",
  },
  {
    n: "06 · Weights",
    fn: "er_weights()",
    d: "Learns field weights three ways: uniform, Fellegi–Sunter EM on the unlabeled pairs, or ARI-guided search on a labeled fit set. The default never touches truth.",
  },
  {
    n: "07 · Cluster",
    fn: "er_cluster() / er_cluster_all()",
    d: "Nine unsupervised methods (threshold connected-components, Louvain, Leiden, HDBSCAN, …) plus eleven supervised pairwise classifiers. Structural inapplicability returns valid=FALSE with a reason — never a silent garbage label.",
  },
  {
    n: "08 · Merge",
    fn: "er_merge()",
    d: "Post-processing: consensus merging across methods, small-cluster absorption. The default merge is consensus — the old truth-picking 'best' now warns loudly.",
  },
  {
    n: "09 · Evaluate",
    fn: "er_evaluate()",
    d: "ARI, B-cubed, AMI and friends. Predictions are aligned to ground truth by record id, by name. A single mismatched id is a loud error, not a wrong number in a table.",
  },
];

const CLASSIFIERS = [
  "logistic (Firth penalized)",
  "LDA",
  "QDA",
  "k-NN",
  "weighted k-NN",
  "decision tree",
  "random forest",
  "XGBoost",
  "neural net",
  "Fellegi–Sunter",
  "radial SVM",
];

export default function Methods() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-extrabold">Methods</h1>
      <p className="text-slate-600 mt-2">
        What ERBOT does at each stage, and the two design principles that
        define it: missing-value-aware everything, and truth that never leaks.
      </p>

      <h2 className="text-xl font-bold mt-12 mb-4">The nine stages</h2>
      <div className="space-y-4">
        {STAGES.map((s) => (
          <div key={s.n} className="border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-bold text-teal-700">{s.n}</span>
              <code className="font-mono2 text-sm bg-slate-100 px-2 py-0.5 rounded">
                {s.fn}
              </code>
            </div>
            <p className="mt-2 text-sm text-slate-600">{s.d}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">Honest evaluation</h2>
      <div className="prose-sm text-slate-600 space-y-3 text-sm leading-relaxed">
        <p>
          Entity resolution has a reproducibility problem: the ground
          truth used to <em>score</em> a method also leaks into{" "}
          <em>choosing</em> it — tuning the threshold on the test set, picking
          the best of twelve methods by test ARI, splitting records instead of
          entities so near-duplicates appear in both train and test.
        </p>
        <p>ERBOT&apos;s defaults address all three:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Truth is evaluation-only.</strong> Ground truth drives
            metrics, never clustering, classifier training, or method
            selection — unless you explicitly set{" "}
            <code className="font-mono2">supervised_selection = TRUE</code>.
          </li>
          <li>
            <strong>Entity-disjoint splits.</strong>{" "}
            <code className="font-mono2">er_split()</code> and{" "}
            <code className="font-mono2">er_stratified_three_way_split()</code>{" "}
            partition by entity, so no duplicate family appears on both sides
            of a split. Tuning uses Fit/Validation; Test is touched once.
          </li>
          <li>
            <strong>Protocol B is a real held-out.</strong> Tune with
            entity-disjoint CV on the Selection set, then cluster and evaluate
            the Test set exactly once.
          </li>
        </ul>
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">
        Eleven supervised classifiers
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        Each classifier learns a pairwise match probability from per-field
        similarities — not from embedding differences. Every one carries a
        validity discipline: when the data makes a method structurally
        inapplicable (rank-deficient design, separation, missing packages), it
        returns <code className="font-mono2">valid = FALSE</code> with a
        human-readable reason, and the pipeline falls back to Louvain with a
        warning. Inapplicability is reported as inapplicability — never as a
        bad score.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {CLASSIFIERS.map((c) => (
          <span
            key={c}
            className="text-sm border border-slate-200 rounded-full px-3 py-1 bg-slate-50"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-5 text-sm text-slate-700 leading-relaxed">
        <strong>Why Firth logistic is the default.</strong> On real ER
        benchmarks, plain logistic regression diverges under complete
        separation — the package author&apos;s advisor confirmed it on four of
        five datasets (Scenario 1). Firth&apos;s penalized likelihood stays
        finite where <span className="font-mono2">glm()</span> blows up, so
        ERBOT fits logistic with{" "}
        <span className="font-mono2">brglm2::brglmFit</span> by default. The
        package&apos;s own test suite reproduces the separation finding with a
        deterministic collinearity case.
      </div>

      <h2 className="text-xl font-bold mt-12 mb-4">Missing-value-aware by construction</h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        Real-world records are messy: missing phones, empty addresses, blank
        names. ERBOT never imputes a similarity it didn&apos;t observe. A
        missing field yields NA for that pair-field, and the combiner simply
        re-weights the fields that are present. Blocking treats missing keys as
        singletons rather than pairing every null with every null.
      </p>
    </div>
  );
}
