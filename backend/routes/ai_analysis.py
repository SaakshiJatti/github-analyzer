import os
from flask import Blueprint, jsonify, request
from fetcher import GitHubFetcher, UserNotFoundError
from analyzer import RepoAnalyzer
from groq import Groq

ai_bp = Blueprint("ai", __name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_groq(prompt, system, max_tokens=600):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

def build_context(user, summary):
    stats    = summary["stats"]
    archetype = summary["archetype"]
    entropy  = summary["entropy"]
    gini     = summary["gini"]
    repos    = summary["repos"][:5]
    top_repos = ", ".join(f"{r['name']}(★{r['stars']})" for r in repos)

    return f"""
Developer: {user.get('name') or user.get('login')} (@{user.get('login')})
Bio: {user.get('bio', 'N/A')}
Followers: {user.get('followers')} | Following: {user.get('following')}
Public Repos: {user.get('public_repos')}
Total Stars: {stats['total_stars']} | Total Forks: {stats['total_forks']}
Mean Stars: {stats['mean_stars']} | Median Stars: {stats['median_stars']} | Std Dev: {stats['stdev_stars']}
Top Language: {stats['top_language']}
Archetype: {archetype['type']} — {archetype['desc']}
Shannon Entropy: {entropy['entropy']} ({entropy['label']})
Gini Coefficient: {gini['gini']} ({gini['label']})
Original Repos: {stats['original_repos']} | Forked: {stats['forked_repos']}
Top 5 Repos: {top_repos}
""".strip()

# ── Dev Summary ────────────────────────────────────────────────────────────────
@ai_bp.route("/api/ai/summary/<username>")
def ai_summary(username):
    try:
        fetcher  = GitHubFetcher()
        user     = fetcher.fetch_user(username)
        repos    = fetcher.fetch_repos(username, limit=50)
        analyzer = RepoAnalyzer(repos, username)
        summary  = analyzer.full_summary(user)
        context  = build_context(user, summary)

        prompt = f"""
Analyze this GitHub developer profile and write a professional 3-paragraph intelligence report.

{context}

Paragraph 1: Technical identity — what kind of developer are they, what do they specialize in?
Paragraph 2: Impact and influence — how significant is their open source contribution?
Paragraph 3: Trajectory — where are they headed based on the data?

Be specific, cite the actual numbers, and write like a senior engineering manager evaluating a candidate.
Do NOT use bullet points. Write in flowing prose. Be direct and insightful.
"""
        system = "You are a senior engineering analyst writing precise, data-driven developer intelligence reports. You cite specific metrics. You avoid vague generalities."
        result = call_groq(prompt, system, max_tokens=600)
        return jsonify({"summary": result, "context": context})

    except UserNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Roast Mode ─────────────────────────────────────────────────────────────────
@ai_bp.route("/api/ai/roast/<username>")
def ai_roast(username):
    try:
        fetcher  = GitHubFetcher()
        user     = fetcher.fetch_user(username)
        repos    = fetcher.fetch_repos(username, limit=50)
        analyzer = RepoAnalyzer(repos, username)
        summary  = analyzer.full_summary(user)
        context  = build_context(user, summary)

        prompt = f"""
Roast this GitHub developer's profile like a brutally honest code reviewer at a comedy roast.

{context}

Rules:
- Be funny and savage but not mean-spirited
- Reference their ACTUAL stats and repos
- Point out ironic things (e.g. high stars but no forks = people admire but won't touch it)
- End with one genuine compliment
- Keep it to 4-5 punchy sentences
- No bullet points, just flowing savage prose
"""
        system = "You are a witty tech comedian doing a roast. You are funny, sharp, and reference real data. You always end with one genuine compliment."
        result = call_groq(prompt, system, max_tokens=400)
        return jsonify({"roast": result})

    except UserNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── Career Trajectory ──────────────────────────────────────────────────────────
@ai_bp.route("/api/ai/career/<username>")
def ai_career(username):
    try:
        fetcher  = GitHubFetcher()
        user     = fetcher.fetch_user(username)
        repos    = fetcher.fetch_repos(username, limit=50)
        analyzer = RepoAnalyzer(repos, username)
        summary  = analyzer.full_summary(user)
        context  = build_context(user, summary)
        timeline = summary.get("language_timeline", {})
        timeline_str = " → ".join(f"{y}:{l}" for y, l in timeline.items())

        prompt = f"""
Analyze this developer's career trajectory based on their GitHub data.

{context}
Language Evolution: {timeline_str}

Write a career trajectory analysis covering:
1. Current career stage (junior/mid/senior/principal/legend) and evidence
2. Technology pivot history — what did they start with vs now?
3. Growth velocity — are they accelerating or plateauing?
4. One specific, actionable recommendation for their next career move

Be direct. Cite the numbers. 4 short paragraphs, no bullet points.
"""
        system = "You are a senior tech recruiter and career coach with 20 years of experience evaluating engineers from their GitHub activity. You give direct, data-backed career assessments."
        result = call_groq(prompt, system, max_tokens=500)
        return jsonify({"career": result})

    except UserNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500