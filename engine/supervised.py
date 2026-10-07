"""Supervised pair classifiers, pure Python (no sklearn/scipy).

Mirrors the advisor's classifier list (er_modular.R) and ERBOT's
er_supervised_classifiers(): logistic, lda, qda, knn, fellegi_sunter.
Each classifier trains on per-field pair similarities with pair labels
derived from gold truth, then predicts match probabilities for all pairs.

 heavier members of the advisor's list (rf, xgboost, nnet, svm) need
 compiled libraries and are out of scope for the serverless demo.
"""

import math


def _mat_inv(a):
    """Gauss-Jordan inverse for small dense matrices."""
    n = len(a)
    m = [row[:] + [1.0 if i == j else 0.0 for j in range(n)]
         for i, row in enumerate(a)]
    for col in range(n):
        piv = max(range(col, n), key=lambda r: abs(m[r][col]))
        if abs(m[piv][col]) < 1e-12:
            raise ValueError("singular covariance")
        m[col], m[piv] = m[piv], m[col]
        pv = m[col][col]
        m[col] = [v / pv for v in m[col]]
        for r in range(n):
            if r != col and m[r][col] != 0.0:
                f = m[r][col]
                m[r] = [rv - f * cv for rv, cv in zip(m[r], m[col])]
    return [row[n:] for row in m]


def _sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


class Logistic:
    """L2-regularized logistic regression via IRLS."""

    def __init__(self, l2=1.0, max_iter=50):
        self.l2 = l2
        self.max_iter = max_iter

    def fit(self, X, y):
        k = len(X[0])
        w = [0.0] * (k + 1)  # last = intercept
        n = len(X)
        for _ in range(self.max_iter):
            grad = [0.0] * (k + 1)
            hess = [[0.0] * (k + 1) for _ in range(k + 1)]
            for xi, yi in zip(X, y):
                z = w[k] + sum(wi * xij for wi, xij in zip(w, xi))
                p = _sigmoid(z)
                r = p * (1.0 - p)
                e = yi - p
                for j in range(k):
                    grad[j] += e * xi[j]
                    for l in range(k):
                        hess[j][l] += r * xi[j] * xi[l]
                    hess[j][k] += r * xi[j]
                    hess[k][j] += r * xi[j]
                grad[k] += e
                hess[k][k] += r
            for j in range(k):  # L2 (not on intercept)
                grad[j] -= self.l2 * w[j]
                hess[j][j] += self.l2
            try:
                step = _mat_inv(hess)
            except ValueError:
                break
            dw = [sum(step[j][l] * grad[l] for l in range(k + 1))
                  for j in range(k + 1)]
            if max(abs(v) for v in dw) < 1e-6:
                w = [wj + dwj for wj, dwj in zip(w, dw)]
                break
            w = [wj + dwj for wj, dwj in zip(w, dw)]
        self.w_ = w
        return self

    def predict_proba(self, X):
        k = len(self.w_) - 1
        return [_sigmoid(self.w_[k] + sum(wi * xij for wi, xij in zip(self.w_, xi)))
                for xi in X]


class _GaussianBase:
    def _fit_stats(self, X, y):
        self.classes_ = sorted(set(y))
        self.means_ = {}
        self.priors_ = {}
        for c in self.classes_:
            rows = [xi for xi, yi in zip(X, y) if yi == c]
            self.priors_[c] = len(rows) / len(X)
            self.means_[c] = [sum(col) / len(rows) for col in zip(*rows)]
        return self

    def _logpdf(self, x, mean, inv, logdet):
        d = [xi - mi for xi, mi in zip(x, mean)]
        q = sum(di * sum(inv[i][j] * dj for j, dj in enumerate(d))
                for i, di in enumerate(d))
        return -0.5 * (logdet + q)

    def _logdet(self, cov):
        # log|.| via the inverse we already compute: use Cholesky-free
        # product of pivots from a quick LU
        n = len(cov)
        m = [row[:] for row in cov]
        logd = 0.0
        for col in range(n):
            piv = max(range(col, n), key=lambda r: abs(m[r][col]))
            if abs(m[piv][col]) < 1e-12:
                return 0.0
            if piv != col:
                m[col], m[piv] = m[piv], m[col]
            pv = m[col][col]
            logd += math.log(abs(pv))
            for r in range(col + 1, n):
                f = m[r][col] / pv
                for c2 in range(col, n):
                    m[r][c2] -= f * m[col][c2]
        return logd


class LDA(_GaussianBase):
    """Linear discriminant analysis (pooled covariance)."""

    def fit(self, X, y):
        self._fit_stats(X, y)
        k = len(X[0])
        n = len(X)
        pooled = [[0.0] * k for _ in range(k)]
        for c in self.classes_:
            rows = [xi for xi, yi in zip(X, y) if yi == c]
            mu = self.means_[c]
            for xi in rows:
                d = [xij - muj for xij, muj in zip(xi, mu)]
                for i in range(k):
                    for j in range(k):
                        pooled[i][j] += d[i] * d[j]
        dof = max(n - len(self.classes_), 1)
        pooled = [[v / dof + (1e-6 if i == j else 0.0)
                   for j, v in enumerate(row)] for i, row in enumerate(pooled)]
        self.inv_ = _mat_inv(pooled)
        self.logdet_ = self._logdet(pooled)
        return self

    def predict_proba(self, X):
        out = []
        for x in X:
            scores = {c: math.log(self.priors_[c]) + self._logpdf(x, self.means_[c],
                                                                 self.inv_, self.logdet_)
                      for c in self.classes_}
            if len(scores) == 2:
                c0, c1 = self.classes_
                out.append(_sigmoid(scores[c1] - scores[c0]))
            else:
                best = max(scores, key=scores.get)
                out.append(1.0 if best == 1 else 0.0)
        return out


class QDA(_GaussianBase):
    """Quadratic discriminant analysis (per-class covariance)."""

    def fit(self, X, y):
        self._fit_stats(X, y)
        k = len(X[0])
        self.inv_ = {}
        self.logdet_ = {}
        for c in self.classes_:
            rows = [xi for xi, yi in zip(X, y) if yi == c]
            mu = self.means_[c]
            cov = [[0.0] * k for _ in range(k)]
            for xi in rows:
                d = [xij - muj for xij, muj in zip(xi, mu)]
                for i in range(k):
                    for j in range(k):
                        cov[i][j] += d[i] * d[j]
            dof = max(len(rows) - 1, 1)
            cov = [[v / dof + (1e-6 if i == j else 0.0)
                    for j, v in enumerate(row)] for i, row in enumerate(cov)]
            self.inv_[c] = _mat_inv(cov)
            self.logdet_[c] = self._logdet(cov)
        return self

    def predict_proba(self, X):
        out = []
        for x in X:
            scores = {c: math.log(self.priors_[c]) + self._logpdf(x, self.means_[c],
                                                                 self.inv_[c],
                                                                 self.logdet_[c])
                      for c in self.classes_}
            if len(scores) == 2:
                c0, c1 = self.classes_
                out.append(_sigmoid(scores[c1] - scores[c0]))
            else:
                best = max(scores, key=scores.get)
                out.append(1.0 if best == 1 else 0.0)
        return out


class KNN:
    """k-nearest neighbors classifier (k=5); proba = neighbor match rate."""

    #: max reference points; beyond this we stratified-subsample (k-NN in
    #: low-dim feature space needs coverage, not all 67k pairs)
    MAX_REF = 2000

    def __init__(self, k=5):
        self.k = k

    def fit(self, X, y):
        if len(X) > self.MAX_REF:
            import random
            idx1 = [i for i, yi in enumerate(y) if yi == 1]
            idx0 = [i for i, yi in enumerate(y) if yi == 0]
            n1 = max(1, int(self.MAX_REF * len(idx1) / len(X)))
            n0 = self.MAX_REF - n1
            rng = random.Random(42)
            keep = rng.sample(idx1, min(n1, len(idx1))) + rng.sample(
                idx0, min(n0, len(idx0))
            )
            X = [X[i] for i in keep]
            y = [y[i] for i in keep]
        self.X_ = X
        self.y_ = y
        self.n_ref_ = len(X)
        return self

    def predict_proba(self, X):
        import numpy as np
        Xa = np.asarray(X, dtype=np.float64)
        Xtr = np.asarray(self.X_, dtype=np.float64)
        ytr = np.asarray(self.y_, dtype=np.float64)
        n_tr = len(Xtr)
        if n_tr == 0 or len(Xa) == 0:
            return [0.0] * len(Xa)
        k = min(self.k, n_tr)
        tr_norm = (Xtr ** 2).sum(axis=1)
        out = np.empty(len(Xa))
        # batched: ||a-b||^2 = ||a||^2 + ||b||^2 - 2 a.b (BLAS matmul)
        B = max(50, min(2000, 12_500_000 // n_tr))
        for s in range(0, len(Xa), B):
            e = min(s + B, len(Xa))
            Xb = Xa[s:e]
            d2 = (Xb ** 2).sum(axis=1)[:, None] + tr_norm[None, :] - 2.0 * (Xb @ Xtr.T)
            np.maximum(d2, 0, out=d2)
            idx = np.argpartition(d2, k - 1, axis=1)[:, :k]
            out[s:e] = ytr[idx].mean(axis=1)
        return out.tolist()


class FellegiSunter:
    """Naive-Bayes Fellegi-Sunter: per-field binned likelihood ratios."""

    def __init__(self, bins=5, laplace=0.5):
        self.bins = bins
        self.laplace = laplace

    def fit(self, X, y):
        k = len(X[0])
        self.tables_ = []
        for j in range(k):
            match = [0.0] * self.bins
            non = [0.0] * self.bins
            for xi, yi in zip(X, y):
                b = min(self.bins - 1, int(max(0.0, min(1.0, xi[j])) * self.bins))
                if yi == 1:
                    match[b] += 1
                else:
                    non[b] += 1
            tm = sum(match) + self.laplace * self.bins
            tn = sum(non) + self.laplace * self.bins
            self.tables_.append([
                math.log((match[b] + self.laplace) / tm)
                - math.log((non[b] + self.laplace) / tn)
                for b in range(self.bins)
            ])
        n1 = sum(y)
        self.log_prior_ = math.log(n1 / len(y)) - math.log(1 - n1 / len(y)) \
            if 0 < n1 < len(y) else 0.0
        return self

    def predict_proba(self, X):
        out = []
        for xi in X:
            llr = self.log_prior_
            for j, v in enumerate(xi):
                b = min(self.bins - 1, int(max(0.0, min(1.0, v)) * self.bins))
                llr += self.tables_[j][b]
            out.append(_sigmoid(llr))
        return out


CLASSIFIERS = {
    "logistic": Logistic,
    "lda": LDA,
    "qda": QDA,
    "knn": KNN,
    "fellegi_sunter": FellegiSunter,
}


def train(name, X, y):
    """Fit a named classifier; returns the fitted model."""
    if name not in CLASSIFIERS:
        raise ValueError(f"unknown classifier: {name}")
    if len(set(y)) < 2:
        raise ValueError(f"{name}: need both match and non-match labeled pairs.")
    return CLASSIFIERS[name]().fit(X, y)
