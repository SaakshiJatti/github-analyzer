import statistics
from datetime import datetime, timezone

# ── Constants ─────────────────────────────────────────────────────────────────
GITHUB_API_BASE = "https://api.github.com"
DEFAULT_REPO_LIMIT = 30
OUTPUT_DIR = "output"
TOOL_VERSION = "1.0.0"

# ── Date Helpers ──────────────────────────────────────────────────────────────
def parse_github_date(date_str: str) -> datetime:
    """Convert GitHub ISO 8601 date string to datetime object."""
    if not date_str:
        return None
    return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

def calculate_age_days(date_str: str) -> int:
    """Return how many days ago a GitHub date string was."""
    dt = parse_github_date(date_str)
    if not dt:
        return 0
    now = datetime.now(timezone.utc)
    return (now - dt).days

def format_date(date_str: str) -> str:
    """Convert GitHub date string to readable format: Jan 15, 2024"""
    dt = parse_github_date(date_str)
    if not dt:
        return "N/A"
    return dt.strftime("%b %d, %Y")

# ── Number Helpers ─────────────────────────────────────────────────────────────
def human_number(n: int) -> str:
    """Convert large numbers to readable format: 1200 -> '1.2k'"""
    if n is None:
        return "0"
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}k"
    return str(n)

# ── Statistics Helpers ─────────────────────────────────────────────────────────
def safe_mean(values: list) -> float:
    """Return mean of a list, or 0 if empty."""
    return round(statistics.mean(values), 2) if values else 0

def safe_median(values: list) -> float:
    """Return median of a list, or 0 if empty."""
    return round(statistics.median(values), 2) if values else 0

def safe_stdev(values: list) -> float:
    """Return standard deviation, or 0 if fewer than 2 values."""
    return round(statistics.stdev(values), 2) if len(values) >= 2 else 0

# ── Misc ───────────────────────────────────────────────────────────────────────
def get_timestamp() -> str:
    """Return current UTC time as a readable string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

def truncate(text: str, length: int = 60) -> str:
    """Truncate a string and add ellipsis if too long."""
    if not text:
        return "No description"
    return text if len(text) <= length else text[:length] + "..."