"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DATASETS, type Dataset } from "../datasets";

type SourceKind = "sample" | "upload" | "url";

type ColProfile = {
  name: string;
  dtype: string;
  n_missing: number;
  missing_pct: number;
  n_unique: number;
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
  columns?: ColProfile[];
  truth?: TruthProfile | null;
  truth_col?: string | null;
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

  async function fetchProfile(text: string, name: string, tcol: string) {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_text: text, filename: name, truth_col: tcol || undefined }),
      });
      const j = (await r.json()) as Profile;
      if (!j.ok) setError(j.error || "Profiling failed.");
      setProfile(j.ok ? j : null);
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
    fetchProfile(text, name, tcol);
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
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const j = (await r.json()) as Profile;
      if (!j.ok) {
        setError(j.error || "Could not fetch that link.");
        setProfile(null);
      } else {
        // re-fetch the raw text for the Studio handoff via the same endpoint
        setProfile(j);
        setFilename(j.filename || "link.csv");
        setDatasetSource(u);
        setCsvText(null); // URL mode: Studio will re-fetch from the link
        setTruthCol("");
      }
    } catch {
      setError("Could not reach the profiling service.");
    } finally {
      setLoading(false);
    }
  }

  function pickSource(s: SourceKind) {
    setSource(s);
    setError("");
    setProfile(null);
    setCsvText(null);
    setTruthCol("");
    if (s === "sample") useDataset(DATASETS[0]);
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
        JSON.stringify({ csv_text: csvText, filename })
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
          <section className="mt-4 border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-bold text-lg">{p.filename}</h2>
              {datasetSource && (
                <span className="text-xs text-slate-400">Source: {datasetSource}</span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Records", (p.n_records ?? 0).toLocaleString()],
                ["Columns", String(p.n_columns ?? 0)],
                [
                  "True entities",
                  p.truth ? p.truth.n_entities.toLocaleString() : "—",
                ],
                [
                  "Cells missing",
                  (() => {
                    const miss = (p.columns ?? []).reduce((a, c) => a + c.n_missing, 0);
                    const total = (p.n_records ?? 0) * (p.n_columns ?? 0);
                    return total ? `${((100 * miss) / total).toFixed(1)}%` : "—";
                  })(),
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="border border-slate-200 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl font-extrabold text-teal-700">{v}</div>
                  <div className="text-xs text-slate-500 mt-1">{k}</div>
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
                  onChange={(e) => {
                    const tc = e.target.value;
                    setTruthCol(tc);
                    if (csvText) fetchProfile(csvText, filename, tc);
                  }}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                >
                  <option value="">No truth</option>
                  {(p.columns ?? []).map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
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
            <h2 className="font-bold">Columns</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b">
                  <th className="py-2 pr-3">column</th>
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
                    <td className="py-2 pr-3 font-mono text-xs font-medium">{c.name}</td>
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
                    <td className="py-2 pr-3 text-xs text-slate-500">
                      {c.n_missing > 0
                        ? `${c.n_missing.toLocaleString()} (${c.missing_pct}%)`
                        : "—"}
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
