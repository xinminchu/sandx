"""Plan endpoint: estimate candidate pairs before a run.

POST {"csv_text"|"url", "block_method", "block_key", "sample_n"}
  -> {"ok": true, "columns": [...], "n_records": N, "n_pairs": M,
      "sampled": bool, "filename": str}
     or {"ok": false, "error": str}

Blocking is O(n log n), so this is cheap even for a few thousand rows.
The studio calls it whenever the data or blocking config changes, so the
user sees the pair count (and the budget) *before* running.
"""

import csv
import io
import json
import os
import random
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from csvsource import resolve_source, read_table, suggested_fields  # noqa: E402
from engine.blocking import block  # noqa: E402

MAX_ROWS = 10000
SAMPLE_SEED = 42


def _read_body(h):
    try:
        length = int(h.headers.get("Content-Length") or 0)
    except ValueError:
        length = 0
    if length > 4_500_000:
        return None
    raw = h.rfile.read(length)
    try:
        return json.loads(raw.decode("utf-8") or "{}")
    except Exception:
        return None


class handler(BaseHTTPRequestHandler):
    def _send(self, obj, status=200):
        data = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        body = _read_body(self)
        if body is None:
            self._send({"ok": False, "error": "Invalid request."}, 400)
            return
        csv_text, filename, err = resolve_source(body)
        if err:
            self._send({"ok": False, "error": err})
            return
        try:
            columns, rows = read_table(csv_text)
        except Exception:
            self._send({"ok": False, "error": "Could not parse CSV."})
            return
        if not rows:
            self._send({"ok": False, "error": "CSV has no data rows."})
            return
        if len(rows) > MAX_ROWS:
            self._send(
                {"ok": False, "error": f"Too many rows ({len(rows):,} > {MAX_ROWS:,}). Try a random sample, or add blocking."}
            )
            return

        # Optional random sampling (seeded, reproducible).
        sampled = False
        sample_n = body.get("sample_n")
        if isinstance(sample_n, int) and sample_n > 0 and len(rows) > sample_n:
            rows = random.Random(SAMPLE_SEED).sample(rows, sample_n)
            sampled = True

        block_method = body.get("block_method") or "prefix"
        block_key = body.get("block_key") or columns[0]
        try:
            pairs = block(rows, method=block_method, key=block_key)
        except ValueError as e:
            self._send({"ok": False, "error": str(e)})
            return

        # If a separate truth file was attached, report its columns so the
        # UI can offer id/cluster column pickers.
        truth_columns = []
        ttext = body.get("truth_csv_text") or ""
        if ttext:
            try:
                rdr = csv.DictReader(io.StringIO(ttext))
                truth_columns = [c for c in (rdr.fieldnames or []) if c]
            except Exception:
                truth_columns = []

        self._send(
            {
                "ok": True,
                "columns": columns,
                "n_records": len(rows),
                "n_pairs": len(pairs),
                "sampled": sampled,
                "filename": filename,
                "truth_columns": truth_columns,
                "suggested_fields": suggested_fields(columns, rows),
            }
        )
