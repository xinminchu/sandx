# sandx.io — ERBOT website + ER Studio

Public site for the [ERBOT](https://github.com/xinminchu/erbot) R package:
entity resolution, forged honest.

- `/` — product home: pipeline, honest-evaluation story, classifiers
- `/studio` — **ER Studio**: upload a CSV, run a real entity-resolution
  pipeline (blocking → NA-aware similarity → clustering) on a serverless
  Python engine, download clusters, view the equivalent R code
- `/methods` — the nine stages, honest evaluation, 11 classifiers
- `/docs` — install, quickstart, function reference

## Engine

`engine/` is a pure-Python port of ERBOT's core stages
(stdlib + `rapidfuzz` + `networkx`), served by `api/run.py`
(a Vercel Python serverless function). Caps: 3,000 rows / 2 MB upload per run.

The R package remains the canonical engine; every Studio run shows the
equivalent `erbot` R code.

## Deploy

Vercel → import `xinminchu/sandx` → add domain `sandx.io`.
Python deps come from `requirements.txt`; the function timeout is set in
`vercel.json`.
