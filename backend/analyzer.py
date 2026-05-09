import pandas as pd
import numpy as np
import math
from utils import (
    calculate_age_days, format_date, human_number,
    safe_mean, safe_median, safe_stdev, truncate
)

class RepoAnalyzer:
    def __init__(self, repos: list, username: str):
        self.username = username
        self.raw = repos
        self.df = self._build_dataframe()

    # ── Build DataFrame ────────────────────────────────────────────────────────
    def _build_dataframe(self) -> pd.DataFrame:
        if not self.raw:
            return pd.DataFrame()

        rows = []
        for r in self.raw:
            stars  = r.get("stargazers_count", 0)
            forks  = r.get("forks_count", 0)
            issues = r.get("open_issues_count", 0)
            size   = r.get("size", 0)
            updated = r.get("updated_at", "")
            created = r.get("created_at", "")
            age_days = calculate_age_days(updated)

            rows.append({
                "name":         r.get("name", "unknown"),
                "description":  r.get("description"),
                "language":     r.get("language"),
                "stars":        stars,
                "forks":        forks,
                "watchers":     r.get("watchers_count", 0),
                "open_issues":  issues,
                "size_kb":      size,
                "updated_at":   updated,
                "created_at":   created,
                "url":          r.get("html_url", ""),
                "is_fork":      r.get("fork", False),
                "topics":       r.get("topics", []),
                "age_days":     age_days,
                "updated_fmt":  format_date(updated),
                "created_fmt":  format_date(created),
                "stars_fmt":    human_number(stars),
                "forks_fmt":    human_number(forks),
                "desc_short":   truncate(r.get("description", "")),
                "impact_score": self._impact_score(stars, forks, age_days, issues),
                "classification": self._classify_repo(stars, forks),
                "issue_velocity": self._issue_velocity(issues, age_days),
                "tech_debt":    self._tech_debt(issues, size, age_days, stars, forks),
            })

        df = pd.DataFrame(rows)
        df["description"] = df["description"].fillna("No description")
        df["language"]    = df["language"].fillna("Unknown")
        return df

    # ── Core scoring ───────────────────────────────────────────────────────────
    def _impact_score(self, stars, forks, age_days, issues) -> float:
        star_score    = min(stars / 1000 * 40, 40)
        fork_score    = min(forks / 200  * 20, 20)
        recency_score = max(0, 20 - age_days / 18)
        issue_penalty = min(issues / 10 * 5, 10)
        return round(min(max(star_score + fork_score + recency_score - issue_penalty, 0), 100), 1)

    def _classify_repo(self, stars, forks) -> str:
        if forks == 0:       return "SOLO"
        ratio = stars / forks
        if ratio > 10:       return "ADMIRED"
        if ratio > 3:        return "UTILISED"
        return "COMMUNITY"

    def _issue_velocity(self, issues, age_days) -> str:
        months = max(age_days / 30, 1)
        rate   = issues / months
        if rate < 0.5:  return "MAINTAINED"
        if rate < 2:    return "THRIVING"
        if rate < 5:    return "BACKLOGGED"
        return "ABANDONED"

    def _tech_debt(self, issues, size_kb, age_days, stars, forks) -> float:
        issue_p  = min(issues / 50, 3)
        size_p   = min(size_kb / 50000, 2)
        age_p    = min(age_days / 365, 3)
        gap_p    = 2 if forks > stars else 0
        return round(min(issue_p + size_p + age_p + gap_p, 10), 1)

    # ── Ranking ────────────────────────────────────────────────────────────────
    def rank_repos(self, by: str = "stars") -> pd.DataFrame:
        sort_col  = "age_days" if by == "updated" else by
        ascending = by == "updated"
        ranked = self.df.sort_values(sort_col, ascending=ascending).copy()
        ranked["rank"] = range(1, len(ranked) + 1)
        return ranked

    # ── Language breakdown ─────────────────────────────────────────────────────
    def language_breakdown(self) -> pd.DataFrame:
        counts = (
            self.df.groupby("language")
                   .size()
                   .reset_index(name="count")
                   .sort_values("count", ascending=False)
        )
        total = counts["count"].sum()
        counts["percentage"] = list(map(
            lambda c: f"{round(c / total * 100, 1)}%",
            counts["count"]
        ))
        counts["pct_val"] = counts["count"] / total * 100
        return counts

    # ── Language timeline ──────────────────────────────────────────────────────
    def language_timeline(self) -> dict:
        df = self.df.copy()
        df["year"] = df["created_at"].str[:4]
        timeline = {}
        for year, group in df.groupby("year"):
            top = group["language"].mode()
            timeline[year] = top[0] if not top.empty else "Unknown"
        return dict(sorted(timeline.items()))

    # ── Descriptive stats ──────────────────────────────────────────────────────
    def describe_stats(self) -> dict:
        stars = self.df["stars"].tolist()
        forks = self.df["forks"].tolist()
        return {
            "total_repos":    len(self.df),
            "total_stars":    int(self.df["stars"].sum()),
            "total_forks":    int(self.df["forks"].sum()),
            "mean_stars":     safe_mean(stars),
            "median_stars":   safe_median(stars),
            "stdev_stars":    safe_stdev(stars),
            "max_stars":      int(self.df["stars"].max()) if not self.df.empty else 0,
            "mean_forks":     safe_mean(forks),
            "top_language":   self.df["language"].mode()[0] if not self.df.empty else "N/A",
            "original_repos": int((~self.df["is_fork"]).sum()),
            "forked_repos":   int(self.df["is_fork"].sum()),
            "total_stars_fmt": human_number(int(self.df["stars"].sum())),
            "total_forks_fmt": human_number(int(self.df["forks"].sum())),
        }

    # ── Academic metrics ───────────────────────────────────────────────────────
    def shannon_entropy(self) -> dict:
        breakdown = self.language_breakdown()
        total   = breakdown["count"].sum()
        entropy = 0.0
        for count in breakdown["count"]:
            p = count / total
            if p > 0:
                entropy -= p * math.log2(p)
        entropy = round(entropy, 3)
        if entropy < 0.5:   label = "SPECIALIST"
        elif entropy < 1.5: label = "FOCUSED"
        elif entropy < 2.5: label = "VERSATILE"
        else:               label = "POLYGLOT"
        max_entropy = round(math.log2(len(breakdown)), 3) if len(breakdown) > 1 else 1
        return {
            "entropy":     entropy,
            "label":       label,
            "max_entropy": max_entropy,
            "normalised":  round(entropy / max_entropy, 3) if max_entropy > 0 else 0,
            "languages":   len(breakdown)
        }

    def gini_coefficient(self) -> dict:
        stars = sorted(self.df["stars"].tolist())
        n     = len(stars)
        if n == 0 or sum(stars) == 0:
            return {"gini": 0, "label": "EQUAL"}
        index  = np.arange(1, n + 1)
        gini   = round(
            float((2 * np.sum(index * stars) / (n * np.sum(stars))) - (n + 1) / n),
            3
        )
        if gini < 0.3:   label = "BALANCED"
        elif gini < 0.6: label = "SKEWED"
        elif gini < 0.8: label = "CONCENTRATED"
        else:            label = "ONE-HIT WONDER"
        return {"gini": gini, "label": label}

    def lorenz_curve(self) -> list:
        stars  = sorted(self.df["stars"].tolist())
        total  = sum(stars)
        if total == 0:
            return []
        n      = len(stars)
        points = [{"x": 0, "y": 0}]
        cumsum = 0
        for i, s in enumerate(stars):
            cumsum += s
            points.append({
                "x": round((i + 1) / n * 100, 1),
                "y": round(cumsum / total * 100, 1)
            })
        return points

    # ── Archetype ──────────────────────────────────────────────────────────────
    def detect_archetype(self, user: dict) -> dict:
        stats    = self.describe_stats()
        top_lang = stats["top_language"]
        followers = user.get("followers", 0)

        if stats["total_stars"] > 100000:
            return {"type": "LEGEND",       "icon": "⚡", "desc": "Repos so influential they shaped entire ecosystems"}
        if stats["total_stars"] > 50000:
            return {"type": "ROCKSTAR",     "icon": "🌟", "desc": "The kind of developer people follow on Twitter"}
        if followers > 10000:
            return {"type": "INFLUENCER",   "icon": "📡", "desc": "More followers than code — a community builder"}
        if stats["forked_repos"] > stats["original_repos"]:
            return {"type": "CURATOR",      "icon": "🔬", "desc": "Studies others' code more than writing their own"}
        if stats["mean_stars"] < 5 and stats["total_repos"] > 20:
            return {"type": "BUILDER",      "icon": "🔧", "desc": "Ships constantly, cares zero about clout"}
        if top_lang in ["Jupyter Notebook", "R"]:
            return {"type": "DATA MONK",    "icon": "📊", "desc": "Lives in notebooks, breathes DataFrames"}
        if stats["stdev_stars"] > stats["mean_stars"] * 3:
            return {"type": "ONE-HIT WONDER","icon": "🎯","desc": "One viral repo, the rest are side quests"}
        if top_lang in ["Assembly", "C", "Rust"]:
            return {"type": "SYSTEMS MAGE", "icon": "⚙️", "desc": "Speaks directly to the machine"}
        if top_lang in ["TypeScript", "JavaScript", "Vue", "Svelte"]:
            return {"type": "WEB ARTISAN",  "icon": "🎨", "desc": "Makes the internet look good"}
        return {"type": "CRAFTSMAN",        "icon": "🏛", "desc": "Steady, deliberate, quality over quantity"}

    # ── Generator ──────────────────────────────────────────────────────────────
    def top_n(self, n=10, by="stars"):
        ranked = self.rank_repos(by=by)
        for _, row in ranked.head(n).iterrows():
            yield row.to_dict()

    # ── Filter ─────────────────────────────────────────────────────────────────
    def filter_active(self, days=365) -> pd.DataFrame:
        return self.df[self.df["age_days"] <= days]

    # ── Normalised scores ───────────────────────────────────────────────────────
    def normalized_scores(self) -> pd.DataFrame:
        df = self.df.copy()
        max_stars = df["stars"].max()
        df["score"] = 0 if max_stars == 0 else np.round(df["stars"] / max_stars * 100, 1)
        return df[["name", "stars", "score"]].sort_values("score", ascending=False)

    # ── Full serialisable summary ───────────────────────────────────────────────
    def full_summary(self, user: dict) -> dict:
        ranked = self.rank_repos("stars")
        return {
            "stats":            self.describe_stats(),
            "repos":            ranked.to_dict(orient="records"),
            "languages":        self.language_breakdown().to_dict(orient="records"),
            "language_timeline":self.language_timeline(),
            "archetype":        self.detect_archetype(user),
            "entropy":          self.shannon_entropy(),
            "gini":             self.gini_coefficient(),
            "lorenz":           self.lorenz_curve(),
            "active_count":     len(self.filter_active(365)),
        }