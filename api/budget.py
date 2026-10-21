"""POST /api/budget — Budget Lab: who gets the pairs?

Runs the budget-allocation demonstration (engine/budget.py): fixed-k vs
E1 collective vs E2 marginal allocation over one shared candidate pool,
at matched budgets, on a dataset that carries a gold `truth` column.
"""
import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from csvsource import read_table, resolve_source  # noqa: E402
from engine.budget import budget_lab  # noqa: E402

MAX_ROWS = 2500  # the demo pool is a dense n x n cosine build


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

            cols, rows = read_table(csv_text)
            if not cols or not rows:
                return self._send({"ok": False, "error": "CSV has no data rows."})
            if len(rows) > MAX_ROWS:
                return self._send(
                    {"ok": False, "error":
                     f"Too many rows ({len(rows):,}). The Budget Lab runs up to "
                     f"{MAX_ROWS:,} rows (its candidate pool is a dense cosine build)."})  # noqa: E501

            truth_col = body.get("truth_col") or ("truth" if "truth" in cols else None)
            if not truth_col or truth_col not in cols:
                return self._send(
                    {"ok": False, "error":
                     "The Budget Lab needs a gold cluster column (a column "
                     "named 'truth', or pass truth_col). All four bundled "
                     "datasets carry one."})
            id_col = body.get("id_col") or ("id" if "id" in cols else None)
            truth = [r.get(truth_col, "") for r in rows]
            if len(set(truth)) < 2:
                return self._send({"ok": False, "error": "The truth column has a single cluster; nothing to allocate."})

            try:
                res = budget_lab(rows, cols, truth,
                                 id_col=id_col, truth_col=truth_col)
            except Exception as e:  # surface as a clean API error
                return self._send({"ok": False, "error": f"Budget Lab failed: {e}"})
            res["ok"] = True
            res["filename"] = filename
            self._send(res)
        except Exception as e:
            self._send({"ok": False, "error": str(e)}, 500)

    def log_message(self, *args):
        pass
