"""Clustering: threshold connected components, Louvain, hierarchical
(average/Ward), PAM, Leiden, label propagation, and GCMER-style graph
coloring — the full unsupervised set of ERBOT's er_cluster()."""


def _compact(labels):
    """Map arbitrary labels to compact 0-based ids, preserving first-seen order."""
    mapping = {}
    out = []
    for lab in labels:
        if lab not in mapping:
            mapping[lab] = len(mapping)
        out.append(mapping[lab])
    return out


def threshold_cc(pairs, scores, threshold, n):
    """Union-find over edges with score >= threshold; singletons stay alone."""
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for (i, j), s in zip(pairs, scores):
        if s >= threshold:
            ri, rj = find(i), find(j)
            if ri != rj:
                parent[rj] = ri
    return _compact([find(i) for i in range(n)])


def louvain(pairs, scores, n):
    """Greedy-modularity communities on score-weighted edges; singletons alone."""
    return louvain_edges(
        [(i, j, s) for (i, j), s in zip(pairs, scores) if s > 0], n
    )


def threshold_cc_edges(edges, n):
    """Union-find over an edge list [(i, j)]; singletons stay alone."""
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i, j in edges:
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[rj] = ri
    return _compact([find(i) for i in range(n)])


def louvain_edges(edges, n):
    """Greedy-modularity communities over [(i, j, weight)] edges."""
    import networkx as nx
    from networkx.algorithms.community import greedy_modularity_communities

    g = nx.Graph()
    g.add_nodes_from(range(n))
    g.add_weighted_edges_from(edges)
    lab = [0] * n
    for cid, comm in enumerate(greedy_modularity_communities(g, weight="weight")):
        for i in comm:
            lab[i] = cid
    return _compact(lab)


def hierarchical(n, triples, h=0.5):
    """Average-linkage agglomerative clustering, cut at height h.

    Faithful to the advisor: hclust(d = 1 - similarity, method = "average")
    then cutree(h). Implemented with numpy + Lance-Williams updates and
    early stopping (no need to build the full dendrogram past the cut).
    Missing pairs have distance 1.0.
    """
    import numpy as np

    INF = float("inf")
    D = np.full((n, n), 1.0, dtype=np.float64)
    for i, j, s in triples:
        d = 1.0 - s
        if d < D[i, j]:
            D[i, j] = d
            D[j, i] = d
    np.fill_diagonal(D, INF)

    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    active = np.ones(n, dtype=bool)
    size = np.ones(n, dtype=np.float64)
    remaining = n
    while remaining > 1:
        flat = int(np.argmin(D))
        a, b = divmod(flat, n)
        if D[a, b] > h:
            break
        # merge b into a (average linkage / Lance-Williams)
        sa, sb = size[a], size[b]
        row = (sa * D[a] + sb * D[b]) / (sa + sb)
        D[a] = row
        D[:, a] = row
        D[a, a] = INF
        D[b, :] = INF
        D[:, b] = INF
        active[b] = False
        # union
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra
        size[a] = sa + sb
        remaining -= 1
    return _compact([find(i) for i in range(n)])


def hdbscan(n, triples, min_pts=3):
    """HDBSCAN over sparse pair similarities (pure Python + numpy).

    Faithful to the advisor (dbscan::hdbscan(dissimilarity, minPts)):
    core distances -> mutual-reachability MST (Prim) -> binary dendrogram
    -> condensed tree (min_cluster_size = min_pts) -> excess-of-mass
    cluster extraction. Noise points become singletons
    (advisor's noise_as_singletons), never one giant cluster.
    distance = 1 - score; missing pairs = 1.0.
    """
    import numpy as np

    D = np.full((n, n), 1.0, dtype=np.float64)
    for i, j, s in triples:
        d = 1.0 - s
        if d < D[i, j]:
            D[i, j] = d
            D[j, i] = d
    return _hdbscan_matrix(n, D, min_pts)


def _hdbscan_matrix(n, D, min_pts=3):
    """HDBSCAN from a dense n x n distance matrix (0 diagonal)."""
    import numpy as np

    if n < 2:
        return [0] * n
    m = max(2, min(int(min_pts), n))

    D = D.copy()
    np.fill_diagonal(D, 0.0)

    # core distance: min_pts-th nearest *other* point (excludes self),
    # matching the standard HDBSCAN definition
    m_core = max(1, min(int(min_pts), n - 1))
    D_noself = D.copy()
    np.fill_diagonal(D_noself, np.inf)
    core = np.partition(D_noself, m_core - 1, axis=1)[:, m_core - 1]
    del D_noself

    # Prim's MST on mutual-reachability distance
    INF = float("inf")
    in_mst = np.zeros(n, dtype=bool)
    best = np.full(n, INF)          # min mreach distance to the MST
    parent = np.zeros(n, dtype=np.int64)
    best = np.maximum(np.maximum(core[0], core), D[0])
    best[0] = INF
    in_mst[0] = True
    mst = []
    for _ in range(n - 1):
        v = int(np.argmin(np.where(in_mst, INF, best)))
        w = float(best[v])
        if not np.isfinite(w):
            break
        mst.append((w, int(parent[v]), v))
        in_mst[v] = True
        best[v] = INF
        cand = np.maximum(np.maximum(core[v], core), D[v])
        upd = (~in_mst) & (cand < best)
        best[upd] = cand[upd]
        parent[upd] = v
    mst.sort(key=lambda e: e[0])

    # union-find -> binary dendrogram
    uf = list(range(n))
    sz = [1] * n
    comp_node = list(range(n))
    children = {}
    birth_w = {}
    comp_size = {i: 1 for i in range(n)}
    nxt = n

    def find(x):
        while uf[x] != x:
            uf[x] = uf[uf[x]]
            x = uf[x]
        return x

    for w, u, v in mst:
        ru, rv = find(u), find(v)
        if ru == rv:
            continue
        if sz[ru] < sz[rv]:
            ru, rv = rv, ru
        uf[rv] = ru
        sz[ru] += sz[rv]
        node = nxt
        nxt += 1
        children[node] = (comp_node[ru], comp_node[rv])
        birth_w[node] = w
        comp_size[node] = sz[ru]
        comp_node[ru] = node
    root = comp_node[find(0)]

    def lam(w):
        return 1.0 / w if w > 1e-9 else 1e9

    lam_max = lam(min((w for w, _, _ in mst), default=1.0))

    # Euler tour for O(1) subtree point ranges
    tin, tout = {}, {}
    euler = np.zeros(n, dtype=np.int64)
    timer = 0
    stack = [(root, False)]
    while stack:
        node, done = stack.pop()
        if node < n:
            tin[node] = timer
            tout[node] = timer + 1
            euler[timer] = node
            timer += 1
        elif not done:
            stack.append((node, True))
            l, r = children[node]
            stack.append((r, False))
            stack.append((l, False))
        else:
            l, r = children[node]
            tin[node] = tin[l]
            tout[node] = tout[r]

    # Condense: fall-out lambdas + condensed cluster tree
    fout = np.full(n, np.inf)
    cl_node, cl_birth, cl_split, cl_kids = [], [], [], []

    def new_cluster(node, birth):
        cid = len(cl_node)
        cl_node.append(node)
        cl_birth.append(birth)
        cl_split.append(np.inf)
        cl_kids.append([])
        return cid

    stack = [(root, new_cluster(root, 0.0))]
    while stack:
        X, cid = stack.pop()
        if X not in children:
            continue
        l, r = children[X]
        lam_s = lam(birth_w[X])
        sl, sr = comp_size[l], comp_size[r]
        small_l, small_r = sl < m, sr < m
        if small_l and small_r:
            # cluster ends here; remaining points fall out at this level
            fout[euler[tin[X]:tout[X]]] = lam_s
            continue
        if small_l or small_r:
            small = l if small_l else r
            big = r if small_l else l
            fout[euler[tin[small]:tout[small]]] = lam_s
            stack.append((big, cid))
        else:
            cl_split[cid] = lam_s
            for side in (l, r):
                nc = new_cluster(side, lam_s)
                cl_kids[cid].append(nc)
                stack.append((side, nc))

    # Stability (excess of mass); points that never fall out persist to lam_max
    ncl = len(cl_node)
    stability = np.zeros(ncl)
    for cid in range(ncl):
        X = cl_node[cid]
        b = cl_birth[cid]
        end = cl_split[cid] if np.isfinite(cl_split[cid]) else lam_max
        pts = euler[tin[X]:tout[X]]
        f = fout[pts]
        mask = f >= b
        if np.any(mask):
            stability[cid] = float(np.sum(np.minimum(f[mask], end) - b))

    # Bottom-up extraction: parent wins iff its stability beats its children.
    # The root (cid 0, "everything is one cluster") is never selected.
    selected = [False] * ncl
    best_stab = stability.copy()
    for cid in range(ncl - 1, 0, -1):  # children always have larger ids
        kids = cl_kids[cid]
        if not kids:
            selected[cid] = True
        elif stability[cid] > sum(best_stab[k] for k in kids):
            selected[cid] = True
            stack = list(kids)
            while stack:
                d = stack.pop()
                selected[d] = False
                stack.extend(cl_kids[d])
        else:
            best_stab[cid] = sum(best_stab[k] for k in kids)

    # Final labels; noise -> singletons.
    # A point belongs to a selected cluster iff it is in its subtree and did
    # not fall out before the cluster was born.
    labels = [-1] * n
    for cid in range(ncl):
        if not selected[cid]:
            continue
        X = cl_node[cid]
        b = cl_birth[cid]
        pts = euler[tin[X]:tout[X]]
        f = fout[pts]
        for p, fp in zip(pts.tolist(), f.tolist()):
            if fp >= b and labels[p] == -1:
                labels[p] = cid
    next_id = ncl
    for i in range(n):
        if labels[i] == -1:
            labels[i] = next_id
            next_id += 1
    return _compact(labels)


# ── Dense-distance helpers (hclust / PAM) ────────────────────────────────────

def _dense_dist(n, triples):
    """Dense n x n distance matrix from (i, j, score) triples.

    distance = 1 - score; missing pairs = 1.0; diagonal 0.
    """
    import numpy as np

    D = np.full((n, n), 1.0, dtype=np.float64)
    for i, j, s in triples:
        d = 1.0 - s
        if d < D[i, j]:
            D[i, j] = d
            D[j, i] = d
    np.fill_diagonal(D, 0.0)
    return D


def _silhouette_avg(D, labels):
    """Mean silhouette width over a dense distance matrix (numpy)."""
    import numpy as np

    labels = np.asarray(labels)
    uniq, inv = np.unique(labels, return_inverse=True)
    K = len(uniq)
    n = len(labels)
    if K < 2 or K >= n:
        return float("nan")
    onehot = np.zeros((n, K))
    onehot[np.arange(n), inv] = 1.0
    counts = onehot.sum(axis=0)
    sumd = D @ onehot
    own = counts[inv]
    a = np.where(own > 1, sumd[np.arange(n), inv] / np.maximum(own - 1, 1), 0.0)
    with np.errstate(divide="ignore", invalid="ignore"):
        meand = sumd / np.maximum(counts, 1)[None, :]
    meand[np.arange(n), inv] = np.inf
    b = meand.min(axis=1)
    denom = np.maximum(a, b)
    s = np.where(denom > 0, (b - a) / denom, 0.0)
    s = np.where(own > 1, s, 0.0)  # singletons contribute 0 by convention
    return float(s.mean())


def _agglomerate(D, method="average"):
    """Agglomerative clustering on a dense distance matrix.

    Records the merge sequence [(root_a, root_b, dist), ...] so one run
    can be cut at any k. method 'average': average linkage on D;
    'ward': Ward.D2 — Lance-Williams update on squared distances
    (mirrors stats::hclust(method = "ward.D2")).
    """
    import numpy as np

    n = D.shape[0]
    W = (D * D) if method == "ward" else D.copy()
    np.fill_diagonal(W, np.inf)
    size = np.ones(n)
    alive = np.ones(n, dtype=bool)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    merges = []
    remaining = n
    while remaining > 1:
        idx = np.where(alive)[0]
        sub = W[np.ix_(idx, idx)]
        f = int(np.argmin(sub))
        ai, bi = divmod(f, len(idx))
        a, b = int(idx[ai]), int(idx[bi])
        dab = float(W[a, b])
        sa, sb = size[a], size[b]
        if method == "ward":
            nk = size
            row = ((sa + nk) * W[a] + (sb + nk) * W[b] - nk * dab) / (sa + sb + nk)
        else:
            row = (sa * W[a] + sb * W[b]) / (sa + sb)
        row[~alive] = np.inf
        row[b] = np.inf
        W[a] = row
        W[:, a] = row
        W[a, a] = np.inf
        W[b, :] = np.inf
        W[:, b] = np.inf
        alive[b] = False
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra
            merges.append((ra, rb, dab))
        size[a] = sa + sb
        remaining -= 1
    return merges


def _cut_k(merges, n, k):
    """Cut a merge sequence at k clusters."""
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for t in range(min(max(n - k, 0), len(merges))):
        ra, rb = find(merges[t][0]), find(merges[t][1])
        if ra != rb:
            parent[rb] = ra
    return _compact([find(i) for i in range(n)])


def _tune_k_agnes(D, method):
    """Pick k by mean silhouette; one agglomeration, cut at each grid k."""
    n = D.shape[0]
    grid = [k for k in (2, 3, 5, 8, 12) if k < n]
    if not grid:
        return 1
    merges = _agglomerate(D, method)
    best_k, best_s = grid[0], float("-inf")
    for k in grid:
        s = _silhouette_avg(D, _cut_k(merges, n, k))
        if s == s and s > best_s:
            best_s, best_k = s, k
    return best_k


def hclust_avg(n, triples, k=None):
    """Average-linkage hierarchical clustering on 1 - score.

    Mirrors er_cluster(method = "hclust_avg"): hclust(d, "average") with k
    tuned by silhouette when k is None.
    """
    if n < 2:
        return [0] * n
    D = _dense_dist(n, triples)
    if k is None:
        k = _tune_k_agnes(D, "average")
    k = max(1, min(int(k), n))
    if k == 1:
        return [0] * n
    return _cut_k(_agglomerate(D, "average"), n, k)


def hclust_ward(n, triples, k=None):
    """Ward.D2 hierarchical clustering on 1 - score.

    Mirrors er_cluster(method = "hclust_ward"): hclust(dist(X), "ward.D2")
    with k tuned by silhouette when k is None.
    """
    if n < 2:
        return [0] * n
    D = _dense_dist(n, triples)
    if k is None:
        k = _tune_k_agnes(D, "ward")
    k = max(1, min(int(k), n))
    if k == 1:
        return [0] * n
    return _cut_k(_agglomerate(D, "ward"), n, k)


# ── PAM ──────────────────────────────────────────────────────────────────────

def _pam_run(D, k, rng, max_iter=100):
    """PAM (BUILD + SWAP) on a dense distance matrix; returns compact labels."""
    import numpy as np

    n = D.shape[0]
    if k >= n:
        return list(range(n))
    # BUILD: first medoid = min total distance, then max gain
    medoids = [int(np.argmin(D.sum(axis=1)))]
    d_nearest = D[:, medoids[0]].copy()
    for _ in range(1, k):
        gain = np.maximum(d_nearest[:, None] - D, 0.0).sum(axis=0)
        gain[medoids] = -1.0
        nxt = int(np.argmax(gain))
        medoids.append(nxt)
        d_nearest = np.minimum(d_nearest, D[:, nxt])
    medoids = np.array(medoids)

    def _assign(meds):
        d = D[:, meds]
        a1 = np.argmin(d, axis=1)
        d2 = d.copy()
        d2[np.arange(n), a1] = np.inf
        return a1, d[np.arange(n), a1], d2.min(axis=1)

    a1, d1, d2 = _assign(medoids)
    arange_n = np.arange(n)
    for _ in range(max_iter):
        med_set = set(medoids.tolist())
        non_med = np.array([i for i in range(n) if i not in med_set])
        if len(non_med) == 0:
            break
        best_delta, best_swap = 0.0, None
        cand = D[np.ix_(arange_n, non_med)]
        for p in range(k):
            base = np.where(a1 == p, d2, d1)
            delta = (np.minimum(base[:, None], cand) - d1[:, None]).sum(axis=0)
            q = int(np.argmin(delta))
            if delta[q] < best_delta - 1e-12:
                best_delta, best_swap = float(delta[q]), (p, int(non_med[q]))
        if best_swap is None:
            break
        p, o = best_swap
        medoids[p] = o
        a1, d1, d2 = _assign(medoids)
    return _compact(a1.tolist())


def pam(n, triples, k=None, seed=42):
    """Partitioning Around Medoids on 1 - score.

    Mirrors er_cluster(method = "pam"): cluster::pam with k tuned by
    silhouette when k is None.
    """
    import numpy as np

    if n < 2:
        return [0] * n
    D = _dense_dist(n, triples)
    rng = np.random.default_rng(seed)
    if k is None:
        grid = [kk for kk in (2, 3, 5, 8) if kk < n]
        best_k, best_s = grid[0], float("-inf")
        for kk in grid:
            s = _silhouette_avg(D, _pam_run(D, kk, rng))
            if s == s and s > best_s:
                best_s, best_k = s, kk
        k = best_k
    k = max(1, min(int(k), n))
    return _pam_run(D, k, rng)


# ── Leiden ───────────────────────────────────────────────────────────────────

def _same_partition(a, b):
    """True if two labelings define the same partition (up to renaming)."""
    if len(a) != len(b):
        return False
    ra, rb = {}, {}
    ca, cb = [], []
    for x in a:
        if x not in ra:
            ra[x] = len(ra)
        ca.append(ra[x])
    for x in b:
        if x not in rb:
            rb[x] = len(rb)
        cb.append(rb[x])
    return ca == cb


def leiden(pairs, scores, n, resolution=1.0, seed=42):
    """Leiden community detection on the score-weighted graph (pure Python).

    Mirrors igraph::cluster_leiden: iterated local node moving (modularity
    gain) -> refinement into well-connected sub-communities -> aggregation,
    until the partition stabilises.
    """
    import random

    rng = random.Random(seed)
    adj = [dict() for _ in range(n)]
    for (i, j), s in zip(pairs, scores):
        if s > 0 and i != j:
            adj[i][j] = adj[i].get(j, 0.0) + s
            adj[j][i] = adj[j].get(i, 0.0) + s

    def core(adjL):
        nn = len(adjL)
        degL = [sum(d.values()) for d in adjL]
        m2 = sum(degL)
        if m2 <= 0 or nn <= 1:
            return list(range(nn))
        gamma = resolution

        def gain(kv, kin_c, kin_cur, sum_c, sum_d):
            return (2.0 * (kin_c - kin_cur) / m2
                    - gamma * kv * (sum_c - sum_d) * 2.0 / (m2 * m2))

        def local_moving(nodes, comm, cdeg, next_id):
            changed = True
            while changed:
                changed = False
                order = list(nodes)
                rng.shuffle(order)
                for v in order:
                    if degL[v] <= 0:
                        continue
                    cur = comm[v]
                    w_to = {}
                    for u, w in adjL[v].items():
                        c = comm[u]
                        w_to[c] = w_to.get(c, 0.0) + w
                    cdeg[cur] = cdeg.get(cur, 0.0) - degL[v]
                    kin_cur = w_to.get(cur, 0.0)
                    best_c, best_gain = cur, 0.0
                    g1 = gain(degL[v], 0.0, kin_cur, 0.0, cdeg[cur])
                    if g1 > best_gain + 1e-12:
                        best_gain, best_c = g1, -1
                    for c, kin in w_to.items():
                        if c == cur:
                            continue
                        g = gain(degL[v], kin, kin_cur, cdeg.get(c, 0.0),
                                 cdeg[cur])
                        if g > best_gain + 1e-12:
                            best_gain, best_c = g, c
                    if best_c == -1:
                        best_c = next_id[0]
                        next_id[0] += 1
                    comm[v] = best_c
                    cdeg[best_c] = cdeg.get(best_c, 0.0) + degL[v]
                    if best_c != cur:
                        changed = True
            return comm

        def refine(comm):
            buckets = {}
            for v, c in enumerate(comm):
                buckets.setdefault(c, []).append(v)
            new_comm = list(comm)
            fresh = [max(buckets) + 1 if buckets else 0]
            for members in buckets.values():
                if len(members) <= 1:
                    continue
                allowed = set(members)
                sub = {v: v for v in members}
                sdeg = {v: degL[v] for v in members}
                changed = True
                while changed:
                    changed = False
                    order = list(members)
                    rng.shuffle(order)
                    for v in order:
                        if degL[v] <= 0:
                            continue
                        cur = sub[v]
                        w_to = {}
                        for u, w in adjL[v].items():
                            if u in allowed:
                                sc = sub[u]
                                w_to[sc] = w_to.get(sc, 0.0) + w
                        sdeg[cur] -= degL[v]
                        kin_cur = w_to.get(cur, 0.0)
                        best_sc, best_gain = cur, 0.0
                        for sc, kin in w_to.items():
                            if sc == cur:
                                continue
                            g = gain(degL[v], kin, kin_cur, sdeg.get(sc, 0.0),
                                     sdeg[cur])
                            if g > best_gain + 1e-12:
                                best_gain, best_sc = g, sc
                        sub[v] = best_sc
                        sdeg[best_sc] = sdeg.get(best_sc, 0.0) + degL[v]
                        if best_sc != cur:
                            changed = True
                remap = {}
                for v in members:
                    s = sub[v]
                    if s not in remap:
                        remap[s] = fresh[0]
                        fresh[0] += 1
                    new_comm[v] = remap[s]
            return new_comm

        comm = list(range(nn))
        next_id = [nn]
        for _ in range(50):  # outer iterations; modularity is bounded
            cdeg = {}
            for v, c in enumerate(comm):
                cdeg[c] = cdeg.get(c, 0.0) + degL[v]
            comm = local_moving(range(nn), comm, cdeg, next_id)
            refined = refine(comm)
            if _same_partition(refined, comm):
                break
            ids = sorted(set(refined))
            idx_of = {c: k for k, c in enumerate(ids)}
            agg = [dict() for _ in range(len(ids))]
            for v in range(nn):
                cv = idx_of[refined[v]]
                for u, w in adjL[v].items():
                    cu = idx_of[refined[u]]
                    if cu != cv:
                        agg[cv][cu] = agg[cv].get(cu, 0.0) + w
            sub = core(agg)
            lifted = [sub[idx_of[refined[v]]] for v in range(nn)]
            if _same_partition(lifted, comm):
                comm = lifted
                break
            comm = lifted
        return _compact(comm)

    return core(adj)


# ── Label propagation ────────────────────────────────────────────────────────

def label_prop(pairs, scores, n, seed=42, max_iter=100):
    """Weighted asynchronous label propagation (pure Python).

    Mirrors igraph::cluster_label_prop: each node adopts the label with the
    greatest incident weight; ties keep the current label.
    """
    import random

    rng = random.Random(seed)
    adj = [dict() for _ in range(n)]
    for (i, j), s in zip(pairs, scores):
        if s > 0 and i != j:
            adj[i][j] = adj[i].get(j, 0.0) + s
            adj[j][i] = adj[j].get(i, 0.0) + s
    labels = list(range(n))
    order = list(range(n))
    for _ in range(max_iter):
        rng.shuffle(order)
        changed = False
        for v in order:
            if not adj[v]:
                continue
            wsum = {}
            for u, w in adj[v].items():
                lab = labels[u]
                wsum[lab] = wsum.get(lab, 0.0) + w
            best, bestw = labels[v], wsum.get(labels[v], 0.0)
            for lab, w in wsum.items():
                if w > bestw:
                    best, bestw = lab, w
            if best != labels[v]:
                labels[v] = best
                changed = True
        if not changed:
            break
    return _compact(labels)


# ── Graph coloring (GCMER-style) ─────────────────────────────────────────────

def gc(pairs, scores, n, threshold=0.5):
    """GCMER-style entity resolution via RLF clique partition (pure Python).

    Graph G has an edge (i, j) iff score >= threshold. Entities are cliques
    partitioning G (minimum clique partition = coloring of the complement),
    extracted with recursive-largest-first. Mirrors
    GCMER::resolve_entities(D, thresholds, method = "rlf"): the clique
    structure guarantees records within an entity are pairwise similar.
    """
    adj = [set() for _ in range(n)]
    for (i, j), s in zip(pairs, scores):
        if s >= threshold and i != j:
            adj[i].add(j)
            adj[j].add(i)
    uncolored = set(range(n))
    labels = [-1] * n
    cid = 0
    while uncolored:
        v = max(uncolored, key=lambda x: len(adj[x] & uncolored))
        clique = {v}
        cand = set(adj[v] & uncolored)
        cand.discard(v)
        while cand:
            u = max(cand, key=lambda x: len(adj[x] & cand))
            clique.add(u)
            cand &= adj[u]
        for x in clique:
            labels[x] = cid
            uncolored.discard(x)
        cid += 1
    return _compact(labels)
