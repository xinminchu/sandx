"""Shared CSV source resolution for the sandx studio APIs.

A request body may carry the data inline ("csv_text") or as a remote link
("url"). This keeps the choice in one place so /api/plan and /api/run
behave identically. Delimiters are sniffed (comma/semicolon/tab/pipe),
so European-style `;`-separated files just work.
"""

import csv
import io
import re
import urllib.request

MAX_BYTES = 4 * 1024 * 1024  # 4 MB upload cap (Vercel Hobby POST ~4.5 MB)
LINK_MAX_BYTES = 10 * 1024 * 1024  # 10 MB for server-side link fetch (no POST limit)

ID_LIKE = re.compile(r"(^|_)id$", re.IGNORECASE)


def sniff_dialect(text):
    """Guess the delimiter; keep standard quoting.

    The sniffer's quoting guesses (e.g. doublequote=False) break on fields
    with embedded quotes, silently misaligning columns. Only the delimiter
    is taken from the sniffer.
    """
    try:
        d = csv.Sniffer().sniff(text[:8192], delimiters=[",", ";", "\t", "|"])
        if d.delimiter not in (",", ";", "\t", "|"):
            raise csv.Error("odd delimiter")
        class _Sniffed(csv.excel):
            pass
        _Sniffed.delimiter = d.delimiter
        return _Sniffed
    except Exception:
        return csv.excel


def read_table(text):
    """(columns, rows) with delimiter sniffing; drops fully-blank rows."""
    rdr = csv.DictReader(io.StringIO(text), dialect=sniff_dialect(text))
    cols = [c for c in (rdr.fieldnames or []) if c and c.strip()]
    rows = []
    for r in rdr:
        d = {c: (r.get(c) or "") for c in cols}
        if any(v.strip() for v in d.values()):
            rows.append(d)
    return cols, rows


def suggested_fields(cols, rows, k=2):
    """Default match fields: skip id-like and unique-key columns."""
    out = []
    for c in cols:
        if ID_LIKE.search(c.strip()):
            continue
        vals = [r[c].strip() for r in rows]
        if len(rows) > 1 and len(set(vals)) == len(rows):
            continue  # unique per record: a key, not a feature
        out.append(c)
        if len(out) >= k:
            break
    return out or cols[:k]


def resolve_source(body):
    """Return (csv_text, filename, error). Exactly one of csv_text / url."""
    if body.get("csv_text"):
        text = body["csv_text"]
        if len(text.encode("utf-8")) > MAX_BYTES:
            return None, None, "CSV too large (4 MB cap). For bigger files, paste a link instead — the server fetches it directly (10 MB cap)."
        return text, body.get("filename") or "upload.csv", None

    url = (body.get("url") or "").strip()
    if not url:
        return None, None, "No data source: upload a CSV, use the sample, or paste a link."
    if "://" not in url:
        url = "https://" + url
    if not url.startswith(("http://", "https://")):
        return None, None, "Only http(s) links are supported."
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "sandx-studio/1.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            ctype = (r.headers.get("Content-Type") or "").lower()
            data = r.read(LINK_MAX_BYTES + 1)
        if len(data) > LINK_MAX_BYTES:
            return None, None, "Linked file too large (10 MB cap)."
        text = data.decode("utf-8", errors="replace")
        head = text[:800].lower()
        looks_like_html = "<html" in head or "<!doctype html" in head
        if looks_like_html and "text/csv" not in ctype:
            return None, None, "That link returned a web page, not CSV data."
        name = url.split("?")[0].rstrip("/").rsplit("/", 1)[-1] or "link.csv"
        return text, name, None
    except Exception as e:  # noqa: BLE001 - surfaced as a clean message
        return None, None, f"Could not fetch link ({type(e).__name__})."
