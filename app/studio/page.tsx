"use client";

import { useEffect, useRef, useState } from "react";
import Term from "../components/Term";

const SIM_METHODS = ["jw", "lv", "jaccard"];
const SIM_LABELS: Record<string, string> = {
  jw: "jw — Jaro-Winkler",
  lv: "lv — Levenshtein",
  jaccard: "jaccard — word overlap",
};
const BLOCK_METHODS = ["prefix", "standard", "sn", "none"];
const BLOCK_LABELS: Record<string, string> = {
  prefix: "prefix — first 3 chars",
  standard: "standard — exact key",
  sn: "sn — sorted neighborhood",
  none: "none — all pairs",
};
const GLOSSARY_ID: Record<string, string> = {
  jw: "jw",
  lv: "lv",
  jaccard: "jaccard",
  prefix: "blocking-prefix",
  standard: "blocking-standard",
  sn: "blocking-sn",
  none: "blocking-none",
  tc: "tc",
  hc: "hc",
  hdbscan: "hdbscan",
  same: "same",
  threshold_cc: "threshold-cc",
  louvain: "louvain",
  logistic: "supervised-classifiers",
  lda: "supervised-classifiers",
  qda: "supervised-classifiers",
  knn: "supervised-classifiers",
  fellegi_sunter: "supervised-classifiers",
};
const CLASSIFY_METHODS = [
  ["tc", "Transitive closure"],
  ["hc", "Hierarchical"],
  ["hdbscan", "HDBSCAN"],
] as const;
const CLUSTER_GROUPS: { label: string; methods: [string, string][] }[] = [
  { label: "Keep classify labels", methods: [["same", "Same as classify (default)"]] },
  { label: "Unsupervised", methods: [["threshold_cc", "threshold_cc"], ["louvain", "louvain"]] },
  {
    label: "Supervised (needs truth)",
    methods: [
      ["logistic", "logistic"],
      ["lda", "lda"],
      ["qda", "qda"],
      ["knn", "knn"],
      ["fellegi_sunter", "fellegi_sunter"],
    ],
  },
];
import { DATASETS } from "./datasets";

const SAMPLE_OPTIONS = [
  { n: 0, label: "All records" },
  { n: 2000, label: "Random 2,000" },
  { n: 1000, label: "Random 1,000" },
  { n: 500, label: "Random 500" },
];
const PAIR_BUDGET = 2000000;

type SourceKind = "sample" | "upload" | "url";
type TruthKind = "none" | "column" | "file";

type Plan = {
  ok: boolean;
  error?: string;
  columns?: string[];
  n_records?: number;
  n_pairs?: number;
  sampled?: boolean;
  filename?: string;
  truth_columns?: string[];
  suggested_fields?: string[];
};

type RunResult = {
  ok: boolean;
  error?: string;
  n_records?: number;
  n_pairs?: number;
  n_links?: number;
  n_clusters?: number;
  ari?: number | null;
  metrics?: {
    ari: number;
    pairwise: { precision: number; recall: number; f1: number };
    b3: { precision: number; recall: number; f1: number };
    n_truth: number;
    n_true_clusters: number;
    held_out?: boolean;
    n_train_entities?: number;
    n_test_entities?: number;
  } | null;
  classify_n_clusters?: number;
  classify_metrics?: {
    ari: number;
    pairwise: { precision: number; recall: number; f1: number };
    b3: { precision: number; recall: number; f1: number };
  } | null;
  cluster_sizes?: number[];
  columns?: string[];
  display_rows?: Record<string, string>[];
  result_csv_b64?: string;
  r_code?: string;
  sampled?: boolean;
  truth_source?: string;
  n_truth_matched?: number;
  warnings?: string[];
};

function smartBlockKey(cols: string[]): string {
  const named = cols.find((c) => /(name|title)$/i.test(c.trim()));
  return named ?? cols[0] ?? "";
}

interface SavedRun {
  id: string;
  ts: number;
  label: string;
  dataset: string;
  config: {
    fields: string[];
    block_method: string;
    block_key: string | null;
    threshold: number;
    classify_method: string;
    cluster_method: string;
    held_out: boolean;
  };
  result: {
    n_clusters: number;
    classify_n_clusters: number;
    ari: number | null;
    classify_ari: number | null;
    pairwise_f1: number | null;
    b3_f1: number | null;
    n_pairs: number;
  };
}

const HISTORY_KEY = "sandx-run-history-v1";
const HISTORY_MAX = 20;

function loadHistory(): SavedRun[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function fmt3(v: number | null | undefined): string {
  return v == null ? "—" : v.toFixed(3);
}

function CompareTable({ runs }: { runs: SavedRun[] }) {
  // chronological: oldest first, so the first column is the baseline
  const ordered = [...runs].reverse();
  const first = ordered[0];
  const cfgRows: [string, (r: SavedRun) => string][] = [
    ["Dataset", (r) => r.dataset],
    ["Classify", (r) => r.config.classify_method],
    ["Clustering", (r) => r.config.cluster_method],
    ["Threshold", (r) => String(r.config.threshold)],
    [
      "Blocking",
      (r) =>
        r.config.block_method +
        (r.config.block_key ? ` · ${r.config.block_key}` : ""),
    ],
    ["Fields", (r) => r.config.fields.join(", ")],
    ["Held-out", (r) => (r.config.held_out ? "yes" : "no")],
  ];
  const metRows: [string, (r: SavedRun) => number | null, boolean][] = [
    ["ARI (classify step)", (r) => r.result.classify_ari, true],
    ["ARI (final)", (r) => r.result.ari, true],
    ["Pairwise F1", (r) => r.result.pairwise_f1, true],
    ["B³ F1", (r) => r.result.b3_f1, true],
    ["Clusters (classify step)", (r) => r.result.classify_n_clusters, false],
    ["Clusters (final)", (r) => r.result.n_clusters, false],
    ["Candidate pairs", (r) => r.result.n_pairs, false],
  ];
  return (
    <div className="mt-4 overflow-x-auto border border-teal-200 rounded-xl bg-white">
      <table className="w-full text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="p-2 text-left text-xs text-slate-400 w-44"></th>
            {ordered.map((r) => (
              <th key={r.id} className="p-2 text-left font-medium">
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cfgRows.map(([label, get]) => (
            <tr key={label} className="border-b border-slate-50">
              <td className="p-2 text-xs text-slate-400">{label}</td>
              {ordered.map((r) => {
                const changed = get(r) !== get(first);
                return (
                  <td
                    key={r.id}
                    className={`p-2 text-xs ${
                      changed ? "bg-amber-50 font-semibold text-amber-900" : ""
                    }`}
                  >
                    {get(r)}
                  </td>
                );
              })}
            </tr>
          ))}
          {metRows.map(([label, get, isScore]) => {
            const vals = ordered
              .map(get)
              .filter((v): v is number => v != null);
            const best = vals.length > 1 ? Math.max(...vals) : null;
            return (
              <tr key={label} className="border-b border-slate-50 last:border-0">
                <td className="p-2 text-xs text-slate-400">{label}</td>
                {ordered.map((r) => {
                  const v = get(r);
                  const isBest = v != null && best != null && v === best;
                  return (
                    <td
                      key={r.id}
                      className={`p-2 text-xs ${
                        isBest ? "font-bold text-teal-700" : ""
                      }`}
                    >
                      {v == null ? "—" : isScore ? v.toFixed(3) : v.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100">
        Amber = parameter differs from the earliest run. Bold teal = best
        score.
      </div>
    </div>
  );
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
  const [classifyMethod, setClassifyMethod] = useState<"tc" | "hc" | "hdbscan">(
    "tc"
  );
  const [hcH, setHcH] = useState(0.5);
  const [hdbscanMinPts, setHdbscanMinPts] = useState(2);
  const [clusterMethod, setClusterMethod] = useState("same");
  const [heldOut, setHeldOut] = useState(true);
  const [history, setHistory] = useState<SavedRun[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX)));
    } catch {
      /* storage full or unavailable — history just won't persist */
    }
  }, [history]);
  const [clusterFilter, setClusterFilter] = useState<string>("all");
  const [truthSource, setTruthSource] = useState<TruthKind>("none");
  const [truthCol, setTruthCol] = useState("");
  const [truthText, setTruthText] = useState("");
  const [truthFileName, setTruthFileName] = useState("");
  const [truthColumns, setTruthColumns] = useState<string[]>([]);
  const [dataIdCol, setDataIdCol] = useState("");
  const [truthIdCol, setTruthIdCol] = useState("");
  const [truthId2Col, setTruthId2Col] = useState("");
  const [truthClusterCol, setTruthClusterCol] = useState("");
  const [truthFormat, setTruthFormat] = useState<"labels" | "pairs">("labels");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState("");
  const [showR, setShowR] = useState(false);
  const planTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  // When an error appears (e.g. after clicking Run at the bottom of the
  // page), scroll it into view so it isn't missed.
  useEffect(() => {
    if (error) {
      const t = setTimeout(
        () => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
        80
      );
      return () => clearTimeout(t);
    }
  }, [error]);
  // Truth preset applied after the plan's firstLoad defaults settle.
  // (firstLoad runs async and would otherwise wipe a truth set by useDataset.)
  const pendingTruth = useRef<{ source: TruthKind; col: string } | null>(null);

  async function refreshPlan(
    p = payload,
    bm = blockMethod,
    bk = blockKey,
    sn = sampleN,
    firstLoad = false,
    tt = truthText
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
          truth_csv_text: tt || undefined,
        }),
      });
      const j = (await r.json()) as Plan;
      setPlan(j);
      if (j.ok && j.columns) {
        setColumns(j.columns);
        setResult(null);
        setShowR(false);
        if (j.truth_columns) {
          setTruthColumns(j.truth_columns);
          if (j.truth_columns.length && !truthIdCol) {
            setTruthIdCol(j.truth_columns[0]);
            setTruthId2Col(j.truth_columns[1] ?? j.truth_columns[0]);
            setTruthClusterCol(j.truth_columns[1] ?? j.truth_columns[0]);
            setDataIdCol((prev) => prev || j.columns![0] || "");
          }
        }
        if (firstLoad) {
          // Set field/blocking defaults from the new schema, then
          // re-plan once with the smart blocking key.
          // The truth column (if any) never becomes a match field or
          // blocking key — that would leak the answer into the features.
          const pt = pendingTruth.current;
          pendingTruth.current = null;
          const tcol = pt && pt.source === "column" ? pt.col : "";
          if (pt) {
            setTruthSource(pt.source);
            setTruthCol(pt.col);
          } else {
            setTruthSource("none");
            setTruthCol("");
          }
          const usable = j.columns.filter((c) => c !== tcol);
          const sugg = (j.suggested_fields?.length
            ? j.suggested_fields
            : j.columns.slice(0, 2)
          ).filter(
            (c) => c !== tcol && !/^(truth|gold|label|cluster|cluster_id)$/i.test(c)
          );
          const init: Record<string, string> = {};
          sugg.forEach((c) => (init[c] = "jw"));
          setFields(init);
          const key = smartBlockKey(usable);
          setBlockKey(key);
          setPlanning(false);
          refreshPlan(p, bm, key, sn, false, tt);
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

  async function useDataset(ds: (typeof DATASETS)[number]) {
    setError("");
    try {
      const r = await fetch(`/data/${ds.file}`);
      const t = await r.text();
      pendingTruth.current = ds.truthCol
        ? { source: "column", col: ds.truthCol }
        : null;
      loadPayload({ csv_text: t, filename: ds.file });
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
    rd.onload = () => loadPayload({ csv_text: String(rd.result ?? ""), filename: f.name });
    rd.readAsText(f);
  }

  function loadUrl(u?: string) {
    const url = (u ?? urlInput).trim();
    if (!url) {
      setError("Paste a link to a CSV file first.");
      return;
    }
    loadPayload({ url });
  }

  function onTruthFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("Truth file too large: 2 MB cap.");
      return;
    }
    const rd = new FileReader();
    rd.onload = () => {
      const t = String(rd.result ?? "");
      setTruthText(t);
      setTruthFileName(f.name);
      setTruthIdCol("");
      setTruthId2Col("");
      setTruthClusterCol("");
      setTruthFormat("labels");
      setError("");
      // Re-plan to pick up the truth file's columns.
      refreshPlan(payload, blockMethod, blockKey, sampleN, false, t);
    };
    rd.readAsText(f);
  }

  // Load the first dataset on first visit, or a handoff from the profile page.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sandx_profile_handoff");
      if (raw) {
        localStorage.removeItem("sandx_profile_handoff");
        const h = JSON.parse(raw);
        if (h.csv_text) {
          if (h.truthCol) {
            pendingTruth.current = { source: "column", col: h.truthCol };
          }
          loadPayload({ csv_text: h.csv_text, filename: h.filename || "dataset.csv" });
          return;
        }
        if (h.url) {
          setSource("url");
          setUrlInput(h.url);
          loadUrl(h.url);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    useDataset(DATASETS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickSource(s: SourceKind) {
    setSource(s);
    setError("");
    if (s === "sample") useDataset(DATASETS[0]);
    else {
      setPayload(null);
      setPlan(null);
      setColumns([]);
      setResult(null);
      setTruthSource("none");
      setTruthCol("");
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
    setClusterFilter("all");
    setTableOpen(false);
    try {
      const r = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv_text: payload.csv_text,
          url: payload.url,
          filename: payload.filename,
          sample_n: sampleN || undefined,
          truth_csv_text: truthSource === "file" ? truthText || undefined : undefined,
          truth_filename: truthFileName || undefined,
          truth_format: truthFormat,
          truth_id_col: truthIdCol || undefined,
          truth_id2_col: truthId2Col || undefined,
          truth_cluster_col: truthClusterCol || undefined,
          data_id_col: dataIdCol || undefined,
          config: {
            fields,
            block_method: blockMethod,
            block_key: blockMethod === "none" ? null : blockKey || null,
            threshold,
            classify_method: classifyMethod,
            hc_h: hcH,
            hdbscan_min_pts: hdbscanMinPts,
            cluster_method: clusterMethod,
            held_out: heldOut,
            truth_source: truthSource,
            truth_col: truthSource === "column" ? truthCol || null : null,
          },
        }),
      });
      const j = await (async () => {
        const text = await r.text();
        try {
          return JSON.parse(text) as RunResult;
        } catch {
          throw new Error(
            `Server returned HTTP ${r.status} (not JSON) — the service may have been redeploying. Try again.`
          );
        }
      })();
      if (!j.ok) setError(j.error || "Run failed.");
      else {
        setResult(j);
        const dsName =
          payload.filename || (source === "url" ? "url" : "data");
        const entry: SavedRun = {
          id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          ts: Date.now(),
          label: `${classifyMethod} → ${clusterMethod} · thr ${threshold}`,
          dataset: dsName,
          config: {
            fields: Object.keys(fields),
            block_method: blockMethod,
            block_key: blockMethod === "none" ? null : blockKey || null,
            threshold,
            classify_method: classifyMethod,
            cluster_method: clusterMethod,
            held_out: heldOut,
          },
          result: {
            n_clusters: j.n_clusters ?? 0,
            classify_n_clusters: j.classify_n_clusters ?? 0,
            ari: j.ari ?? null,
            classify_ari: j.classify_metrics?.ari ?? null,
            pairwise_f1: j.metrics?.pairwise?.f1 ?? null,
            b3_f1: j.metrics?.b3?.f1 ?? null,
            n_pairs: j.n_pairs ?? 0,
          },
        };
        setHistory((h) => [entry, ...h].slice(0, HISTORY_MAX));
        setCompareIds([]);
      }
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
  // The active truth column lives only in Gold truth — never as a match
  // field or blocking key (that would leak the answer into the features).
  const truthColActive = truthSource === "column" && truthCol ? truthCol : null;

  function dropColumnFromConfig(col: string) {
    setFields((prev) => {
      if (!prev[col]) return prev;
      const next = { ...prev };
      delete next[col];
      return next;
    });
    if (blockKey === col) {
      const key = smartBlockKey(columns.filter((c) => c !== col));
      setBlockKey(key);
      debouncePlan(payload, blockMethod, key, sampleN);
    }
  }

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
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">1 · Data — pick one source</h2>
          <a
            href="/studio/profile"
            className="text-sm px-3 py-1.5 rounded-lg border border-teal-600 text-teal-700 font-medium hover:bg-teal-50"
          >
            Full data profile →
          </a>
        </div>
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
                  payload?.filename === ds.file
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm font-medium">{ds.label}</div>
                <div className="text-xs text-slate-500">{ds.desc}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Source: {ds.source}
                </div>
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
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono2"
            />
            <button
              onClick={() => loadUrl()}
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
          <div
            ref={errorRef}
            className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
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
              Match fields <span className="text-slate-400">(<Term id="similarity">similarity</Term> per field)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {columns
                .filter((c) => c !== truthColActive)
                .map((c) => (
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
                          {SIM_LABELS[m]}
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
              <span className="font-medium text-slate-700"><Term id="blocking">Blocking</Term></span>
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
                    {BLOCK_LABELS[m]}
                  </option>
                ))}
              </select>
              {blockMethod === "none" && (
                <span className="text-xs text-slate-400">no blocking: every pair is compared</span>
              )}
            </label>
            {blockMethod !== "none" && (
              <label className="block">
                <span className="font-medium text-slate-700"><Term id="blocking-key">Blocking key</Term></span>
                <select
                  value={blockKey}
                  onChange={(e) => {
                    setBlockKey(e.target.value);
                    debouncePlan(payload, blockMethod, e.target.value, sampleN);
                  }}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-2 py-2 font-mono2"
                >
                  {columns
                    .filter((c) => c !== truthColActive)
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label className="block">
              <span className="font-medium text-slate-700"><Term id="sampling">Sampling</Term></span>
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

          <div className="mt-5 text-sm">
            <div>
              <span className="font-medium text-slate-700">
                <Term id="gold-truth">Gold truth</Term> <span className="text-slate-400">(optional, for ARI)</span>
              </span>
              <div className="mt-1 flex flex-wrap gap-2 text-sm">
                {(
                  [
                    ["none", "No truth"],
                    ["column", "Column in my data"],
                    ["file", "Separate truth file"],
                  ] as [TruthKind, string][]
                ).map(([t, label]) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTruthSource(t)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${
                      truthSource === t
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {truthSource === "column" && (
                <select
                  value={truthCol}
                  onChange={(e) => {
                    const tc = e.target.value;
                    setTruthCol(tc);
                    if (tc) dropColumnFromConfig(tc);
                  }}
                  className="mt-2 w-full border border-slate-300 rounded-lg px-2 py-2 font-mono2 text-sm"
                >
                  <option value="">— pick a column —</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              {truthSource === "file" && (
                <div className="mt-2 space-y-2 text-sm">
                  <label className="inline-block px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50 cursor-pointer">
                    {truthFileName || "Choose truth CSV…"}
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => onTruthFile(e.target.files?.[0])}
                    />
                  </label>
                  {truthColumns.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                      <label className="block">
                        <span className="text-xs text-slate-500">
                          Join on: my data column
                        </span>
                        <select
                          value={dataIdCol}
                          onChange={(e) => setDataIdCol(e.target.value)}
                          className="mt-0.5 w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono2"
                        >
                          {columns.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="flex gap-2 text-sm">
                        {(
                          [
                            ["labels", "id → cluster"],
                            ["pairs", "duplicate pairs"],
                          ] as ["labels" | "pairs", string][]
                        ).map(([f, label]) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setTruthFormat(f)}
                            className={`px-3 py-1 rounded-lg border text-xs ${
                              truthFormat === f
                                ? "border-teal-600 bg-teal-600 text-white"
                                : "border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {truthFormat === "labels" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="text-xs text-slate-500">
                              Truth id column
                            </span>
                            <select
                              value={truthIdCol}
                              onChange={(e) => setTruthIdCol(e.target.value)}
                              className="mt-0.5 w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono2"
                            >
                              {truthColumns.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs text-slate-500">
                              Truth cluster column
                            </span>
                            <select
                              value={truthClusterCol}
                              onChange={(e) => setTruthClusterCol(e.target.value)}
                              className="mt-0.5 w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono2"
                            >
                              {truthColumns.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="text-xs text-slate-500">
                              Truth id column A
                            </span>
                            <select
                              value={truthIdCol}
                              onChange={(e) => setTruthIdCol(e.target.value)}
                              className="mt-0.5 w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono2"
                            >
                              {truthColumns.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs text-slate-500">
                              Truth id column B
                            </span>
                            <select
                              value={truthId2Col}
                              onChange={(e) => setTruthId2Col(e.target.value)}
                              className="mt-0.5 w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono2"
                            >
                              {truthColumns.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
              {plan.sampled ? " (on the sample)" : ""} · <Term id="pair-budget">budget</Term>{" "}
              {PAIR_BUDGET.toLocaleString()}
              {overBudget && (
                <span>
                  {" "}— over budget. Pick a blocking key (not “none”) or turn on
                  sampling above.
                </span>
              )}
            </div>
          )}
        </section>
      )}

      {/* 3 · Classify */}
      {columns.length > 0 && (
        <section className="mt-4 border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold">3 · Classify</h2>
          <p className="text-sm text-slate-500 mt-1">
            Group pairs into entities — the advisor&apos;s three grouping
            methods, run on the pair scores.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CLASSIFY_METHODS.map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setClassifyMethod(m)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  classifyMethod === m
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Term id={GLOSSARY_ID[m]}>{label}</Term>
              </button>
            ))}
          </div>
          {classifyMethod === "tc" && (
            <div className="mt-4 max-w-md">
              <label className="text-sm font-medium text-slate-700">
                Similarity threshold τ:{" "}
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
              <p className="text-xs text-slate-400 mt-1">
                Pairs with score ≥ τ become links; connected components are
                the entities. Lower τ = more links, higher chaining risk.
              </p>
            </div>
          )}
          {classifyMethod === "hc" && (
            <div className="mt-4 max-w-md">
              <label className="text-sm font-medium text-slate-700">
                Cut height h:{" "}
                <span className="font-mono2">{hcH.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={hcH}
                onChange={(e) => setHcH(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
              <p className="text-xs text-slate-400 mt-1">
                Average-linkage agglomerative clustering on 1 − score, cut at
                distance h. Smaller h = more, tighter clusters.
              </p>
            </div>
          )}
          {classifyMethod === "hdbscan" && (
            <div className="mt-4 max-w-md">
              <label className="text-sm font-medium text-slate-700">
                min_pts:{" "}
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={hdbscanMinPts}
                  onChange={(e) =>
                    setHdbscanMinPts(
                      Math.min(20, Math.max(2, parseInt(e.target.value, 10) || 2))
                    )
                  }
                  className="w-20 border border-slate-300 rounded-lg px-2 py-1 font-mono2"
                />
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Density clustering on 1 − score, no eps to tune. Noise points
                become singletons. Needs ≥3 mutually close records to form a
                cluster — pairs stay singletons (use transitive closure for
                pair-heavy data).
              </p>
            </div>
          )}
        </section>
      )}

      {/* 4 · Clustering */}
      {columns.length > 0 && (
        <section className="mt-4 border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold">4 · Clustering</h2>
          <p className="text-sm text-slate-500 mt-1">
            Final cluster labels. Keep the classify output, re-cluster the
            pair graph, or train a supervised pair classifier on gold truth.
          </p>
          <div className="mt-3 space-y-3">
            {CLUSTER_GROUPS.map((g) => (
              <div key={g.label}>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {g.label}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {g.methods.map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setClusterMethod(v)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        clusterMethod === v
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Term id={GLOSSARY_ID[v]}>{label}</Term>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {["logistic", "lda", "qda", "knn", "fellegi_sunter"].includes(
            clusterMethod
          ) && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-slate-400">
                Supervised: trains on truth-labeled pairs, predicts all pairs,
                then transitive closure over predicted links. Needs gold truth
                in step 2.
              </p>
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heldOut}
                  onChange={(e) => setHeldOut(e.target.checked)}
                  className="accent-teal-600 mt-0.5"
                />
                <span>
                  <span className="font-medium">Held-out validation</span> — train on
                  70% of entities, report ARI on the other 30%{" "}
                  <span className="text-slate-400">
                    (honest; without this the score is in-sample and optimistic)
                  </span>
                </span>
              </label>
            </div>
          )}
        </section>
      )}

      {/* Run — after all methods are configured */}
      {columns.length > 0 && (
        <section className="mt-4 border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold">Run</h2>
          <p className="text-sm text-slate-500 mt-1">
            Everything above is configured. Run the pipeline and see the
            results below.
          </p>
          {plan?.ok && (
            <div
              className={`mt-3 text-sm rounded-lg px-3 py-2 border ${
                overBudget
                  ? "text-amber-800 bg-amber-50 border-amber-200"
                  : "text-slate-600 bg-slate-50 border-slate-200"
              }`}
            >
              {(plan.n_records ?? 0).toLocaleString()} records →{" "}
              {(plan.n_pairs ?? 0).toLocaleString()} candidate pairs
              {plan.sampled ? " (on the sample)" : ""} · <Term id="pair-budget">budget</Term>{" "}
              {PAIR_BUDGET.toLocaleString()}
              {overBudget && (
                <span>
                  {" "}— over budget. Pick a blocking key (not “none”) or turn
                  on sampling in step 2.
                </span>
              )}
            </div>
          )}
          <button
            onClick={run}
            disabled={running || planning || !fieldCols.length || !!overBudget}
            className="mt-4 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            {running ? "Running…" : "Run entity resolution"}
          </button>
        </section>
      )}

      {/* 5 · Results */}
      {result?.ok && (
        <section className="mt-4 border border-slate-200 rounded-xl p-5">
          <h2 className="font-bold">5 · Results</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Records", String(result.n_records), ""],
              ["Candidate pairs", Number(result.n_pairs).toLocaleString(), ""],
              ["Links", result.n_links == null ? "—" : Number(result.n_links).toLocaleString(), ""],
              [
                "Clusters",
                String(result.n_clusters),
                result.metrics ? `${result.metrics.n_true_clusters} true entities` : "",
              ],
            ].map(([k, v, sub]) => (
              <div key={k} className="border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-extrabold text-teal-700">{v}</div>
                <div className="text-xs text-slate-500 mt-1">{k}</div>
                {sub ? <div className="text-xs text-slate-400">{sub}</div> : null}
              </div>
            ))}
          </div>

          {/* Performance panel */}
          {result.metrics ? (
            <div className="mt-4 border border-slate-200 rounded-lg p-4">
              <div className="text-sm font-bold">
                Performance{" "}
                <span className="font-normal text-slate-400">
                  (on {result.metrics.n_truth} records with truth ·{" "}
                  {result.metrics.n_true_clusters} <Term id="truth-entities">true clusters</Term>)
                </span>
              </div>
              {result.metrics.held_out && (
                <div className="mt-2 text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                  Held-out validation: classifier trained on {result.metrics.n_train_entities}{" "}
                  entities, ARI scored on {result.metrics.n_test_entities} unseen entities.
                </div>
              )}
              {clusterMethod !== "same" && result.classify_n_clusters != null && result.n_clusters != null && (
                <div className="mt-2 text-xs text-slate-500">
                  Step 3 (classify): {result.classify_n_clusters} clusters
                  {result.classify_metrics && (
                    <>, ARI {result.classify_metrics.ari.toFixed(3)}</>
                  )}{" "}
                  → Step 4 ({clusterMethod}): {result.n_clusters} clusters
                  {result.metrics && (
                    <>, ARI {result.metrics.ari.toFixed(3)}</>
                  )}
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  ["ari", "ARI", result.metrics.ari],
                  ["pairwise-prf", "Pairwise F1", result.metrics.pairwise.f1],
                  ["b3", "B³ F1", result.metrics.b3.f1],
                ].map(([gid, k, v]) => (
                  <div key={k as string} className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xl font-extrabold text-teal-700">
                      {(v as number).toFixed(3)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1"><Term id={gid as string}>{k}</Term></div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {(
                  [
                    ["pairwise-prf", "Pairwise", result.metrics.pairwise],
                    ["b3", "B³", result.metrics.b3],
                  ] as const
                ).map(([gid, k, m]) => (
                  <div key={k} className="border border-slate-100 rounded-lg p-3">
                    <div className="text-xs font-bold text-slate-500 mb-2"><Term id={gid}>{k}</Term></div>
                    {(
                      [
                        ["Precision", m.precision],
                        ["Recall", m.recall],
                      ] as const
                    ).map(([pk, pv]) => (
                      <div key={pk} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-slate-500 w-16">{pk}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${Math.round(pv * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono2 w-10 text-right">
                          {pv.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 border border-slate-200 rounded-lg p-4">
              <div className="text-sm font-bold">
                Performance{" "}
                <span className="font-normal text-slate-400">
                  (no gold truth — attach truth in step 2 and re-run for metrics)
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Largest cluster:{" "}
                <span className="font-bold text-teal-700">
                  {result.cluster_sizes?.[0] ?? "—"} records
                </span>
              </div>
              {/* cluster size distribution */}
              <div className="mt-3 space-y-1">
                {(result.cluster_sizes ?? []).slice(0, 12).map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-14 font-mono2">
                      #{i}
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500/70 rounded-full"
                        style={{
                          width: `${Math.max(
                            2,
                            Math.round(
                              (s / (result.cluster_sizes?.[0] ?? 1)) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono2 w-12 text-right">{s}</span>
                  </div>
                ))}
                {(result.cluster_sizes?.length ?? 0) > 12 && (
                  <div className="text-xs text-slate-400">
                    + {(result.cluster_sizes?.length ?? 0) - 12} more clusters
                  </div>
                )}
              </div>
            </div>
          )}
          {result.truth_source === "file" && (
            <div className="mt-3 text-sm text-slate-600">
              Gold truth matched {(result.n_truth_matched ?? 0).toLocaleString()}{" "}
              of {Number(result.n_records).toLocaleString()} records
              {result.ari == null ? " — too few matches for ARI." : "."}
            </div>
          )}

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
            <div className="mt-5">
              <button
                onClick={() => setTableOpen((o) => !o)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-teal-700"
              >
                <span
                  className={`inline-block transition-transform ${tableOpen ? "rotate-90" : ""}`}
                >
                  ▸
                </span>
                Show cluster table
                <span className="text-xs font-normal text-slate-400">
                  ({result.display_rows.length} rows)
                </span>
              </button>
              {tableOpen && (
              <div className="mt-2">
              <div className="flex items-center gap-2 mb-2 text-sm">
                <span className="font-medium text-slate-700">Show cluster:</span>
                <select
                  value={clusterFilter}
                  onChange={(e) => setClusterFilter(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1 font-mono2 text-sm"
                >
                  <option value="all">all</option>
                  {Array.from(
                    new Set(result.display_rows.map((r) => String(r.__cluster)))
                  )
                    .sort((a, b) => Number(a) - Number(b))
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
                <span className="text-xs text-slate-400">
                  {
                    result.display_rows.filter(
                      (r) =>
                        clusterFilter === "all" ||
                        String(r.__cluster) === clusterFilter
                    ).length
                  }{" "}
                  rows
                </span>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-3 font-mono2 whitespace-nowrap">cluster</th>
                    {result.columns?.map((c) => (
                      <th key={c} className="py-2 pr-3 font-medium whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.display_rows
                    .filter(
                      (r) =>
                        clusterFilter === "all" ||
                        String(r.__cluster) === clusterFilter
                    )
                    .map((r, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3 font-mono2 text-teal-700 font-bold whitespace-nowrap">
                        {r.__cluster}
                      </td>
                      {result.columns?.map((c) => {
                        const v = String(r[c] ?? "");
                        const short = v.length > 42 ? v.slice(0, 42) + "…" : v;
                        return (
                          <td
                            key={c}
                            className="py-1.5 pr-3 text-slate-700 max-w-[220px] truncate"
                            title={v.length > 42 ? v : undefined}
                          >
                            {short}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Showing first {result.display_rows.length} rows — download the CSV
                for the full result.
              </div>
              </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      {/* Run history */}
      {history.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 pb-16">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Run history</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(history, null, 2)], {
                    type: "application/json",
                  });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `sandx-run-history-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium"
              >
                Export
              </button>
              <label className="text-xs text-teal-700 hover:text-teal-900 font-medium cursor-pointer">
                Import
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const rd = new FileReader();
                    rd.onload = () => {
                      try {
                        const arr = JSON.parse(String(rd.result ?? "[]"));
                        if (!Array.isArray(arr)) throw new Error("bad file");
                        const valid = arr.filter(
                          (r: unknown) =>
                            r &&
                            typeof r === "object" &&
                            typeof (r as SavedRun).id === "string" &&
                            (r as SavedRun).config &&
                            (r as SavedRun).result
                        ) as SavedRun[];
                        setHistory((h) => {
                          const seen = new Set(h.map((x) => x.id));
                          const merged = [
                            ...valid.filter((r) => !seen.has(r.id)),
                            ...h,
                          ]
                            .sort((a, b) => b.ts - a.ts)
                            .slice(0, HISTORY_MAX);
                          return merged;
                        });
                        setCompareIds([]);
                      } catch {
                        alert("Could not import: not a valid history file.");
                      }
                    };
                    rd.readAsText(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                onClick={() => {
                  setHistory([]);
                  setCompareIds([]);
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear all
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every run is saved automatically (latest {HISTORY_MAX}, this
            browser only). Click a label to rename. Tick two or more to
            compare — changed parameters are highlighted.
          </p>
          <div className="mt-3 overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="p-2 w-8"></th>
                  <th className="p-2">Run</th>
                  <th className="p-2">Dataset</th>
                  <th className="p-2">Classify → Cluster</th>
                  <th className="p-2">Thr</th>
                  <th className="p-2">ARI</th>
                  <th className="p-2">Δ ARI</th>
                  <th className="p-2">Clusters</th>
                  <th className="p-2">Time</th>
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {history.map((run, i) => {
                  const prev = history[i + 1];
                  const d =
                    run.result.ari != null && prev?.result.ari != null
                      ? run.result.ari - prev.result.ari
                      : null;
                  const checked = compareIds.includes(run.id);
                  return (
                    <tr
                      key={run.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setCompareIds((ids) =>
                              checked
                                ? ids.filter((x) => x !== run.id)
                                : [...ids, run.id]
                            )
                          }
                          className="accent-teal-600"
                        />
                      </td>
                      <td className="p-2">
                        {editingId === run.id ? (
                          <input
                            autoFocus
                            defaultValue={run.label}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v)
                                setHistory((h) =>
                                  h.map((x) =>
                                    x.id === run.id ? { ...x, label: v } : x
                                  )
                                );
                              setEditingId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                (e.target as HTMLInputElement).blur();
                            }}
                            className="border border-teal-300 rounded px-1 text-sm w-44"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingId(run.id)}
                            className="font-medium hover:text-teal-700"
                            title="Click to rename"
                          >
                            {run.label}
                          </button>
                        )}
                      </td>
                      <td className="p-2 text-slate-500 text-xs">
                        {run.dataset}
                      </td>
                      <td className="p-2 text-xs">
                        {run.config.classify_method} → {run.config.cluster_method}
                      </td>
                      <td className="p-2 text-xs">{run.config.threshold}</td>
                      <td className="p-2 font-semibold">
                        {fmt3(run.result.ari)}
                      </td>
                      <td
                        className={`p-2 text-xs ${
                          d == null
                            ? "text-slate-300"
                            : d > 0.001
                              ? "text-emerald-600"
                              : d < -0.001
                                ? "text-rose-600"
                                : "text-slate-400"
                        }`}
                      >
                        {d == null ? "—" : `${d > 0 ? "+" : ""}${d.toFixed(3)}`}
                      </td>
                      <td className="p-2 text-xs">{run.result.n_clusters}</td>
                      <td className="p-2 text-xs text-slate-400">
                        {new Date(run.ts).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => {
                            setHistory((h) =>
                              h.filter((x) => x.id !== run.id)
                            );
                            setCompareIds((ids) =>
                              ids.filter((x) => x !== run.id)
                            );
                          }}
                          className="text-slate-300 hover:text-rose-500"
                          title="Delete"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {compareIds.length >= 2 && (
            <CompareTable
              runs={history.filter((r) => compareIds.includes(r.id))}
            />
          )}
        </section>
      )}
    </div>
  );
}
