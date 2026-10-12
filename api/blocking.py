"""Vercel serverless: blocking-stage analysis for the sandx ER engine.

POST {"csv_text"|"url", "filename", "config": {...}, "sample_n"}
Returns candidate-pair stats (pair completeness, reduction ratio,
pairs-per-record) without running classify/cluster. Request parsing
mirrors /api/run.
"""
import json
import os
import random
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))

from csvsource import resolve_source, read_table  # noqa: E402
from engine.pipeline import blocking_report  # noqa: E402
from run import _truth_from_file, MAX_ROWS, SAMPLE_SEED  # noqa: E402

MAX_PAIRS = 2_000_000


class handler(BaseHTTPRequestHandler):
    def _send(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            self._send({"ok": False, "error": "Invalid request."}, 400)
            return

        cfg = body.get("config", {}) or {}
        csv_text, filename, err = resolve_source(body)
        if err:
            self._send({"ok": False, "error": err}, 400)
            return
        try:
            cols, rows = read_table(csv_text)
        except Exception:
            self._send({"ok": False, "error": "Could not parse CSV."}, 400)
            return
        if not cols:
            self._send({"ok": False, "error": "No header row found in CSV."}, 400)
            return
        if not rows:
            self._send({"ok": False, "error": "CSV has no data rows."}, 400)
            return
        if len(rows) > MAX_ROWS:
            self._send(
                {"ok": False,
                 "error": f"Too many rows ({len(rows):,}). Try a random sample."},
                400)
            return

        sample_n = body.get("sample_n")
        if isinstance(sample_n, int) and sample_n > 0 and len(rows) > sample_n:
            rows = random.Random(SAMPLE_SEED).sample(rows, sample_n)

        fields = cfg.get("fields") or {}
        if not fields:
            self._send({"ok": False, "error": "Select at least one match field."},
                       400)
            return
        block_method = cfg.get("block_method", "prefix")
        block_key = cfg.get("block_key") or (cols[0] if cols else None)
        try:
            max_pairs = int(cfg.get("max_pairs", 2000000))
        except (TypeError, ValueError):
            max_pairs = 2000000
        max_pairs = max(100, min(max_pairs, 10000000))

        # Gold truth: none | a column in the data | a separate truth file.
        truth_source = cfg.get("truth_source") or "none"
        truth_col = cfg.get("truth_col") or None
        if truth_source != "column" or truth_col not in cols:
            truth_col = None
        # Defensive: the truth column must never be a match field.
        if truth_col and truth_col in fields:
            fields = {k: v for k, v in fields.items() if k != truth_col}
            if not fields:
                self._send(
                    {"ok": False,
                     "error": "Select at least one match field (not the truth column)."},
                    400)
                return
        truth = None
        if truth_source == "file":
            truth, _, terr = _truth_from_file(rows, body)
            if terr:
                self._send({"ok": False, "error": terr}, 400)
                return

        try:
            rep = blocking_report(
                rows, fields, block_method=block_method, block_key=block_key,
                truth_col=truth_col, max_pairs=max_pairs, truth=truth)
        except ValueError as e:
            self._send({"ok": False, "error": str(e)}, 400)
            return
        rep["ok"] = True
        rep["config_summary"] = {
            "block_method": block_method,
            "block_key": block_key if block_method not in ("none", "embed") else None,
            "max_pairs": max_pairs,
        }
        self._send(rep)
