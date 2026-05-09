from flask import Blueprint, jsonify
from fetcher import GitHubFetcher, UserNotFoundError
from analyzer import RepoAnalyzer

compare_bp = Blueprint("compare", __name__)

@compare_bp.route("/api/compare/<user1>/<user2>")
def compare_users(user1, user2):
    try:
        fetcher = GitHubFetcher()
        results = {}
        for username in [user1, user2]:
            user     = fetcher.fetch_user(username)
            repos    = fetcher.fetch_repos(username, limit=50)
            analyzer = RepoAnalyzer(repos, username)
            results[username] = {
                "user":    user,
                "summary": analyzer.full_summary(user)
            }

        # ── Head to head ────────────────────────────────────────────────
        def winner(key, path=None):
            def get(u):
                d = results[u]["summary"]["stats"]
                return d.get(key, 0)
            a, b = get(user1), get(user2)
            if a > b:   return user1
            if b > a:   return user2
            return "tie"

        head_to_head = {
            "total_stars":  winner("total_stars"),
            "total_forks":  winner("total_forks"),
            "total_repos":  winner("total_repos"),
            "mean_stars":   winner("mean_stars"),
            "original_repos": winner("original_repos"),
        }

        return jsonify({
            user1: results[user1],
            user2: results[user2],
            "head_to_head": head_to_head
        })

    except UserNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500