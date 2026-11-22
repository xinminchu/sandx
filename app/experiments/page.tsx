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
        fixed-<em>k</em> nearest-neighbor baseline — under a protocol designed
        to keep us honest: budgets aligned to the pair, kill lines registered
        before the runs, and a permutation test that decides whether an
        apparent mechanism is real or a mirage.
      </p>

      {/* plain-language guide */}
      <section className="mt-6 border border-teal-200 bg-teal-50 rounded-xl p-6">
        <h2 className="text-base font-semibold text-teal-900">
          Reading this page — start here
        </h2>
        <p className="mt-2 text-sm text-teal-900/80 leading-relaxed max-w-3xl">
          Blocking decides which record pairs a matcher ever gets to see, so a
          blocking method&apos;s whole job is choosing pairs well. Every method
          on this page spends the <em>same</em> fixed budget of pairs — the
          only difference is which pairs it buys.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-teal-900/80 leading-relaxed list-disc pl-5 max-w-3xl">
          <li>
            <strong>E2</strong> asks whether it helps to give more pairs to the
            records that still look promising and fewer to the easy ones.{" "}
            <strong>Yes — certified by permutation (p = 0.001)</strong> — but
            only where the baseline leaves room: the gain tracks the
            baseline&apos;s headroom, and on a saturated split it is exactly
            zero.
          </li>
          <li>
            <strong>E1</strong> asks whether communities in the similarity
            graph concentrate the budget where duplicates live. The October run
            never actually tested that — its communities had silently collapsed
            to singletons. A corrected rerun on 2026-11-22 says{" "}
            <strong>yes, dPC +0.1744, also certified (p = 0.005)</strong>.
          </li>
          <li>
            <strong>How to read the page:</strong> the 3 × 2 matrix first, then
            the Cora sections for the two effects; D10K and MusicBrainz-20K are
            the ceiling cases that bound both claims. Numbers are archived run
            outputs; where a figure was later corrected, the correction is
            stated where it happens.
          </li>
        </ul>
      </section>

      {/* protocol */}
      <section className="mt-10 border border-slate-200 rounded-xl p-6 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">The protocol (v2)</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
          <li>
            <strong>Shared pool.</strong> All arms draw from one candidate pool:
            the union of per-record top-200 neighbors by character-3-gram
            bag-of-words cosine.
          </li>
          <li>
            <strong>Entity-disjoint split.</strong> Split by entity: floor(0.7 ×
            number of entities) to train, the rest to test, so no entity
            appears on both sides — and because entities differ greatly in
            size, the record counts are not 70/30. The two experiments use
            their own seeds: E1, 20261012 (Cora test: 729 records); E2,
            20261016 (Cora test: 604 records). All tuning and calibration on
            train only. (20261020, once quoted here as the split seed, is the
            MusicBrainz sample-construction seed — corrected 2026-11-22.)
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
            <strong>Permutation attribution.</strong> E2 on Cora: R = 999
            permutations of the allocation profile (p = 0.001, rerun
            2026-11-22); E1-R: R = 199 permutations of the community labels
            (p = 0.005); E2 multi-seed: R = 199 per split. The floor of the
            empirical p is 1/(R + 1).
          </li>
          <li>
            <strong>November 22 amendments.</strong> A partition health gate
            (a community partition with singleton rate &gt; 0.90 is degenerate
            and disqualified from tuning) and native-pair logging
            (pre-alignment pair count and PC, plus the retained/padded split
            of the aligned set) — both added after the E1 diagnosis; see the
            E1 section.
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
          Full-protocol v2 runs, 2026-10-20/21, updated 2026-11-22: E1 is the
          corrected rerun (E1-R), E2&apos;s permutation is R = 999, and E2
          has a multi-seed check below. E1 and E2 use different test splits,
          hence two Cora baselines.
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
                  dPC <span className="font-mono text-[13px]">+0.1744</span> (corrected run
                  E1-R, 2026-11-22), perm p = 0.005{" "}
                  <Chip kind="ok">established</Chip>
                  <div className="text-xs text-slate-400 mt-1">
                    October&apos;s +0.2835 was a pool-padding artifact of a
                    degenerate partition — see the E1 section.
                  </div>
                </td>
                <td className="py-3 pr-4">
                  dPC <span className="font-mono text-[13px]">+0.3227</span> (both variants),
                  perm p = 0.001 (R = 999) <Chip kind="ok">established</Chip>
                  <div className="text-xs text-slate-400 mt-1">
                    Frozen split; across four splits +0.3227 / +0.2116 /
                    +0.0126 / +0.0000 — see below.
                  </div>
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
          records whose next neighbors are still likely to be true matches
          receive more pairs; records that have run dry receive fewer. Two
          calibration variants — A (Platt-calibrated model fitted on labeled
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
          still buys ≈ +0.169: that half is generic pool mechanics (any
          reallocation beats the rigid grid). The observed allocation adds a
          further ≈ +0.15 on top, and that increment is what the test
          certifies: at R = 999 (rerun 2026-11-22), it beat all 999
          permutations for both variants (variant A null mean +0.1693, sd
          0.0164; variant B +0.1696, sd 0.0160; p = 0.001, the floor at this R).
        </p>
        <div className="mt-4 border border-slate-200 rounded-xl p-5">
          <PermChart
            min={-0.02}
            max={0.36}
            nullMean={0.1693}
            nullSd={0.0164}
            observed={0.3227}
            zeroLabel="fixed-k · dPC 0"
            nullLabel="random allocation · +0.169 ± 0.016"
            obsLabel="observed · +0.3227 · p = 0.001"
          />
          <p className="text-xs text-slate-400 mt-1">
            dPC axis. Teal band: permutation null, mean ± 2 sd (R = 999,
            2026-11-22). Claim, precisely: <em>who gets the budget matters,
            beyond the shape of the budget profile.</em>
          </p>
        </div>
        <h3 className="mt-8 font-semibold text-slate-800">
          Multi-seed robustness — the headline is a property of the split (2026-11-22)
        </h3>
        <p className="mt-2 text-slate-600 leading-relaxed max-w-3xl">
          The frozen split is one draw. The full E2 protocol was rerun on three
          fresh split seeds, each judged independently under the same kill
          lines, all reported as drawn. The attribution holds on every split —
          the observed allocation beat all 199 permuted profiles in all eight
          variant-tests — but the size tracks the headroom the baseline leaves.
          The honest summary: +0.3227 is the frozen split&apos;s value, not a
          constant of the dataset.
        </p>
        <div className="mt-4 border border-slate-200 rounded-xl divide-y divide-slate-100 max-w-3xl">
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Frozen split · seed 20261016</span>
              <span className="text-xs text-slate-500">604 test rows</span>
              <Chip kind="ok">holds</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">0.5865</span></span>
              <span>Headroom <span className="font-mono text-[13px]">0.4135</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold text-teal-700">+0.3227</span></span>
              <span>Permutation p = 0.001 (R = 999)</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Seed 20261021</span>
              <span className="text-xs text-slate-500">738 test rows</span>
              <Chip kind="ok">holds</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">0.4156</span></span>
              <span>Headroom <span className="font-mono text-[13px]">0.5844</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold text-teal-700">+0.2116</span></span>
              <span>Permutation p = 0.005 (R = 199)</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Seed 20261022</span>
              <span className="text-xs text-slate-500">582 test rows</span>
              <Chip kind="ok">holds — trivial size</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">0.9872</span></span>
              <span>Headroom <span className="font-mono text-[13px]">0.0128</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold text-teal-700">+0.0126</span></span>
              <span>Permutation p = 0.005 (R = 199)</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Seed 20261023</span>
              <span className="text-xs text-slate-500">289 test rows</span>
              <Chip kind="dead">kill line — no headroom</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">1.0000</span></span>
              <span>Headroom <span className="font-mono text-[13px]">0.0000</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold">+0.0000</span></span>
              <span>Permutation null −0.0170 / −0.0160 (A / B)</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-3xl">
          Headroom shares captured: 78% (frozen), 36% (20261021), 98%
          (20261022) — no fixed capture rate, but the bound holds everywhere:
          gains appear only inside the headroom. Seed 20261023&apos;s baseline
          is already perfect, so its kill line fires and the seed does not
          support the improvement claim; its negative permutation nulls still
          show the observed profile beating random ones.
        </p>
      </section>

      {/* Cora E1 */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Cora · E1 collective blocking — three acts: a headline, a diagnosis, a corrected rerun
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          E1 allocates the budget by community: Leiden communities on the
          similarity graph receive budget shares, on the theory that dense
          regions hide more duplicates. The October run produced the largest
          headline on this page — and a permutation test that refused to
          certify it. On 2026-11-22 we found out why, and reran it corrected.
        </p>

        <h3 className="mt-8 font-semibold text-slate-800">
          Act 1 — the October run: a bigger headline, a rejected explanation
        </h3>
        <p className="mt-2 text-slate-600 leading-relaxed max-w-3xl">
          At an exactly aligned budget (24,267 pairs, deviation +0.00%) the
          October v2 treatment reached PC = 0.9885 against the baseline&apos;s
          0.7050: dPC = +0.2835. But the community-label permutation returned a
          null PC of 0.9885 with standard deviation 0.0000 — the observed
          result reproduced <em>exactly</em> when community identity was
          destroyed, p = 1.0. The October report declined to claim the
          +0.2835 for community structure, but could not say what had
          produced it.
        </p>

        <h3 className="mt-8 font-semibold text-slate-800">
          Act 2 — the diagnosis (2026-11-22): the community layer never ran
        </h3>
        <div className="mt-3 border border-red-200 bg-red-50 rounded-xl p-5 text-sm text-red-900 leading-relaxed max-w-3xl">
          A diagnostic rerun (v3: the v2 script plus native-pair logging,
          nothing else changed) reproduced every archived number exactly, then
          showed what v2 had not recorded. The treatment&apos;s native,
          pre-alignment pair set contained only <strong>2,543 pairs at PC =
          0.1180</strong> — far <em>below</em> the baseline — and the aligned
          set decomposed into 2,543 retained native pairs and 21,724 padded
          pool pairs: <strong>89.5% of the &ldquo;treatment&rdquo; was global
          pool padding</strong>. A variant allowed to pad only from
          within-community candidates added zero pairs (shortfall 21,724).
          Measured directly, the treatment partition at the tuned resolution
          (res* = 1) had <strong>729 communities for 729 test records — every
          record its own community</strong> — so the native set consisted
          entirely of per-record cross-community &ldquo;insurance&rdquo; pairs.
          The mechanism: igraph&apos;s <code>cluster_leiden()</code> defaults to
          a CPM objective, whose optimum at resolution 1.0 with edge weights
          at most 1 is exactly the all-singleton partition (the similarity
          graph itself is healthy: 18,095 edges, median weight 1.0). Tuning
          selected the degenerate setting because, scored by post-alignment
          PC, the singleton setting wins — it reduces the treatment to
          insurance pairs plus the pool&apos;s global top-B. This also explains
          the Act 1 permutation result mechanically: shuffling the labels of
          an all-singleton partition changes nothing, hence sd = 0.0000.
        </div>

        <h3 className="mt-8 font-semibold text-slate-800">
          Act 3 — the corrected rerun (E1-R, 2026-11-22): the effect is real
        </h3>
        <p className="mt-2 text-slate-600 leading-relaxed max-w-3xl">
          The rerun changed only the partition step and the tuning rule:
          Louvain partitions (a modularity-family method, avoiding the CPM
          default) and a pre-registered health gate — a partition with
          singleton rate above 0.90 is degenerate and disqualified from
          tuning. The test partition at res* = 0.5 has <strong>67 communities,
          20 singletons (rate 0.027), largest community 153</strong>.
        </p>
        <div className="mt-5">
          <PcBars
            rows={[
              { label: "Fixed-k baseline", pc: 0.705, note: "24,267 pairs" },
              { label: "E1-R · native (pre-alignment)", pc: 0.7298, note: "21,164 pairs · 12.8% under budget", strong: true },
              { label: "E1-R · aligned (the treatment)", pc: 0.8794, note: "24,267 pairs · dPC +0.1744", strong: true },
            ]}
          />
        </div>
        <div className="mt-5 border border-teal-200 bg-teal-50 rounded-xl p-5 text-sm text-teal-900 leading-relaxed max-w-3xl">
          <strong>Permutation verdict: p = 0.005, null 0.3613 ± 0.0054.</strong>{" "}
          The community method&apos;s own pairs — 21,164 pairs, 12.8% under
          budget — already beat the full-budget baseline (PC 0.7298 vs
          0.7050). At exact budget alignment the gain is dPC ={" "}
          <strong>+0.1744</strong>, and the permutation test on the corrected
          partition is non-degenerate and decisive: shuffled communities
          nominate almost no true matches (null 0.3613, below even the
          baseline). The W arm&apos;s shortfall of 3,103 pairs is arithmetic,
          not degeneracy — native already enumerates every within-community
          pair, so any exact-budget treatment must import at least 3,103
          cross-community pairs. The true community effect is smaller than the
          October headline and, unlike it, is real. (Cross-check, stated as
          what it is: the corrected native line matches the October 20
          prototype&apos;s archived treatment line digit for digit, consistent
          with the prototype having run a genuine modularity-family partition
          before the igraph default changed.)
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
          (each record keeps neighbors within a relative threshold of its own
          best cosine, α tuned on train), <strong>meta-blocking</strong>{" "}
          (token blocks with block purging; edges weighted by common-block
          count or Jaccard, plus weight-based neighborhood pruning),{" "}
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
        <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-3xl">
          Provenance of the D10K and MusicBrainz columns: the D10K figures
          come from a copy rebuilt from JedAI&apos;s official distribution
          (k* = 20, B = 40,825, baseline PC 0.9996), while the lab copy used
          for the §4 runs has k* = 50, B = 101,201, baseline 1.0000 — every
          verdict is the same on both copies. The MusicBrainz figures come
          from a rebuilt sample (baseline 0.9946, B = 219,882, 5,891 test rows;
          the loader dropped 88 duplicate-id rows), against the v2 runs&apos;
          0.9954 at B = 223,406 with 5,943 test rows.
        </p>
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
          experiment series is that scope statement plus two certified effect
          sizes on Cora — E2, dPC +0.3227, permutation p = 0.001 (roughly half
          of it allocation proper), and the corrected E1, dPC +0.1744,
          p = 0.005 — not a universal improvement claim. And the multi-seed
          check qualifies the headline: +0.3227 is the frozen split&apos;s
          value; across four splits E2 ranges +0.3227 / +0.2116 / +0.0126 /
          +0.0000, tracking the headroom the baseline leaves. The
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
              The corrected E1 result is one dataset, one split. On D10K and
              MusicBrainz-20K the E1 figures are still the October v2 runs —
              their &ldquo;no gain&rdquo; verdicts stand for saturation reasons,
              but no corrected community measurement exists there (and those
              datasets offer no headroom to take one in).
            </li>
            <li>
              E2 on Cora now has four splits and the flagship permutation at
              R = 999 (p = 0.001); the other datasets are still single-split,
              and E1-R&apos;s permutation is R = 199 (p = 0.005).
            </li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800">What runs next</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
            <li>
              <strong>E1 v3 attribution check</strong> —{" "}
              <span className="text-teal-700 font-medium">done 2026-11-22</span>:
              native logging diagnosed the degenerate partition, and the
              corrected rerun (E1-R) certified the community effect
              (+0.1744, p = 0.005).
            </li>
            <li>
              <strong>E3 exclusion blocking</strong> — a pre-registered design:
              confidence-controlled exclusion whose freed budget is recycled
              through allocation; three baselines, two ablations, fixed
              metrics (Recall@B, AUPC, false-exclusion rate, full cost
              accounting).
            </li>
            <li>
              <strong>Scale track</strong> — the same protocol on
              cluster-sampled ladders (100K → 500K → 1M → full North Carolina
              voter data, where saturation is not a given), with
              subgroup-stratified error reporting pre-registered at every
              step.
            </li>
            <li>
              <strong>E1-R extension</strong> — the corrected community test on
              a second dataset with headroom, so the community claim does not
              rest on Cora alone.
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

      {/* reproduce in R */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">Reproduce these runs in R</h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          Every number on this page comes from four R scripts run against a
          source checkout of the ERBOT package. The scripts <em>are</em> the
          protocol — there is no hidden step. If a re-run disagrees with the
          archived numbers, the disagreement is in the data files or the
          package state, and step 5 below is how you catch it. The November 22
          updates used v3/v4 scripts derived from these by the changes stated
          in the sections above (native logging, the partition health gate, R
          as a parameter, the split seed as a parameter).
        </p>

        <h3 className="mt-6 font-semibold text-slate-800">1 · Environment</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
          R ≥ 4.1 (the archived runs used R 4.3/4.4). Install the package
          dependencies once:
        </p>
        <pre className="code mt-3">
{`install.packages(c("pkgload", "data.table", "dplyr", "tibble", "stringr",
                   "stringi", "tidyr", "purrr", "readr", "readxl",
                   "text2vec", "Matrix", "irlba", "stringdist", "igraph",
                   "FNN", "cluster", "gridExtra", "scales", "magrittr",
                   "jsonlite"))`}
        </pre>

        <h3 className="mt-6 font-semibold text-slate-800">2 · The scripts</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
          Download the four scripts and place them in{" "}
          <code className="font-mono text-[13px]">experiments/</code> at the
          package root. Each loads the package from the working tree
          (pkgload::load_all), so always run{" "}
          <code className="font-mono text-[13px]">Rscript</code> from the
          package root. The dataset is the first argument (default{" "}
          <code className="font-mono text-[13px]">cora</code>).
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 list-disc pl-5">
          <li><a className="underline font-mono text-[13px]" href="/rerun/exp-e1-collective-blocking-v2.R">exp-e1-collective-blocking-v2.R</a> — E1 collective blocking + community-label permutation</li>
          <li><a className="underline font-mono text-[13px]" href="/rerun/exp-e2-waterfill-v2.R">exp-e2-waterfill-v2.R</a> — E2 marginal allocation (variants A/B) + allocation-profile permutation</li>
          <li><a className="underline font-mono text-[13px]" href="/rerun/exp-related-baselines-v1.R">exp-related-baselines-v1.R</a> — the related-methods comparison above (global top-B, adaptive-k, meta-blocking, sorted neighborhood, canopy)</li>
          <li><a className="underline font-mono text-[13px]" href="/rerun/build-musicbrainz20k.R">build-musicbrainz20k.R</a> — one-time MusicBrainz-20K sample builder</li>
        </ul>

        <h3 className="mt-6 font-semibold text-slate-800">3 · Data placement</h3>
        <pre className="code mt-3">
{`inst/extdata/cora.csv            inst/extdata/cora_gold.csv   # bundled with the working tree
data/10Kfull.csv                 data/10Kduplicates.csv       # D10K — source on the Datasets page
data/raw/musicbrainz-20000-A01.csv.zip                        # MusicBrainz — Leipzig download`}
        </pre>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
          Build the MusicBrainz-20K sample once (whole-cluster sampling,
          seed 20261020; writes{" "}
          <code className="font-mono text-[13px]">data/musicbrainz20k.csv</code>{" "}
          and its gold file; check the printed fingerprint — 20,000 records /
          10,294 entities / 16,934 matched pairs):
        </p>
        <pre className="code mt-3">
{`Rscript experiments/build-musicbrainz20k.R id CID 20000`}
        </pre>

        <h3 className="mt-6 font-semibold text-slate-800">4 · Run</h3>
        <pre className="code mt-3">
{`Rscript experiments/exp-e1-collective-blocking-v2.R cora
Rscript experiments/exp-e2-waterfill-v2.R cora
Rscript experiments/exp-related-baselines-v1.R cora

Rscript experiments/exp-e1-collective-blocking-v2.R d10k
Rscript experiments/exp-e2-waterfill-v2.R d10k
Rscript experiments/exp-related-baselines-v1.R d10k

Rscript experiments/exp-e1-collective-blocking-v2.R musicbrainz20k
Rscript experiments/exp-e2-waterfill-v2.R musicbrainz20k
Rscript experiments/exp-related-baselines-v1.R musicbrainz20k`}
        </pre>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
          Cora finishes in minutes. The E1/E2 permutation sections (R = 199)
          on D10K and MusicBrainz are hour-scale — run them in one sitting,
          on a machine that will not sleep. The related-baselines script has
          no permutation section, and it can also run <em>without</em> the
          package installed: it carries local replicas of the three package
          functions it needs (standalone mode; data.table, Matrix and tibble
          suffice).
        </p>

        <h3 className="mt-6 font-semibold text-slate-800">5 · Check against the archive</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
          The E2 Cora run must open with these lines (the same numbers the
          related-baselines script prints as its self-check). If your
          baseline differs, stop — your data or package state differs from
          the archived runs, and later numbers are not comparable.
        </p>
        <pre className="code mt-3">
{`baseline (fixed-k):   20,898 pairs · PC 0.5865
waterfill A / B:      20,575 pairs · PC 0.9092
permutation (R=999):  null +0.169 ± 0.016 · observed +0.3227 · p = 0.001`}
        </pre>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-3xl">
          State note: the scripts were run on 2026-10-20–22 against the
          ERBOT working tree; they also live in the public package
          repository (<a className="underline" href="https://github.com/xinminchu/erbot/tree/main/experiments">xinminchu/erbot · experiments/</a>),
          which was unified on 2026-10-22 to the working-tree state that
          produced these results. The D10K and
          MusicBrainz data files are not redistributed
          here — their sources are on the{" "}
          <Link className="underline" href="/datasets">Datasets page</Link>.
        </p>
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
          2026-10-21; November 22, 2026 runs (E1 v3 diagnostics, E1-R corrected
          rerun, E2 permutation at R = 999, E2 multi-seed) used scripts{" "}
          <code className="font-mono text-[13px]">exp-e1-collective-blocking-v3.R</code>,{" "}
          <code className="font-mono text-[13px]">exp-e1-collective-blocking-v4.R</code>,{" "}
          <code className="font-mono text-[13px]">exp-e2-waterfill-v3.R</code> and{" "}
          <code className="font-mono text-[13px]">exp-e2-waterfill-v4.R</code>; the
          v3 diagnostic first reproduced the archived v2 numbers exactly. Every
          number on this page is taken from the archived run outputs without
          modification. Dataset identities, gold construction and licenses:{" "}
          <Link className="underline" href="/datasets">Datasets</Link>.
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
