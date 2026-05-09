from flask import Blueprint, jsonify
from fetcher import GitHubFetcher, UserNotFoundError
from analyzer import RepoAnalyzer
import numpy as np
from scipy import stats
from collections import Counter
import math

academic_bp = Blueprint("academic", __name__)

# ── Zipf's Law ─────────────────────────────────────────────────────────────────
def compute_zipf(repos):
    stars = sorted([r.get("stargazers_count", 0) for r in repos], reverse=True)
    stars = [s for s in stars if s > 0]
    if len(stars) < 2:
        return {"points": [], "r_squared": 0, "exponent": 0}

    ranks  = list(range(1, len(stars) + 1))
    log_r  = np.log(ranks)
    log_s  = np.log(stars)

    slope, intercept, r, p, se = stats.linregress(log_r, log_s)
    r_squared = round(r ** 2, 3)

    points = []
    for i, (rank, star) in enumerate(zip(ranks, stars)):
        theoretical = math.exp(intercept) * (rank ** slope)
        points.append({
            "rank":        rank,
            "actual":      star,
            "theoretical": round(theoretical),
            "name":        repos[i].get("name", "") if i < len(repos) else ""
        })

    return {
        "points":     points,
        "r_squared":  r_squared,
        "exponent":   round(abs(slope), 3),
        "fits_zipf":  bool(r_squared > 0.85),
        "intercept":  round(intercept, 3)
    }

# ── Benford's Law ──────────────────────────────────────────────────────────────
def compute_benford(repos):
    digits = []
    for r in repos:
        for field in ["stargazers_count", "forks_count", "open_issues_count", "size"]:
            val = str(r.get(field, 0))
            if val and val[0] in "123456789":
                digits.append(int(val[0]))

    if len(digits) < 10:
        return {"points": [], "chi2": 0, "p_value": 1, "follows_benford": False}

    n = len(digits)
    observed  = [digits.count(d) for d in range(1, 10)]
    expected  = [n * math.log10(1 + 1/d) for d in range(1, 10)]
    chi2, p   = stats.chisquare(observed, expected)

    points = []
    for d in range(1, 10):
        points.append({
            "digit":    d,
            "observed": round(digits.count(d) / n * 100, 1),
            "expected": round(math.log10(1 + 1/d) * 100, 1),
            "count":    digits.count(d)
        })

    return {
        "points":          points,
        "chi2":            round(chi2, 3),
        "p_value":         round(p, 4),
        "follows_benford": bool(p > 0.05),
        "sample_size":     n
    }

# ── Kolmogorov Complexity Proxy ────────────────────────────────────────────────
def compute_kolmogorov(repos):
    results = []
    for r in repos:
        desc_len    = len(r.get("description") or "")
        topics      = len(r.get("topics", []))
        issues      = r.get("open_issues_count", 0)
        size        = r.get("size", 0)
        languages   = 1  # API doesn't return multi-lang without extra call

        # Complexity proxy: normalized weighted sum
        complexity = round(
            (min(desc_len / 200, 1) * 25) +
            (min(topics / 10, 1)    * 25) +
            (min(issues / 100, 1)   * 20) +
            (min(size / 100000, 1)  * 20) +
            (languages              * 10),
            1
        )
        label = (
            "TRIVIAL"  if complexity < 20 else
            "SIMPLE"   if complexity < 40 else
            "MODERATE" if complexity < 60 else
            "COMPLEX"  if complexity < 80 else
            "ARCANE"
        )
        results.append({
            "name":       r.get("name"),
            "complexity": complexity,
            "label":      label,
            "desc_len":   desc_len,
            "topics":     topics,
            "size_kb":    size,
        })

    return sorted(results, key=lambda x: x["complexity"], reverse=True)

# ── Z-Score Outlier Detection ──────────────────────────────────────────────────
def compute_zscores(repos):
    stars = np.array([r.get("stargazers_count", 0) for r in repos], dtype=float)
    if stars.std() == 0:
        return []

    z_scores = (stars - stars.mean()) / stars.std()
    results  = []
    for i, r in enumerate(repos):
        z = round(float(z_scores[i]), 2)
        results.append({
            "name":    r.get("name"),
            "stars":   r.get("stargazers_count", 0),
            "z_score": z,
            "label":   "VIRAL" if z > 2 else "ABOVE AVG" if z > 0.5 else "BELOW AVG" if z < -0.5 else "NORMAL",
            "outlier": bool(abs(z) > 2)
        })

    return sorted(results, key=lambda x: x["z_score"], reverse=True)

# ── K-Means Clustering (pure numpy) ───────────────────────────────────────────
def compute_clusters(repos, k=3):
    if len(repos) < k:
        return []

    features = np.array([
        [r.get("stargazers_count", 0),
         r.get("forks_count", 0),
         r.get("size", 0),
         r.get("open_issues_count", 0)]
        for r in repos
    ], dtype=float)

    # Normalize
    maxvals  = features.max(axis=0)
    maxvals[maxvals == 0] = 1
    norm     = features / maxvals

    # Random init
    np.random.seed(42)
    centroids = norm[np.random.choice(len(norm), k, replace=False)]

    labels = np.zeros(len(norm), dtype=int)
    for _ in range(50):
        dists  = np.array([[np.linalg.norm(f - c) for c in centroids] for f in norm])
        labels = dists.argmin(axis=1)
        new_c  = np.array([
            norm[labels == i].mean(axis=0) if (labels == i).any() else centroids[i]
            for i in range(k)
        ])
        if np.allclose(centroids, new_c):
            break
        centroids = new_c

    cluster_names = ["ALPHA", "BETA", "GAMMA"]
    results = []
    for i, r in enumerate(repos):
        results.append({
            "name":    r.get("name"),
            "cluster": cluster_names[labels[i]],
            "stars":   r.get("stargazers_count", 0),
            "forks":   r.get("forks_count", 0),
            "size_kb": r.get("size", 0),
            "issues":  r.get("open_issues_count", 0),
        })

    return results

# ── Pearson Correlation Matrix ─────────────────────────────────────────────────
def compute_pearson(repos):
    fields = ["stars", "forks", "size_kb", "open_issues", "age_days"]
    labels = ["STARS", "FORKS", "SIZE", "ISSUES", "AGE"]

    data = {
        "stars":      [r.get("stargazers_count", 0) for r in repos],
        "forks":      [r.get("forks_count", 0) for r in repos],
        "size_kb":    [r.get("size", 0) for r in repos],
        "open_issues":[r.get("open_issues_count", 0) for r in repos],
        "age_days":   [0] * len(repos),  # placeholder
    }

    matrix = []
    for i, f1 in enumerate(fields):
        row = []
        for j, f2 in enumerate(fields):
            if f1 == f2:
                row.append(1.0)
            else:
                a, b = data[f1], data[f2]
                if len(set(a)) < 2 or len(set(b)) < 2:
                    row.append(0.0)
                else:
                    r, _ = stats.pearsonr(a, b)
                    row.append(round(float(r), 3))
        matrix.append({"label": labels[i], "values": row})

    return {"matrix": matrix, "labels": labels}

# ── Cohort Analysis ────────────────────────────────────────────────────────────
def compute_cohorts(repos):
    cohorts = {}
    for r in repos:
        year = r.get("created_at", "")[:4]
        if not year:
            continue
        if year not in cohorts:
            cohorts[year] = {"year": year, "repos": [], "stars": [], "forks": []}
        cohorts[year]["repos"].append(r.get("name"))
        cohorts[year]["stars"].append(r.get("stargazers_count", 0))
        cohorts[year]["forks"].append(r.get("forks_count", 0))

    results = []
    for year, c in sorted(cohorts.items()):
        results.append({
            "year":       year,
            "count":      len(c["repos"]),
            "avg_stars":  round(np.mean(c["stars"]), 1) if c["stars"] else 0,
            "avg_forks":  round(np.mean(c["forks"]), 1) if c["forks"] else 0,
            "total_stars":sum(c["stars"]),
            "repos":      c["repos"],
        })

    return results

# ── Main route ─────────────────────────────────────────────────────────────────
@academic_bp.route("/api/academic/<username>")
def get_academic(username):
    try:
        fetcher  = GitHubFetcher()
        repos    = fetcher.fetch_repos(username, limit=100)
        raw      = [r for r in repos]  # keep raw dicts

        return jsonify({
            "zipf":        compute_zipf(raw),
            "benford":     compute_benford(raw),
            "kolmogorov":  compute_kolmogorov(raw),
            "zscores":     compute_zscores(raw),
            "clusters":    compute_clusters(raw),
            "pearson":     compute_pearson(raw),
            "cohorts":     compute_cohorts(raw),
        })
    except UserNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500