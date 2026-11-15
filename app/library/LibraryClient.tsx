"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PAPERS, THEMES, type Paper } from "./papers-data";

const METHODS = ["key-based", "token-based", "hashing/LSH", "embedding/ANN", "graph-based", "probabilistic", "ML classifier", "deep learning", "LLM", "Bayesian", "string metric", "phonetic", "system", "survey", "benchmark"];
const SUPERVISION = ["supervised", "unsupervised", "self-supervised", "n/a"];
const DATATYPES = ["structured", "textual", "mixed", "relational", "multi-source"];
const SCALES = ["small benchmark", "large (100K-1M)", "web scale (>1M)", "n/a"];
const YEARS = ["2026", "2025", "2024", "2023", "2022", "2017–2021", "2012–2016", "2007–2011", "2002–2006", "1997–2001", "1992–1996", "1991 and earlier"];

function yearBucket(y: number | null): string {
  if (!y) return "2020s";
  if (y >= 2022) return String(y);
  if (y >= 2017) return "2017–2021";
  if (y >= 2012) return "2012–2016";
  if (y >= 2007) return "2007–2011";
  if (y >= 2002) return "2002–2006";
  if (y >= 1997) return "1997–2001";
  if (y >= 1992) return "1992–1996";
  return "1991 and earlier";
}
function shortAuthors(a: string[]): string {
  if (a.length === 0) return "";
  if (a.length <= 3) return a.join(", ");
  return a.slice(0, 3).join(", ") + " et al.";
}

export default function LibraryClient() {
  const [query, setQuery] = useState("");
  const [themes, setThemes] = useState<Set<string>>(new Set());
  const [methods, setMethods] = useState<Set<string>>(new Set());
  const [sups, setSups] = useState<Set<string>>(new Set());
  const [dts, setDts] = useState<Set<string>>(new Set());
  const [scales, setScales] = useState<Set<string>>(new Set());
  const [years, setYears] = useState<Set<string>>(new Set());
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState("year-desc");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [jump, setJump] = useState("");
  const [jumpMsg, setJumpMsg] = useState("");
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const toggleIn = (set: Set<string>, v: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v); else n.add(v);
    fn(n);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PAPERS.filter((p) => {
      if (themes.size && !p.themes.some((t) => themes.has(t))) return false;
      if (methods.size && !p.method.some((m) => methods.has(m))) return false;
      if (sups.size && !sups.has(p.supervision)) return false;
      if (dts.size && !dts.has(p.dataType)) return false;
      if (scales.size && !scales.has(p.scale)) return false;
      if (years.size && !years.has(yearBucket(p.year))) return false;
      if (verifiedOnly && !p.verified) return false;
      if (q) {
        const hay = (p.title + " " + p.authors.join(" ") + " " + p.abstract + " " + p.focus + " " + p.id).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "year-desc") return (b.year ?? 0) - (a.year ?? 0) || a.n - b.n;
      if (sort === "year-asc") return (a.year ?? 9999) - (b.year ?? 9999) || a.n - b.n;
      if (sort === "citations") return (b.citations ?? -1) - (a.citations ?? -1) || a.n - b.n;
      return a.n - b.n;
    });
    return list;
  }, [query, themes, methods, sups, dts, scales, years, verifiedOnly, sort]);

  const clearAll = () => {
    setThemes(new Set()); setMethods(new Set()); setSups(new Set());
    setDts(new Set()); setScales(new Set()); setYears(new Set());
    setQuery(""); setVerifiedOnly(false);
  };

  const jumpTo = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) { setJumpMsg("Enter a paper number, e.g. 42."); return; }
    const n = parseInt(digits, 10);
    const p = PAPERS.find((x) => x.n === n);
    if (!p) { setJumpMsg(`No paper No. ${n} in the library yet.`); return; }
    clearAll();
    setJumpMsg("");
    setOpen((s) => new Set(s).add(p.id));
    setFlash(p.id);
    history.replaceState(null, "", `#${p.id}`);
    setTimeout(() => {
      cardRefs.current.get(p.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    setTimeout(() => setFlash(null), 2600);
  };

  useEffect(() => {
    const h = location.hash.replace("#", "");
    if (/^er-\d+$/.test(h) && PAPERS.some((p) => p.id === h)) jumpTo(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const facetGroup = (title: string, values: string[], set: Set<string>, fn: (s: Set<string>) => void, counts?: Map<string, number>) => (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((v) => {
          const active = set.has(v);
          const c = counts?.get(v);
          if (c !== undefined && c === 0) return null;
          return (
            <button key={v} onClick={() => toggleIn(set, v, fn)}
              className={`text-xs px-2 py-1 rounded-full border transition ${active ? "bg-teal-700 text-white border-teal-700" : "bg-white text-slate-600 border-slate-200 hover:border-teal-500"}`}>
              {v}{c !== undefined ? ` · ${c}` : ""}
            </button>
          );
        })}
      </div>
    </div>
  );

  const themeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of PAPERS) for (const t of p.themes) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  }, []);

  const yearCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of PAPERS) { const b = yearBucket(p.year); m.set(b, (m.get(b) ?? 0) + 1); }
    return m;
  }, []);

  const filters = (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">Filter by</div>
        <button onClick={clearAll} className="text-xs text-teal-700 underline decoration-dotted underline-offset-2">Clear all</button>
      </div>
      {facetGroup("Theme", THEMES.map((t) => t.id), themes, setThemes, themeCounts)}
      <div className="mt-2 space-y-1">
        {THEMES.filter((t) => themes.has(t.id)).map((t) => (
          <p key={t.id} className="text-xs text-slate-400 leading-snug">{t.name}: {t.blurb}</p>
        ))}
      </div>
      {facetGroup("Method", METHODS, methods, setMethods)}
      {facetGroup("Supervision", SUPERVISION, sups, setSups)}
      {facetGroup("Data type", DATATYPES, dts, setDts)}
      {facetGroup("Scale", SCALES, scales, setScales)}
      {facetGroup("Year", YEARS, years, setYears, yearCounts)}
      <label className="mt-5 flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
        <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-teal-700" />
        Verified entries only
      </label>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Literature Library</h1>
      <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-3xl">
        A working library of entity resolution and record linkage research, organised by theme and
        searchable from several angles. Every entry carries a short focus note and a preliminary
        three-lens reading — <strong>Borrow</strong> (what we can take from it), <strong>Fill</strong>{" "}
        (the gap it leaves for us — what it did not do that we can), <strong>Correct</strong> (what in
        its core claims we should question). Bibliographic details are checked against Crossref and Semantic Scholar; entries
        still awaiting full verification are marked <span className="text-amber-600 font-medium">Unverified</span>.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, author, abstract, focus…"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-600 bg-white" />
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); jumpTo(jump); }}>
          <input value={jump} onChange={(e) => setJump(e.target.value)} placeholder="Go to No. (e.g. 42)"
            className="w-44 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-600 bg-white" />
          <button type="submit" className="px-3 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800">Go</button>
        </form>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white text-slate-600">
          <option value="year-desc">Year · newest first</option>
          <option value="year-asc">Year · oldest first</option>
          <option value="citations">Citations · most first</option>
          <option value="number">Number</option>
        </select>
      </div>
      {jumpMsg && <p className="mt-2 text-sm text-amber-600">{jumpMsg}</p>}

      <div className="mt-8 flex gap-8 items-start">
        <aside className="hidden lg:block w-60 shrink-0 sticky top-24 border border-slate-200 rounded-xl p-4 bg-white">
          {filters}
        </aside>
        <div className="flex-1 min-w-0">
          <details className="lg:hidden border border-slate-200 rounded-xl p-4 bg-white mb-4">
            <summary className="text-sm font-semibold text-slate-700 cursor-pointer">Filters</summary>
            <div className="mt-2">{filters}</div>
          </details>
          <p className="text-sm text-slate-500 mb-3">
            {filtered.length} of {PAPERS.length} papers
            {themes.size > 0 && <> in {[...themes].map((t) => THEMES.find((x) => x.id === t)?.name).join(", ")}</>}
          </p>
          <div className="space-y-3">
            {filtered.map((p) => (
              <PaperCard key={p.id} p={p} open={open.has(p.id)} flash={flash === p.id}
                refCb={(el) => { if (el) cardRefs.current.set(p.id, el); }}
                onToggle={() => {
                  const n = new Set(open);
                  if (n.has(p.id)) n.delete(p.id); else { n.add(p.id); history.replaceState(null, "", `#${p.id}`); }
                  setOpen(n);
                }} />
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                No papers match the current filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaperCard({ p, open, flash, onToggle, refCb }: {
  p: Paper; open: boolean; flash: boolean; onToggle: () => void; refCb: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={refCb} id={p.id}
      className={`scroll-mt-24 border rounded-xl bg-white transition-shadow ${flash ? "border-teal-500 shadow-[0_0_0_3px_rgba(13,148,136,0.25)]" : "border-slate-200"}`}>
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          <code className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">{p.id}</code>
          {!p.verified && <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Unverified</span>}
          <span className="text-sm text-slate-500">{shortAuthors(p.authors)}</span>
          <span className="text-xs text-slate-400">{p.year ?? ""}</span>
        </div>
        <div className="mt-1.5 font-medium text-slate-800 leading-snug">{p.title}</div>
        <div className="mt-1 text-xs text-slate-400">
          {p.venue ?? ""}{p.citations != null ? ` · Cited by ${p.citations}` : ""}
          {" · "}{p.themes.map((t) => THEMES.find((x) => x.id === t)?.name ?? t).join(" · ")}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {p.abstract && (
            <>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-1">Abstract</div>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{p.abstract}</p>
            </>
          )}
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4">Focus</div>
          <p className="mt-1 text-sm text-slate-700 leading-relaxed">{p.focus}</p>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <Lens label="Borrow" body={p.borrow} />
            <Lens label="Fill" body={p.fill} />
            <Lens label="Correct" body={p.correct} />
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            {p.doi && <a className="text-teal-700 underline decoration-dotted underline-offset-2" href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer">doi:{p.doi}</a>}
            <span>{p.method.join(" / ")} · {p.supervision} · {p.dataType} · {p.scale}</span>
          </div>
          {!p.verified && p.verifyNote && <p className="mt-2 text-xs text-amber-600">Verification note: {p.verifyNote}</p>}
        </div>
      )}
    </div>
  );
}

function Lens({ label, body }: { label: string; body: string }) {
  return (
    <div className="border border-slate-100 bg-slate-50/60 rounded-lg p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">{label}</div>
      <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
