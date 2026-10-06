"""Vercel serverless: run the sandx ER engine on an uploaded CSV."""
import base64
import csv
import io
import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    from engine.pipeline import run
    from engine.rcode import r_script
except ImportError:  # local dev fallback
    from engine.pipeline import run  # type: ignore
    from engine.rcode import r_script  # type: ignore

MAX_ROWS = 3000
DISPLAY_ROWS = 300


class handler(BaseHTTPRequestHandler):
    def _send(self, payload, code=200):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            if length > 4 * 1024 * 1024:
                return self._send({"ok": False, "error": "Request too large (4 MB cap)."})
            body = json.loads(self.rfile.read(length) or b"{}")
            csv_text = body.get("csv_text", "")
            filename = body.get("filename", "upload.csv") or "upload.csv"
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

            fields = cfg.get("fields") or {}
            if not fields:
                return self._send({"ok": False, "error": "Select at least one match field."})
            block_method = cfg.get("block_method", "standard")
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
                    "warnings": [],
                }
            )
        except ValueError as e:
            return self._send({"ok": False, "error": str(e)})
        except Exception as e:  # never leak a stack trace to the client
            return self._send({"ok": False, "error": f"Engine error: {type(e).__name__}"})
