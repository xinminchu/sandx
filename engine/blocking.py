"""Blocking: generate candidate record pairs."""


def _key_str(rec, key):
    """Stripped key value, or None when missing/blank (never paired)."""
    v = rec.get(key)
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def block(df, method, key=None, prefix_len=3, window=20, max_pairs=2000000):
    """Return sorted [(i, j)] with i < j. methods: standard/prefix/sn/none."""
    n = len(df)
    if method == "none":
        count = n * (n - 1) // 2
        if count > max_pairs:
            raise ValueError(f"pair budget exceeded: {count} > {max_pairs}")
        return [(i, j) for i in range(n) for j in range(i + 1, n)]
    if method in ("standard", "prefix"):
        if key is None:
            raise ValueError("key is required for standard/prefix blocking")
        buckets = {}
        for i, rec in enumerate(df):
            ks = _key_str(rec, key)
            if ks is None:
                continue  # singleton: never paired
            b = ks if method == "standard" else ks[:prefix_len]
            buckets.setdefault(b, []).append(i)
        pairs = set()
        for idxs in buckets.values():
            for a in range(len(idxs)):
                for b_ in range(a + 1, len(idxs)):
                    pairs.add((idxs[a], idxs[b_]))
    elif method == "sn":
        if key is None:
            raise ValueError("key is required for sn blocking")
        order = sorted(
            range(n),
            key=lambda i: "" if df[i].get(key) is None else str(df[i].get(key)),
        )
        pairs = set()
        for pos, i in enumerate(order):
            for k in range(1, window + 1):
                if pos + k < n:
                    j = order[pos + k]
                    pairs.add((min(i, j), max(i, j)))
    else:
        raise ValueError(f"unknown blocking method: {method}")
    pairs = sorted(pairs)
    if len(pairs) > max_pairs:
        raise ValueError(f"pair budget exceeded: {len(pairs)} > {max_pairs}")
    return pairs
