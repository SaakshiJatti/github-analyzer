from flask import Blueprint, jsonify
from fetcher import GitHubFetcher
from collections import Counter
from datetime import datetime, timezone

deep_bp = Blueprint("deep", __name__)

@deep_bp.route("/api/deep/<username>")
def get_deep(username):
    try:
        fetcher = GitHubFetcher()
        repos   = fetcher.fetch_repos(username, limit=30)

        # ── Commit velocity (top 5 repos) ──────────────────────────────
        commit_data = []
        for repo in sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:5]:
            activity = fetcher.fetch_commit_activity(username, repo["name"])
            if activity:
                weeks  = [w.get("total", 0) for w in activity[-12:]]
                commit_data.append({
                    "repo":  repo["name"],
                    "weeks": weeks,
                    "total": sum(weeks),
                    "peak":  max(weeks) if weeks else 0
                })

        # ── Productivity clock ──────────────────────────────────────────
        events = fetcher.fetch_events(username)
        hour_counts = Counter()
        day_counts  = Counter()
        for event in events:
            if event.get("type") == "PushEvent":
                ts  = event.get("created_at", "")
                try:
                    dt  = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
                    hour_counts[dt.hour] += 1
                    day_counts[dt.weekday()] += 1
                except:
                    pass

        clock = [{"hour": h, "commits": hour_counts.get(h, 0)} for h in range(24)]
        days  = [{"day": d, "name": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d],
                  "commits": day_counts.get(d, 0)} for d in range(7)]

        # ── Star history (top repo) ─────────────────────────────────────
        star_history = []
        if repos:
            top_repo = max(repos, key=lambda r: r.get("stargazers_count", 0))
            raw_history = fetcher.fetch_star_history(username, top_repo["name"])
            for i, entry in enumerate(raw_history[:100]):
                ts = entry.get("starred_at", "")
                star_history.append({
                    "index": i + 1,
                    "date":  ts[:10] if ts else "",
                    "repo":  top_repo["name"]
                })

        return jsonify({
            "commit_velocity": commit_data,
            "productivity_clock": clock,
            "day_activity": days,
            "star_history": star_history
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500