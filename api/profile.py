"""Vercel serverless: profile a dataset for the Studio data-profile page.

POST {"csv_text"|"url", "filename", "truth_col"} ->
{
  "ok": True, "filename", "n_records", "n_columns",
  "columns": [{"name", "dtype": "numeric"|"text"|"id", "n_missing",
               "missing_pct", "n_unique", "min"|"max"|"mean",
               "avg_len", "top_values": [[v, n]...], "samples": [...]}],
  "truth": {"n_entities", "n_labeled", "size_min", "size_max",
            "size_mean", "n_singletons", "hist": [[size, n_entities]...]}
  (truth only when a valid truth_col is supplied)
}
"""
import json
import os
import re
import sys
from collections import Counter
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    from csvsource import resolve_source, read_table, ID_LIKE
except ImportError:  # local dev fallback
    from csvsource import resolve_source, read_table, ID_LIKE  # type: ignore

MAX_ROWS = 3000


def _is_num(v):
    try:
        float(v)
        return True
    except (TypeError, ValueError):
        return False


def _round(x, nd=4):
    if x is None:
        return None
    r = round(x, nd)
    return int(r) if isinstance(r, float) and r.is_integer() else r


def profile_column(name, vals, n):
    non_missing = [v for v in vals if v is not None and str(v).strip() != ""]
    n_missing = n - len(non_missing)
    stripped = [str(v).strip() for v in non_missing]
    uniq = set(stripped)
    col = {
        "name": name,
        "n_missing": n_missing,
        "missing_pct": round(100.0 * n_missing / n, 1) if n else 0.0,
        "n_unique": len(uniq),
        "samples": [v[:60] for v in stripped[:3]],
    }
    if ID_LIKE.search(name.strip()) or (n > 1 and len(uniq) == n):
        col["dtype"] = "id"
    elif stripped and all(_is_num(v) for v in stripped):
        col["dtype"] = "numeric"
        nums = [float(v) for v in stripped]
        col["min"] = _round(min(nums))
        col["max"] = _round(max(nums))
        col["mean"] = _round(sum(nums) / len(nums))
    else:
        col["dtype"] = "text"
        col["avg_len"] = _round(sum(len(v) for v in stripped) / len(stripped), 1) if stripped else 0
        col["top_values"] = [[v[:60], c] for v, c in Counter(stripped).most_common(5)]
    return col


def truth_summary(rows, truth_col):
    vals = [str(r.get(truth_col)).strip() for r in rows]
    vals = [v for v in vals if v != ""]
    if not vals:
        return None
    counts = Counter(vals)
    sizes = sorted(counts.values())
    hist = sorted(Counter(sizes).items())
    return {
        "n_entities": len(counts),
        "n_labeled": len(vals),
        "size_min": sizes[0],
        "size_max": sizes[-1],
        "size_mean": _round(sum(sizes) / len(sizes), 1),
        "n_singletons": sum(1 for s in sizes if s == 1),
        "hist": hist,
    }


class handler(BaseHTTPRequestHandler):
    def _send(self, payload, code=200):
        data = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            if length > 4 * 1024 * 1024:
                return self._send({"ok": False, "error": "Request too large (4 MB cap)."})
            body = json.loads(self.rfile.read(length) or b"{}")

            csv_text, filename, src_err = resolve_source(body)
            if src_err:
                return self._send({"ok": False, "error": src_err})
            cols, rows = read_table(csv_text)
            if not cols:
                return self._send({"ok": False, "error": "No header row found in CSV."})
            if not rows:
                return self._send({"ok": False, "error": "CSV has no data rows."})
            if len(rows) > MAX_ROWS:
                return self._send(
                    {"ok": False, "error": f"Too many rows ({len(rows)}). Demo cap: {MAX_ROWS}."}
                )

            n = len(rows)
            columns = [profile_column(c, [r.get(c) for r in rows], n) for c in cols]

            truth_col = body.get("truth_col") or None
            truth = None
            if truth_col and truth_col in cols:
                truth = truth_summary(rows, truth_col)

            return self._send(
                {
                    "ok": True,
                    "filename": filename,
                    "n_records": n,
                    "n_columns": len(cols),
                    "columns": columns,
                    "truth": truth,
                    "truth_col": truth_col if truth else None,
                }
            )
        except Exception as e:  # never leak a stack trace to the client
            return self._send({"ok": False, "error": f"Engine error: {type(e).__name__}"})
