import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datasets — ERBOT",
  description:
    "Every dataset ERBOT uses: where it comes from, how it is structured, how its gold standard was built, who else has used it, and what we learned from the data itself.",
};

type Ds = {
  id: string;
  name: string;
  tag: string;
  source: React.ReactNode;
  scale: string;
  fields: string;
  gold: string;
  usedBy: React.ReactNode;
  analysis: React.ReactNode;
};

const LEIPZIG =
  "https://dbs.uni-leipzig.de/research/projects/object_matching/benchmark_datasets_for_entity_resolution";
const GOLLUM = "https://arxiv.org/abs/2209.07479";

const DATASETS: Ds[] = [
  {
    id: "cora",
    name: "Cora (citation deduplication)",
    tag: "ERBOT experiments · Studio",
    source: (
      <>
        Citation records from the Cora research-paper search engine (McCallum
        et al.), distributed through the{" "}
        <a className="underline" href="https://www.cs.utexas.edu/~ml/riddle/data.html">
          RIDDLE repository
        </a>{" "}
        (UT Austin), provided by William Cohen. Not the graph-ML &ldquo;Cora&rdquo;
        dataset &mdash; same origin system, different data.
      </>
    ),
    scale: "1,879 citation records, 182 gold clusters (verified against our copy).",
    fields:
      "16 segmented citation fields: title, booktitle, authors, address, date, year, editor, journal, volume, pages, publisher, institution, type, tech, note — plus the gold label.",
    gold: "Hand-labelled citation clusters shipped with the RIDDLE distribution; ERBOT stores them as a duplicate-pair list (id1, id2).",
    usedBy: (
      <>
        A benchmark since Bilenko &amp; Mooney (KDD 2003, &ldquo;Adaptive Duplicate
        Detection Using Learnable String Similarity Measures&rdquo;). In ERBOT it is
        the hard case of the E1/E2 blocking experiments (2026).
      </>
    ),
    analysis: (
      <>
        Famously dirty: fields bleed into each other, values arrive fragmented
        (a &ldquo;title&rdquo; cell can hold half a citation), many cells are empty.
        In our blocking experiments a plain per-record kNN baseline reaches only
        PC&nbsp;=&nbsp;0.59&ndash;0.71 here &mdash; the one dataset in our matrix with real
        headroom, and the one where marginal budget allocation shows a
        permutation-certified gain (+0.32 PC, p&nbsp;=&nbsp;0.005).
      </>
    ),
  },
  {
    id: "d10k",
    name: "D10K (synthetic, 10,000 records)",
    tag: "ERBOT experiments · JedAI benchmark",
    source: (
      <>
        The synthetic Dirty-ER dataset <strong>D10K</strong> from the JedAI
        benchmark suite (Papadakis et al., &ldquo;Three-dimensional Entity
        Resolution with JedAI,&rdquo; <em>Information Systems</em> 93, 2020).
        Census-style person profiles artificially generated with the{" "}
        <strong>Febrl</strong> generator: duplicate-free profiles were first
        built from frequency tables of real given names, surnames and
        addresses, then duplicates were created with realistic error
        modifications (character/word insertions, deletions, substitutions;
        at most 10 per entity), leaving 40% of the records duplicates. Our
        copy reached us as a flattened re-packaging (single Aggregate Value
        column, plus embedding columns we do not use), not in JedAI&rsquo;s
        original serialized form &mdash; the intermediate step is untraced, but
        the fingerprint matches JedAI&rsquo;s published table exactly: 10,000
        profiles, 12 attributes, and the 40%-duplicate rate implies 6,000
        distinct entities, which is what our loader measures.
      </>
    ),
    scale:
      "10,000 records, 6,000 entities, 8,705 duplicate pairs (JedAI, Table 1 of the paper above; entity count verified on our copy).",
    fields:
      "12 person attributes in the original (names, addresses and related census-style values; 106,108 name–value pairs in total). Our copy (10Kfull.csv) is pipe-delimited and flattened: ERBOT loads only Id and the Aggregate Value text. The raw file also carries embedding columns, which ERBOT does not load or use.",
    gold: "Known by construction (Febrl generation). Our copy carries it as a pair file (10Kduplicates.csv, Entity1|Entity2) of generation links; clusters are the connected components of those pairs.",
    usedBy: (
      <>
        The JedAI experimental programme (Papadakis et al. 2020 and the
        blocking/filtering evaluations around it) uses D10K as the smallest
        of a synthetic scale ladder (D10K&ndash;D2M). In ERBOT it is the ceiling
        case of the E1/E2 full-protocol matrix (2026), below.
      </>
    ),
    analysis: (
      <>
        Duplicates are near-identical synthetic copies inside one long text
        field, so a plain per-record kNN baseline saturates: baseline
        PC&nbsp;=&nbsp;1.0000 at k&nbsp;=&nbsp;50 (reduction ratio 0.977), and neither collective
        blocking nor marginal allocation has any headroom left. We audited the
        pipeline for truth leakage before reporting this &mdash; gold labels touch
        only the entity-disjoint split, train-side tuning and final scoring,
        never the similarity computation &mdash; and a dedicated data-side audit
        (cluster-signature tokens, id-in-text, gold-pair cosine distribution)
        accompanies the experiment code. D10K&rsquo;s role in the paper is to mark
        the scope boundary: budget-allocation questions only exist where the
        baseline cannot saturate.
      </>
    ),
  },
  {
    id: "musicbrainz",
    name: "MusicBrainz 20K",
    tag: "ERBOT experiments",
    source: (
      <>
        Leipzig University Database Group,{" "}
        <a className="underline" href={LEIPZIG}>
          Benchmark datasets for entity resolution
        </a>
        ; introduced with the FAMER multi-source matching framework (Saeedi,
        Peukert &amp; Rahm). Distributed under a Creative Commons licence
        (Leipzig DB Group, June 2019).
      </>
    ),
    scale:
      "Official 20K release: 19,375 records from 5 sources, 10,000 clusters, 16,250 duplicate pairs. The family scales by 10× steps up to a 20M variant (19,375,000 records, 10,000,000 clusters, 16,250,000 pairs).",
    fields:
      "Raw header (verified on our file): TID, CID, CTID, SourceID, id, number, title, length, artist, album, year, language. Values are messy by design — lengths like “1m 58sec”, years like “75” or “null”.",
    gold: "Known by construction: real MusicBrainz records were duplicated and corrupted with the DAPO / GeCo data generators, so the cluster id (CID) is the gold standard.",
    usedBy: (
      <>
        FAMER and later multi-source clustering evaluations; also Databricks&rsquo;
        Arc Autolinker evaluation (a 10&times; scaled variant). In ERBOT: the
        near-ceiling column of the E1/E2 matrix &mdash; our local raw file is
        Leipzig&rsquo;s <strong>20M variant</strong> (19,375,000 records,
        10,000,000 clusters, 16,250,000 pairs &mdash; all three counts match the
        Leipzig table exactly), from which we sample whole CID clusters down
        to 20,000 records (10,294 entities).
      </>
    ),
    analysis: (
      <>
        Baseline pair completeness is already 0.9954, so both of our methods
        are kill-line dead here &mdash; yet the learned allocation still beats a
        random allocation under permutation (p&nbsp;=&nbsp;0.005): the ordering effect
        is real, the headroom is not. The Gollum gold-standard paper (
        <a className="underline" href={GOLLUM}>
          arXiv:2209.07479
        </a>
        ) cautions that generator-built datasets &ldquo;can be arbitrarily large but
        do not represent real-world matching problems&rdquo; &mdash; we report MusicBrainz
        results with that caveat attached.
      </>
    ),
  },
  {
    id: "abt-buy",
    name: "Abt-Buy",
    tag: "Studio · Leipzig benchmark",
    source: (
      <>
        Product records scraped from the online retailers Abt.com and Buy.com
        for Köpcke, Thor &amp; Rahm, &ldquo;Evaluation of entity resolution approaches
        on real-world match problems&rdquo; (PVLDB 2010); distributed via the{" "}
        <a className="underline" href={LEIPZIG}>
          Leipzig benchmark page
        </a>{" "}
        under a Creative Commons licence (Leipzig DB Group, Jan 2019).
      </>
    ),
    scale: "2,173 records (1,081 Abt + 1,092 Buy), 1,076 entities in our Studio copy, 1,097 gold matches.",
    fields: "id, source, name, description, manufacturer, price. Mostly free text — descriptions carry the matching signal.",
    gold: "Derived from UPC codes: only products with a valid UPC were kept, and identical UPC = match (per Köpcke et al. 2010).",
    usedBy: (
      <>
        One of the most-used entity-matching benchmarks since 2010: the FEVER
        evaluations, DeepMatcher&rsquo;s textual category, Ditto and essentially
        every later EM paper. Ships in ERBOT Studio as a ready-made demo.
      </>
    ),
    analysis: (
      <>
        A two-source linkage task with highly textual attributes and little
        structure to exploit &mdash; a good middle-difficulty test between the
        toy restaurant sample and Cora.
      </>
    ),
  },
  {
    id: "affiliations",
    name: "Affiliation strings",
    tag: "Studio · Leipzig benchmark",
    source: (
      <>
        Leipzig University Database Group,{" "}
        <a className="underline" href={LEIPZIG}>
          Benchmark datasets for entity resolution
        </a>
        , under a Creative Commons licence (June 2019). The strings were
        extracted from the PDFs of database publications that appeared
        between 2000 and 2009.
      </>
    ),
    scale: "2,260 affiliation strings, 330 gold clusters, 32,816 within-cluster pairs.",
    fields: "Exactly one attribute: the affiliation string itself, as extracted from publications.",
    gold: "Strings grouped by the institution they refer to.",
    usedBy: (
      <>
        Tabulated in the Gollum gold-standard survey (arXiv:2209.07479) as the
        single-attribute clustering case; ships in ERBOT Studio.
      </>
    ),
    analysis: (
      <>
        No attribute structure at all &mdash; one noisy free-text field with
        abbreviations, reordered components and missing pieces. A pure
        string-clustering problem, and a useful stress test for similarity
        functions.
      </>
    ),
  },
  {
    id: "restaurant",
    name: "Fodors–Zagats (Restaurant)",
    tag: "Package · DeepMatcher / RIDDLE",
    source: (
      <>
        Restaurant records from the Fodor&rsquo;s and Zagat&rsquo;s guides. The original
        Restaurant dataset (Sheila Tejada) was distributed via{" "}
        <a className="underline" href="https://www.cs.utexas.edu/~ml/riddle/data.html">
          RIDDLE
        </a>
        ; the two-table packaging is the{" "}
        <a className="underline" href="https://github.com/anhaidgroup/deepmatcher">
          DeepMatcher
        </a>{" "}
        benchmark&rsquo;s.
      </>
    ),
    scale: "864 source records with 112 duplicates (RIDDLE distribution); DeepMatcher packaging: 946 labelled pairs, 110 positives. ERBOT Studio ships a 35-record toy sample.",
    fields: "ERBOT keeps id, source, name, addr, city, phone, type.",
    gold: "The duplicate labels shipped with the RIDDLE Restaurant distribution; ERBOT&rsquo;s builder turns the DeepMatcher matches file into (id, cluster_id) gold.",
    usedBy: (
      <>
        In use since the early 2000s (Tejada&rsquo;s own work, MARLIN-era
        evaluations); a standard &ldquo;small data&rdquo; test in the DeepMatcher
        family, where several models reach F1&nbsp;=&nbsp;1.0.
      </>
    ),
    analysis: (
      <>
        Tiny and largely solved &mdash; which is exactly its job in ERBOT: a
        smoke test where any pipeline regression shows up immediately.
      </>
    ),
  },
  {
    id: "dblp-acm",
    name: "DBLP–ACM",
    tag: "Package · DeepMatcher",
    source: (
      <>
        Bibliographic records from DBLP and the ACM Digital Library, first
        presented by Köpcke &amp; Rahm (2008); the Leipzig distribution is
        Creative Commons (Jan 2019). Labelled train/validation/test
        splits packaged by{" "}
        <a className="underline" href="https://github.com/anhaidgroup/deepmatcher">
          DeepMatcher
        </a>{" "}
        (Mudgal et al., SIGMOD 2018, UW–Madison).
      </>
    ),
    scale: "2,614 DBLP + 2,294 ACM records, 2,224 gold matches.",
    fields: "authors, title, venue, year.",
    gold: "Built on the partially hand-curated source data; the sibling DBLP–Scholar perfect-match result was determined manually (Köpcke et al. 2010).",
    usedBy: (
      <>
        A staple structured-matching benchmark (DeepMatcher, Ditto, and most
        EM papers since 2010). ERBOT ships a builder (
        <code className="font-mono text-[13px]">er_build_dblp_acm()</code>) that
        merges the two tables into ERBOT&rsquo;s combined format.
      </>
    ),
    analysis: (
      <>
        Considered one of the easier benchmarks &mdash; Köpcke et al. expected
        &ldquo;low difficulty&rdquo;, and modern methods routinely reach
        F1&nbsp;&asymp;&nbsp;0.98. Useful as a sanity floor, not as a discriminator.
      </>
    ),
  },
  {
    id: "ncvr",
    name: "North Carolina Voter Registration (NCVR)",
    tag: "Package · scale track",
    source: (
      <>
        Three different artifacts share this name; we keep them apart. (a) Raw
        snapshots published free by the NC State Board of Elections (NCSBE).
        (b) Peter Christen&rsquo;s (ANU) temporal merge of 17 snapshots,
        2011&ndash;2014 (
        <a className="underline" href="https://users.cecs.anu.edu.au/~Peter.Christen/publications/ncvoter-report-29june2014.pdf">
          technical report, 2014
        </a>
        ). (c) The generated large-scale test dataset of Panse et al., EDBT
        2021 (
        <a className="underline" href="http://openproceedings.org/2021/conf/edbt/p152.pdf">
          paper
        </a>
        ). (d) Leipzig&rsquo;s generated &ldquo;North Carolina Voters&rdquo; family (
        <a className="underline" href={LEIPZIG}>
          benchmark page
        </a>
        , Creative Commons, June 2019): real registry records replicated
        across 5 or 10 duplicate-free sources with GeCo — 50% of entities
        replicated in all sources uncorrupted, 25% corrupted and replicated
        everywhere, 25% corrupted and present in only some sources, at a
        moderate 20% corruption rate; the 5-source configuration holds
        5,000,000 records in 3,500,840 clusters.
      </>
    ),
    scale:
      "Christen&rsquo;s merge: ~8.26M records over ~8.1M voters — ~98% of voters have one record, ~145,000 have two, ~3,500 have three to six. Panse et al. generated >120M labelled records from 45 snapshots. Raw records carry ~90 attributes (incl. the NCID).",
    fields: "Names, addresses, age, gender, driver&rsquo;s licence and telephone numbers, race, ethnicity, party affiliation (~70 attributes in Christen&rsquo;s files; ~90 incl. district/election fields in the raw snapshots).",
    gold: "The voter registration number (NCID/VRN) identifies the voter — with Christen&rsquo;s explicit caveat that it is “not 100% correct”.",
    usedBy: (
      <>
        Christen&rsquo;s record-linkage research programme; Panse et al.&rsquo;s
        large-scale duplicate-detection testbed; a ~100K Leipzig NC sample in
        Databricks&rsquo; Autolinker evaluation. In ERBOT it is the designated
        scale track: the design samples whole NCID clusters up a
        100K&nbsp;&rarr;&nbsp;full ladder to test blocking where the small benchmarks
        saturate.
      </>
    ),
    analysis: (
      <>
        Real, dirty and temporal: forms are re-collected by hand each
        election, so typos, swapped fields and outdated values accumulate —
        and Christen&rsquo;s report documents a severely corrupted April 2014
        snapshot. This is the dataset family where our small-benchmark scope
        conclusions (allocation matters only without saturation) go to be
        stress-tested.
      </>
    ),
  },
];

function DsCard({ d }: { d: Ds }) {
  return (
    <section id={d.id} className="scroll-mt-24 border border-slate-200 rounded-2xl p-6 bg-white">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{d.name}</h2>
        <span className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
          {d.tag}
        </span>
      </div>
      <dl className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
        <div>
          <dt className="font-semibold text-slate-800 inline">Source. </dt>
          <dd className="inline">{d.source}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800 inline">Scale. </dt>
          <dd className="inline">{d.scale}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800 inline">Fields. </dt>
          <dd className="inline">{d.fields}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800 inline">Gold standard. </dt>
          <dd className="inline">{d.gold}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800 inline">Who used it. </dt>
          <dd className="inline">{d.usedBy}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-800 inline">What the data taught us. </dt>
          <dd className="inline">{d.analysis}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function Datasets() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
      <p className="mt-3 text-slate-600 text-sm leading-relaxed">
        Every dataset ERBOT runs on &mdash; where it comes from, how it is
        structured, how its gold standard was built, who else has used it, and
        what analysing the data itself showed. Provenance is stated per
        dataset; where a source or a licence is not established, the page says
        so instead of smoothing it over. ERBOT links to the original sources
        rather than redistributing data it has no licence to share.
      </p>
      <p className="mt-3 text-slate-600 text-sm leading-relaxed">
        Short on time? The three experiment datasets tell the story:{" "}
        <Link href="#cora" className="underline text-teal-700">Cora</Link>{" "}
        (real headroom),{" "}
        <Link href="#d10k" className="underline text-teal-700">D10K</Link>{" "}
        (total saturation; JedAI&rsquo;s Febrl-generated synthetic),{" "}
        <Link href="#musicbrainz" className="underline text-teal-700">MusicBrainz 20K</Link>{" "}
        (near-ceiling, generator-built).
      </p>
      <div className="mt-8 space-y-6">
        {DATASETS.map((d) => (
          <DsCard key={d.id} d={d} />
        ))}
      </div>
      <h2 className="mt-12 text-lg font-bold tracking-tight">Sources</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed list-disc pl-5">
        <li>
          Leipzig University Database Group,{" "}
          <a className="underline" href={LEIPZIG}>
            Benchmark datasets for entity resolution
          </a>{" "}
          (MusicBrainz, Abt-Buy, Affiliation strings, NC variants).
        </li>
        <li>
          Köpcke, Thor &amp; Rahm, &ldquo;Evaluation of entity resolution approaches on
          real-world match problems,&rdquo; PVLDB 3(1), 2010.
        </li>
        <li>
          Papadakis et al., &ldquo;Three-dimensional Entity Resolution with
          JedAI,&rdquo; <em>Information Systems</em> 93 (2020) 101565 &mdash; Table 1
          and the dataset-generation description for D10K (Febrl-generated
          synthetic Dirty-ER family, D10K&ndash;D2M).
        </li>
        <li>
          <a className="underline" href={GOLLUM}>
            Gollum gold-standard paper, arXiv:2209.07479
          </a>{" "}
          &mdash; dataset tables for MusicBrainz, Abt-Buy, Affiliations, DBLP-ACM.
        </li>
        <li>
          <a className="underline" href="https://www.cs.utexas.edu/~ml/riddle/data.html">
            RIDDLE labeled datasets
          </a>{" "}
          (UT Austin) &mdash; Cora and Restaurant distributions.
        </li>
        <li>
          Mudgal et al., &ldquo;Deep Learning for Entity Matching,&rdquo; SIGMOD 2018;{" "}
          <a className="underline" href="https://github.com/anhaidgroup/deepmatcher">
            DeepMatcher benchmark repository
          </a>{" "}
          (DBLP-ACM, Fodors-Zagats packaging).
        </li>
        <li>
          Christen, &ldquo;Preparation of a real temporal voter data set for record
          linkage and duplicate detection research,&rdquo; ANU technical report,
          2014; Panse et al., &ldquo;Generating Realistic Test Datasets for Duplicate
          Detection at Scale Using Historical Voter Data,&rdquo; EDBT 2021.
        </li>
        <li>
          ERBOT experiment archives, Oct 2026 &mdash; all ERBOT-side numbers on this
          page (pair completeness, cluster counts, saturation findings) are
          measured on our own copies, not copied from the sources above.
        </li>
      </ul>
    </div>
  );
}
