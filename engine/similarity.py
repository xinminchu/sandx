"""NA-aware per-field pair similarities (rapidfuzz-backed)."""
import math

from rapidfuzz.distance import JaroWinkler, Levenshtein


def _norm01(x):
    """rapidfuzz normalized_similarity scale guard: 0-100 -> 0-1, 0-1 kept."""
    x = float(x)
    return x / 100.0 if x > 1.0 else x


def _clean(v):
    """None / blank -> None, else the stripped lower-cased string.

    Record linkage is case-insensitive: "Blue Fin Sushi" and
    "blue fin sushi" are the same entity.
    """
    if v is None:
        return None
    s = str(v).strip().lower()
    return s if s else None


def sim_value(a, b, method):
    """Similarity in [0, 1]; float('nan') when either side is missing/blank."""
    sa, sb = _clean(a), _clean(b)
    if sa is None or sb is None:
        return float("nan")
    return sim_cleaned(sa, sb, method)


def sim_cleaned(sa, sb, method):
    """Similarity in [0, 1] for already-cleaned (non-None) strings.

    The hot path pre-cleans each column once, so per-pair work skips
    the cleaning step.
    """
    if method == "jw":
        return _norm01(JaroWinkler.normalized_similarity(sa, sb))
    if method == "lv":
        return _norm01(Levenshtein.normalized_similarity(sa, sb))
    if method == "jaccard":
        ta, tb = set(sa.lower().split()), set(sb.lower().split())
        u = len(ta | tb)
        return len(ta & tb) / u if u else 0.0
    raise ValueError(f"unknown similarity method: {method}")


def pair_sims(df, pairs, fields):
    """One {col: score} dict per pair; fields maps column -> method."""
    out = []
    for i, j in pairs:
        out.append(
            {col: sim_value(df[i].get(col), df[j].get(col), m)
             for col, m in fields.items()}
        )
    return out


def combine(sim_dicts, weights=None):
    """Weighted nan-mean per pair; all-nan -> 0.0; equal weights if None."""
    scores = []
    for d in sim_dicts:
        vals = [(k, v) for k, v in d.items() if not math.isnan(v)]
        if not vals:
            scores.append(0.0)
            continue
        if weights is None:
            scores.append(sum(v for _, v in vals) / len(vals))
        else:
            w = [weights.get(k, 1.0) for k, _ in vals]
            tot = sum(w)
            scores.append(
                sum(v * wi for (_, v), wi in zip(vals, w)) / tot if tot else 0.0
            )
    return scores
