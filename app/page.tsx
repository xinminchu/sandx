import Link from "next/link";

const STATS: [string, string][] = [
  ["199", "regression tests, zero warnings"],
  ["9", "pipeline stages, one function call"],
  ["11", "supervised classifier families"],
  ["0", "truth leakage in default paths"],
];

const CARDS: [string, string, string, string][] = [
  [
    "Nine stages, one call",
    "Load → diagnose → block → similarity → combine → weights → cluster → merge → evaluate.",
    "/methods",
    "How it works →",
  ],
  [
    "Honest by default",
    "Truth is evaluation-only. Entity-disjoint splits. No silent misalignment.",
    "/methods",
    "The methodology →",
  ],
  [
    "Documented & tested",
    "Every stage is a tested, documented function. R package on GitHub, MIT licensed.",
    "/docs",
    "Read the docs →",
  ],
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

      {/* At a glance */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid sm:grid-cols-3 gap-4">
          {CARDS.map(([title, desc, href, link]) => (
            <Link
              key={title}
              href={href}
              className="block border border-slate-200 rounded-xl p-5 bg-white hover:border-teal-300 hover:shadow-sm transition"
            >
              <div className="font-bold">{title}</div>
              <div className="mt-2 text-sm text-slate-600">{desc}</div>
              <div className="mt-3 text-sm font-semibold text-teal-700">
                {link}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Have messy data? Run it.
        </h2>
        <p className="text-slate-600 mt-3 max-w-xl mx-auto">
          Upload a CSV in the Studio — no install, no signup — and get
          clusters, metrics, and the equivalent R code.
        </p>
        <div className="mt-6">
          <Link
            href="/studio"
            className="inline-block px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            Open the Studio →
          </Link>
        </div>
      </section>
    </div>
  );
}
