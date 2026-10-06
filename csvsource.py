"""Shared CSV source resolution for the sandx studio APIs.

A request body may carry the data inline ("csv_text") or as a remote link
("url"). This keeps the choice in one place so /api/plan and /api/run
behave identically.
"""

import urllib.request

MAX_BYTES = 2 * 1024 * 1024  # 2 MB cap, matches the studio upload limit


def resolve_source(body):
    """Return (csv_text, filename, error). Exactly one of csv_text / url."""
    if body.get("csv_text"):
        text = body["csv_text"]
        if len(text.encode("utf-8")) > MAX_BYTES:
            return None, None, "CSV too large (2 MB cap)."
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
            data = r.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            return None, None, "Linked file too large (2 MB cap)."
        text = data.decode("utf-8", errors="replace")
        head = text[:800].lower()
        looks_like_html = "<html" in head or "<!doctype html" in head
        if looks_like_html and "text/csv" not in ctype:
            return None, None, "That link returned a web page, not CSV data."
        name = url.split("?")[0].rstrip("/").rsplit("/", 1)[-1] or "link.csv"
        return text, name, None
    except Exception as e:  # noqa: BLE001 - surfaced as a clean message
        return None, None, f"Could not fetch link ({type(e).__name__})."
