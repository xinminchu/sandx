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


def dbscan(n, triples, eps=0.3, min_pts=3):
    """Classic DBSCAN over sparse pair similarities.

    triples: [(i, j, score)]. distance = 1 - score; pairs not listed have
    distance 1.0 (never neighbors when eps < 1). Noise points become
    singletons (advisor's noise_as_singletons), never one giant cluster.
    """
    # adjacency: neighbors(i) = {j : score(i,j) >= 1 - eps}
    cutoff = 1.0 - eps
    adj = [set() for _ in range(n)]
    for i, j, s in triples:
        if s >= cutoff:
            adj[i].add(j)
            adj[j].add(i)
    for i in range(n):
        adj[i].add(i)

    labels = [-1] * n
    cluster_id = 0
    for i in range(n):
        if labels[i] != -1:
            continue
        neighbors = adj[i]
        if len(neighbors) < min_pts:
            continue  # noise for now; singletoned below
        # start a new cluster; expand
        labels[i] = cluster_id
        seeds = set(neighbors)
        seeds.discard(i)
        while seeds:
            j = seeds.pop()
            if labels[j] == -1:
                labels[j] = cluster_id
                if len(adj[j]) >= min_pts:
                    seeds |= adj[j]
            # already-labeled points keep their (earlier) cluster
        cluster_id += 1

    # noise -> singletons (each its own cluster), like the advisor's code
    next_id = cluster_id
    for i in range(n):
        if labels[i] == -1:
            labels[i] = next_id
            next_id += 1
    return _compact(labels)


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
