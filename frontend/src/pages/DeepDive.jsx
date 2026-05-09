import { useSearchParams } from 'react-router-dom'
import { useDeep } from '../hooks/useDeep'
import { useProfile } from '../hooks/useProfile'
import Panel from '../components/Panel'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// ── Sparkline for one repo ────────────────────────────────────────────────────
function CommitSparkline({ repo }) {
  const max  = Math.max(...repo.weeks, 1)
  const color = repo.total > 500 ? 'var(--green)' : repo.total > 100 ? 'var(--cyan)' : 'var(--text2)'

  return (
    <div style={{
      background: 'rgba(0,0,0,0.2)',
      border: '1px solid var(--border2)',
      padding: 16, marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 15, fontWeight: 700,
          color: 'var(--white)',
        }}>{repo.repo}</div>
        <div style={{ display: 'flex', gap: 20, fontFamily: 'Share Tech Mono, monospace', fontSize: 10 }}>
          <span style={{ color: 'var(--text2)' }}>TOTAL <span style={{ color }}>{repo.total.toLocaleString()}</span></span>
          <span style={{ color: 'var(--text2)' }}>PEAK <span style={{ color: 'var(--yellow)' }}>{repo.peak.toLocaleString()}</span></span>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 48 }}>
        {repo.weeks.map((w, i) => {
          const h = max === 0 ? 0 : Math.max((w / max) * 48, w > 0 ? 2 : 0)
          const isLast4 = i >= repo.weeks.length - 4
          return (
            <div key={i} style={{
              flex: 1,
              height: `${h}px`,
              background: isLast4
                ? `linear-gradient(180deg, ${color}, ${color}88)`
                : 'rgba(0,229,255,0.2)',
              boxShadow: isLast4 ? `0 0 4px ${color}` : 'none',
              transition: 'height 0.5s ease',
              minWidth: 2,
            }}/>
          )
        })}
      </div>

      {/* X labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 8, color: 'var(--text2)', marginTop: 4,
      }}>
        <span>12 WEEKS AGO</span>
        <span style={{ color }}>NOW</span>
      </div>
    </div>
  )
}

// ── Productivity Clock ────────────────────────────────────────────────────────
function ProductivityClock({ clockData, dayData }) {
  const max = Math.max(...clockData.map(d => d.commits), 1)

  const peakHour = clockData.reduce((a, b) => a.commits > b.commits ? a : b, { commits: 0, hour: 0 })
  const peakDay  = dayData.reduce((a, b) => a.commits > b.commits ? a : b, { commits: 0, name: '?' })

  const label = (hour) => {
    if (hour === 0)  return '12A'
    if (hour < 12)  return `${hour}A`
    if (hour === 12) return '12P'
    return `${hour - 12}P`
  }

  const getColor = (commits) => {
    const pct = commits / max
    if (pct > 0.7)  return 'var(--green)'
    if (pct > 0.4)  return 'var(--cyan)'
    if (pct > 0.15) return 'var(--cyan2)'
    if (pct > 0)    return 'rgba(0,229,255,0.2)'
    return 'rgba(255,255,255,0.03)'
  }

  return (
    <div>
      {/* Peak callouts */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          ['PEAK HOUR',  `${label(peakHour.hour)}  (${peakHour.commits} commits)`, 'var(--green)'],
          ['PEAK DAY',   `${peakDay.name}  (${peakDay.commits} commits)`,           'var(--yellow)'],
          ['STYLE',      peakHour.hour >= 22 || peakHour.hour <= 4 ? 'NIGHT OWL 🦉' : peakHour.hour <= 9 ? 'EARLY BIRD 🐦' : peakHour.hour <= 17 ? '9-TO-5 💼' : 'EVENING CODER 🌙', 'var(--orange)'],
        ].map(([k, v, c]) => (
          <div key={k} style={{
            flex: 1, background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border2)',
            padding: '12px 14px',
          }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 2, marginBottom: 6 }}>{k}</div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* 24-hour heatmap */}
      <div style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 8, color: 'var(--text2)',
        letterSpacing: 3, marginBottom: 10,
      }}>// 24-HOUR COMMIT HEATMAP</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 3, marginBottom: 6 }}>
        {clockData.map(d => (
          <div key={d.hour} title={`${label(d.hour)}: ${d.commits} commits`}
            style={{
              height: 32,
              background: getColor(d.commits),
              boxShadow: d.commits > 0 ? `0 0 4px ${getColor(d.commits)}` : 'none',
              transition: 'all 0.3s',
              cursor: 'pointer',
              position: 'relative',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scaleY(1.3)'
              e.currentTarget.style.zIndex = '10'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scaleY(1)'
              e.currentTarget.style.zIndex = '1'
            }}
          />
        ))}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)',
        gap: 3, marginBottom: 20,
      }}>
        {clockData.map((d, i) => (
          i % 6 === 0
            ? <div key={d.hour} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 7, color: 'var(--text2)', gridColumn: `${i + 1} / span 6`, textAlign: 'left' }}>{label(d.hour)}</div>
            : null
        ))}
      </div>

      {/* Day of week bar chart */}
      <div style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 8, color: 'var(--text2)',
        letterSpacing: 3, marginBottom: 10,
      }}>// DAY OF WEEK ACTIVITY</div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={dayData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }} axisLine={false} tickLine={false}/>
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
            formatter={v => [v, 'commits']}
          />
          <Bar dataKey="commits" radius={0}>
            {dayData.map((d, i) => (
              <Cell key={i} fill={d.commits === Math.max(...dayData.map(x => x.commits)) ? '#00e5ff' : 'rgba(0,229,255,0.25)'}/>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Star History ──────────────────────────────────────────────────────────────
function StarHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: 40,
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 11, color: 'var(--text2)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
        Star history requires authentication.<br/>
        Add a GitHub token with <span style={{ color: 'var(--cyan)' }}>--token</span> flag.
      </div>
    )
  }

  const data = history.map((s, i) => ({ index: i + 1, date: s.date, stars: i + 1 }))
  const repoName = history[0]?.repo || 'top repo'

  return (
    <div>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
        color: 'var(--text2)', marginBottom: 16,
      }}>
        <span style={{ color: 'var(--cyan)' }}>// REPO: </span>{repoName} — first {history.length} stargazers
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="starGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ffd740" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffd740" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date"
            tick={{ fontFamily: 'Share Tech Mono', fontSize: 8, fill: '#6a9bb5' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 8, fill: '#6a9bb5' }}/>
          <Tooltip
            contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
            formatter={v => [`★ ${v}`, 'cumulative stars']}
          />
          <Area dataKey="stars" stroke="var(--yellow)" fill="url(#starGrad)"
            strokeWidth={2} dot={false} name="cumulative stars"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,64,0.5))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DeepDive() {
  const [params]  = useSearchParams()
  const username  = params.get('user')
  const { data: deepData,    loading: deepLoading,    error: deepError }    = useDeep(username)
  const { data: profileData, loading: profileLoading, error: profileError } = useProfile(username)

  if (!username)    return <ErrorBox message="No username provided." />
  if (deepLoading || profileLoading) return <Loader text="RUNNING DEEP ANALYSIS..." />
  if (deepError)    return <ErrorBox message={deepError} />
  if (profileError) return <ErrorBox message={profileError} />
  if (!deepData || !profileData) return null

  const { commit_velocity, productivity_clock, day_activity, star_history } = deepData
  const { summary } = profileData
  const { repos }   = summary

  // Velocity summary stats
  const totalCommits = commit_velocity.reduce((s, r) => s + r.total, 0)
  const peakWeek     = Math.max(...commit_velocity.flatMap(r => r.weeks), 0)
  const mostActive   = commit_velocity.reduce((a, b) => a.total > b.total ? a : b, { repo: 'N/A', total: 0 })

  return (
    <div style={{ padding: 32, animation: 'fadeIn 0.4s ease' }}>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
        color: 'var(--text2)', letterSpacing: 4, marginBottom: 20,
      }}>// DEEP DIVE / @{username} / BEHAVIOURAL ANALYSIS</div>

      {/* Velocity summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 24, background: 'var(--border2)' }}>
        {[
          ['COMMITS (12W)', totalCommits.toLocaleString(), 'var(--green)'],
          ['PEAK WEEK',     peakWeek.toLocaleString(),     'var(--yellow)'],
          ['MOST ACTIVE',   mostActive.repo,               'var(--cyan)'],
        ].map(([label, value, color]) => (
          <div key={label} style={{
            background: 'var(--panel)', padding: '18px 20px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: 22,
              fontWeight: 800, color,
              textShadow: `0 0 20px ${color}`,
              marginBottom: 6,
            }}>{value}</div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 9, color: 'var(--text2)', letterSpacing: 3,
            }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Commit velocity */}
        <Panel title="// COMMIT VELOCITY" badge="LAST 12 WEEKS">
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
            color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8,
          }}>
            <span style={{ color: 'var(--cyan)' }}>// SOURCE: </span>
            GitHub Stats API · each bar = 1 week · brighter = more recent
          </div>
          {commit_velocity.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--text2)' }}>No commit data available — GitHub may still be computing stats.</div>
            : commit_velocity.map(r => <CommitSparkline key={r.repo} repo={r} />)
          }
        </Panel>

        {/* Productivity clock */}
        <Panel title="// PRODUCTIVITY CLOCK" badge="COMMIT HOUR ANALYSIS">
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
            color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8,
          }}>
            <span style={{ color: 'var(--cyan)' }}>// SOURCE: </span>
            Public push events · last 100 events · UTC timezone
          </div>
          {productivity_clock.every(d => d.commits === 0)
            ? <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--text2)' }}>No recent push events found for this user.</div>
            : <ProductivityClock clockData={productivity_clock} dayData={day_activity} />
          }
        </Panel>
      </div>

      {/* Star history + Impact leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        <Panel title="// STAR HISTORY" badge="TOP REPO GROWTH">
          <StarHistory history={star_history} />
        </Panel>

        {/* Impact leaderboard */}
        <Panel title="// IMPACT LEADERBOARD" badge="COMPOSITE SCORE">
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
            color: 'var(--text2)', marginBottom: 16,
          }}>
            <span style={{ color: 'var(--cyan)' }}>// FORMULA: </span>
            stars(40) + forks(20) + recency(20) - issues(10) = max 100
          </div>
          {[...repos]
            .sort((a, b) => b.impact_score - a.impact_score)
            .slice(0, 10)
            .map((r, i) => {
              const color = r.impact_score >= 70 ? 'var(--green)' : r.impact_score >= 40 ? 'var(--yellow)' : r.impact_score >= 20 ? 'var(--orange)' : 'var(--text2)'
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${String(i+1).padStart(2,'0')}`
              return (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--text2)', width: 28, flexShrink: 0, textAlign: 'center' }}>{medal}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--white)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                  <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.04)', flexShrink: 0, overflow: 'hidden' }}>
                    <div style={{ width: `${r.impact_score}%`, height: '100%', background: color, boxShadow: `0 0 4px ${color}` }}/>
                  </div>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color, width: 32, textAlign: 'right', flexShrink: 0 }}>{r.impact_score}</span>
                </div>
              )
            })
          }
        </Panel>
      </div>
    </div>
  )
}