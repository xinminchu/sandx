"use client";

import { useState } from "react";

const SIM_METHODS = ["jw", "lv", "jaccard"];
const BLOCK_METHODS = ["standard", "prefix", "sn", "none"];
const CLUSTER_METHODS = ["threshold_cc", "louvain"];

type RunResult = {
  ok: boolean;
  error?: string;
  n_records?: number;
  n_pairs?: number;
  n_clusters?: number;
  ari?: number | null;
  cluster_sizes?: number[];
  columns?: string[];
  display_rows?: Record<string, string>[];
  result_csv_b64?: string;
  r_code?: string;
  warnings?: string[];
};

function parseCSV(text: string): { columns: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") cur += c;
  }
  if (cur !== "" || row.length) {
    row.push(cur);
    rows.push(row);
  }
  const nonEmpty = rows.filter((r) => r.some((x) => x.trim() !== ""));
  return { columns: nonEmpty[0] ?? [], rows: nonEmpty.slice(1) };
}

export default function Studio() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [blockMethod, setBlockMethod] = useState("prefix");
  const [blockKey, setBlockKey] = useState("");
  const [threshold, setThreshold] = useState(0.5);
  const [clusterMethod, setClusterMethod] = useState("threshold_cc");
  const [truthCol, setTruthCol] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState("");
  const [showR, setShowR] = useState(false);

  function loadText(text: string, name: string) {
    const { columns: cols, rows } = parseCSV(text);
    if (!cols.length) {
      setError("Could not parse CSV: no header row found.");
      return;
    }
    if (rows.length > 3000) {
      setError(
        `Too many records (${rows.length}). The demo service caps at 3,000 rows.`
      );
      return;
    }
    setError("");
    setCsvText(text);
    setFileName(name);
    setColumns(cols);
    setRowCount(rows.length);
    setResult(null);
    // sensible defaults: first two text columns as match fields
    const init: Record<string, string> = {};
    cols.slice(0, 2).forEach((c) => (init[c] = "jw"));
    setFields(init);
    setBlockKey(cols[0] ?? "");
    setTruthCol("");
  }

  async function useSample() {
    setError("");
    try {
      const r = await fetch("/data/restaurant_sample.csv");
      const t = await r.text();
      loadText(t, "restaurant_sample.csv");
    } catch {
      setError("Failed to load the sample dataset.");
    }
  }

  function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("File too large: the demo service caps uploads at 2 MB.");
      return;
    }
    const rd = new FileReader();
    rd.onload = () => loadText(String(rd.result ?? ""), f.name);
    rd.readAsText(f);
  }

  function toggleField(col: string) {
    setFields((prev) => {
      const next = { ...prev };
      if (next[col]) delete next[col];
      else next[col] = "jw";
      return next;
    });
  }

  async function run() {
    if (!csvText || !Object.keys(fields).length) {
      setError("Load data and select at least one match field first.");
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv_text: csvText,
          filename: fileName,
          config: {
            fields,
            block_method: blockMethod,
            block_key: blockKey || null,
            threshold,
            cluster_method: clusterMethod,
            truth_col: truthCol || null,
          },
        }),
      });
      const j = (await r.json()) as RunResult;
      if (!j.ok) setError(j.error || "Run failed.");
      else setResult(j);
    } catch {
      setError("Request failed. The service may be cold-starting — try again.");
    } finally {
      setRunning(false);
    }
  }

  function download() {
    if (!result?.result_csv_b64) return;
    const bin = atob(result.result_csv_b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "erbot_clusters.csv";
    a.click();
  }

  const fieldCols = Object.keys(fields);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-extrabold">ER Studio</h1>
      <p className="text-slate-600 mt-2 max-w-2xl">
        Upload a CSV and run a real entity-resolution pipeline in your browser —
        blocking, NA-aware similarity, clustering — powered by a Python port of
        ERBOT&apos;s core stages. Your data never leaves the request.
      </p>

      {/* Data source */}
      <section className="mt-8 border border-slate-200 rounded-xl p-5">
        <h2 className="font-bold">1 · Data</h2>
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <button
            onClick={useSample}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
          >
            Use sample: restaurants
          </button>
          <label className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 cursor-pointer">
            Upload CSV…
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {fileName && (
            <span className="text-sm text-slate-500">
              {fileName} · {rowCount} records · {columns.length} columns
            </span>
          )}
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </section>

      {/* Config */}
      {columns.length > 0 && (
        <section className="mt-4 border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold">2 · Configure</h2>
          <div className="mt-4">
            <div className="text-sm font-medium text-slate-700 mb-2">
              Match fields <span className="text-slate-400">(similarity per field)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {columns.map((c) => (
                <label
                  key={c}
                  className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer ${
                    fields[c]
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!fields[c]}
                    onChange={() => toggleField(c)}
                    className="accent-teal-600"
                  />
                  <span className="font-mono2">{c}</span>
                  {fields[c] && (
                    <select
                      value={fields[c]}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, [c]: e.target.value }))
                      }
                      className="text-xs border border-slate-300 rounded px-1 py-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {SIM_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <label className="block">
              <span className="font-medium text-slate-700">Blocking</span>
              <select
                value={blockMethod}
                onChange={(e) => setBlockMethod(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2"
              >
                {BLOCK_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-medium text-slate-700">Blocking key</span>
              <select
                value={blockKey}
                onChange={(e) => setBlockKey(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 font-mono2"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-medium text-slate-700">Clustering</span>
              <select
                value={clusterMethod}
                onChange={(e) => setClusterMethod(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2"
              >
                {CLUSTER_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-medium text-slate-700">
                Truth column <span className="text-slate-400">(optional, for ARI)</span>
              </span>
              <select
                value={truthCol}
                onChange={(e) => setTruthCol(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 font-mono2"
              >
                <option value="">— none —</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">
              Similarity threshold:{" "}
              <span className="font-mono2">{threshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={0.95}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full max-w-md accent-teal-600"
            />
          </div>

          <button
            onClick={run}
            disabled={running || !fieldCols.length}
            className="mt-5 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {running ? "Running…" : "Run entity resolution"}
          </button>
        </section>
      )}

      {/* Results */}
      {result?.ok && (
        <section className="mt-4 border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold">3 · Results</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Records", String(result.n_records)],
              ["Candidate pairs", String(result.n_pairs)],
              ["Clusters", String(result.n_clusters)],
              ["ARI", result.ari == null ? "—" : result.ari.toFixed(3)],
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

          {result.warnings?.length ? (
            <div className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {result.warnings.join(" ")}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={download}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
            >
              Download clusters (CSV)
            </button>
            <button
              onClick={() => setShowR((s) => !s)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
            >
              {showR ? "Hide R code" : "View R code"}
            </button>
          </div>

          {showR && result.r_code && (
            <pre className="code mt-4">
              <code>{result.r_code}</code>
            </pre>
          )}

          {result.display_rows?.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-3 font-mono2">cluster</th>
                    {result.columns?.map((c) => (
                      <th key={c} className="py-2 pr-3 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.display_rows.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3 font-mono2 text-teal-700 font-bold">
                        {r.__cluster}
                      </td>
                      {result.columns?.map((c) => (
                        <td key={c} className="py-1.5 pr-3 text-slate-700">
                          {r[c]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-slate-400 mt-2">
                Showing first {result.display_rows.length} rows — download the
                CSV for the full result.
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
