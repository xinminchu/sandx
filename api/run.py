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
    from csvsource import resolve_source, read_table
    from engine.pipeline import run
    from engine.rcode import r_script
except ImportError:  # local dev fallback
    from csvsource import resolve_source, read_table  # type: ignore
    from engine.pipeline import run  # type: ignore
    from engine.rcode import r_script  # type: ignore

MAX_ROWS = 10000
MAX_PAIRS = 2_000_000
DISPLAY_ROWS = 300
SAMPLE_SEED = 42


def _truth_from_file(rows, body):
    """Build a truth vector aligned with rows from a separate truth CSV.

    Two formats:
      labels: one row per record; truth_id_col -> truth_cluster_col.
      pairs:  duplicate pairs (id1_col, id2_col); components become clusters.
    Returns (truth_list, n_matched, error). Entries are ints or None.
    """
    ttext = body.get("truth_csv_text") or ""
    if len(ttext.encode("utf-8")) > 2 * 1024 * 1024:
        return None, 0, "Truth file too large (2 MB cap)."
    did_col = body.get("data_id_col") or ""
    fmt = body.get("truth_format") or "labels"
    if not did_col:
        return None, 0, "Pick the data column to join on."
    try:
        _, trows = read_table(ttext)
    except Exception:
        return None, 0, "Could not parse the truth CSV."
    if not trows:
        return None, 0, "Truth file has no data rows."

    if fmt == "pairs":
        return _truth_from_pairs(rows, trows, body, did_col)

    tid_col = body.get("truth_id_col") or ""
    tcl_col = body.get("truth_cluster_col") or ""
    if not (tid_col and tcl_col):
        return None, 0, "Pick the id/cluster columns for the truth file."
    tmap = {}
    for r in trows:
        tid = (r.get(tid_col) or "").strip()
        if tid:
            tmap[tid] = (r.get(tcl_col) or "").strip()
    cmap, truth, matched = {}, [], 0
    for r in rows:
        c = tmap.get((r.get(did_col) or "").strip())
        if c is None:
            truth.append(None)
        else:
            if c not in cmap:
                cmap[c] = len(cmap)
            truth.append(cmap[c])
            matched += 1
    return truth, matched, None


def _truth_from_pairs(rows, trows, body, did_col):
    """Pairwise gold truth: connected components of duplicate pairs."""
    id1_col = body.get("truth_id_col") or ""
    id2_col = body.get("truth_id2_col") or ""
    if not (id1_col and id2_col):
        return None, 0, "Pick both id columns of the pair file."
    parent = {}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    data_ids = []
    for r in rows:
        did = (r.get(did_col) or "").strip()
        data_ids.append(did)
        if did and did not in parent:
            parent[did] = did
    mentioned = set()
    for r in trows:
        a = (r.get(id1_col) or "").strip()
        b = (r.get(id2_col) or "").strip()
        if a in parent and b in parent:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[rb] = ra
            mentioned.add(a)
            mentioned.add(b)
    cmap, truth, matched = {}, [], 0
    for did in data_ids:
        if did in mentioned:
            root = find(did)
            if root not in cmap:
                cmap[root] = len(cmap)
            truth.append(cmap[root])
            matched += 1
        else:
            truth.append(None)
    return truth, matched, None


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

            cols, rows = read_table(csv_text)
            if not cols:
                return self._send({"ok": False, "error": "No header row found in CSV."})
            if not rows:
                return self._send({"ok": False, "error": "CSV has no data rows."})
            if len(rows) > MAX_ROWS:
                return self._send(
                    {"ok": False, "error": f"Too many rows ({len(rows):,}). This demo runs up to {MAX_ROWS:,} rows — try a random sample (below), or add blocking to cut the pair count."}
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
            classify_method = cfg.get("classify_method") or "tc"
            cluster_method = cfg.get("cluster_method") or "same"
            try:
                hc_h = float(cfg.get("hc_h", 0.5))
            except (TypeError, ValueError):
                hc_h = 0.5
            try:
                hdbscan_min_pts = max(2, int(cfg.get("hdbscan_min_pts",
                                                    cfg.get("dbscan_min_pts", 2))))
            except (TypeError, ValueError):
                hdbscan_min_pts = 2

            # Gold truth: none | a column in the data | a separate truth file.
            truth_source = cfg.get("truth_source") or "none"
            truth_col = cfg.get("truth_col") or None
            if truth_source != "column" or truth_col not in cols:
                truth_col = None
            # Defensive: the truth column must never be a match field
            # (leaking the answer into the features).
            if truth_col and truth_col in fields:
                fields = {k: v for k, v in fields.items() if k != truth_col}
                if not fields:
                    return self._send(
                        {"ok": False, "error": "Select at least one match field (not the truth column)."}
                    )
            truth, n_truth_matched = None, 0
            if truth_source == "file":
                truth, n_truth_matched, terr = _truth_from_file(rows, body)
                if terr:
                    return self._send({"ok": False, "error": terr})

            res = run(
                rows,
                fields=fields,
                block_method=block_method,
                block_key=block_key,
                classify_method=classify_method,
                threshold=threshold,
                hc_h=hc_h,
                hdbscan_min_pts=hdbscan_min_pts,
                cluster_method=cluster_method,
                truth_col=truth_col,
                truth=truth,
                held_out=bool(cfg.get("held_out", False)),
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
                    "classify_method": classify_method,
                    "hc_h": hc_h,
                    "hdbscan_min_pts": hdbscan_min_pts,
                    "truth_source": truth_source,
                    "truth_col": truth_col,
                    "truth_filename": body.get("truth_filename") or "truth.csv",
                }
            )

            warnings = []
            if sampled:
                warnings.append(
                    f"Results are on a random sample of {len(rows)} records (seed {SAMPLE_SEED})."
                )
            warnings.extend(res.get("warnings", []))
            cluster_sizes = res.get("cluster_sizes", [])
            if cluster_sizes and res["n_records"] > 1:
                share = cluster_sizes[0] / res["n_records"]
                if share > 0.5:
                    warnings.append(
                        f"One cluster absorbed {share:.0%} of records — likely chaining "
                        "through a too-generic field (e.g. an id column) or too low a "
                        "threshold. Try raising the similarity threshold or dropping "
                        "id-like match fields."
                    )

            return self._send(
                {
                    "ok": True,
                    "n_records": res["n_records"],
                    "n_pairs": res["n_pairs"],
                    "n_links": res["n_links"],
                    "n_clusters": res["n_clusters"],
                    "ari": res.get("ari"),
                    "metrics": res.get("metrics"),
                    "cluster_sizes": res.get("cluster_sizes", []),
                    "columns": cols,
                    "display_rows": display,
                    "result_csv_b64": csv_b64,
                    "r_code": r_code,
                    "sampled": sampled,
                    "truth_source": truth_source,
                    "n_truth_matched": n_truth_matched,
                    "warnings": warnings,
                    "config_summary": {
                        "fields": fields,
                        "block_method": block_method,
                        "block_key": block_key,
                        "threshold": threshold,
                        "classify_method": classify_method,
                        "cluster_method": cluster_method,
                    },
                }
            )
        except ValueError as e:
            return self._send({"ok": False, "error": str(e)})
        except TimeoutError as e:
            return self._send({"ok": False, "error": str(e)})
        except Exception as e:  # never leak a stack trace to the client
            return self._send({"ok": False, "error": f"Engine error: {type(e).__name__}"})
