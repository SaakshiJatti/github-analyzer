from flask import Blueprint, jsonify
from fetcher import GitHubFetcher, UserNotFoundError, RateLimitError, APIError
from analyzer import RepoAnalyzer
from validators import validate_username

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/api/profile/<username>")
def get_profile(username):
    try:
        validate_username(username)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    try:
        fetcher  = GitHubFetcher()
        user     = fetcher.fetch_user(username)
        repos    = fetcher.fetch_repos(username, limit=100)
        analyzer = RepoAnalyzer(repos, username)
        return jsonify({
            "user":    user,
            "summary": analyzer.full_summary(user)
        })
    except UserNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except RateLimitError as e:
        return jsonify({"error": str(e)}), 429
    except APIError as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500