"use client";

import { useState } from "react";
import Link from "next/link";
import { DATASETS } from "./datasets";

type GridRow = { k: number; budget: number; fixed_pc: number; e1_pc: number; e2_pc: number };
type LabResult = {
  ok: boolean;
  error?: string;
  filename?: string;
  sampled_from?: number;
  sampled_to?: number;
  n: number;
  entities: number;
  n_train: number;
  n_test: number;
  pool_pairs_test: number;
  gold_pairs_test: number;
  k_star: number;
  train_pc_at_k_star: number;
  grid: GridRow[];
  perm: {
    arm: string;
    at_k: number;
    budget: number;
    observed_dpc: number;
    null_mean: number;
    null_sd: number;
    r: number;
    p: number;
  };
};

const ARMS = [
  { key: "fixed_pc", label: "Fixed-k baseline", color: "#94a3b8" },
  { key: "e1_pc", label: "E1 · collective (communities)", color: "#0d9488" },
  { key: "e2_pc", label: "E2 · marginal allocation", color: "#d97706" },
] as const;

function PcChart({ grid, sel }: { grid: GridRow[]; sel: number }) {
  const W = 720;
  const H = 190;
  const padL = 44;
  const padR = 12;
  const padT = 10;
  const padB = 30;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const x = (i: number) => padL + (grid.length > 1 ? (i / (grid.length - 1)) * iw : iw / 2);
  const y = (v: number) => padT + (1 - v) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="#e2e8f0" />
          <text x={padL - 6} y={y(v) + 4} fontSize={11} fill="#94a3b8" textAnchor="end">
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      <line x1={x(sel)} y1={padT} x2={x(sel)} y2={padT + ih} stroke="#0f766e" strokeDasharray="4 3" />
      {ARMS.map((arm) => (
        <g key={arm.key}>
          <polyline
            fill="none"
            stroke={arm.color}
            strokeWidth={2}
            points={grid.map((g, i) => `${x(i)},${y(g[arm.key])}`).join(" ")}
          />
          {grid.map((g, i) => (
            <circle key={i} cx={x(i)} cy={y(g[arm.key])} r={i === sel ? 4.5 : 2.5} fill={arm.color} />
          ))}
        </g>
      ))}
      {grid.map((g, i) => (
        <text key={i} x={x(i)} y={H - 14} fontSize={11} fill="#64748b" textAnchor="middle">
          k={g.k}
        </text>
      ))}
      <text x={padL} y={H - 1} fontSize={10} fill="#94a3b8">
        budget = the fixed-k pair count at that k (all arms spend exactly it)
      </text>
    </svg>
  );
}

function PermBand({ perm }: { perm: LabResult["perm"] }) {
  const W = 720;
  const lo = Math.min(perm.null_mean - 3 * perm.null_sd, perm.observed_dpc, 0) - 0.01;
  const hi = Math.max(perm.null_mean + 3 * perm.null_sd, perm.observed_dpc, 0) + 0.01;
  const x = (v: number) => ((v - lo) / (hi - lo)) * W;
  const bandL = x(perm.null_mean - 2 * perm.null_sd);
  const bandR = x(perm.null_mean + 2 * perm.null_sd);
  const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(3)}`;
  return (
    <svg viewBox={`0 0 ${W} 84`} className="w-full h-auto" role="img">
      <line x1={x(0)} y1={8} x2={x(0)} y2={52} stroke="#94a3b8" strokeDasharray="4 3" />
      <line x1={0} y1={52} x2={W} y2={52} stroke="#cbd5e1" />
      <rect x={bandL} y={26} width={Math.max(bandR - bandL, 2)} height={14} fill="#fde68a" />
      <line x1={x(perm.null_mean)} y1={22} x2={x(perm.null_mean)} y2={44} stroke="#b45309" strokeWidth={2} />
      <line x1={x(perm.observed_dpc)} y1={12} x2={x(perm.observed_dpc)} y2={52} stroke="#0f766e" strokeWidth={2.5} />
      <polygon
        points={`${x(perm.observed_dpc)},6 ${x(perm.observed_dpc) - 6},16 ${x(perm.observed_dpc) + 6},16`}
        fill="#0f766e"
      />
      <text x={x(0)} y={68} fontSize={11} fill="#64748b" textAnchor="middle">
        fixed-k · dPC 0
      </text>
      <text x={x(perm.null_mean)} y={68} fontSize={11} fill="#b45309" textAnchor="middle">
        shuffled budgets · {fmt(perm.null_mean)} ± {perm.null_sd.toFixed(3)}
      </text>
      <text x={x(perm.observed_dpc)} y={68} fontSize={11} fill="#0f766e" textAnchor="middle" fontWeight={600}>
        observed · {fmt(perm.observed_dpc)}
      </text>
    </svg>
  );
}

export default function BudgetLab() {
  const usable = DATASETS.filter((d) => d.truthCol);
  const [file, setFile] = useState(usable.find((d) => d.file === "cora.csv")?.file ?? usable[0]?.file ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<LabResult | null>(null);
  const [sel, setSel] = useState(0);

  async function run() {
    const ds = usable.find((d) => d.file === file);
    if (!ds || busy) return;
    setBusy(true);
    setError(null);
    try {
      const csv_text = await (await fetch(`/data/${ds.file}`)).text();
      const r = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_text, filename: ds.file }),
      });
      const j = (await r.json()) as LabResult;
      if (!j.ok) {
        setError(j.error || "Budget Lab failed.");
        setRes(null);
      } else {
        setRes(j);
        const star = j.grid.findIndex((g) => g.k === j.k_star);
        setSel(star >= 0 ? star : 0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Budget Lab failed.");
    } finally {
      setBusy(false);
    }
  }

  const row = res?.grid[sel];
  const fmtD = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(4)}`;

  return (
    <section className="mt-4 border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold">Budget Lab — who gets the pairs?</h2>
        <span className="text-xs font-medium border border-amber-200 bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">
          interactive demonstration
        </span>
      </div>
      <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
        Blocking spends a budget of candidate pairs. This lab replays ERBOT&apos;s
        blocking experiments in miniature on a bundled dataset: one shared
        candidate pool (char-3-gram cosine, top-200 per record), an
        entity-disjoint 70/30 split, and three ways to spend exactly the same
        budget — <strong>fixed-k</strong>, <strong>E1 collective</strong>{" "}
        (community pairs + cross-community insurance), and{" "}
        <strong>E2 marginal allocation</strong> (water-filling by calibrated
        match probability). The paper-grade archived runs live on the{" "}
        <Link href="/experiments" className="underline">
          Experiments page
        </Link>
        ; numbers here are computed live, on this smaller scale, and are not
        the paper&apos;s.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={file}
          onChange={(e) => setFile(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {usable.map((d) => (
            <option key={d.file} value={d.file}>
              {d.label} — {d.desc}
            </option>
          ))}
        </select>
        <button
          onClick={run}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {busy ? "Running the lab… (a few seconds)" : "Run the lab"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {res && row && (
        <div className="mt-5">
          {res.sampled_from ? (
            <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-3xl">
              Whole-cluster sample: this run uses {res.sampled_to?.toLocaleString()} of the
              file&apos;s {res.sampled_from.toLocaleString()} records (the lab&apos;s pool
              build caps at 2,500 records). Sampling takes whole gold clusters, never
              splits one — the same construction as the MusicBrainz-20K subset itself.
            </div>
          ) : null}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
            <span>
              <strong className="text-slate-800">{res.n.toLocaleString()}</strong> records ·{" "}
              <strong className="text-slate-800">{res.entities.toLocaleString()}</strong> entities
            </span>
            <span>
              test: <strong className="text-slate-800">{res.n_test.toLocaleString()}</strong> records ·{" "}
              <strong className="text-slate-800">{res.gold_pairs_test.toLocaleString()}</strong> true pairs ·{" "}
              pool <strong className="text-slate-800">{res.pool_pairs_test.toLocaleString()}</strong> pairs
            </span>
            <span>
              k* tuned on train = <strong className="text-slate-800">{res.k_star}</strong> (train PC{" "}
              {res.train_pc_at_k_star.toFixed(4)})
            </span>
          </div>

          <div className="mt-4">
            <PcChart grid={res.grid} sel={sel} />
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 -mt-1">
              {ARMS.map((a) => (
                <span key={a.key} className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-3 h-[3px] rounded" style={{ background: a.color }} />
                  {a.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={res.grid.length - 1}
              step={1}
              value={sel}
              onChange={(e) => setSel(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="mt-2 space-y-1.5">
              {ARMS.map((a) => (
                <div key={a.key} className="flex items-center gap-3 text-sm">
                  <div className="w-52 shrink-0 text-slate-600">{a.label}</div>
                  <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{ width: `${Math.max(row[a.key] * 100, 0.4)}%`, background: a.color }}
                    />
                  </div>
                  <div className="w-16 shrink-0 font-mono text-[13px] text-slate-700">
                    {row[a.key].toFixed(4)}
                  </div>
                </div>
              ))}
              <div className="text-xs text-slate-400">
                budget at k={row.k}: {row.budget.toLocaleString()} pairs · E1 {fmtD(row.e1_pc - row.fixed_pc)}{" "}
                vs fixed-k · E2 {fmtD(row.e2_pc - row.fixed_pc)} vs fixed-k
              </div>
            </div>
          </div>

          <div className="mt-5 border border-slate-200 rounded-xl p-4">
            <div className="text-sm font-medium text-slate-700">
              Permutation check — E2 at k* = {res.perm.at_k} (budget {res.perm.budget.toLocaleString()} pairs)
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Shuffle E2&apos;s per-record budget profile across records and
              re-select by marginal value ({res.perm.r} shuffles). If the
              observed dPC sits inside the shuffled band, <em>who</em> gets
              the budget does not matter — only the total does.
            </p>
            <div className="mt-2">
              <PermBand perm={res.perm} />
            </div>
            <p className="text-sm text-slate-600">
              observed dPC {fmtD(res.perm.observed_dpc)} vs shuffled{" "}
              {fmtD(res.perm.null_mean)} ± {res.perm.null_sd.toFixed(4)} · empirical p ={" "}
              {res.perm.p.toFixed(2)} (floor {`1/(R+1)`} = 0.05 at R = {res.perm.r})
            </p>
          </div>

          <p className="text-xs text-slate-400 mt-4 max-w-3xl leading-relaxed">
            Miniature disclosures: Louvain resolution fixed at 1 (the harness
            tunes it on train); pair weights are BoW cosines where the
            harness&apos;s E1 uses signature agreement; E2 shown is variant A
            (Platt calibration) only; permutation R = 19 here vs 199 in the
            archived runs. Same pool, split seed (20261012), budget alignment
            and kill-line discipline as the full protocol.
          </p>
        </div>
      )}
    </section>
  );
}
