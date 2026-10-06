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
    import networkx as nx
    from networkx.algorithms.community import greedy_modularity_communities

    g = nx.Graph()
    g.add_nodes_from(range(n))
    for (i, j), s in zip(pairs, scores):
        if s > 0:
            g.add_edge(i, j, weight=s)
    lab = [0] * n
    for cid, comm in enumerate(greedy_modularity_communities(g, weight="weight")):
        for i in comm:
            lab[i] = cid
    return _compact(lab)
