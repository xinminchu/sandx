import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Experiments — ERBOT",
  description:
    "ERBOT's blocking experiments under a full protocol: exact budget alignment, permutation attribution, pre-registered kill lines. Blocking treated as what it is — a budget-allocation problem.",
};

/* ---------- small visual helpers (all values are archived run outputs) ---------- */

function PcBars({
  rows,
}: {
  rows: { label: string; pc: number; note?: string; strong?: boolean }[];
}) {
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-sm">
          <div className="w-44 shrink-0 text-slate-600">{r.label}</div>
          <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
            <div
              className={`h-full rounded ${r.strong ? "bg-teal-600" : "bg-slate-400"}`}
              style={{ width: `${Math.max(r.pc * 100, 0.4)}%` }}
            />
          </div>
          <div className="w-40 shrink-0 font-mono text-[13px] text-slate-700">
            {r.pc.toFixed(4)}
            {r.note ? <span className="text-slate-400"> · {r.note}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function PermChart({
  min,
  max,
  nullMean,
  nullSd,
  observed,
  zeroLabel,
  nullLabel,
  obsLabel,
}: {
  min: number;
  max: number;
  nullMean: number;
  nullSd: number;
  observed: number;
  zeroLabel: string;
  nullLabel: string;
  obsLabel: string;
}) {
  const W = 720;
  const x = (v: number) => ((v - min) / (max - min)) * W;
  const bandL = x(nullMean - 2 * nullSd);
  const bandR = x(nullMean + 2 * nullSd);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} 92`} className="w-full h-auto" role="img">
        {/* zero line */}
        <line x1={x(0)} y1={10} x2={x(0)} y2={58} stroke="#94a3b8" strokeDasharray="4 3" />
        {/* axis */}
        <line x1={0} y1={58} x2={W} y2={58} stroke="#cbd5e1" />
        {/* null band: mean ± 2sd */}
        <rect x={bandL} y={30} width={Math.max(bandR - bandL, 2)} height={16} fill="#99f6e4" />
        <line x1={x(nullMean)} y1={26} x2={x(nullMean)} y2={50} stroke="#0f766e" strokeWidth={2} />
        {/* observed marker */}
        <line x1={x(observed)} y1={14} x2={x(observed)} y2={58} stroke="#d97706" strokeWidth={2} />
        <polygon
          points={`${x(observed)},8 ${x(observed) - 6},18 ${x(observed) + 6},18`}
          fill="#d97706"
        />
        <text x={x(0)} y={74} fontSize={12} fill="#64748b" textAnchor="middle">
          {zeroLabel}
        </text>
        <text x={x(nullMean)} y={74} fontSize={12} fill="#0f766e" textAnchor="middle">
          {nullLabel}
        </text>
        <text x={x(observed)} y={74} fontSize={12} fill="#b45309" textAnchor="middle" fontWeight={600}>
          {obsLabel}
        </text>
      </svg>
    </figure>
  );
}

function Chip({ kind, children }: { kind: "ok" | "no" | "dead" | "info"; children: React.ReactNode }) {
  const cls =
    kind === "ok"
      ? "bg-teal-50 text-teal-700 border-teal-200"
      : kind === "no"
        ? "bg-red-50 text-red-700 border-red-200"
        : kind === "dead"
          ? "bg-slate-100 text-slate-500 border-slate-200"
          : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`inline-block text-xs font-medium border rounded-full px-2 py-0.5 ${cls}`}>
      {children}
    </span>
  );
}

/* ---------- page ---------- */

export default function ExperimentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-bold text-slate-900">
        Blocking is a budget problem
      </h1>
      <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">
        Every blocking method spends the same currency: candidate pairs. Given
        a fixed pair budget <em>B</em>, the only question that matters is{" "}
        <strong>which pairs you buy</strong>. ERBOT&apos;s blocking experiments
        (E1, E2) test two ways of spending that budget against the standard
        fixed-<em>k</em> nearest-neighbour baseline — under a protocol designed
        to keep us honest: budgets aligned to the pair, kill lines registered
        before the runs, and a permutation test that decides whether an
        apparent mechanism is real or a mirage.
      </p>

      {/* protocol */}
      <section className="mt-10 border border-slate-200 rounded-xl p-6 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">The protocol (v2)</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
          <li>
            <strong>Shared pool.</strong> All arms draw from one candidate pool:
            the union of per-record top-200 neighbours by character-3-gram
            bag-of-words cosine.
          </li>
          <li>
            <strong>Entity-disjoint split.</strong> 70/30 train/test by gold
            cluster (seed 20261012); all tuning and calibration on train only.
          </li>
          <li>
            <strong>Exact budget alignment.</strong> Treatments are trimmed or
            padded to the baseline&apos;s pair count (E1 on Cora aligned to
            +0.00%), so a win cannot be a bigger budget in disguise.
          </li>
          <li>
            <strong>Pre-registered kill lines.</strong> dPC ≤ 0 kills the idea
            on that dataset; a mechanism claim additionally requires
            permutation p &lt; 0.05.
          </li>
          <li>
            <strong>Permutation attribution.</strong> R = 199 permutations of
            the allocation profile (E2) or the community labels (E1);
            p = 0.005 is the floor at this R.
          </li>
          <li>
            <strong>Metric.</strong> PC = pair completeness (share of true
            duplicate pairs the candidate set contains). Datasets are
            described on the <Link className="underline" href="/datasets">Datasets page</Link>.
          </li>
        </ul>
      </section>

      {/* matrix */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-800">The 3 × 2 matrix, closed</h2>
        <p className="mt-2 text-sm text-slate-500">
          Full-protocol v2 runs, 2026-10-20/21. E1 and E2 use different test
          splits, hence two Cora baselines.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Dataset</th>
                <th className="py-2 pr-4 font-medium">Baseline PC</th>
                <th className="py-2 pr-4 font-medium">E1 collective</th>
                <th className="py-2 pr-4 font-medium">E2 marginal-allocation</th>
                <th className="py-2 font-medium">Reading</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100 align-top">
                <td className="py-3 pr-4 font-medium">Cora</td>
                <td className="py-3 pr-4 font-mono text-[13px]">0.7050 (E1) · 0.5865 (E2)</td>
                <td className="py-3 pr-4">
                  dPC <span className="font-mono text-[13px]">+0.2835</span>, perm p = 1.0{" "}
                  <Chip kind="no">attribution rejected</Chip>
                </td>
                <td className="py-3 pr-4">
                  dPC <span className="font-mono text-[13px]">+0.3227</span> (both variants),
                  perm p = 0.005 <Chip kind="ok">established</Chip>
                </td>
                <td className="py-3">The effect lives here: the baseline cannot saturate.</td>
              </tr>
              <tr className="border-b border-slate-100 align-top">
                <td className="py-3 pr-4 font-medium">D10K</td>
                <td className="py-3 pr-4 font-mono text-[13px]">1.0000</td>
                <td className="py-3 pr-4">
                  dPC <span className="font-mono text-[13px]">−0.0008</span>{" "}
                  <Chip kind="dead">kill line</Chip>
                </td>
                <td className="py-3 pr-4">
                  dPC <span className="font-mono text-[13px]">+0.0000 / −0.0004</span>{" "}
                  <Chip kind="dead">kill line</Chip>
                </td>
                <td className="py-3">Ceiling: the scope boundary, from above.</td>
              </tr>
              <tr className="align-top">
                <td className="py-3 pr-4 font-medium">MusicBrainz-20K</td>
                <td className="py-3 pr-4 font-mono text-[13px]">0.9948 (E1) · 0.9954 (E2)</td>
                <td className="py-3 pr-4">
                  dPC <span className="font-mono text-[13px]">−0.0025</span>{" "}
                  <Chip kind="dead">kill line</Chip>
                </td>
                <td className="py-3 pr-4">
                  dPC <span className="font-mono text-[13px]">−0.0010 / −0.0026</span>{" "}
                  <Chip kind="dead">kill line</Chip>{" "}
                  <Chip kind="info">A beats random, p = 0.005</Chip>
                </td>
                <td className="py-3">Near-ceiling: the same boundary.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Cora E2 */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Cora · E2 marginal allocation — the effect, decomposed
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          E2 replaces the uniform per-record budget with a learned allocation:
          records whose next neighbours are still likely to be true matches
          receive more pairs; records that have run dry receive fewer. Two
          calibration variants — A (Platt-calibrated model fitted on labelled
          train pairs) and B (an unlabeled mixture model of the similarity
          profile) — land on exactly the same test result.
        </p>
        <div className="mt-5">
          <PcBars
            rows={[
              { label: "Fixed-k baseline", pc: 0.5865, note: "20,898 pairs" },
              { label: "E2-A · Platt", pc: 0.9092, note: "20,575 pairs", strong: true },
              { label: "E2-B · mixture", pc: 0.9092, note: "20,575 pairs", strong: true },
            ]}
          />
        </div>
        <p className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
          A gain of dPC +0.3227 on <em>fewer</em> pairs (−1.5%). The
          permutation test then splits the credit. Shuffling <em>who</em> gets
          the budget — keeping the multiset of per-record budgets fixed —
          still buys ≈ +0.170: that half is generic pool mechanics (any
          reallocation beats the rigid grid). The observed allocation adds a
          further ≈ +0.15 on top, and that increment is what the test
          certifies: it beat all 199 permutations (variant A null mean
          +0.1704, sd 0.0156; variant B +0.1697, sd 0.0154).
        </p>
        <div className="mt-4 border border-slate-200 rounded-xl p-5">
          <PermChart
            min={-0.02}
            max={0.36}
            nullMean={0.1704}
            nullSd={0.0156}
            observed={0.3227}
            zeroLabel="fixed-k · dPC 0"
            nullLabel="random allocation · +0.170 ± 0.016"
            obsLabel="observed · +0.3227 · p = 0.005"
          />
          <p className="text-xs text-slate-400 mt-1">
            dPC axis. Teal band: permutation null, mean ± 2 sd (R = 199).
            Claim, precisely: <em>who gets the budget matters, beyond the
            shape of the budget profile.</em>
          </p>
        </div>
      </section>

      {/* Cora E1 */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Cora · E1 collective blocking — a bigger headline, a rejected explanation
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          E1 allocates the budget by community: Leiden communities on the
          similarity graph receive budget shares, on the theory that dense
          regions hide more duplicates. At an exactly aligned budget
          (24,267 pairs, deviation +0.00%) the headline is even larger than
          E2&apos;s — and the permutation test refuses to certify it.
        </p>
        <div className="mt-5">
          <PcBars
            rows={[
              { label: "Fixed-k baseline", pc: 0.705, note: "24,267 pairs" },
              { label: "E1 · collective", pc: 0.9885, note: "24,267 pairs", strong: true },
            ]}
          />
        </div>
        <div className="mt-5 border border-red-200 bg-red-50 rounded-xl p-5 text-sm text-red-900 leading-relaxed max-w-3xl">
          <strong>Permutation verdict: p = 1.0000, null sd = 0.0000.</strong>{" "}
          Shuffling the community labels changes nothing — under permutation,
          the budget-alignment step trims the (now meaningless) native pairs
          and pads from the label-independent top-200 pool, so all 199
          permutations reproduce PC = 0.9885 exactly. The pool&apos;s global
          top-B selection alone explains the gain; community structure adds
          nothing measurable at this budget. The v2 harness did not log the
          native-only (pre-alignment) PC, so the credit split inside the
          observed run is unknown — a v3 attribution check is planned (see
          below). We report the rejection, not the headline.
        </div>
      </section>

      {/* ceilings */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          D10K &amp; MusicBrainz-20K — where the effect cannot live
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          On the two larger datasets the fixed-k baseline is already at (D10K)
          or near (MusicBrainz) the ceiling, and every kill line fires as
          pre-registered. Reallocation can only swap away pairs the baseline
          already holds. These are not failures of the experiments; they are
          the measurements that bound the claim.
        </p>
        <div className="mt-5 space-y-6">
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              D10K (baseline PC = 1.0000 — literally perfect)
            </div>
            <PcBars
              rows={[
                { label: "E1 baseline", pc: 1.0 },
                { label: "E1 · collective", pc: 0.9992, note: "dPC −0.0008" },
                { label: "E2 baseline", pc: 1.0, note: "101,201 pairs" },
                { label: "E2-A · Platt", pc: 1.0, note: "99,843 pairs · dPC +0.0000", strong: true },
                { label: "E2-B · mixture", pc: 0.9996, note: "dPC −0.0004" },
              ]}
            />
            <p className="mt-2 text-sm text-slate-500 max-w-3xl">
              Footnote kept, claim not made: variant A reaches the same
              perfect PC with 1.3% fewer pairs — an efficiency whisper, recorded
              as dead under the pre-registered wording.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              MusicBrainz-20K (baseline PC = 0.9954, ≈ 0.5% headroom)
            </div>
            <PcBars
              rows={[
                { label: "E1 baseline", pc: 0.9948, note: "226,013 pairs" },
                { label: "E1 · collective", pc: 0.9923, note: "dPC −0.0025" },
                { label: "E2 baseline", pc: 0.9954, note: "223,406 pairs" },
                { label: "E2-A · Platt", pc: 0.9944, note: "dPC −0.0010", strong: true },
                { label: "E2-B · mixture", pc: 0.9928, note: "dPC −0.0026" },
              ]}
            />
          </div>
        </div>
        <p className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
          One nuance survives the ceiling. MusicBrainz E2-A is dead against
          fixed-k (−0.0010), yet its permutation null sits at −0.0060
          (sd 0.0012): the learned allocation is significantly{" "}
          <em>less bad</em> than random reallocation (p = 0.005). The ordering{" "}
          <em>learned &gt; random</em> holds on both Cora and MusicBrainz —
          what flips sign across datasets is the headroom, not the quality of
          the allocation. Variant B shows no such signal (p = 0.93).
        </p>
        <div className="mt-4 border border-slate-200 rounded-xl p-5 max-w-3xl">
          <PermChart
            min={-0.01}
            max={0.003}
            nullMean={-0.006}
            nullSd={0.0012}
            observed={-0.001}
            zeroLabel="fixed-k · dPC 0"
            nullLabel="random · −0.0060 ± 0.0012"
            obsLabel="observed · −0.0010 · p = 0.005"
          />
          <p className="text-xs text-slate-400 mt-1">
            MusicBrainz-20K, E2-A. Dead against the baseline, alive against
            chance: the allocation carries signal even where it cannot win.
          </p>
        </div>
      </section>

      {/* related methods */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Related methods under the same ruler (2026-10-22)
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          A claim about allocation invites an obvious question: how do the
          classic methods do under the <em>same</em> protocol — same split,
          same pool, same budget? We re-ran five of them: <strong>global
          top-B</strong> (the whole pool ranked by cosine — the degenerate
          allocation with no per-record structure), <strong>adaptive-k</strong>{" "}
          (each record keeps neighbours within a relative threshold of its own
          best cosine, α tuned on train), <strong>meta-blocking</strong>{" "}
          (token blocks with block purging; edges weighted by common-block
          count or Jaccard, plus weight-based neighbourhood pruning),{" "}
          <strong>sorted neighborhood</strong> (one lexicographic key, sliding
          window), and <strong>canopy</strong> (two-threshold greedy
          clustering). This comparison is descriptive — no permutation tests
          were run for these methods.
        </p>
        <div className="mt-5">
          <div className="text-sm font-medium text-slate-700 mb-2">
            Cora — the one dataset with headroom (B = 20,898 pairs)
          </div>
          <PcBars
            rows={[
              { label: "Fixed-k baseline", pc: 0.5865, note: "20,898 pairs" },
              { label: "Global top-B", pc: 0.9227, note: "20,898 pairs", strong: true },
              { label: "Adaptive-k (aligned)", pc: 0.9173, note: "native 0.8990 · 20,445 pairs" },
              { label: "E2 waterfill A / B", pc: 0.9092, note: "20,575 pairs" },
              { label: "Sorted neighborhood", pc: 0.5279, note: "aligned" },
              { label: "Meta-blocking CBS / JS", pc: 0.5135, note: "aligned" },
            ]}
          />
        </div>
        <p className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
          The uncomfortable result first: on Cora, plain global ranking{" "}
          <strong>beats our calibrated waterfill by +0.0135</strong>, and
          adaptive-k sits between them. We therefore withdraw the claim that
          calibrated marginal allocation is the best allocator. What survives
          is the framework — spending the budget by global score gains
          +0.32 to +0.34 over the fixed-k grid — plus the scope law below and
          E2&apos;s permutation attribution, which compared waterfill against
          shuffled budget profiles and is untouched by this run. (Global
          top-B&apos;s +0.34 is a headline number; nobody has decomposed it.)
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Method (PC at budget B)</th>
                <th className="py-2 pr-4 font-medium">Cora</th>
                <th className="py-2 pr-4 font-medium">D10K</th>
                <th className="py-2 font-medium">MusicBrainz-20K</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 font-mono text-[13px]">
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Fixed-k baseline</td><td className="py-2 pr-4">0.5865</td><td className="py-2 pr-4">0.9996</td><td className="py-2">0.9946</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Global top-B</td><td className="py-2 pr-4">0.9227</td><td className="py-2 pr-4">0.9996</td><td className="py-2">0.9924</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Adaptive-k (aligned)</td><td className="py-2 pr-4">0.9173</td><td className="py-2 pr-4">0.9996</td><td className="py-2">0.9889</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Marginal allocation A (Platt)</td><td className="py-2 pr-4">0.9092</td><td className="py-2 pr-4">0.9996</td><td className="py-2">0.9924</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Marginal allocation B (mixture)</td><td className="py-2 pr-4">0.9092</td><td className="py-2 pr-4">0.9992</td><td className="py-2">0.9920</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Meta-blocking CBS (aligned)</td><td className="py-2 pr-4">0.5135</td><td className="py-2 pr-4">0.9935</td><td className="py-2">0.9899</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Meta-blocking JS (aligned)</td><td className="py-2 pr-4">0.5135</td><td className="py-2 pr-4">0.9906</td><td className="py-2">0.9911</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Sorted neighborhood (aligned)</td><td className="py-2 pr-4">0.5279</td><td className="py-2 pr-4">0.6851</td><td className="py-2">0.2075</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Canopy (native pairs)</td><td className="py-2 pr-4">0.2007 · 4,517</td><td className="py-2 pr-4">1.0000 · 5,668</td><td className="py-2">0.9848 · 56,721</td></tr>
              <tr><td className="py-2 pr-4 font-sans text-sm">Meta-blocking WNP (native pairs)</td><td className="py-2 pr-4">0.1790 · 4,373</td><td className="py-2 pr-4">0.9471 · 7,772</td><td className="py-2">0.9804 · 97,406</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-5 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5 max-w-3xl">
          <li>
            <strong>Meta-blocking never wins at equal budget</strong> — on any
            of the three datasets. On Cora its token graph holds only 15,009
            edges, fewer than the budget itself: sparse bibliographic tokens
            are a poor fit for token blocking.
          </li>
          <li>
            <strong>Sorted neighborhood is uniformly weak</strong>, and
            collapses on MusicBrainz (0.2075): one lexicographic key cannot
            group music-metadata duplicates.
          </li>
          <li>
            <strong>Canopy is the efficiency side-finding.</strong> At equal
            budget it changes no verdict, but on near-duplicate data it needs
            a fraction of the pairs: PC 1.0000 on D10K with 5,668 pairs —
            14% of the budget.
          </li>
          <li>
            On MusicBrainz the plain fixed-k baseline beats every
            alternative on the table — the scope law from the other side.
          </li>
        </ul>
      </section>

      {/* conclusion */}
      <section className="mt-14 border border-teal-200 bg-teal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-teal-900">The scope law</h2>
        <p className="mt-2 text-teal-900/80 leading-relaxed max-w-3xl">
          Allocation gains appear exactly where the fixed-k baseline
          cannot saturate — large on Cora (baseline 0.59–0.71), zero at the
          D10K and MusicBrainz ceilings (0.995–1.000). The deliverable of this
          experiment series is that scope statement plus one certified effect
          size (Cora E2, dPC +0.3227, permutation p = 0.005, roughly half of
          it allocation proper) — not a universal improvement claim. The
          related-methods run narrows it once more: within allocation rules,
          the ranking signal matters more than the allocation&apos;s shape.
        </p>
      </section>

      {/* limitations + next */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800">Limitations, stated</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
            <li>
              End-to-end clustering on the D10K and MusicBrainz candidate
              graphs collapses to singletons in both arms (ARI = 0), so
              end-to-end claims for those datasets are blocked until the
              clustering layer is addressed. The blocking comparisons are
              unaffected (identical in both arms).
            </li>
            <li>
              E1&apos;s native-only PC was not logged in v2, so its Cora gain
              cannot be split between native community pairs and pool padding
              retroactively.
            </li>
            <li>
              One seed, one split per dataset; permutation R = 199 bounds p at
              0.005.
            </li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800">What runs next</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
            <li>
              <strong>E1 v3 attribution check</strong> — log native pairs and
              native-only PC before alignment; pad only from within-community
              candidates.
            </li>
            <li>
              <strong>E3 exclusion blocking</strong> — recycle budget from
              pairs the model is sure are non-matches.
            </li>
            <li>
              <strong>Scale track</strong> — the same protocol on
              cluster-sampled ladders up to full North Carolina voter data,
              where saturation is not a given.
            </li>
            <li>
              An interactive budget-allocation demo (the Budget Lab) is live
              in the{" "}
              <Link className="underline" href="/studio">Studio</Link>: same
              protocol in miniature on the bundled datasets, computed live —
              a teaching demonstration, distinct from the archived runs
              reported here.
            </li>
          </ul>
        </div>
      </section>

      {/* provenance */}
      <section className="mt-12 text-sm text-slate-500 leading-relaxed max-w-3xl">
        <h3 className="font-semibold text-slate-700">Provenance</h3>
        <p className="mt-2">
          Harness: ERBOT R package, experiment scripts{" "}
          <code className="font-mono text-[13px]">exp-e1-collective-blocking-v2.R</code>{" "}
          and{" "}
          <code className="font-mono text-[13px]">exp-e2-waterfill-v2.R</code>{" "}
          (v2.2, including the D10K gold shim and the TID-keyed MusicBrainz-20K
          builder; sample seed 20261020). Runs executed 2026-10-20 and
          2026-10-21; every number on this page is taken from the archived run
          outputs without modification. Dataset identities, gold construction
          and licences: <Link className="underline" href="/datasets">Datasets</Link>.
        </p>
        <p className="mt-2">
          Related-methods section: script{" "}
          <code className="font-mono text-[13px]">exp-related-baselines-v1.R</code>,
          run 2026-10-22 on E2&apos;s v2 split; its in-run self-check
          reproduced the archived Cora baseline and waterfill numbers
          exactly. Two data notes: the D10K runs used a copy rebuilt from
          JedAI&apos;s official serialized distribution and verified against
          the archived fingerprint (10,000 records / 8,705 pairs / 6,000
          entities) — its tuned k* is 20 rather than 50, so D10K budgets
          differ from the v2 runs while every verdict is unchanged; the
          MusicBrainz-20K sample was rebuilt with the builder&apos;s seed
          and matches the archived fingerprint exactly (20,000 / 10,294 /
          16,934), with the baseline PC differing in the fourth decimal
          (0.9946 vs 0.9954).
        </p>
      </section>
    </div>
  );
}
