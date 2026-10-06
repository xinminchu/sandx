import type { Metadata } from "next";
import Link from "next/link";
import { SECTIONS, type Entry } from "../components/glossary-data";

export const metadata: Metadata = {
  title: "Glossary — ERBOT",
  description:
    "Every term used in ERBOT Studio: similarity methods, blocking, classification, clustering, and evaluation metrics.",
};

function EntryCard({ e }: { e: Entry }) {
  return (
    <div id={e.id} className="scroll-mt-24 border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-baseline gap-2 flex-wrap">
        <code className="font-mono text-[15px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
          {e.term}
        </code>
        {e.aka && <span className="text-sm text-slate-500">{e.aka}</span>}
      </div>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{e.body}</p>
    </div>
  );
}

export default function Glossary() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
      <p className="mt-2 text-slate-500 text-sm leading-relaxed">
        Every abbreviation and term used in{" "}
        <Link href="/studio" className="text-teal-700 underline decoration-dotted underline-offset-2">
          Studio
        </Link>
        . Dotted-underlined terms anywhere on the site show their definition on click.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#sec-${s.id}`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-700"
          >
            {s.title}
          </a>
        ))}
      </nav>

      {SECTIONS.map((s) => (
        <section key={s.id} id={`sec-${s.id}`} className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-bold">{s.title}</h2>
          <p className="mt-1 mb-4 text-sm text-slate-500 leading-relaxed">{s.intro}</p>
          <div className="space-y-3">
            {s.entries.map((e) => (
              <EntryCard key={e.id} e={e} />
            ))}
          </div>
        </section>
      ))}

      <p className="mt-12 text-sm text-slate-400">
        Something unclear?{" "}
        <a
          href="https://github.com/xinminchu/erbot"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted underline-offset-2"
        >
          Open an issue on GitHub
        </a>
        .
      </p>
    </div>
  );
}
