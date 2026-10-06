"""Clustering: threshold connected components and Louvain."""


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
