import argparse
import sys
import subprocess
import os

from validators import validate_username
from fetcher import GitHubFetcher, UserNotFoundError, RateLimitError, APIError
from analyzer import RepoAnalyzer
from reporter import JSONReporter, CSVReporter, HTMLReporter
from utils import OUTPUT_DIR

def parse_args():
    parser = argparse.ArgumentParser(
        prog="github-analyzer",
        description="Analyze any GitHub user's public repositories and generate a report.",
        epilog="Example: python main.py --user torvalds --limit 20 --sort stars --output both"
    )

    parser.add_argument(
        "--user", "-u",
        type=str,
        required=True,
        help="GitHub username to analyze"
    )
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=30,
        metavar="N",
        help="Max number of repos to fetch (1-100). Default: 30"
    )
    parser.add_argument(
        "--sort", "-s",
        type=str,
        choices=["stars", "forks", "watchers", "updated"],
        default="stars",
        help="Sort repos by this metric. Default: stars"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        choices=["html", "json", "csv", "all"],
        default="html",
        help="Output format. Default: html"
    )
    parser.add_argument(
        "--token", "-t",
        type=str,
        default=None,
        help="GitHub personal access token (increases rate limit to 5000/hr)"
    )
    parser.add_argument(
        "--open",
        action="store_true",
        help="Auto-open the HTML report in your browser after generation"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show detailed logs (@log_call output)"
    )

    return parser.parse_args()


def run(args):
    # ── Step 1: Validate username ──────────────────────────────────────────────
    print(f"\n🔍 Analyzing GitHub user: {args.user}\n")
    try:
        validate_username(args.user)
    except ValueError as e:
        print(f"❌ Invalid username: {e}")
        sys.exit(1)

    # ── Step 2: Validate limit ─────────────────────────────────────────────────
    if not 1 <= args.limit <= 100:
        print("❌ --limit must be between 1 and 100.")
        sys.exit(1)

    # ── Step 3: Fetch data ─────────────────────────────────────────────────────
    fetcher = GitHubFetcher(token=args.token)

    try:
        print(f"📡 Fetching user profile...")
        user = fetcher.fetch_user(args.user)

        print(f"📦 Fetching up to {args.limit} repositories...")
        repos = fetcher.fetch_repos(args.user, limit=args.limit)

    except UserNotFoundError as e:
        print(f"\n❌ User not found: {e}")
        sys.exit(1)
    except RateLimitError as e:
        print(f"\n⚠️  Rate limit hit: {e}")
        sys.exit(1)
    except APIError as e:
        print(f"\n❌ API error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

    # ── Step 4: Check for empty results ───────────────────────────────────────
    if not repos:
        print(f"⚠️  '{args.user}' has no public repositories. Nothing to analyze.")
        sys.exit(0)

    print(f"✅ Found {len(repos)} repositories for @{args.user}\n")

    # ── Step 5: Analyze ────────────────────────────────────────────────────────
    print("🧮 Analyzing repositories...")
    analyzer = RepoAnalyzer(repos, username=args.user)
    stats = analyzer.describe_stats()

    # Print quick summary to terminal
    print(f"\n{'─'*45}")
    print(f"  User       : {user.get('name') or args.user}")
    print(f"  Repos      : {stats['total_repos']}")
    print(f"  Total Stars: {stats['total_stars']:,}")
    print(f"  Total Forks: {stats['total_forks']:,}")
    print(f"  Top Language: {stats['top_language']}")
    print(f"{'─'*45}\n")

    if args.verbose:
        print("📋 Top 5 repos:")
        for repo in analyzer.top_n(n=5, by=args.sort):
            print(f"   #{repo['rank']}  ★{repo['stars_fmt']:>7}  {repo['name']}")
        print()

    # ── Step 6: Generate reports ───────────────────────────────────────────────
    print("📝 Generating report(s)...")
    generated_paths = []

    # Map output choice to reporter classes
    reporter_map = {
        "html": [HTMLReporter],
        "json": [JSONReporter],
        "csv":  [CSVReporter],
        "all":  [HTMLReporter, JSONReporter, CSVReporter],
    }

    # Polymorphism — each reporter has the same generate() interface
    for ReporterClass in reporter_map[args.output]:
        reporter = ReporterClass(user, analyzer)
        path = reporter.generate()
        generated_paths.append(path)

    # ── Step 7: Open in browser ────────────────────────────────────────────────
    html_path = os.path.join(OUTPUT_DIR, "report.html")
    if args.open and os.path.exists(html_path):
        print("\n🌐 Opening report in browser...")
        try:
            # subprocess used to open file cross-platform
            if sys.platform == "win32":
                subprocess.Popen(["start", html_path], shell=True)
            elif sys.platform == "darwin":
                subprocess.Popen(["open", html_path])
            else:
                subprocess.Popen(["xdg-open", html_path])
        except Exception as e:
            print(f"⚠️  Could not auto-open browser: {e}")

    # ── Done ───────────────────────────────────────────────────────────────────
    print(f"\n✅ Done! Reports saved to /{OUTPUT_DIR}/")
    for p in generated_paths:
        print(f"   → {p}")
    print()


if __name__ == "__main__":
    args = parse_args()
    run(args)