"use client";

import { useEffect, useRef, useState } from "react";

const SIM_METHODS = ["jw", "lv", "jaccard"];
const BLOCK_METHODS = ["prefix", "standard", "sn", "none"];
const CLUSTER_METHODS = ["threshold_cc", "louvain"];
const SAMPLE_OPTIONS = [
  { n: 0, label: "All records" },
  { n: 2000, label: "Random 2,000" },
  { n: 1000, label: "Random 1,000" },
  { n: 500, label: "Random 500" },
];
const PAIR_BUDGET = 500000;

type SourceKind = "sample" | "upload" | "url";

type Plan = {
  ok: boolean;
  error?: string;
  columns?: string[];
  n_records?: number;
  n_pairs?: number;
  sampled?: boolean;
  filename?: string;
};

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
  sampled?: boolean;
  warnings?: string[];
};

function smartBlockKey(cols: string[]): string {
  const named = cols.find((c) => /(name|title)$/i.test(c.trim()));
  return named ?? cols[0] ?? "";
}

export default function Studio() {
  const [source, setSource] = useState<SourceKind>("sample");
  const [payload, setPayload] = useState<{
    csv_text?: string;
    url?: string;
    filename?: string;
  } | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planning, setPlanning] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [blockMethod, setBlockMethod] = useState("prefix");
  const [blockKey, setBlockKey] = useState("");
  const [sampleN, setSampleN] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [clusterMethod, setClusterMethod] = useState("threshold_cc");
  const [truthCol, setTruthCol] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState("");
  const [showR, setShowR] = useState(false);
  const planTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refreshPlan(
    p = payload,
    bm = blockMethod,
    bk = blockKey,
    sn = sampleN,
    firstLoad = false
  ) {
    if (!p) return;
    setPlanning(true);
    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv_text: p.csv_text,
          url: p.url,
          filename: p.filename,
          block_method: bm,
          block_key: bk || undefined,
          sample_n: sn || undefined,
        }),
      });
      const j = (await r.json()) as Plan;
      setPlan(j);
      if (j.ok && j.columns) {
        setColumns(j.columns);
        setResult(null);
        setShowR(false);
        if (firstLoad) {
          // Set field/blocking defaults from the new schema, then
          // re-plan once with the smart blocking key.
          const init: Record<string, string> = {};
          j.columns.slice(0, 2).forEach((c) => (init[c] = "jw"));
          setFields(init);
          setTruthCol("");
          const key = smartBlockKey(j.columns);
          setBlockKey(key);
          setPlanning(false);
          refreshPlan(p, bm, key, sn, false);
          return;
        }
      } else if (!j.ok) {
        setError(j.error || "Could not plan this dataset.");
      }
    } catch {
      setError("Could not reach the planning service — try again.");
    } finally {
      setPlanning(false);
    }
  }

  function debouncePlan(p = payload, bm = blockMethod, bk = blockKey, sn = sampleN) {
    if (planTimer.current) clearTimeout(planTimer.current);
    planTimer.current = setTimeout(() => refreshPlan(p, bm, bk, sn), 450);
  }

  function loadPayload(p: { csv_text?: string; url?: string; filename?: string }) {
    setError("");
    setPlan(null);
    setColumns([]);
    setResult(null);
    setPayload(p);
    refreshPlan(p, blockMethod, blockKey, sampleN, true);
  }

  async function useSample() {
    setError("");
    try {
      const r = await fetch("/data/restaurant_sample.csv");
      const t = await r.text();
      loadPayload({ csv_text: t, filename: "restaurant_sample.csv" });
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
    rd.onload = () => loadPayload({ csv_text: String(rd.result ?? ""), filename: f.name });
    rd.readAsText(f);
  }

  function loadUrl() {
    const u = urlInput.trim();
    if (!u) {
      setError("Paste a link to a CSV file first.");
      return;
    }
    loadPayload({ url: u });
  }

  // Load the sample on first visit.
  useEffect(() => {
    useSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickSource(s: SourceKind) {
    setSource(s);
    setError("");
    if (s === "sample") useSample();
    else {
      setPayload(null);
      setPlan(null);
      setColumns([]);
      setResult(null);
    }
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
    if (!payload || !Object.keys(fields).length) {
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
          csv_text: payload.csv_text,
          url: payload.url,
          filename: payload.filename,
          sample_n: sampleN || undefined,
          config: {
            fields,
            block_method: blockMethod,
            block_key: blockMethod === "none" ? null : blockKey || null,
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
  const overBudget = plan?.ok && (plan.n_pairs ?? 0) > PAIR_BUDGET;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-extrabold">ER Studio</h1>
      <p className="text-slate-600 mt-2 max-w-2xl">
        Run a real entity-resolution pipeline — blocking, NA-aware similarity,
        clustering — powered by a Python port of ERBOT&apos;s core stages.
        Your data never leaves the request.
      </p>

      {/* 1 · Data source (pick exactly one) */}
      <section className="mt-8 border border-slate-200 rounded-xl p-5">
        <h2 className="font-bold">1 · Data — pick one source</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["sample", "Sample dataset"],
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
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono2"
            />
            <button
              onClick={loadUrl}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
            >
              Load
            </button>
          </div>
        )}

        <div className="mt-3 text-sm text-slate-500">
          {planning && <span>Analyzing dataset…</span>}
          {!planning && plan?.ok && (
            <span>
              {plan.filename} · {plan.n_records?.toLocaleString()} records
              {plan.sampled ? " (sampled)" : ""} · {plan.columns?.length} columns
            </span>
          )}
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </section>

      {/* 2 · Configure */}
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
                    fields[c] ? "border-teal-500 bg-teal-50" : "border-slate-200"
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
                      onChange={(e) => setFields((p) => ({ ...p, [c]: e.target.value }))}
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
                onChange={(e) => {
                  setBlockMethod(e.target.value);
                  debouncePlan(payload, e.target.value, blockKey, sampleN);
                }}
                className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2"
              >
                {BLOCK_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {blockMethod === "none" && (
                <span className="text-xs text-slate-400">no blocking: every pair is compared</span>
              )}
            </label>
            {blockMethod !== "none" && (
              <label className="block">
                <span className="font-medium text-slate-700">Blocking key</span>
                <select
                  value={blockKey}
                  onChange={(e) => {
                    setBlockKey(e.target.value);
                    debouncePlan(payload, blockMethod, e.target.value, sampleN);
                  }}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 font-mono2"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            )}
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
              <span className="font-medium text-slate-700">Sampling</span>
              <select
                value={sampleN}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setSampleN(n);
                  debouncePlan(payload, blockMethod, blockKey, n);
                }}
                className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2"
              >
                {SAMPLE_OPTIONS.map((o) => (
                  <option key={o.n} value={o.n}>
                    {o.label}
                  </option>
                ))}
              </select>
              {sampleN > 0 && (
                <span className="text-xs text-slate-400">seeded random sample — reproducible</span>
              )}
            </label>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-slate-700">
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
                className="w-full accent-teal-600"
              />
            </div>
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

          {/* pair budget preview */}
          {plan?.ok && (
            <div
              className={`mt-5 text-sm rounded-lg px-3 py-2 border ${
                overBudget
                  ? "text-amber-800 bg-amber-50 border-amber-200"
                  : "text-slate-600 bg-slate-50 border-slate-200"
              }`}
            >
              {(plan.n_records ?? 0).toLocaleString()} records →{" "}
              {(plan.n_pairs ?? 0).toLocaleString()} candidate pairs
              {plan.sampled ? " (on the sample)" : ""} · budget{" "}
              {PAIR_BUDGET.toLocaleString()}
              {overBudget && (
                <span>
                  {" "}— over budget. Pick a blocking key (not “none”) or turn on
                  sampling above.
                </span>
              )}
            </div>
          )}

          <button
            onClick={run}
            disabled={running || planning || !fieldCols.length || !!overBudget}
            className="mt-5 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {running ? "Running…" : "Run entity resolution"}
          </button>
        </section>
      )}

      {/* 3 · Results */}
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
              <div key={k} className="border border-slate-200 rounded-lg p-3 text-center">
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
                Showing first {result.display_rows.length} rows — download the CSV
                for the full result.
              </div>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
