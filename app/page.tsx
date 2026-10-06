import Link from "next/link";

const STAGES = [
  ["01 · Load", "Read CSVs, parse truth, normalize text."],
  ["02 · Diagnose", "Field types, missingness, and blocking-key advice."],
  ["03 · Block", "Standard, prefix, or sorted-neighborhood candidate pairs."],
  ["04 · Similarity", "NA-aware per-field scores: Jaro-Winkler, Levenshtein, Jaccard."],
  ["05 · Combine", "Weighted fusion of field similarities into one matrix."],
  ["06 · Weights", "Uniform, Fellegi–Sunter EM, or ARI-learned field weights."],
  ["07 · Cluster", "Threshold CC, Louvain, Leiden, HDBSCAN, or 11 supervised classifiers."],
  ["08 · Merge", "Consensus merging across methods, small-cluster absorption."],
  ["09 · Evaluate", "ARI, B-cubed, AMI — aligned by record id, never by position."],
];

const STATS: [string, string][] = [
  ["199", "regression tests, zero warnings"],
  ["9", "pipeline stages, one function call"],
  ["11", "supervised classifier families"],
  ["0", "truth leakage in default paths"],
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-12 text-center">
        <div className="inline-block text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 mb-5">
          R package · xinminchu/erbot · MIT
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Entity resolution,
          <br />
          <span className="text-teal-600">sand in, gold out.</span>
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
          ERBOT is a unified R pipeline for deduplication and record linkage —
          nine stages from raw CSV to evaluated clusters, with the evaluation
          discipline most toolkits skip.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/studio"
            className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            Try the Studio →
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Read the docs
          </Link>
        </div>
        <div className="mt-8 max-w-xl mx-auto text-left">
          <pre className="code">
            <code>{`# install\nremotes::install_github("xinminchu/erbot")\n\n# one call, nine stages\nres <- er_run(df, truth = truth_tbl)\nres$metrics  # ARI, B-cubed, AMI`}</code>
          </pre>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(([n, label]) => (
            <div key={label}>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-700">
                {n}
              </div>
              <div className="mt-1 text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          One pipeline, nine stages
        </h2>
        <p className="text-slate-600 text-center mt-3 max-w-2xl mx-auto">
          Every stage is a documented, tested function. Run them individually
          for research — or call <span className="font-mono2 text-sm bg-slate-100 px-1.5 py-0.5 rounded">er_run()</span> and
          get the whole thing.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAGES.map(([title, desc]) => (
            <div
              key={title}
              className="stage-card border border-slate-200 rounded-xl p-5 bg-white"
            >
              <div className="font-bold text-teal-700">{title}</div>
              <div className="mt-2 text-sm text-slate-600">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Honesty */}
      <section className="bg-slate-900 text-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Honest by default
          </h2>
          <p className="text-center mt-3 max-w-2xl mx-auto text-slate-400">
            Most ER toolkits quietly let the truth leak into model selection.
            ERBOT&apos;s defaults make that impossible.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              ["Truth is evaluation-only", "Ground truth drives metrics, never clustering or classifier choice — unless you explicitly opt in."],
              ["Entity-disjoint splits", "Fit / Validation / Test partitions split by entity, not by record. No train-test leakage, ever."],
              ["No silent misalignment", "Predictions are aligned to record ids by name. A single mismatched id is a loud error, not a wrong number."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl bg-slate-800 p-5">
                <div className="font-bold text-white">{t}</div>
                <div className="mt-2 text-sm text-slate-400">{d}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/methods" className="text-teal-300 font-semibold hover:text-teal-200">
              How the methodology works →
            </Link>
          </div>
        </div>
      </section>

      {/* Classifiers */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          Eleven supervised classifiers
        </h2>
        <p className="text-slate-600 text-center mt-3 max-w-2xl mx-auto">
          Pairwise match-probability learners — logistic (Firth), LDA, QDA,
          k-NN, trees, random forests, XGBoost, neural nets, Fellegi–Sunter,
          radial SVM — each with a validity discipline: structural
          inapplicability is reported, never silently returned.
        </p>
        <div className="mt-8 max-w-3xl mx-auto rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <span className="font-bold text-slate-800">Why Firth logistic is the default.</span>{" "}
          On real ER data, plain logistic regression diverges under complete
          separation — the advisor&apos;s Scenario 1 confirmed it on four of five
          benchmarks. Firth&apos;s penalized likelihood stays finite where{" "}
          <span className="font-mono2">glm()</span> blows up. The package
          reproduces that finding in its own test suite.
        </div>
        <div className="text-center mt-8">
          <Link
            href="/studio"
            className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            Run it in the Studio →
          </Link>
        </div>
      </section>
    </div>
  );
}
