"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DATASETS, type Dataset } from "../datasets";
import Term from "../../components/Term";

type SourceKind = "sample" | "upload" | "url";

type ColProfile = {
  name: string;
  dtype: string;
  n_missing: number;
  missing_pct: number;
  n_unique: number;
  role: string;
  role_reason: string;
  min?: number | string;
  max?: number | string;
  mean?: number | string;
  avg_len?: number;
  top_values?: [string, number][];
  samples: string[];
};

type TruthProfile = {
  n_entities: number;
  n_labeled: number;
  size_min: number;
  size_max: number;
  size_mean: number;
  n_singletons: number;
  hist: [number, number][];
};

type Profile = {
  ok: boolean;
  error?: string;
  filename?: string;
  n_records?: number;
  n_columns?: number;
  n_complete?: number;
  columns?: ColProfile[];
  selection?: {
    fields: string[];
    n_complete: number;
    complete_pct: number;
  } | null;
  truth?: TruthProfile | null;
  truth_col?: string | null;
  truth_guess?: string | null;
};

export default function DataProfile() {
  const router = useRouter();
  const [source, setSource] = useState<SourceKind>("sample");
  const [urlInput, setUrlInput] = useState("");
  const [csvText, setCsvText] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [datasetSource, setDatasetSource] = useState("");
  const [truthCol, setTruthCol] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function scrollToResults() {
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      120
    );
  }

  const [selFields, setSelFields] = useState<string[] | null>(null);
  const truthTouched = useRef(false);

  async function postProfile(body: Record<string, unknown>): Promise<Profile | null> {
    const r = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await r.json()) as Profile;
  }

  async function runProfile(o: {
    text?: string | null;
    url?: string;
    name: string;
    tcol?: string;
    fields?: string[];
    scroll?: boolean;
  }) {
    setLoading(true);
    setError("");
    try {
      const post = (extra: Record<string, unknown>) =>
        postProfile({
          ...(o.url ? { url: o.url } : { csv_text: o.text, filename: o.name }),
          ...extra,
        });
      let j = await post({ truth_col: o.tcol || undefined, fields: o.fields });
      // Auto-apply a detected truth column (once — user choice wins after).
      if (j && j.ok && !j.truth && j.truth_guess && !truthTouched.current) {
        truthTouched.current = true;
        const tc = j.truth_guess;
        setTruthCol(tc);
        j = await post({ truth_col: tc, fields: o.fields });
      }
      if (!j || !j.ok) {
        setError(j?.error || "Profiling failed.");
        setProfile(null);
      } else {
        setProfile(j);
        setSelFields((prev) => prev ?? (j!.columns ?? []).map((c) => c.name));
        if (o.url && j.filename) setFilename(j.filename);
        if (o.scroll !== false) scrollToResults();
      }
    } catch {
      setError("Could not reach the profiling service.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  function loadText(text: string, name: string, src: string, tcol: string) {
    setCsvText(text);
    setFilename(name);
    setDatasetSource(src);
    setTruthCol(tcol);
    setSelFields(null);
    truthTouched.current = false;
    runProfile({ text, name, tcol, scroll: true });
  }

  async function useDataset(ds: Dataset) {
    setError("");
    try {
      const r = await fetch(`/data/${ds.file}`);
      const t = await r.text();
      loadText(t, ds.file, ds.source, ds.truthCol || "");
    } catch {
      setError("Failed to load the dataset.");
    }
  }

  function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("File too large: the demo service caps uploads at 2 MB.");
      return;
    }
    const rd = new FileReader();
    rd.onload = () => loadText(String(rd.result ?? ""), f.name, "uploaded file", "");
    rd.readAsText(f);
  }

  async function loadUrl() {
    const u = urlInput.trim();
    if (!u) {
      setError("Paste a link to a CSV file first.");
      return;
    }
    setFilename("link.csv");
    setDatasetSource(u);
    setCsvText(null); // URL mode: Studio will re-fetch from the link
    setTruthCol("");
    setSelFields(null);
    truthTouched.current = false;
    await runProfile({ url: u, name: "link.csv", scroll: true });
  }

  function pickSource(s: SourceKind) {
    setSource(s);
    setError("");
    setProfile(null);
    setCsvText(null);
    setTruthCol("");
    setSelFields(null);
    truthTouched.current = false;
    if (s === "sample") useDataset(DATASETS[0]);
  }

  function toggleField(name: string) {
    const cur = selFields ?? [];
    const next = cur.includes(name) ? cur.filter((f) => f !== name) : [...cur, name];
    setSelFields(next);
    // State is settled here (user interaction after render), so reading
    // csvText/filename/truthCol is safe; do NOT scroll — keep the user's place.
    if (source === "url") {
      runProfile({ url: urlInput.trim(), name: filename, tcol: truthCol, fields: next, scroll: false });
    } else {
      runProfile({ text: csvText, name: filename, tcol: truthCol, fields: next, scroll: false });
    }
  }

  function onTruthSelect(tc: string) {
    truthTouched.current = true;
    setTruthCol(tc);
    if (source === "url") {
      runProfile({ url: urlInput.trim(), name: filename, tcol: tc, fields: selFields ?? undefined, scroll: false });
    } else {
      runProfile({ text: csvText, name: filename, tcol: tc, fields: selFields ?? undefined, scroll: false });
    }
  }

  // Load the first dataset on first visit.
  useEffect(() => {
    useDataset(DATASETS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openInStudio() {
    if (source === "url") {
      localStorage.setItem(
        "sandx_profile_handoff",
        JSON.stringify({ url: urlInput.trim(), filename })
      );
    } else if (csvText) {
      localStorage.setItem(
        "sandx_profile_handoff",
        JSON.stringify({ csv_text: csvText, filename, truthCol: truthCol || undefined })
      );
    } else {
      return;
    }
    router.push("/studio");
  }

  const p = profile;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <Link href="/studio" className="text-sm text-teal-700 hover:underline">
        ← Back to Studio
      </Link>
      <h1 className="text-3xl font-extrabold mt-2">Data profile</h1>
      <p className="text-slate-500 mt-1">
        The full picture of a dataset before you run anything: shape, columns,
        missing values, and the truth summary.
      </p>

      {/* source picker */}
      <section className="mt-6 border border-slate-200 rounded-xl p-5">
        <h2 className="font-bold">1 · Pick a dataset</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["sample", "Sample datasets"],
              ["upload", "Upload CSV"],
              ["url", "Link to CSV"],
            ] as [SourceKind, string][]
          ).map(([s, label]) => (
            <button
              key={s}
              onClick={() => pickSource(s)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                source === s
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {source === "sample" && (
          <div className="mt-3 grid gap-2 max-w-2xl">
            {DATASETS.map((ds) => (
              <button
                key={ds.file}
                type="button"
                onClick={() => useDataset(ds)}
                className={`text-left px-4 py-3 rounded-lg border ${
                  filename === ds.file
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm font-medium">{ds.label}</div>
                <div className="text-xs text-slate-500">{ds.desc}</div>
                <div className="text-xs text-slate-400 mt-0.5">Source: {ds.source}</div>
              </button>
            ))}
          </div>
        )}
        {source === "upload" && (
          <label className="mt-3 inline-block px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 cursor-pointer">
            Choose file…
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
        )}
        {source === "url" && (
          <div className="mt-3 flex gap-2 max-w-xl">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUrl()}
              placeholder="https://…/data.csv"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={loadUrl}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
            >
              Load
            </button>
          </div>
        )}
      </section>

      {error && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {loading && <p className="mt-4 text-sm text-slate-500">Profiling…</p>}

      {p?.ok && (
        <>
          {/* overview */}
          <section ref={resultsRef} className="mt-4 border border-slate-200 rounded-xl p-5 scroll-mt-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-bold text-lg">{p.filename}</h2>
              {datasetSource && (
                <span className="text-xs text-slate-400">Source: {datasetSource}</span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(
                [
                  [null, "Records", (p.n_records ?? 0).toLocaleString()],
                  [null, "Columns", String(p.n_columns ?? 0)],
                  [
                    "truth-entities",
                    "True entities",
                    p.truth ? p.truth.n_entities.toLocaleString() : "—",
                  ],
                  [
                    "complete-records",
                    "Complete records",
                    (() => {
                      const nc = p.n_complete ?? 0;
                      const nr = p.n_records ?? 0;
                      const pct = nr ? ((100 * nc) / nr).toFixed(1) : "—";
                      return `${nc.toLocaleString()} (${pct}%)`;
                    })(),
                  ],
                  [
                    null,
                    "Cells missing",
                    (() => {
                      const miss = (p.columns ?? []).reduce((a, c) => a + c.n_missing, 0);
                      const total = (p.n_records ?? 0) * (p.n_columns ?? 0);
                      return total ? `${((100 * miss) / total).toFixed(1)}%` : "—";
                    })(),
                  ],
                ] as [string | null, string, string][]
              ).map(([gid, k, v]) => (
                <div
                  key={k}
                  className="border border-slate-200 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl font-extrabold text-teal-700">{v}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {gid ? <Term id={gid}>{k}</Term> : k}
                  </div>
                </div>
              ))}
            </div>

            {/* truth picker for uploads / links */}
            {!p.truth && (p.columns ?? []).length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500">
                  This dataset has a truth column?
                </span>
                <select
                  value={truthCol}
                  onChange={(e) => onTruthSelect(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                >
                  <option value="">No truth</option>
                  {(p.columns ?? []).map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                      {p.truth_guess === c.name ? " (detected)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* truth summary */}
            {p.truth && (
              <div className="mt-4 border border-teal-200 bg-teal-50/50 rounded-lg p-4">
                <div className="text-sm font-bold">
                  Truth summary{" "}
                  <span className="font-normal text-slate-400">
                    (column “{p.truth_col}” · {p.truth.n_labeled.toLocaleString()}{" "}
                    labeled records)
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                  <span>
                    <b>{p.truth.n_entities.toLocaleString()}</b> entities
                  </span>
                  <span>
                    size <b>{p.truth.size_min}</b>–<b>{p.truth.size_max}</b>, mean{" "}
                    <b>{p.truth.size_mean}</b>
                  </span>
                  <span>
                    <b>{p.truth.n_singletons.toLocaleString()}</b> singletons
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  size → entities:{" "}
                  {p.truth.hist
                    .slice(0, 12)
                    .map(([s, n]) => `${s}→${n}`)
                    .join(" · ")}
                  {p.truth.hist.length > 12 && " · …"}
                </div>
              </div>
            )}

            <button
              onClick={openInStudio}
              disabled={source !== "sample" && source !== "upload" ? !urlInput.trim() : !csvText}
              className="mt-4 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              Open in Studio →
            </button>
          </section>

          {/* columns */}
          <section className="mt-4 border border-slate-200 rounded-xl p-5 overflow-x-auto">
            <h2 className="font-bold">Columns <span className="font-normal text-xs text-slate-400">(<Term id="column-roles">roles</Term>)</span></h2>
            {(() => {
              const cols = p.columns ?? [];
              const ids = cols.filter((c) => c.role === "id").map((c) => c.name);
              const truths = cols.filter((c) => c.role === "truth").map((c) => c.name);
              const excluded = cols.filter((c) => c.role === "exclude");
              const features = cols.filter((c) => c.role === "feature").map((c) => c.name);
              return (
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  {ids.length > 0 && (
                    <div>
                      <span className="font-medium text-violet-700">id:</span> {ids.join(", ")}
                    </div>
                  )}
                  {truths.length > 0 && (
                    <div>
                      <span className="font-medium text-teal-700">truth:</span> {truths.join(", ")}
                    </div>
                  )}
                  {features.length > 0 && (
                    <div>
                      <span className="font-medium text-slate-700">match fields:</span>{" "}
                      {features.join(", ")}
                    </div>
                  )}
                  {excluded.length > 0 && (
                    <div>
                      <span className="font-medium text-amber-700">excluded from ER:</span>{" "}
                      {excluded.map((c) => `${c.name} (${c.role_reason})`).join(" · ")}
                    </div>
                  )}
                </div>
              );
            })()}
            {p.selection && (
              <div className="mt-3 text-sm bg-teal-50/60 border border-teal-200 rounded-lg px-3 py-2">
                <span className="font-medium">{p.selection.fields.length} fields selected</span>
                {" → "}
                <span className="font-bold text-teal-700">
                  {p.selection.n_complete.toLocaleString()}
                </span>{" "}
                complete records ({p.selection.complete_pct}%)
              </div>
            )}
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b">
                  <th className="py-2 pr-2">
                    <span title="Select fields to analyze missing / complete on the subset">
                      use
                    </span>
                  </th>
                  <th className="py-2 pr-3">column</th>
                  <th className="py-2 pr-3">role</th>
                  <th className="py-2 pr-3">type</th>
                  <th className="py-2 pr-3">missing</th>
                  <th className="py-2 pr-3">unique</th>
                  <th className="py-2 pr-3">summary</th>
                  <th className="py-2">samples</th>
                </tr>
              </thead>
              <tbody>
                {(p.columns ?? []).map((c) => (
                  <tr key={c.name} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={(selFields ?? []).includes(c.name)}
                        onChange={() => toggleField(c.name)}
                        className="accent-teal-600 w-4 h-4"
                        aria-label={`select ${c.name}`}
                      />
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs font-medium">{c.name}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                          c.role === "id"
                            ? "bg-violet-50 text-violet-700"
                            : c.role === "truth"
                            ? "bg-teal-50 text-teal-700"
                            : c.role === "exclude"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        title={c.role_reason || undefined}
                      >
                        {c.role === "id"
                          ? "id"
                          : c.role === "truth"
                          ? "truth"
                          : c.role === "exclude"
                          ? "excluded"
                          : "field"}
                      </span>
                      {c.role_reason && (
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-[180px]">
                          {c.role_reason}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          c.dtype === "numeric"
                            ? "bg-blue-50 text-blue-700"
                            : c.dtype === "id"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.dtype}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-500 min-w-[110px]">
                      {c.n_missing > 0 ? (
                        <div>
                          <div>
                            {c.n_missing.toLocaleString()} ({c.missing_pct}%)
                          </div>
                          <div className="mt-1 h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${Math.min(100, c.missing_pct)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-500">
                      {c.n_unique.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-500 max-w-[240px]">
                      {c.dtype === "numeric" && (
                        <>min {c.min} · max {c.max} · mean {c.mean}</>
                      )}
                      {c.dtype === "text" && (
                        <>
                          avg len {c.avg_len}
                          {(c.top_values ?? []).length > 0 && (
                            <> · top: {c.top_values!.slice(0, 3).map(([v, n]) => `${v}×${n}`).join(", ")}</>
                          )}
                        </>
                      )}
                      {c.dtype === "id" && <>unique key</>}
                    </td>
                    <td className="py-2 text-xs text-slate-400 max-w-[280px] truncate">
                      {c.samples.join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
