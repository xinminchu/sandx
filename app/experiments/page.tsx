import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Experiments — ERBOT",
  description:
    "ERBOT's blocking experiments under a random-split protocol: exact budget alignment, permutation attribution, pre-registered kill lines. Blocking treated as what it is — a budget-allocation problem.",
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
        to keep us honest: random record splits, budgets aligned to the pair,
        kill lines registered before the runs, and a permutation test that
        decides whether an apparent mechanism is real or a mirage.
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
          only difference is which pairs it buys. The primary protocol splits
          each dataset at random by record; an entity-disjoint split is kept
          as a sensitivity check.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-teal-900/80 leading-relaxed list-disc pl-5 max-w-3xl">
          <li>
            <strong>E2</strong> asks whether it helps to give more pairs to the
            records that still look promising and fewer to the easy ones.{" "}
            <strong>Yes — on Cora it reaches pair completeness 1.0000 on all
            four split seeds</strong> (dPC +0.0344 to +0.0797), and the
            flagship permutation test certifies the assignment itself
            (p = 0.001). The gain never exceeds the headroom the baseline
            leaves.
          </li>
          <li>
            <strong>E1</strong> asks whether communities in the similarity
            graph concentrate the budget where duplicates live. On Cora,{" "}
            <strong>yes</strong>: the community method&apos;s own pairs, built
            at 43–54% of the full budget, reach PC 0.7258–0.7668 and are
            certified at that native budget on all four seeds (p = 0.005).
            On D10K and MusicBrainz-20K the same method collapses when its
            oversized pair set is trimmed back to budget (dPC −0.9599 and
            −0.9504).
          </li>
          <li>
            <strong>How to read the page:</strong> the 3 × 2 matrix first,
            then the two Cora sections, then the large datasets, the
            sensitivity check, and the related-methods comparison. Numbers are
            archived run outputs.
          </li>
        </ul>
      </section>

      {/* protocol */}
      <section className="mt-10 border border-slate-200 rounded-xl p-6 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">The protocol</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
          <li>
            <strong>Random record splits are the primary protocol.</strong>{" "}
            Each dataset is split at random by record, 70% for training and
            30% for testing; on Cora the test split is 545 records on every
            seed. All tuning (k*, community resolution, calibration) is done
            on the training side only, and the test split is reported once.
            The reason is a design argument: an entity-disjoint split can
            only be built by someone who already knows which entity every
            record belongs to — it presupposes the complete gold truth, and
            real collections, such as voter registration files, come with no
            gold at all. One consequence, stated plainly: under a random
            split, tuning sees other records of entities that also appear in
            the test split. That is the reality of deployment. Gold labels
            are used only to score the test split, never to tune. The
            entity-disjoint split is reported below as a sensitivity check.
          </li>
          <li>
            <strong>Shared pool.</strong> All treatments and baselines work
            over the same pool — each record&apos;s top-200 neighbors by
            cosine similarity. E2 allocates within this pool directly;
            E1&apos;s budget alignment trims and pads against it.
          </li>
          <li>
            <strong>Exact budget alignment, two-sided.</strong> Treatments
            are trimmed <em>and topped up</em> to exactly the baseline&apos;s
            test pair count B. The budget deviation is 0.00% for E1.
            E2&apos;s waterfill lands about 1.5% under B after
            de-duplication, inside the protocol&apos;s ±2% tolerance.
          </li>
          <li>
            <strong>Pre-registered kill lines.</strong> A treatment is dead
            on a dataset if dPC ≤ 0 — an exact tie counts as dead. An
            attribution is rejected if its permutation test gives p ≥ 0.05.
            These lines were fixed before the runs.
          </li>
          <li>
            <strong>Permutation attribution tests.</strong> Each test
            destroys the claimed mechanism while preserving everything else.
            For E1, community labels are shuffled, with community sizes
            preserved. For E2, the per-record allocation profile is shuffled,
            with the shape of the budget distribution preserved. The standard
            test runs at R = 199 (smallest attainable p = 0.005); the
            flagship E2 test on Cora runs at R = 999 (smallest attainable
            p = 0.001).
          </li>
          <li>
            <strong>Partition health gate.</strong> Every candidate community
            partition is logged with its health statistics (number of
            communities, singleton count and rate, largest community). A
            partition whose singleton rate exceeds 0.90 is degenerate and is
            disqualified from tuning selection, whatever its score.
          </li>
          <li>
            <strong>Native-pair logging.</strong> For community-based
            treatments, the pre-alignment (native) pair count and native-only
            PC are recorded, together with the split of the aligned set into
            retained native pairs and padded pool pairs.
          </li>
          <li>
            <strong>Seeds.</strong> The two experiments use their own split
            seeds (E1: 20261012; E2: 20261016, with shared robustness seeds
            where noted). The split draw depends only on the seed and the
            record count, so where the two experiments use the same seed,
            their test sets are identical and the comparison is paired. The
            MusicBrainz-20K sample was built with seed 20261020.
          </li>
          <li>
            <strong>Metric.</strong> PC = pair completeness (share of true
            duplicate pairs the candidate set contains); RR = reduction
            ratio, reported where the runs recorded it. Datasets are
            described on the <Link className="underline" href="/datasets">Datasets page</Link>.
          </li>
          <li>
            <strong>Datasets.</strong> Cora: 1,815 records in 118 entities,
            after dropping 64 unlabeled records. D10K: the synthetic Dirty-ER
            dataset of the JedAI benchmark — 10,000 records, 6,000 entities,
            8,705 gold pairs; the D10K numbers on this page come from
            JedAI&apos;s official distribution of the dataset.
            MusicBrainz-20K: a whole-cluster sample of 20,000 records from
            the Leipzig MusicBrainz file; the run harness drops 88 records
            that have no gold label, leaving 19,912 records in 10,241
            entities.
          </li>
        </ul>
      </section>

      {/* matrix */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-800">The 3 × 2 matrix (random splits)</h2>
        <p className="mt-2 text-sm text-slate-500">
          Both experiments under the primary protocol. E1 and E2 use their
          own split seeds (20261012 and 20261016).
        </p>
        <div className="mt-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Dataset</th>
                <th className="py-2 pr-4 font-medium">Baseline PC</th>
                <th className="py-2 pr-4 font-medium hidden md:table-cell">E1 (community)</th>
                <th className="py-2 pr-4 font-medium hidden md:table-cell">E2 (marginal allocation), A / B</th>
                <th className="py-2 font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100 align-top">
                <td className="py-3 pr-4 font-medium">Cora</td>
                <td className="py-3 pr-4 font-mono text-[13px] whitespace-nowrap">0.9203–0.9656</td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  Native arm certified on 4/4 seeds (p = 0.005){" "}
                  <Chip kind="ok">established</Chip>
                  <div className="text-xs text-slate-400 mt-1">
                    Native pairs at 42.6–53.8% of budget reach PC
                    0.7258–0.7668 — see the E1 section.
                  </div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  dPC <span className="font-mono text-[13px]">+0.0344 to +0.0797</span>;
                  flagship p = 0.001 (R = 999) <Chip kind="ok">established</Chip>
                  <div className="text-xs text-slate-400 mt-1">
                    Treatment reaches PC 1.0000 on all four seeds.
                  </div>
                </td>
                <td className="py-3">Both effects live here.</td>
              </tr>
              <tr className="border-b border-slate-100 align-top">
                <td className="py-3 pr-4 font-medium">D10K</td>
                <td className="py-3 pr-4 font-mono text-[13px] whitespace-nowrap">1.0000</td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  dPC <span className="font-mono text-[13px]">−0.9599</span>{" "}
                  <Chip kind="dead">kill line</Chip>
                  <div className="text-xs text-slate-400 mt-1">
                    Native set is 5.1× the budget; alignment cuts it to PC
                    0.0401.
                  </div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  dPC <span className="font-mono text-[13px]">+0.0000 / +0.0000</span>{" "}
                  <Chip kind="dead">kill line</Chip>
                </td>
                <td className="py-3">Ceiling.</td>
              </tr>
              <tr className="align-top">
                <td className="py-3 pr-4 font-medium">MusicBrainz-20K</td>
                <td className="py-3 pr-4 font-mono text-[13px] whitespace-nowrap">0.9849–0.9960</td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  dPC <span className="font-mono text-[13px]">−0.9504</span>{" "}
                  <Chip kind="dead">kill line</Chip>
                  <div className="text-xs text-slate-400 mt-1">
                    Native set is 1.78× the budget; alignment cuts it to PC
                    0.0456.
                  </div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  dPC <span className="font-mono text-[13px]">−0.0026 / −0.0032</span>{" "}
                  <Chip kind="dead">kill line</Chip>
                </td>
                <td className="py-3">Near-ceiling, and E1 collapses.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Cora E2 */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Cora · E2 marginal allocation — certified on every seed
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          E2 replaces the uniform per-record budget with a learned allocation.
          Each record has a similarity-decay curve — its candidate
          similarities in decreasing order. A calibration maps similarity to
          an estimated match probability, so the k-th candidate of a record
          has an estimated marginal value, and allocation proceeds greedily:
          each next pair slot goes to the record whose current marginal value
          is highest, until the budget is spent. Two calibrations are tested:
          variant A fits Platt scaling on labeled training pairs; variant B
          fits an unlabeled two-component mixture to the similarity
          distribution, so it needs no gold labels.
        </p>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          Under random splits the fixed-k baseline is much stronger than
          under entity-disjoint splits, because test records keep same-entity
          neighbors on the training side. It still leaves headroom on every
          seed, and marginal allocation takes all of it. The flagship split
          (seed 20261016):
        </p>
        <div className="mt-5">
          <PcBars
            rows={[
              { label: "Fixed-k baseline", pc: 0.9355, note: "18,940 pairs" },
              { label: "E2-A · Platt", pc: 1.0, note: "18,648 pairs", strong: true },
              { label: "E2-B · mixture", pc: 1.0, note: "18,648 pairs", strong: true },
            ]}
          />
        </div>
        <p className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
          On the flagship split the permutation test was run at R = 999. The
          nulls are +0.0203 ± 0.0102 (variant A) and +0.0203 ± 0.0109 (variant
          B); none of the 999 shuffles of who gets the budget reaches the
          observed +0.0645 for either variant, so p = 0.001 for both — the
          floor at R = 999.
        </p>
        <div className="mt-4 border border-slate-200 rounded-xl p-5">
          <PermChart
            min={-0.02}
            max={0.09}
            nullMean={0.0203}
            nullSd={0.0102}
            observed={0.0645}
            zeroLabel="fixed-k · dPC 0"
            nullLabel="random allocation · +0.0203 ± 0.0102"
            obsLabel="observed · +0.0645 · p = 0.001"
          />
          <p className="text-xs text-slate-400 mt-1">
            dPC axis, flagship split. Teal band: permutation null for variant
            A, mean ± 2 sd (R = 999); variant B&apos;s null is +0.0203 ±
            0.0109, the same picture. Claim, precisely: <em>who gets the
            budget matters, beyond the shape of the budget profile.</em>
          </p>
        </div>
        <h3 className="mt-8 font-semibold text-slate-800">
          All four seeds — the treatment reaches the ceiling every time
        </h3>
        <div className="mt-4 border border-slate-200 rounded-xl divide-y divide-slate-100 max-w-3xl">
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Flagship · seed 20261016</span>
              <span className="text-xs text-slate-500">545 test rows</span>
              <Chip kind="ok">holds</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">0.9355</span></span>
              <span>Treatment PC <span className="font-mono text-[13px]">1.0000</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold text-teal-700">+0.0645</span></span>
              <span>Null A +0.0203 ± 0.0102 · B +0.0203 ± 0.0109</span>
              <span>Permutation p = 0.001 (R = 999)</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Seed 20261021</span>
              <span className="text-xs text-slate-500">545 test rows</span>
              <Chip kind="ok">holds</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">0.9656</span></span>
              <span>Treatment PC <span className="font-mono text-[13px]">1.0000</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold text-teal-700">+0.0344</span></span>
              <span>Null A −0.0024 ± 0.0091 · B −0.0012 ± 0.0087</span>
              <span>Permutation p = 0.005 (R = 199)</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Seed 20261022</span>
              <span className="text-xs text-slate-500">545 test rows</span>
              <Chip kind="ok">holds</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">0.9369</span></span>
              <span>Treatment PC <span className="font-mono text-[13px]">1.0000</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold text-teal-700">+0.0631</span></span>
              <span>Null A +0.0163 ± 0.0109 · B +0.0180 ± 0.0091</span>
              <span>Permutation p = 0.005 (R = 199)</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-slate-800">Seed 20261023</span>
              <span className="text-xs text-slate-500">545 test rows</span>
              <Chip kind="ok">holds</Chip>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>Baseline PC <span className="font-mono text-[13px]">0.9203</span></span>
              <span>Treatment PC <span className="font-mono text-[13px]">1.0000</span></span>
              <span>dPC <span className="font-mono text-[13px] font-semibold text-teal-700">+0.0797</span></span>
              <span>Null A +0.0348 ± 0.0100 · B +0.0345 ± 0.0109</span>
              <span>Permutation p = 0.005 (R = 199)</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-3xl">
          Three readings. First, on every seed the treatment reaches the
          ceiling, so each dPC is exactly the headroom the baseline left.
          Second, the permutation nulls sit far below the observed values on
          every seed: the increment that belongs to the assignment itself —
          observed dPC minus the null mean — is +0.037 to +0.047 across
          seeds. Third, the unlabeled variant B reaches exactly the same
          allocation as the labeled variant A on every seed: the flagship
          result does not need gold labels to tune.
        </p>
      </section>

      {/* Cora E1 */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Cora · E1 collective blocking — the community effect, certified at the native budget
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          E1 builds a MinHash k-nearest-neighbor graph over the records,
          detects communities on it, and nominates pairs from within
          communities, plus a set of cross-community &ldquo;insurance&rdquo;
          pairs. The hope is that community structure concentrates the budget
          where duplicates actually live.
        </p>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          The community partitions are healthy on every seed: the test
          partitions have 75–93 communities with singleton rates of
          0.048–0.062, far from the health gate. The selected resolution is
          res* = 0.5 on all four seeds. One caveat: on the training side, all
          three grid resolutions produce the same partition, so the grid does
          not discriminate and res* is simply the first maximizer.
        </p>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          The community method&apos;s own pairs — the native arm, before any
          budget alignment — are the informative measurement:
        </p>
        <div className="mt-4">
          <table className="w-full text-sm border-collapse max-w-3xl">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Seed</th>
                <th className="py-2 pr-4 font-medium">Native pairs / share of budget</th>
                <th className="py-2 pr-4 font-medium">Native PC</th>
                <th className="py-2 pr-4 font-medium hidden md:table-cell">Permutation null</th>
                <th className="py-2 font-medium">p (R = 199)</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 font-mono text-[13px]">
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 whitespace-nowrap">20261012</td><td className="py-2 pr-4 whitespace-nowrap">7,897 / 42.6%</td><td className="py-2 pr-4 whitespace-nowrap">0.7668</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.2930 ± 0.0040</td><td className="py-2 whitespace-nowrap">0.005</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 whitespace-nowrap">20261021</td><td className="py-2 pr-4 whitespace-nowrap">9,080 / 48.6%</td><td className="py-2 pr-4 whitespace-nowrap">0.7440</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.3233 ± 0.0048</td><td className="py-2 whitespace-nowrap">0.005</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 whitespace-nowrap">20261022</td><td className="py-2 pr-4 whitespace-nowrap">8,471 / 46.2%</td><td className="py-2 pr-4 whitespace-nowrap">0.7258</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.2857 ± 0.0042</td><td className="py-2 whitespace-nowrap">0.005</td></tr>
              <tr><td className="py-2 pr-4 whitespace-nowrap">20261023</td><td className="py-2 pr-4 whitespace-nowrap">9,955 / 53.8%</td><td className="py-2 pr-4 whitespace-nowrap">0.7538</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.2884 ± 0.0052</td><td className="py-2 whitespace-nowrap">0.005</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-5">
          <PcBars
            rows={[
              { label: "Shuffled labels (null)", pc: 0.293, note: "seed 20261012" },
              { label: "E1 native pairs", pc: 0.7668, note: "7,897 pairs · 42.6% of budget", strong: true },
            ]}
          />
        </div>
        <p className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
          At roughly half the budget, the community nomination reaches PC
          0.73–0.77, while shuffled community labels reach only about
          0.29–0.32: the observed values sit 88 to 118 null standard
          deviations above the null means, and no shuffle in 199 reaches any
          of them.
        </p>
        <div className="mt-5 border border-teal-200 bg-teal-50 rounded-xl p-5 text-sm text-teal-900 leading-relaxed max-w-3xl">
          <strong>The claim is deliberately not larger than this.</strong>{" "}
          Native PC (0.73–0.77) stays below the full-budget baseline
          (0.92–0.97): under random splits the baseline is strong, and the
          community method does not beat it. What is certified is that the
          community nomination is real and efficient — about three quarters
          of all true pairs for about half the budget — not that it wins at
          full budget.
        </div>
        <div className="mt-5 border border-slate-200 rounded-xl p-5 text-sm text-slate-600 leading-relaxed max-w-3xl">
          <strong className="text-slate-800">The aligned arm, disclosed.</strong>{" "}
          After alignment to the full budget, the treatment reaches PC
          1.0000 on every seed, so its dPC equals the headroom, as in the E2
          section. But the aligned permutation test carries no information
          under this protocol: the permuted null also sits at PC 1.0000 with
          standard deviation 0 (p = 1.0), because at the full budget every
          allocation, learned or shuffled, reaches the ceiling. The
          certification therefore rests on the native budget, where
          allocations actually differ. One more disclosure, on timing: the
          native-budget permutation test was added after the aligned test
          was observed to saturate; it is not pre-registered. End-to-end, the
          two arms&apos; downstream partitions are the same on Cora.
        </div>
        <div className="mt-5 border border-slate-200 rounded-xl p-5 text-sm text-slate-600 leading-relaxed max-w-3xl">
          <strong className="text-slate-800">Why the health gate and native logging exist.</strong>{" "}
          igraph&apos;s <code>cluster_leiden()</code> uses a CPM objective by
          default. At resolution 1.0, with edge weights of at most 1, the
          all-singleton partition — every record its own community — is the
          optimum of that objective: on a graph of 729 records it returns 729
          communities. A tuning rule that scores partitions by
          post-alignment PC can select exactly such a partition, because a
          treatment with no real communities reduces to insurance pairs plus
          the global pool, which scores well; the community layer then never
          enters the pair set, and nothing in the aligned output shows that
          it was absent. The health gate disqualifies such partitions before
          they can be selected, and native-pair logging makes the community
          layer&apos;s contribution visible in every run. The experiments
          use Louvain partitions, a modularity-family method that does not
          have this failure mode at the resolutions used here.
        </div>
      </section>

      {/* D10K & MusicBrainz */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          D10K &amp; MusicBrainz-20K — saturation for E2, collapse for E1
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          On the two large datasets the picture splits. For E2, the baseline
          is at or near the ceiling and there is no headroom to take. For E1,
          the communities themselves hold nearly all the true pairs — but the
          native pair set far exceeds the budget, and the alignment step that
          trims it back destroys the result. The weakness is in the
          alignment, not in community detection.
        </p>
        <div className="mt-5 space-y-6">
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              D10K (baseline PC = 1.0000 — literally perfect)
            </div>
            <PcBars
              rows={[
                { label: "Fixed-k baseline (E2 run)", pc: 1.0, note: "21,516 pairs" },
                { label: "E2-A · Platt", pc: 1.0, note: "21,197 pairs · dPC +0.0000", strong: true },
                { label: "E2-B · mixture", pc: 1.0, note: "21,516 pairs · dPC +0.0000", strong: true },
                { label: "E1 · native pairs", pc: 1.0, note: "109,501 pairs · 5.1× budget" },
                { label: "E1 · aligned", pc: 0.0401, note: "21,557 pairs · dPC −0.9599" },
              ]}
            />
            <p className="mt-2 text-sm text-slate-500 max-w-3xl leading-relaxed">
              E2 (train 7,000 / test 3,000 records; tuned k* = 10): variant
              A&apos;s permutation null is −0.0048 ± 0.0028 (p = 0.045), so
              the learned allocation does beat a random reallocation — but
              dPC = 0, and under the kill line the treatment is dead. Beating
              random is not beating the baseline. Variant B&apos;s null is
              −0.0000 (p = 0.970), also dead. E1 (seed 20261012): the
              baseline is 21,557 pairs at PC 1.0000, and the native set holds
              every true pair — but at 5.1 times the budget. Pool-order
              alignment keeps only 21,557 of the 109,501 native pairs — about
              80% are cut — and it cuts in pool order, so the quota fills
              with the mass of false pairs that the largest communities
              nominate. The permutation null is 0.9909 ± 0.0032 (p = 1.0):
              the true communities do significantly <em>worse</em> than
              shuffled labels, because shuffled labels do not exclude
              high-similarity cross-boundary pairs. This is not a partition
              failure — the test partition has 447 communities, a singleton
              rate of 0.076, and a largest community of 248, and passes the
              health gate easily — and it is not a test-side accident: on the
              training side the aligned treatment already reaches only PC
              0.0331.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              MusicBrainz-20K (baseline PC = 0.9849–0.9960 — near the ceiling)
            </div>
            <PcBars
              rows={[
                { label: "Fixed-k baseline (E2 run)", pc: 0.9849, note: "225,911 pairs" },
                { label: "E2-A · Platt", pc: 0.9823, note: "225,214 pairs · dPC −0.0026", strong: true },
                { label: "E2-B · mixture", pc: 0.9817, note: "225,839 pairs · dPC −0.0032", strong: true },
                { label: "E1 · native pairs", pc: 0.9806, note: "400,057 pairs · 1.78× budget" },
                { label: "E1 · aligned", pc: 0.0456, note: "dPC −0.9504" },
              ]}
            />
            <p className="mt-2 text-sm text-slate-500 max-w-3xl leading-relaxed">
              E1 (seed 20261012) shows the same mechanism, one notch less
              extreme: the baseline is 224,824 pairs at PC 0.9960; the native
              set holds 400,057 pairs at PC 0.9806 — 1.78 times the budget,
              containing 98% of the true pairs — and after alignment the
              treatment falls to PC 0.0456 (permutation null 0.9801 ± 0.0026,
              p = 1.0). The test partition is healthy (736 communities,
              singleton rate 0.073), and the training side shows the same
              early sign (aligned treatment PC 0.0401). E2 (tuned k* = 50)
              has headroom of only 0.0151: variant A&apos;s null is −0.0041
              ± 0.0014 (p = 0.225) and variant B&apos;s is −0.0033 ± 0.0005
              (p = 0.685). Both variants are dead: at this headroom,
              reallocation can only swap away pairs that per-record top-k
              already holds, and that is what happens.
            </p>
          </div>
        </div>
      </section>

      {/* sensitivity check */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Sensitivity check — entity-disjoint splits
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          The same experiments were also run under entity-disjoint splits (no
          entity on both sides). The E2 conclusions do not change: D10K
          saturates and both variants are dead, MusicBrainz-20K is slightly
          negative, and the Cora effect is present and larger. The cost of
          the entity-disjoint protocol is stability: because its split is
          over entities of very unequal size, the Cora test set swings from
          289 to 738 records across seeds and the baseline PC varies with a
          standard deviation of about 0.293, where the random split holds the
          test set at 545 records with a baseline standard deviation of about
          0.019.
        </p>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          For E1, the entity-disjoint split gives the aligned permutation
          test room to work, and there the aligned arm is certified:
          dPC = +0.1744 (permutation null 0.3613 ± 0.0054, p = 0.005), with
          the native set of 21,164 pairs at PC 0.7298 beating the full-budget
          baseline of 0.7050 on its own. The community claim therefore rests
          on both: certification at full budget under the split where that
          test has power, and at the native budget under the primary
          protocol.
        </p>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          One sub-result is sensitive to the protocol and must be cited with
          that warning: on MusicBrainz-20K, variant A&apos;s &ldquo;learned
          allocation beats random reallocation&rdquo; is significant under
          entity-disjoint splits (p = 0.005) and not significant under random
          splits (p = 0.225).
        </p>
      </section>

      {/* related methods */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-800">
          Related methods under one protocol
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
          A claim about allocation invites an obvious question: how do the
          classic methods do under the <em>same</em> protocol — same pool,
          same budget? This comparison was run on Cora&apos;s entity-disjoint
          split (seed 20261016), over the same top-200 pool and at the same
          budget B = 20,898 pairs; a rerun under the random-split protocol is
          planned. The comparison is descriptive: no permutation tests were
          run for these methods. We re-ran five of them: <strong>global
          top-B</strong> (the whole pool ranked by cosine — the degenerate
          allocation with no per-record structure), <strong>adaptive-k</strong>{" "}
          (each record keeps neighbors within a relative threshold of its own
          best cosine, α tuned on train), <strong>meta-blocking</strong>{" "}
          (token blocks with block purging; edges weighted by common-block
          count or Jaccard, plus weight-based neighborhood pruning),{" "}
          <strong>sorted neighborhood</strong> (one lexicographic key, sliding
          window), and <strong>canopy</strong> (two-threshold greedy
          clustering).
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
          The headline of this comparison is against us, and we state it
          plainly: plain global top-B — rank the entire shared pool by cosine
          similarity and take the top B pairs, with no per-record structure
          at all — <strong>beats our calibrated marginal allocation on Cora,
          0.9227 to 0.9092 (+0.0135)</strong>. Adaptive-k also edges out the
          waterfill once budgets are aligned (0.9173). We do not claim that
          calibrated marginal allocation is the best allocator; on the one
          dataset where allocation matters, it is not. The reason is
          instructive: calibration is a monotone re-ranking of cosine
          similarity <em>within</em> each record, so it cannot change any
          record&apos;s internal candidate order; what the waterfill adds on
          top of global ranking is a per-record floor and a particular
          profile shape, and on Cora those cost a little rather than gain.
          Two things survive intact. First, the permutation result above: it
          compares the learned allocation profile against shuffled versions
          of <em>itself</em>, and global top-B is a different, profile-free
          allocation, so the certified statement — who gets the budget
          matters, beyond the profile&apos;s shape — is untouched. Second,
          the size of the prize: every allocation-style method gains between
          +0.32 and +0.34 PC over fixed-k on this split.
        </p>
        <div className="mt-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Method (PC at budget B)</th>
                <th className="py-2 pr-4 font-medium">Cora</th>
                <th className="py-2 pr-4 font-medium hidden md:table-cell">D10K</th>
                <th className="py-2 font-medium hidden md:table-cell">MusicBrainz-20K</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 font-mono text-[13px]">
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Fixed-k baseline</td><td className="py-2 pr-4 whitespace-nowrap">0.5865</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9996</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9946</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Global top-B</td><td className="py-2 pr-4 whitespace-nowrap">0.9227</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9996</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9924</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Adaptive-k (aligned)</td><td className="py-2 pr-4 whitespace-nowrap">0.9173</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9996</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9889</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Marginal allocation A (Platt)</td><td className="py-2 pr-4 whitespace-nowrap">0.9092</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9996</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9924</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Marginal allocation B (mixture)</td><td className="py-2 pr-4 whitespace-nowrap">0.9092</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9992</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9920</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Meta-blocking CBS (aligned)</td><td className="py-2 pr-4 whitespace-nowrap">0.5135</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9935</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9899</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Meta-blocking JS (aligned)</td><td className="py-2 pr-4 whitespace-nowrap">0.5135</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9906</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9911</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Sorted neighborhood (aligned)</td><td className="py-2 pr-4 whitespace-nowrap">0.5279</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.6851</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.2075</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 pr-4 font-sans text-sm">Canopy (native pairs)</td><td className="py-2 pr-4 whitespace-nowrap">0.2007 · 4,517</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">1.0000 · 5,668</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9848 · 56,721</td></tr>
              <tr><td className="py-2 pr-4 font-sans text-sm">Meta-blocking WNP (native pairs)</td><td className="py-2 pr-4 whitespace-nowrap">0.1790 · 4,373</td><td className="py-2 pr-4 hidden md:table-cell whitespace-nowrap">0.9471 · 7,772</td><td className="py-2 hidden md:table-cell whitespace-nowrap">0.9804 · 97,406</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-3xl">
          Dataset notes for this section: the D10K figures come from
          JedAI&apos;s official distribution of the dataset. The
          MusicBrainz-20K figures come from the local run copy, in which the
          harness drops 88 records that have no gold label, leaving 19,912
          records.
        </p>
        <ul className="mt-5 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5 max-w-3xl">
          <li>
            <strong>Meta-blocking never wins at equal budget</strong> — on any
            of the three datasets. On Cora its token graph contains only
            15,009 edges — fewer than the budget B = 20,898 — and even after
            budget alignment it reaches only 0.5135, below the fixed-k
            baseline; sparse bibliographic tokens are a poor fit for token
            blocking. Its one bright spot is efficiency at native size on
            MusicBrainz-20K, where WNP reaches PC 0.9804 using 97,406 pairs,
            44% of the budget.
          </li>
          <li>
            <strong>Sorted neighborhood is below the baseline
            everywhere</strong>: 0.5279 on Cora, 0.6851 on D10K, and a
            collapse to 0.2075 on MusicBrainz-20K, where a single
            lexicographic key cannot group music-metadata duplicates.
          </li>
          <li>
            <strong>Canopy is weak as a standalone method on Cora</strong>{" "}
            (native PC 0.2007) <strong>but is the efficiency champion on
            near-duplicate data</strong>: on D10K it reaches PC 1.0000 with
            5,668 pairs, 14% of the budget.
          </li>
          <li>
            On the two near-ceiling datasets the comparison confirms the main
            picture from the other side: on D10K every allocation variant
            ties at about 0.9996, and on MusicBrainz-20K the plain fixed-k
            baseline is the best method on the table (0.9946).
          </li>
        </ul>
      </section>

      {/* conclusion */}
      <section className="mt-14 border border-teal-200 bg-teal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-teal-900">The scope law</h2>
        <p className="mt-2 text-teal-900/80 leading-relaxed max-w-3xl">
          The results support one empirical statement:{" "}
          <strong>the gain from reallocating a fixed pair budget is bounded
          by the baseline&apos;s headroom, H = 1 − baseline PC; where H is
          zero, the gain is zero.</strong> Under the random-split protocol,
          E2 on Cora captures 100% of the headroom on all four seeds — the
          treatment reaches PC 1.0000 every time, so dPC = H by construction.
          That is a ceiling artifact, not a capture-rate constant: under
          entity-disjoint splits the same allocator captured between 36% and
          98% of the headroom across splits, and nothing in either protocol
          supports a fixed share. What is stable across protocols is the
          bound and the sign: gains appear only inside the headroom, the
          permutation test certifies the assignment wherever a gain appears,
          and changing the split protocol neither rescues nor kills any E2
          cell.
        </p>
        <p className="mt-2 text-teal-900/80 leading-relaxed max-w-3xl">
          For E1, the law takes a second, sharper form — a boundary on the
          native pair volume. When the native set is at or under the budget
          (the Cora regime: 43–54% of B), the community effect holds and is
          certified. When the native set far exceeds the budget (D10K:
          5.1 × B; MusicBrainz-20K: 1.78 × B), the current alignment turns
          community structure into a liability. The weakness sits in the
          alignment&apos;s pool-order truncation, not in community detection:
          in both collapse cases the communities themselves hold 98–100% of
          the true pairs. The practical reading is about where these methods
          should be evaluated and used: on large, noisy collections where the
          baseline cannot saturate, not on clean benchmarks.
        </p>
      </section>

      {/* limitations + next */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800">Limitations, stated</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
            <li>
              End-to-end clustering is a separate, unresolved layer. On Cora
              the downstream clustering returns the same partition for both
              arms even when the candidate sets differ materially, and on
              D10K and MusicBrainz-20K it returns singletons in both arms.
              The blocking comparisons are unaffected, because the behavior
              is identical across arms; but end-to-end claims wait on the
              clustering layer. On identical link graphs, the choice among 11
              clustering algorithms alone has been measured to move link
              error by up to 66% (Lauren et al., 2026).
            </li>
            <li>
              E1&apos;s positive certification rests on one dataset. The
              community effect is certified on Cora — four random-split seeds
              at the native budget, and one entity-disjoint split at full
              budget. No second dataset with headroom has yet carried the
              test.
            </li>
            <li>
              The aligned permutation test saturates under the primary
              protocol, and the native test was added after that was seen.
              Certification under random splits therefore rests on the native
              budget, with the timing disclosed in the E1 section; the
              entity-disjoint aligned test is the cross-check.
            </li>
            <li>
              E1&apos;s tuning grid does not discriminate: all three
              resolutions give the same training partition, and res* is the
              first maximizer.
            </li>
            <li>
              Two datasets bound the claim more than they stress it.
              MusicBrainz-20K is a 20,000-record sample, not the full file.
              D10K&apos;s duplicates are near-identical synthetic copies in a
              single flattened text field, which is exactly why per-record
              kNN saturates there.
            </li>
            <li>
              The related-methods comparison is descriptive and runs on a
              different split: it has no permutation tests and was run on
              Cora&apos;s entity-disjoint split. End-to-end metrics are also
              insensitive at this scale — PC differences of the size reported
              here do not propagate to measurable partition differences on
              these datasets.
            </li>
          </ul>
        </div>
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800">What runs next</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
            <li>
              <strong>E3 — exclusion blocking with budget recycling</strong>,
              as a pre-registered design: pair-level conflict predicates
              remove high-confidence non-duplicates, and the freed budget is
              recycled through allocation. Three baselines (global top-B;
              CEP/CNP; progressive scheduling), two ablations (exclusion
              only; exclusion with global refill), and a fixed metric set:
              Recall@B, AUPC progress curves, the partition-level
              false-exclusion rate, and full cost accounting that includes
              the cheap filter&apos;s own cost.
            </li>
            <li>
              <strong>Scale track</strong> — the North Carolina
              voter-registration data (about 8.3 million records, about
              155,000 true duplicate pairs, statewide NCID as gold) on
              cluster-preserving subsample ladders of 100K → 500K → 1M → full
              file, each step with its own pre-registered kill line, with
              subgroup-stratified error reporting pre-registered at every
              step. The full 19.4M-record MusicBrainz file is a second,
              already-local ladder.
            </li>
            <li>
              <strong>E1 alignment repair, and a second dataset.</strong> Two
              repairs target the truncation step directly — truncating within
              each community in similarity order, and giving each community a
              share of the budget instead of letting the pool order decide.
              The repaired E1 then runs on a second dataset with headroom. A
              random-split rerun of the related-methods comparison belongs
              to this item as well.
            </li>
            <li>
              <strong>E4 — gold-free blocking audit</strong> (after E3):
              stratified sampling of the near-miss pairs that blocking
              discarded, to estimate PC with confidence intervals on data
              without gold labels.
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
          Every number on this page comes from R scripts run against a source
          checkout of the ERBOT package. The scripts <em>are</em> the
          protocol — there is no hidden step. The random-split runs reported
          above use the v5 scripts (split mode as a parameter) and, for the
          native-budget permutation test, the v6 E1 script — all three are
          in the downloads below, so the headline random-split results can
          be rerun as-is. The v2 scripts are in the downloads too: they run
          the entity-disjoint protocol behind the sensitivity check, and
          the related-methods comparison above.
          Before any random-split run was trusted, each script first
          reproduced the archived entity-mode numbers exactly, in a
          self-check run.
        </p>

        <h3 className="mt-6 font-semibold text-slate-800">1 · Environment</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
          R ≥ 4.1 (the archived runs used R 4.3.3, with igraph 2.3.4).
          Install the package dependencies once:
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
          Download the seven scripts and place them in{" "}
          <code className="font-mono text-[13px]">experiments/</code> at the
          package root. Each loads the package from the working tree
          (pkgload::load_all), so always run{" "}
          <code className="font-mono text-[13px]">Rscript</code> from the
          package root. The dataset is the first argument (default{" "}
          <code className="font-mono text-[13px]">cora</code>).
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 list-disc pl-5">
          <li><a className="underline font-mono text-[13px]" href="/rerun/exp-e1-collective-blocking-v5.R">exp-e1-collective-blocking-v5.R</a> — E1 collective blocking, either split protocol (seed and split mode as arguments); the random-split E1 runs above</li>
          <li><a className="underline font-mono text-[13px]" href="/rerun/exp-e2-waterfill-v5.R">exp-e2-waterfill-v5.R</a> — E2 marginal allocation (variants A/B), either split protocol; the random-split E2 runs above</li>
          <li><a className="underline font-mono text-[13px]" href="/rerun/exp-e1-collective-blocking-v6.R">exp-e1-collective-blocking-v6.R</a> — E1 v5 plus the native-budget permutation test (the Cora native-arm certification above)</li>
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
          and its gold file — 20,000 records sampled; the run harness then
          drops 88 records that have no gold label, leaving 19,912 records in
          10,241 entities):
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
        <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-3xl">
          The headline random-split runs on Cora use the v5/v6 scripts
          (arguments: dataset, seed, split mode; the E2 script takes the
          permutation count as its second argument, and the v6 script
          takes the permutation target — aligned or native — as its
          fourth):
        </p>
        <pre className="code mt-3">
{`Rscript experiments/exp-e1-collective-blocking-v5.R cora 20261012 random
Rscript experiments/exp-e2-waterfill-v5.R cora 999 20261016 random
Rscript experiments/exp-e1-collective-blocking-v6.R cora 20261012 random native`}
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
          The E2 Cora run on the entity-disjoint split must open with these
          lines (the same numbers the related-baselines script prints as its
          self-check). If your baseline differs, stop — your data or package
          state differs from the archived runs, and later numbers are not
          comparable.
        </p>
        <pre className="code mt-3">
{`baseline (fixed-k):   20,898 pairs · PC 0.5865
waterfill A / B:      20,575 pairs · PC 0.9092
permutation (R=999):  null +0.169 ± 0.016 · observed +0.3227 · p = 0.001`}
        </pre>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-3xl">
          State note: the scripts also live in the public package repository
          (<a className="underline" href="https://github.com/xinminchu/erbot/tree/main/experiments">xinminchu/erbot · experiments/</a>).
          The D10K and MusicBrainz data files are not redistributed here —
          their sources are on the{" "}
          <Link className="underline" href="/datasets">Datasets page</Link>.
        </p>
      </section>

      {/* provenance */}
      <section className="mt-12 text-sm text-slate-500 leading-relaxed max-w-3xl">
        <h3 className="font-semibold text-slate-700">Provenance</h3>
        <p className="mt-2">
          Pre-registered design:{" "}
          <code className="font-mono text-[13px]">reports/blocking-innovations-2026-10-16.md</code>.
          Scripts:{" "}
          <code className="font-mono text-[13px]">experiments/exp-e1-collective-blocking-v5.R</code>{" "}
          and{" "}
          <code className="font-mono text-[13px]">experiments/exp-e2-waterfill-v5.R</code>{" "}
          (split mode as a parameter),{" "}
          <code className="font-mono text-[13px]">experiments/exp-e1-collective-blocking-v6.R</code>{" "}
          (native-budget permutation test),{" "}
          <code className="font-mono text-[13px]">experiments/exp-related-baselines-v1.R</code>.
        </p>
        <p className="mt-2">
          Result summaries and run logs:{" "}
          <code className="font-mono text-[13px]">results/random-split-robustness-2026-11-22.md</code>,{" "}
          <code className="font-mono text-[13px]">results/randsplit-e1-nativeperm-2026-11-22.md</code>,{" "}
          <code className="font-mono text-[13px]">results/random-split-d10k-musicbrainz-2026-11-22.md</code>,{" "}
          <code className="font-mono text-[13px]">results/related-baselines-v1-COMBINED-2026-10-22.md</code>,
          with the corresponding .log file for every run.
        </p>
        <p className="mt-2">
          Environment: Linux, R 4.3.3, igraph 2.3.4. Before any random-split
          run was trusted, each script first reproduced the archived
          entity-mode numbers exactly, in a self-check run. Dataset
          identities, gold construction and licenses:{" "}
          <Link className="underline" href="/datasets">Datasets</Link>.
        </p>
      </section>
    </div>
  );
}
