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


def _cluster_sample(rows, truth, cap=MAX_ROWS, floor_n=2000, seed=20261020):
    """Whole-cluster sample (the same construction the MusicBrainz-20K
    subset itself used): shuffle gold clusters, take whole clusters
    until ~cap records. Returns (rows, truth) in original order."""
    import random
    from collections import defaultdict

    by = defaultdict(list)
    for i, t in enumerate(truth):
        by[t].append(i)
    keys = list(by.keys())
    random.Random(seed).shuffle(keys)
    picked = []
    for k in keys:
        members = by[k]
        if len(picked) + len(members) > cap and len(picked) >= floor_n:
            continue
        if len(picked) + len(members) > cap and picked:
            continue
        picked.extend(members)
    picked.sort()
    return [rows[i] for i in picked], [truth[i] for i in picked]


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

            truth_col = body.get("truth_col") or ("truth" if "truth" in cols else None)
            if not truth_col or truth_col not in cols:
                return self._send(
                    {"ok": False, "error":
                     "The Budget Lab needs a gold cluster column (a column "
                     "named 'truth', or pass truth_col). All bundled "
                     "datasets carry one."})
            id_col = body.get("id_col") or ("id" if "id" in cols else None)
            truth = [r.get(truth_col, "") for r in rows]
            if len(set(truth)) < 2:
                return self._send({"ok": False, "error": "The truth column has a single cluster; nothing to allocate."})

            sampled_from = None
            if len(rows) > MAX_ROWS:
                sampled_from = len(rows)
                rows, truth = _cluster_sample(rows, truth)
                if len(rows) > MAX_ROWS:
                    return self._send(
                        {"ok": False, "error":
                         f"Too many rows ({sampled_from:,}), and a whole-cluster "
                         f"sample still exceeds the lab's {MAX_ROWS:,}-row cap."})

            try:
                res = budget_lab(rows, cols, truth,
                                 id_col=id_col, truth_col=truth_col)
            except Exception as e:  # surface as a clean API error
                return self._send({"ok": False, "error": f"Budget Lab failed: {e}"})
            res["ok"] = True
            res["filename"] = filename
            if sampled_from is not None:
                res["sampled_from"] = sampled_from
                res["sampled_to"] = len(rows)
            self._send(res)
        except Exception as e:
            self._send({"ok": False, "error": str(e)}, 500)

    def log_message(self, *args):
        pass
