from flask import Blueprint, jsonify
from fetcher import GitHubFetcher, UserNotFoundError
import numpy as np
from scipy import stats
from datetime import datetime, timezone

predict_bp = Blueprint("predict", __name__)

def moving_average(data, window=3):
    result = []
    for i in range(len(data)):
        start = max(0, i - window + 1)
        result.append(round(np.mean(data[start:i+1]), 1))
    return result

def linear_forecast(values, forecast_steps=6):
    if len(values) < 3:
        return [], 0, "INSUFFICIENT DATA"

    x = np.arange(len(values), dtype=float)
    y = np.array(values, dtype=float)

    slope, intercept, r, p, se = stats.linregress(x, y)
    r_squared = round(r ** 2, 3)

    # Forecast future points
    future_x     = np.arange(len(values), len(values) + forecast_steps)
    forecast_raw = slope * future_x + intercept
    forecast     = [max(0, round(float(v), 1)) for v in forecast_raw]

    trend = (
        "RAPIDLY GROWING" if slope > 5 else
        "GROWING"         if slope > 1 else
        "STABLE"          if abs(slope) <= 1 else
        "DECLINING"       if slope > -5 else
        "RAPIDLY DECLINING"
    )

    return forecast, r_squared, trend, round(float(slope), 3)

@predict_bp.route("/api/predict/<username>")
def get_predict(username):
    try:
        fetcher = GitHubFetcher()
        repos   = fetcher.fetch_repos(username, limit=100)

        # ── Commit velocity for top 3 repos ──────────────────────────────
        top3 = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:3]
        velocity_forecasts = []

        for repo in top3:
            activity = fetcher.fetch_commit_activity(username, repo["name"])
            if not activity:
                continue

            weeks    = [w.get("total", 0) for w in activity]
            smoothed = moving_average(weeks, window=3)
            recent   = weeks[-12:]  # last 12 weeks

            forecast, r2, trend, slope = linear_forecast(recent, forecast_steps=8)

            velocity_forecasts.append({
                "repo":      repo["name"],
                "stars":     repo.get("stargazers_count", 0),
                "weeks":     weeks,
                "smoothed":  smoothed,
                "recent":    recent,
                "forecast":  forecast,
                "r_squared": r2,
                "trend":     trend,
                "slope":     slope,
            })

        # ── Star growth projection ────────────────────────────────────────
        stars_by_repo = []
        for repo in sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:5]:
            stars = repo.get("stargazers_count", 0)
            age   = max(1, (datetime.now(timezone.utc) -
                           datetime.strptime(repo.get("created_at","2020-01-01T00:00:00Z"),
                                             "%Y-%m-%dT%H:%M:%SZ")
                           .replace(tzinfo=timezone.utc)).days)

            stars_per_day = stars / age
            projections   = {
                "30d":  round(stars + stars_per_day * 30),
                "90d":  round(stars + stars_per_day * 90),
                "365d": round(stars + stars_per_day * 365),
            }
            stars_by_repo.append({
                "name":         repo["name"],
                "current":      stars,
                "stars_per_day": round(stars_per_day, 2),
                "projections":  projections,
                "age_days":     age,
            })

        # ── Cohort performance trend ──────────────────────────────────────
        cohort_data = {}
        for r in repos:
            year = r.get("created_at", "")[:4]
            if not year:
                continue
            cohort_data.setdefault(year, []).append(r.get("stargazers_count", 0))

        cohort_trend = []
        for year in sorted(cohort_data.keys()):
            avg = round(np.mean(cohort_data[year]), 1)
            cohort_trend.append({"year": year, "avg_stars": avg, "count": len(cohort_data[year])})

        if len(cohort_trend) >= 3:
            avgs = [c["avg_stars"] for c in cohort_trend]
            _, _, r, _, _ = stats.linregress(range(len(avgs)), avgs)
            cohort_r2 = round(r ** 2, 3)
            cohort_direction = "IMPROVING" if avgs[-1] > avgs[0] else "DECLINING"
        else:
            cohort_r2 = 0
            cohort_direction = "INSUFFICIENT DATA"

        # ── Overall developer trajectory ──────────────────────────────────
        total_stars = sum(r.get("stargazers_count", 0) for r in repos)
        total_forks = sum(r.get("forks_count", 0) for r in repos)
        active_repos = sum(1 for r in repos
                          if r.get("updated_at","") >= "2025-01-01T00:00:00Z")

        trajectory_score = min(100, round(
            (min(total_stars / 10000, 1) * 40) +
            (min(active_repos / max(len(repos), 1), 1) * 30) +
            (min(total_forks / 2000, 1) * 30)
        , 1))

        trajectory_label = (
            "RISING STAR"   if trajectory_score > 70 else
            "ACTIVE"        if trajectory_score > 40 else
            "STEADY"        if trajectory_score > 20 else
            "DORMANT"
        )

        return jsonify({
            "velocity_forecasts":  velocity_forecasts,
            "star_projections":    stars_by_repo,
            "cohort_trend":        cohort_trend,
            "cohort_direction":    cohort_direction,
            "cohort_r2":           cohort_r2,
            "trajectory_score":    trajectory_score,
            "trajectory_label":    trajectory_label,
        })

    except UserNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500