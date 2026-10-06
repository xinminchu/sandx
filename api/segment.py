"""Vercel serverless: ScholComp rule-based paper segmenter.

POST JSON: {"mode": "url"|"text", "url": ..., "text": ..., "slug": ...}
Returns: {"ok": true, "doc": <JSON-LD>} or {"ok": false, "error": ...}

The vendored engine is scholcomp's segmenter/segment.py (pure stdlib).
"""
import json
import os
import re
import sys
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from seg.segment import (  # noqa: E402
    fetch,
    extract_ar5iv_sections,
    extract_text_sections,
    build_graph,
)

ALLOW_HOSTS = {"arxiv.org", "ar5iv.org", "export.arxiv.org"}
MAX_TEXT = 500_000
CORS_ORIGIN = "https://xinminchu.github.io"


def norm_arxiv_url(u: str) -> str:
    u = (u or "").strip()
    if not u:
        raise ValueError("Empty URL.")
    if re.fullmatch(r"\d{4}\.\d{4,5}(v\d+)?", u):
        return f"https://ar5iv.org/html/{u}"
    if not u.startswith(("http://", "https://")):
        u = "https://" + u
    p = urlparse(u)
    host = (p.hostname or "").lower()
    if host not in ALLOW_HOSTS:
        raise ValueError("Only arxiv.org / ar5iv.org URLs are accepted.")
    m = re.search(r"/(abs|html|pdf)/(\d{4}\.\d{4,5})(v\d+)?", p.path)
    if m:
        return f"https://ar5iv.org/html/{m.group(2)}"
    if host == "ar5iv.org" and p.path.startswith("/html/"):
        return "https://ar5iv.org" + p.path
    raise ValueError("Could not find an arXiv paper in that URL.")


def clean_slug(s: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9_-]", "-", (s or "").strip().lower())[:60]
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "upload"


class handler(BaseHTTPRequestHandler):
    def _send(self, payload, code=200):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", CORS_ORIGIN)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", CORS_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            if length > 1_000_000:
                return self._send({"ok": False, "error": "Request too large."})
            body = json.loads(self.rfile.read(length) or b"{}")
            mode = body.get("mode", "url")
            slug = clean_slug(body.get("slug") or "")

            if mode == "url":
                target = norm_arxiv_url(body.get("url", ""))
                if not slug or slug == "upload":
                    m = re.search(r"/html/(\d{4}\.\d{4,5})", target)
                    slug = "arxiv-" + (m.group(1) if m else "paper")
                raw = fetch(target)
                title, sections = extract_ar5iv_sections(raw)
            elif mode == "text":
                text = body.get("text", "")
                if not text or not text.strip():
                    return self._send({"ok": False, "error": "Empty text."})
                if len(text) > MAX_TEXT:
                    return self._send({"ok": False, "error": "Text too long (500 KB cap)."})
                title, sections = extract_text_sections(text)
                if not slug or slug == "upload":
                    slug = "pasted-text"
            else:
                return self._send({"ok": False, "error": "Unknown mode."})

            if not sections:
                return self._send({"ok": False, "error": "No sections found in the paper."})
            doc = build_graph(title or "Untitled", slug, sections)
            n_comp = len(doc["@graph"]) - 1
            return self._send({"ok": True, "doc": doc, "n_components": n_comp})
        except ValueError as e:
            return self._send({"ok": False, "error": str(e)})
        except Exception:
            return self._send({"ok": False, "error": "Segmentation failed."})
