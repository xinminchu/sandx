"""Vercel serverless: run the sandx ER engine on a CSV.

POST {"csv_text"|"url", "filename", "config": {...}, "sample_n"}
The data source resolution (inline text vs link) is shared with /api/plan
via csvsource.resolve_source.
"""
import base64
import csv
import io
import json
import os
import random
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    from csvsource import resolve_source
    from engine.pipeline import run
    from engine.rcode import r_script
except ImportError:  # local dev fallback
    from csvsource import resolve_source  # type: ignore
    from engine.pipeline import run  # type: ignore
    from engine.rcode import r_script  # type: ignore

MAX_ROWS = 3000
MAX_PAIRS = 500_000
DISPLAY_ROWS = 300
SAMPLE_SEED = 42


class handler(BaseHTTPRequestHandler):
    def _send(self, payload, code=200):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            if length > 4 * 1024 * 1024:
                return self._send({"ok": False, "error": "Request too large (4 MB cap)."})
            body = json.loads(self.rfile.read(length) or b"{}")

            csv_text, filename, src_err = resolve_source(body)
            if src_err:
                return self._send({"ok": False, "error": src_err})
            cfg = body.get("config", {}) or {}

            reader = csv.DictReader(io.StringIO(csv_text))
            cols = [c for c in (reader.fieldnames or []) if c]
            if not cols:
                return self._send({"ok": False, "error": "No header row found in CSV."})
            rows = []
            for r in reader:
                d = {c: (r.get(c) or "") for c in cols}
                if any(v.strip() for v in d.values()):
                    rows.append(d)
            if not rows:
                return self._send({"ok": False, "error": "CSV has no data rows."})
            if len(rows) > MAX_ROWS:
                return self._send(
                    {"ok": False, "error": f"Too many rows ({len(rows)}). Demo cap: {MAX_ROWS}."}
                )

            # Optional random sampling (seeded, reproducible) for large sets.
            sampled = False
            sample_n = body.get("sample_n")
            if isinstance(sample_n, int) and sample_n > 0 and len(rows) > sample_n:
                rows = random.Random(SAMPLE_SEED).sample(rows, sample_n)
                sampled = True

            fields = cfg.get("fields") or {}
            if not fields:
                return self._send({"ok": False, "error": "Select at least one match field."})
            block_method = cfg.get("block_method", "prefix")
            block_key = cfg.get("block_key") or (cols[0] if cols else None)
            threshold = float(cfg.get("threshold", 0.5))
            cluster_method = cfg.get("cluster_method", "threshold_cc")
            truth_col = cfg.get("truth_col") or None
            if truth_col not in cols:
                truth_col = None

            res = run(
                rows,
                fields=fields,
                block_method=block_method,
                block_key=block_key,
                threshold=threshold,
                cluster_method=cluster_method,
                truth_col=truth_col,
            )
            if res.get("n_pairs", 0) > MAX_PAIRS:
                return self._send(
                    {
                        "ok": False,
                        "error": (
                            f"Too many candidate pairs ({res['n_pairs']:,} > {MAX_PAIRS:,}). "
                            "Pick a blocking key or use sampling."
                        ),
                    }
                )

            labels = res["labels"]
            out = io.StringIO()
            w = csv.DictWriter(out, fieldnames=["cluster"] + cols)
            w.writeheader()
            for r, lab in zip(rows, labels):
                w.writerow({"cluster": lab, **r})
            csv_b64 = base64.b64encode(out.getvalue().encode()).decode()

            display = []
            for r, lab in zip(rows[:DISPLAY_ROWS], labels[:DISPLAY_ROWS]):
                display.append({**r, "__cluster": lab})

            r_code = r_script(
                {
                    "filename": filename,
                    "fields": fields,
                    "block_method": block_method,
                    "block_key": block_key,
                    "threshold": threshold,
                    "cluster_method": cluster_method,
                }
            )

            warnings = []
            if sampled:
                warnings.append(
                    f"Results are on a random sample of {len(rows)} records (seed {SAMPLE_SEED})."
                )

            return self._send(
                {
                    "ok": True,
                    "n_records": res["n_records"],
                    "n_pairs": res["n_pairs"],
                    "n_clusters": res["n_clusters"],
                    "ari": res.get("ari"),
                    "cluster_sizes": res.get("cluster_sizes", []),
                    "columns": cols,
                    "display_rows": display,
                    "result_csv_b64": csv_b64,
                    "r_code": r_code,
                    "sampled": sampled,
                    "warnings": warnings,
                }
            )
        except ValueError as e:
            return self._send({"ok": False, "error": str(e)})
        except Exception as e:  # never leak a stack trace to the client
            return self._send({"ok": False, "error": f"Engine error: {type(e).__name__}"})
