import requests
import sys
from utils import GITHUB_API_BASE
from decorators import retry, log_call, timer

# ── Custom Exceptions ──────────────────────────────────────────────────────────
class UserNotFoundError(Exception):
    pass

class RateLimitError(Exception):
    pass

class APIError(Exception):
    pass

# ── GitHubFetcher Class ────────────────────────────────────────────────────────
class GitHubFetcher:
    def __init__(self, token: str = None):
        self.token = token
        self.session = requests.Session()
        self.session.headers.update(self._build_headers())

    def _build_headers(self) -> dict:
        """Build request headers. Adds auth token if provided."""
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    @log_call
    def fetch_user(self, username: str) -> dict:
        """Fetch GitHub user profile."""
        url = f"{GITHUB_API_BASE}/users/{username}"
        response = self.session.get(url, timeout=10)

        if response.status_code == 404:
            raise UserNotFoundError(
                f"GitHub user '{username}' not found. Check the spelling and try again."
            )
        if response.status_code == 403:
            raise RateLimitError(
                "GitHub API rate limit hit. Wait 60 minutes or use --token with a personal access token."
            )
        if response.status_code != 200:
            raise APIError(f"GitHub API error {response.status_code}: {response.text}")

        return response.json()

    @retry(max_attempts=3, delay=2)
    @timer
    def fetch_repos(self, username: str, limit: int = 30) -> list:
        """
        Fetch all public repos for a user.
        Paginates automatically — GitHub returns max 100 per page.
        """
        repos = []
        page = 1
        per_page = min(limit, 100)

        while len(repos) < limit:
            url = f"{GITHUB_API_BASE}/users/{username}/repos"
            params = {
                "per_page": per_page,
                "page": page,
                "sort": "updated",
                "direction": "desc"
            }
            response = self.session.get(url, params=params, timeout=10)

            if response.status_code == 403:
                remaining = response.headers.get("X-RateLimit-Remaining", "?")
                raise RateLimitError(
                    f"Rate limit hit (remaining: {remaining}). Use --token to increase limit."
                )
            if response.status_code != 200:
                raise APIError(f"Failed to fetch repos: {response.status_code}")

            page_data = response.json()
            if not page_data:
                break  # No more pages

            repos.extend(page_data)
            page += 1

            if len(page_data) < per_page:
                break  # Last page — fewer results than requested

        return repos[:limit]  # Trim to exact limit

    def fetch_commit_activity(self, username: str, repo_name: str) -> list:
        """52 weeks of commit activity for a repo."""
        url = f"{GITHUB_API_BASE}/repos/{username}/{repo_name}/stats/commit_activity"
        try:
            r = self.session.get(url, timeout=15)
            if r.status_code == 200:
                return r.json()
            return []
        except Exception:
            return []

    def fetch_events(self, username: str) -> list:
        """Latest public events for a user — used for productivity clock."""
        url = f"{GITHUB_API_BASE}/users/{username}/events/public"
        try:
            r = self.session.get(url, params={"per_page": 100}, timeout=10)
            return r.json() if r.status_code == 200 else []
        except Exception:
            return []

    def fetch_star_history(self, username: str, repo_name: str) -> list:
        """Stargazers with timestamps for a repo."""
        url = f"{GITHUB_API_BASE}/repos/{username}/{repo_name}/stargazers"
        headers = {"Accept": "application/vnd.github.star+json"}
        try:
            r = self.session.get(
                url, headers=headers,
                params={"per_page": 100}, timeout=10
            )
            return r.json() if r.status_code == 200 else []
        except Exception:
            return []


# ── Quick Test ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    fetcher = GitHubFetcher()

    # Test 1: Valid user
    print("=== Fetching user: torvalds ===")
    try:
        user = fetcher.fetch_user("torvalds")
        print(f"Name: {user['name']}")
        print(f"Followers: {user['followers']}")
        print(f"Public repos: {user['public_repos']}")
    except Exception as e:
        print(f"Error: {e}")

    # Test 2: Fetch repos
    print("\n=== Fetching top 5 repos ===")
    try:
        repos = fetcher.fetch_repos("torvalds", limit=5)
        for r in repos:
            print(f"  ★ {r['stargazers_count']:>6}  {r['name']}")
    except Exception as e:
        print(f"Error: {e}")

    # Test 3: Invalid user
    print("\n=== Testing invalid user ===")
    try:
        fetcher.fetch_user("thisuserdoesnotexist99999xyzabc")
    except UserNotFoundError as e:
        print(f"Caught correctly: {e}")