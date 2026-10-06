#!/usr/bin/env python3
"""
ScholComp segmenter v0.1 — rule-based baseline.

Reads a scholarly article (ar5iv-style HTML or plain text), splits it into
sections, classifies each section into one of the six ScholComp component
types (A–F), and emits JSON-LD conforming to ``schema/context.jsonld``.

This is intentionally a *baseline*: deterministic, stdlib-only, no API
keys, no network calls except an optional ``--url`` fetch. The production
pipeline replaces the classifier below with an LLM-assisted stage; the
schema, the stable URIs, and the provenance model stay the same.

Usage:
    python3 segment.py --url https://ar5iv.org/html/1706.03762 \\
        --slug arxiv-1706-03762 -o ../examples/arxiv-1706-03762.jsonld
    python3 segment.py --html paper.html --slug my-paper -o out.jsonld
    python3 segment.py --text paper.txt --slug my-paper -o out.jsonld
"""

import argparse
import html as htmlmod
import json
import re
import sys
import urllib.request
from pathlib import Path

SCHEMA_VERSION = "0.1"
MODEL_NAME = "scholcomp-segmenter v0.1 (rule-based baseline, 2026-09-29)"
TEXT_LIMIT = 2000  # demo truncation per component

# ---------------------------------------------------------------------------
# Component-type knowledge
# ---------------------------------------------------------------------------

# (type, code) pairs in canonical order
TYPES = [
    ("MotivationProblem", "a"),
    ("LiteratureReview", "b"),
    ("MethodStrategy", "c"),
    ("ProcessResults", "d"),
    ("ConclusionExtensions", "e"),
    ("AppendicesArtifacts", "f"),
]

# Strong title rules: substring -> type. Checked before keyword scoring.
TITLE_RULES = [
    ("abstract", "MotivationProblem"),
    ("introduction", "MotivationProblem"),
    ("related work", "LiteratureReview"),
    ("background", "LiteratureReview"),
    ("prior work", "LiteratureReview"),
    ("literature review", "LiteratureReview"),
    ("method", "MethodStrategy"),
    ("model architecture", "MethodStrategy"),
    ("approach", "MethodStrategy"),
    ("training", "MethodStrategy"),
    ("experiment", "ProcessResults"),
    ("result", "ProcessResults"),
    ("evaluation", "ProcessResults"),
    ("conclusion", "ConclusionExtensions"),
    ("discussion", "ConclusionExtensions"),
    ("future work", "ConclusionExtensions"),
    ("limitation", "ConclusionExtensions"),
    ("appendix", "AppendicesArtifacts"),
    ("supplement", "AppendicesArtifacts"),
    ("visualization", "AppendicesArtifacts"),
]

SKIP_TITLES = ("reference", "bibliography", "acknowledg")

# Keyword cues for the fallback scorer: type -> [keywords]
KEYWORDS = {
    "MotivationProblem": ["problem", "challenge", "motivat", "we propose",
                          "difficult", "task of", "goal"],
    "LiteratureReview": ["prior work", "previous work", "et al", "survey",
                         "literature", "proposed by", "introduced by"],
    "MethodStrategy": ["model", "architecture", "layer", "attention",
                       "network", "algorithm", "training", "parameter",
                       "propose", "define"],
    "ProcessResults": ["experiment", "bleu", "accuracy", "outperform",
                       "baseline", "table", "compare", "achieve",
                       "performance"],
    "ConclusionExtensions": ["conclude", "future work", "limitation",
                             "we have shown", "summary", "in this paper"],
    "AppendicesArtifacts": ["appendix", "supplementary", "proof",
                            "visualization", "hyperparameter"],
}


def classify(title, body, position, n_sections):
    """Return (component_type, confidence, reason)."""
    t = title.lower()

    if any(s in t for s in SKIP_TITLES):
        return None, 0.0, "skipped (non-content section)"

    for substr, ctype in TITLE_RULES:
        if substr in t:
            return ctype, 0.95, f"title rule: '{substr}'"

    # Fallback: keyword scoring on the section opening.
    sample = (title + " " + body[:1200]).lower()
    scores = {}
    for ctype, kws in KEYWORDS.items():
        scores[ctype] = sum(sample.count(k) for k in kws)
    if position == 0:
        scores["MotivationProblem"] += 2  # opening sections motivate
    if position == n_sections - 1:
        scores["ConclusionExtensions"] += 2  # closings conclude

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    best, best_score = ranked[0]
    runner_up = ranked[1][1]
    if best_score == 0:
        return "MotivationProblem", 0.50, "fallback: no cues, default A"
    margin = best_score - runner_up
    confidence = round(0.55 + 0.40 * margin / (margin + 2), 2)
    return best, confidence, f"keyword scoring ({best_score} cues)"


# ---------------------------------------------------------------------------
# HTML extraction (ar5iv / latexml style)
# ---------------------------------------------------------------------------

def clean_html(fragment):
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ",
                  fragment, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = htmlmod.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def extract_ar5iv_sections(raw):
    """Return (title, [(section_title, section_text), ...]).

    Picks up: document title, abstract, top-level numbered sections, and
    trailing unnumbered appendix sections. References are dropped.
    """
    m = re.search(r'<h1 class="ltx_title ltx_title_document">(.*?)</h1>',
                  raw, flags=re.S)
    title = clean_html(m.group(1)) if m else "Untitled"

    sections = []

    m = re.search(r'<div id="abstract\d*" class="ltx_abstract">(.*?)</div>\s*'
                  r'(?:<section|<div)',
                  raw, flags=re.S)
    if m:
        sections.append(("Abstract", clean_html(m.group(1))))

    # Top-level sections S1..Sn: slice between their start tags.
    starts = [m.start() for m in
              re.finditer(r'<section id="S\d+" class="ltx_section">', raw)]
    # Bibliography / appendix markers that end the section run.
    end_marks = [m.start() for m in re.finditer(
        r'<section id="bibliography"|<h2 class="ltx_title ltx_title_bibliography"',
        raw)]
    end_of_sections = min(end_marks) if end_marks else len(raw)

    for i, s in enumerate(starts):
        e = starts[i + 1] if i + 1 < len(starts) else end_of_sections
        chunk = raw[s:e]
        hm = re.search(r"<h2[^>]*>(.*?)</h2>", chunk, flags=re.S)
        sec_title = clean_html(hm.group(1)) if hm else f"Section {i + 1}"
        sec_title = re.sub(r"^\d+(\.\d+)*\s*", "", sec_title)  # strip "3.1 "
        sections.append((sec_title, clean_html(chunk)))

    # Trailing appendix-style h2 sections after the numbered run.
    for m in re.finditer(
            r'<h2 class="ltx_title ltx_title_section">(.*?)</h2>(.*?)(?='
            r'<h2 class="ltx_title ltx_title_section">|$)',
            raw[end_of_sections:], flags=re.S):
        sec_title = clean_html(m.group(1)).strip()
        if sec_title and "reference" not in sec_title.lower():
            sections.append((sec_title, clean_html(m.group(2))))

    return title, sections


def extract_text_sections(raw):
    """Fallback for plain text: blank-line-separated blocks whose first
    line looks like a header become sections."""
    lines = [l.rstrip() for l in raw.split("\n")]
    sections, buf, cur_title = [], [], "Untitled"
    header_re = re.compile(
        r"^(\d+(\.\d+)*\s+[A-Z]|#+\s+|[A-Z][A-Za-z ,/-]{2,40})$")
    for line in lines + [""]:
        if line.strip() == "":
            if buf:
                sections.append((cur_title, " ".join(buf)))
                buf, cur_title = [], "Untitled"
            continue
        if header_re.match(line.strip()) and len(line.strip()) < 60 and not buf:
            cur_title = re.sub(r"^#+\s*", "", line.strip())
            cur_title = re.sub(r"^\d+(\.\d+)*\s*", "", cur_title)
        else:
            buf.append(line.strip())
    if buf:
        sections.append((cur_title, " ".join(buf)))
    title = sections[0][1][:120] if sections else "Untitled"
    return title, sections[1:] if len(sections) > 1 else sections


# ---------------------------------------------------------------------------
# JSON-LD emission
# ---------------------------------------------------------------------------

def load_context():
    ctx_path = Path(__file__).resolve().parent.parent / "schema" / "context.jsonld"
    return json.loads(ctx_path.read_text(encoding="utf-8"))["@context"]


def build_graph(paper_title, slug, sections):
    base = f"https://w3id.org/scholcomp/{slug}"
    article_id = base
    counters = {code: 0 for _, code in TYPES}
    type_of = dict(TYPES)

    graph = [{
        "@id": article_id,
        "@type": "ScholarlyArticle",
        "schema:name": paper_title,
        "hasComponent": [],
        "schemaVersion": SCHEMA_VERSION,
    }]

    n = len(sections)
    for i, (sec_title, sec_text) in enumerate(sections):
        ctype, conf, reason = classify(sec_title, sec_text, i, n)
        if ctype is None:
            print(f"  [skip] {sec_title} — {reason}", file=sys.stderr)
            continue
        code = type_of[ctype]
        counters[code] += 1
        comp_id = f"{base}/{code}{counters[code]}"
        text = sec_text[:TEXT_LIMIT]
        if len(sec_text) > TEXT_LIMIT:
            text += " …[truncated in demo]"
        graph[0]["hasComponent"].append({"@id": comp_id})
        graph.append({
            "@id": comp_id,
            "@type": "ScholarlyComponent",
            "componentType": ctype,
            "schema:name": sec_title,
            "order": len(graph) - 1,
            "locator": f"Section: {sec_title}",
            "schema:inLanguage": "en",
            "schema:text": text,
            "derivedFrom": {"@id": article_id},
            "extractionMethod": "rule-based",
            "extractorModel": MODEL_NAME,
            "confidence": conf,
            "note": f"Classification basis: {reason}.",
            "schemaVersion": SCHEMA_VERSION,
        })
        print(f"  [{code}{counters[code]}] {ctype:22s} "
              f"conf={conf:.2f}  {sec_title[:48]}", file=sys.stderr)

    return {"@context": load_context(), "@graph": graph}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "scholcomp-demo/0.1"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main():
    ap = argparse.ArgumentParser(description="ScholComp rule-based segmenter v0.1")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--html", help="path to ar5iv-style HTML file")
    src.add_argument("--text", help="path to plain-text file")
    src.add_argument("--url", help="URL of ar5iv-style HTML")
    ap.add_argument("--slug", required=True, help="paper slug for URI minting")
    ap.add_argument("-o", "--output", required=True, help="output .jsonld path")
    args = ap.parse_args()

    if args.url:
        print(f"fetching {args.url} …", file=sys.stderr)
        raw = fetch(args.url)
        title, sections = extract_ar5iv_sections(raw)
    elif args.html:
        raw = Path(args.html).read_text(encoding="utf-8", errors="replace")
        title, sections = extract_ar5iv_sections(raw)
    else:
        raw = Path(args.text).read_text(encoding="utf-8", errors="replace")
        title, sections = extract_text_sections(raw)

    print(f"paper: {title}", file=sys.stderr)
    print(f"sections found: {len(sections)}", file=sys.stderr)

    doc = build_graph(title, args.slug, sections)
    out = Path(args.output)
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=2),
                   encoding="utf-8")
    n_comp = len(doc["@graph"]) - 1
    print(f"wrote {n_comp} components → {out}", file=sys.stderr)


if __name__ == "__main__":
    main()
