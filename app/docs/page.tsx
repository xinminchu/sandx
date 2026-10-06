const CORE: [string, string][] = [
  ["er_run()", "Run the full entity-resolution pipeline"],
  ["er_block()", "Generate candidate pairs via blocking"],
  ["er_similarity()", "Compute per-field similarity for all candidate pairs"],
  ["er_combine()", "NA-aware adaptive weighted similarity combination"],
  ["er_weights()", "Learn or select field weights"],
  ["er_cluster()", "Run a single clustering method"],
  ["er_cluster_all()", "Run all clustering methods"],
  ["er_merge()", "Post-process clustering results"],
  ["er_evaluate()", "Evaluate clustering against ground truth"],
];

const SUPERVISED: [string, string][] = [
  ["er_supervised_classifiers()", "Names of the 11 supervised pairwise classifiers"],
  ["er_pair_features()", "Build the pair-feature matrix from per-field similarities"],
  ["er_pair_classify()", "Fit one supervised pairwise classifier"],
];

const HONEST: [string, string][] = [
  ["er_split()", "Entity-disjoint (or record-level) CV folds"],
  ["er_stratified_three_way_split()", "Entity-disjoint three-way split with positive-pair quotas"],
  ["er_augment_fit_pairs()", "Augment positive pairs inside the Fit partition only"],
  ["er_positive_ratio_report()", "Per-partition natural-prevalence report"],
  ["er_tune()", "Tune ER methods over parameter grids"],
  ["er_cv()", "K-fold cross-validation for the pipeline"],
  ["er_protocol_a()", "Protocol A: full-data principled parameter selection"],
  ["er_protocol_b()", "Protocol B: entity-disjoint CV tune, true held-out evaluation"],
];

const STUDY: [string, string][] = [
  ["er_ablation_all()", "Full ablation study: single-run conditions + CV + baselines"],
  ["er_scaling_curve()", "Scalability curves by subsampling n"],
  ["er_stability_ari()", "Stability via repeated-subsample ARI"],
  ["er_bcubed()", "B-cubed precision, recall, and F-score"],
  ["er_ami()", "Adjusted mutual information"],
  ["er_baseline_splink()", "Splink probabilistic-linkage baseline"],
  ["er_scenarios()", "Scenario presets for stress-testing"],
];

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {rows.map(([fn, d], i) => (
        <div
          key={fn}
          className={`grid sm:grid-cols-[240px_1fr] gap-1 sm:gap-4 px-4 py-3 text-sm ${
            i % 2 ? "bg-white" : "bg-slate-50"
          }`}
        >
          <code className="font-mono2 text-teal-700">{fn}</code>
          <span className="text-slate-600">{d}</span>
        </div>
      ))}
    </div>
  );
}

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-extrabold">Docs</h1>
      <p className="text-slate-600 mt-2">
        The R package is the canonical engine. The Studio on this site runs a
        Python port of its core stages — same blocking, same NA-aware
        similarities, same clustering ideas.
      </p>

      <h2 className="text-xl font-bold mt-10 mb-3">Install</h2>
      <pre className="code">
        <code>{`# R (canonical package)\ninstall.packages("remotes")\nremotes::install_github("xinminchu/erbot")\n\nlibrary(erbot)`}</code>
      </pre>

      <h2 className="text-xl font-bold mt-10 mb-3">Quickstart</h2>
      <pre className="code">
        <code>{`# one call: nine stages, honest defaults\nres <- er_run(df, truth = truth_tbl)\nres$metrics        # ARI, B-cubed, AMI, ...\nres$labels         # cluster per record\n\n# or stage by stage\npairs <- er_block(df, method = "prefix", block_key = "name")\nsim   <- er_similarity(df, pairs,\n          spec = list(list(name = "name", type = "jw"),\n                      list(name = "address", type = "jw")))\nS     <- er_pairs_to_sparse(pairs, er_combine(sim), n = nrow(df))\nlabs  <- er_cluster(S, method = "louvain")\n\n# supervised pairwise classifier (Firth logistic default)\nfit <- er_pair_classify(sim, pairs, truth_vec = truth,\n                        classifier = "logistic")\nfit$valid          # FALSE + reason if structurally inapplicable`}</code>
      </pre>

      <h2 className="text-xl font-bold mt-10 mb-3">Core pipeline</h2>
      <Table rows={CORE} />

      <h2 className="text-xl font-bold mt-10 mb-3">Supervised classifiers</h2>
      <Table rows={SUPERVISED} />

      <h2 className="text-xl font-bold mt-10 mb-3">Honest evaluation</h2>
      <Table rows={HONEST} />

      <h2 className="text-xl font-bold mt-10 mb-3">Studies &amp; baselines</h2>
      <Table rows={STUDY} />

      <h2 className="text-xl font-bold mt-10 mb-3">The Studio engine</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">
        <p>
          The <a href="/studio" className="text-teal-700 font-medium">Studio</a>{" "}
          runs <span className="font-mono2">engine/</span> — a pure-Python port
          of ERBOT&apos;s core stages on a serverless function: blocking,
          NA-aware similarity, <em>classification</em> (score ≥ threshold, or
          top-k links per record), clustering (threshold connected-components,
          Louvain), and evaluation (ARI, pairwise precision/recall/F1, B-cubed
          when gold truth is attached). Pairs stream through the pipeline, so
          million-pair runs stay in budget. It covers the interactive-dedup
          path; the full R package adds weight learning, consensus merging,
          multiplex fusion, baselines, and the complete evaluation suite.
        </p>
        <p>
          Every Studio run shows its equivalent R code — the exact{" "}
          <span className="font-mono2">erbot</span> calls that reproduce the
          result on your own machine.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 p-5 text-sm">
        <span className="font-bold">Source &amp; issues: </span>
        <a
          href="https://github.com/xinminchu/erbot"
          target="_blank"
          rel="noreferrer"
          className="text-teal-700 font-medium"
        >
          github.com/xinminchu/erbot
        </a>
      </div>
    </div>
  );
}
