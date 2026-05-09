import { useState } from 'react'
import { useCompare } from '../hooks/useCompare'
import Panel from '../components/Panel'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

// ── Radar comparison chart ────────────────────────────────────────────────────
function CompareRadar({ u1, u2, s1, s2 }) {
  const norm = (val, max) => max === 0 ? 0 : Math.round((val / max) * 100)

  const maxStars  = Math.max(s1.total_stars,    s2.total_stars,    1)
  const maxForks  = Math.max(s1.total_forks,    s2.total_forks,    1)
  const maxRepos  = Math.max(s1.total_repos,    s2.total_repos,    1)
  const maxOrig   = Math.max(s1.original_repos, s2.original_repos, 1)
  const maxMean   = Math.max(s1.mean_stars,     s2.mean_stars,     1)
  const maxForkM  = Math.max(s1.mean_forks,     s2.mean_forks,     1)

  const data = [
    { metric: 'STARS',       [u1]: norm(s1.total_stars,    maxStars), [u2]: norm(s2.total_stars,    maxStars) },
    { metric: 'FORKS',       [u1]: norm(s1.total_forks,    maxForks), [u2]: norm(s2.total_forks,    maxForks) },
    { metric: 'REPOS',       [u1]: norm(s1.total_repos,    maxRepos), [u2]: norm(s2.total_repos,    maxRepos) },
    { metric: 'ORIGINALS',   [u1]: norm(s1.original_repos, maxOrig),  [u2]: norm(s2.original_repos, maxOrig)  },
    { metric: 'AVG STARS',   [u1]: norm(s1.mean_stars,     maxMean),  [u2]: norm(s2.mean_stars,     maxMean)  },
    { metric: 'AVG FORKS',   [u1]: norm(s1.mean_forks,     maxForkM), [u2]: norm(s2.mean_forks,     maxForkM) },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(0,229,255,0.1)" />
        <PolarAngleAxis dataKey="metric"
          tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5', letterSpacing: 1 }}
        />
        <Tooltip
          contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
        />
        <Radar name={u1} dataKey={u1}
          stroke="var(--cyan)" fill="rgba(0,229,255,0.15)"
          strokeWidth={2} dot={{ fill: 'var(--cyan)', r: 3 }}
        />
        <Radar name={u2} dataKey={u2}
          stroke="var(--orange)" fill="rgba(255,112,67,0.15)"
          strokeWidth={2} dot={{ fill: 'var(--orange)', r: 3 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ── Profile mini card ─────────────────────────────────────────────────────────
function ProfileCard({ user, color, isWinner }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: `1px solid ${isWinner ? color : 'var(--border2)'}`,
      padding: 20, textAlign: 'center',
      boxShadow: isWinner ? `0 0 20px ${color}22` : 'none',
      position: 'relative', overflow: 'hidden',
      clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))',
    }}>
      {isWinner && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          fontFamily: 'Orbitron, monospace', fontSize: 8,
          color, letterSpacing: 2,
          background: `${color}15`,
          border: `1px solid ${color}44`,
          padding: '3px 8px',
        }}>WINNER</div>
      )}
      <img src={user.avatar_url} alt="avatar"
        style={{
          width: 72, height: 72,
          clipPath: 'polygon(8px 0%,100% 0%,100% calc(100% - 8px),calc(100% - 8px) 100%,0% 100%,0% 8px)',
          marginBottom: 12, display: 'block', margin: '0 auto 12px',
          filter: `saturate(0.8) drop-shadow(0 0 8px ${color}44)`,
        }}
      />
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 15, fontWeight: 900, color: 'var(--white)', marginBottom: 4 }}>
        {user.name || user.login}
      </div>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color, marginBottom: 12 }}>
        @{user.login}
      </div>
      {user.bio && (
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
          {user.bio.slice(0, 80)}{user.bio.length > 80 ? '...' : ''}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        {[['FOLLOWERS', user.followers], ['REPOS', user.public_repos]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color }}>{v?.toLocaleString()}</div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 2 }}>{k}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Head to head row ──────────────────────────────────────────────────────────
function H2HRow({ label, v1, v2, winner, u1, u2, fmt }) {
  const c1 = winner === u1 ? 'var(--cyan)'   : winner === 'tie' ? 'var(--text)' : 'var(--text2)'
  const c2 = winner === u2 ? 'var(--orange)' : winner === 'tie' ? 'var(--text)' : 'var(--text2)'
  const display = (v) => fmt === 'num' ? Number(v).toLocaleString() : fmt === 'dec' ? Number(v).toFixed(2) : v

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center', gap: 16,
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ textAlign: 'right', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: c1, fontWeight: winner === u1 ? 700 : 400 }}>
        {display(v1)}
        {winner === u1 && <span style={{ marginLeft: 6, fontSize: 10 }}>◀</span>}
      </div>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', letterSpacing: 2, textAlign: 'center', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ textAlign: 'left', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: c2, fontWeight: winner === u2 ? 700 : 400 }}>
        {winner === u2 && <span style={{ marginRight: 6, fontSize: 10 }}>▶</span>}
        {display(v2)}
      </div>
    </div>
  )
}

// ── Bar comparison ────────────────────────────────────────────────────────────
function CompareBar({ label, v1, v2, u1, u2 }) {
  const max  = Math.max(v1, v2, 1)
  const p1   = Math.round(v1 / max * 100)
  const p2   = Math.round(v2 / max * 100)

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 9, color: 'var(--text2)', marginBottom: 6, letterSpacing: 1,
      }}>
        <span style={{ color: 'var(--cyan)' }}>{Number(v1).toLocaleString()}</span>
        <span>{label}</span>
        <span style={{ color: 'var(--orange)' }}>{Number(v2).toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', height: 6, gap: 2 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            width: `${p1}%`, height: '100%',
            background: 'linear-gradient(90deg, transparent, var(--cyan))',
            boxShadow: '0 0 6px var(--cyan)',
          }}/>
        </div>
        <div style={{ width: 2, background: 'var(--border)', flexShrink: 0 }}/>
        <div style={{ flex: 1 }}>
          <div style={{
            width: `${p2}%`, height: '100%',
            background: 'linear-gradient(90deg, var(--orange), transparent)',
            boxShadow: '0 0 6px var(--orange)',
          }}/>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Compare() {
  const [u1, setU1] = useState('')
  const [u2, setU2] = useState('')
  const { data, loading, error, compare } = useCompare()

  const handleCompare = () => {
    if (u1.trim() && u2.trim()) compare(u1.trim(), u2.trim())
  }

  const PRESETS = [
    ['torvalds',   'gvanrossum'],
    ['microsoft',  'google'],
    ['facebook',   'netflix'],
    ['antirez',    'tj'],
  ]

  return (
    <div style={{ padding: 32, animation: 'fadeIn 0.4s ease' }}>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
        color: 'var(--text2)', letterSpacing: 4, marginBottom: 20,
      }}>// COMPARE / SIDE-BY-SIDE BATTLE MODE</div>

      {/* Search inputs */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr auto',
        gap: 12, marginBottom: 16, alignItems: 'center',
      }}>
        <input value={u1} onChange={e => setU1(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompare()}
          placeholder="first username..."
          style={{
            background: 'var(--panel)', border: '1px solid var(--cyan-dim)',
            borderBottom: '2px solid var(--cyan)',
            outline: 'none', padding: '12px 16px',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: 13, color: 'var(--white)', letterSpacing: 2,
          }}
        />
        <div style={{
          fontFamily: 'Orbitron, monospace', fontSize: 14,
          fontWeight: 900, color: 'var(--text2)', letterSpacing: 4,
          padding: '0 8px',
        }}>VS</div>
        <input value={u2} onChange={e => setU2(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompare()}
          placeholder="second username..."
          style={{
            background: 'var(--panel)', border: '1px solid rgba(255,112,67,0.3)',
            borderBottom: '2px solid var(--orange)',
            outline: 'none', padding: '12px 16px',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: 13, color: 'var(--white)', letterSpacing: 2,
          }}
        />
        <button onClick={handleCompare} style={{
          background: 'linear-gradient(135deg, var(--cyan), var(--orange))',
          border: 'none', color: '#000',
          fontFamily: 'Orbitron, monospace',
          fontSize: 10, fontWeight: 900,
          padding: '12px 24px', cursor: 'pointer',
          letterSpacing: 3,
        }}>BATTLE</button>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 3, alignSelf: 'center' }}>QUICK:</span>
        {PRESETS.map(([a, b]) => (
          <button key={`${a}-${b}`}
            onClick={() => { setU1(a); setU2(b); compare(a, b) }}
            style={{
              background: 'transparent',
              border: '1px solid var(--border2)',
              color: 'var(--text2)',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 9, padding: '5px 12px',
              cursor: 'pointer', letterSpacing: 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.color = 'var(--cyan)'; e.target.style.borderColor = 'var(--cyan)' }}
            onMouseLeave={e => { e.target.style.color = 'var(--text2)'; e.target.style.borderColor = 'var(--border2)' }}
          >{a} vs {b}</button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && <Loader text="RUNNING BATTLE ANALYSIS..." />}
      {error   && <ErrorBox message={error} />}

      {/* Results */}
      {data && (() => {
        const unames  = Object.keys(data).filter(k => k !== 'head_to_head')
        const [n1, n2] = unames
        const d1 = data[n1], d2 = data[n2]
        const h2h = data.head_to_head
        const s1  = d1.summary.stats,  s2  = d2.summary.stats
        const a1  = d1.summary.archetype, a2 = d2.summary.archetype

        // Count wins
        const wins1 = Object.values(h2h).filter(w => w === n1).length
        const wins2 = Object.values(h2h).filter(w => w === n2).length
        const overallWinner = wins1 > wins2 ? n1 : wins2 > wins1 ? n2 : 'tie'

        return (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>

            {/* Profile cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, marginBottom: 24, alignItems: 'center' }}>
              <ProfileCard user={d1.user} color="var(--cyan)"   isWinner={overallWinner === n1} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 28, fontWeight: 900, color: 'var(--text2)', letterSpacing: 6 }}>VS</div>
                {overallWinner !== 'tie' && (
                  <div style={{
                    marginTop: 8,
                    fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
                    color: overallWinner === n1 ? 'var(--cyan)' : 'var(--orange)',
                    letterSpacing: 2,
                  }}>
                    {wins1}-{wins2}
                  </div>
                )}
              </div>
              <ProfileCard user={d2.user} color="var(--orange)" isWinner={overallWinner === n2} />
            </div>

            {/* Archetype row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                [a1, d1.user.login, 'var(--cyan)'],
                [a2, d2.user.login, 'var(--orange)'],
              ].map(([arch, uname, color]) => (
                <div key={uname} style={{
                  background: 'var(--panel)',
                  border: `1px solid var(--border2)`,
                  padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <span style={{ fontSize: 28 }}>{arch.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 2, marginBottom: 3 }}>@{uname} ARCHETYPE</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, fontWeight: 700, color, letterSpacing: 2, marginBottom: 3 }}>{arch.type}</div>
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)' }}>{arch.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar + H2H */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

              <Panel title="// RADAR COMPARISON" badge="NORMALISED 0-100">
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
                  {[[n1, 'var(--cyan)'], [n2, 'var(--orange)']].map(([name, color]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Share Tech Mono, monospace', fontSize: 10 }}>
                      <div style={{ width: 20, height: 2, background: color, boxShadow: `0 0 4px ${color}` }}/>
                      <span style={{ color }}>@{name}</span>
                    </div>
                  ))}
                </div>
                <CompareRadar u1={n1} u2={n2} s1={s1} s2={s2} />
              </Panel>

              <Panel title="// HEAD TO HEAD" badge={`${wins1}-${wins2} ${overallWinner !== 'tie' ? overallWinner.toUpperCase() + ' LEADS' : 'TIE'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 2 }}>
                  <span style={{ color: 'var(--cyan)' }}>@{n1}</span>
                  <span style={{ color: 'var(--text2)' }}>METRIC</span>
                  <span style={{ color: 'var(--orange)' }}>@{n2}</span>
                </div>
                <H2HRow label="TOTAL STARS"   v1={s1.total_stars}    v2={s2.total_stars}    winner={h2h.total_stars}    u1={n1} u2={n2} fmt="num" />
                <H2HRow label="TOTAL FORKS"   v1={s1.total_forks}    v2={s2.total_forks}    winner={h2h.total_forks}    u1={n1} u2={n2} fmt="num" />
                <H2HRow label="TOTAL REPOS"   v1={s1.total_repos}    v2={s2.total_repos}    winner={h2h.total_repos}    u1={n1} u2={n2} fmt="num" />
                <H2HRow label="MEAN STARS"    v1={s1.mean_stars}     v2={s2.mean_stars}     winner={h2h.mean_stars}     u1={n1} u2={n2} fmt="dec" />
                <H2HRow label="ORIGINAL REPOS" v1={s1.original_repos} v2={s2.original_repos} winner={h2h.original_repos} u1={n1} u2={n2} fmt="num" />
                <H2HRow label="ENTROPY"       v1={d1.summary.entropy.entropy} v2={d2.summary.entropy.entropy} winner={d1.summary.entropy.entropy > d2.summary.entropy.entropy ? n1 : n2} u1={n1} u2={n2} fmt="dec" />
                <H2HRow label="GINI COEFF"    v1={d1.summary.gini.gini}       v2={d2.summary.gini.gini}       winner={d1.summary.gini.gini < d2.summary.gini.gini ? n1 : n2}            u1={n1} u2={n2} fmt="dec" />

                {/* Overall verdict */}
                <div style={{
                  marginTop: 16, padding: '12px 16px', textAlign: 'center',
                  background: overallWinner !== 'tie' ? `${overallWinner === n1 ? 'rgba(0,229,255,0.06)' : 'rgba(255,112,67,0.06)'}` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${overallWinner !== 'tie' ? (overallWinner === n1 ? 'var(--cyan-dim)' : 'rgba(255,112,67,0.3)') : 'var(--border2)'}`,
                }}>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 3, marginBottom: 6 }}>OVERALL VERDICT</div>
                  <div style={{
                    fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 900,
                    color: overallWinner === n1 ? 'var(--cyan)' : overallWinner === n2 ? 'var(--orange)' : 'var(--text)',
                    letterSpacing: 4,
                  }}>
                    {overallWinner !== 'tie' ? `@${overallWinner} WINS` : '🤝 TIE'}
                  </div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 4 }}>
                    {wins1} vs {wins2} categories
                  </div>
                </div>
              </Panel>
            </div>

            {/* Bar comparisons */}
            <Panel title="// METRIC BREAKDOWN" badge="VISUAL COMPARISON">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <CompareBar label="TOTAL STARS"    v1={s1.total_stars}    v2={s2.total_stars}    u1={n1} u2={n2} />
                  <CompareBar label="TOTAL FORKS"    v1={s1.total_forks}    v2={s2.total_forks}    u1={n1} u2={n2} />
                  <CompareBar label="MEAN STARS"     v1={s1.mean_stars}     v2={s2.mean_stars}     u1={n1} u2={n2} />
                </div>
                <div>
                  <CompareBar label="TOTAL REPOS"    v1={s1.total_repos}    v2={s2.total_repos}    u1={n1} u2={n2} />
                  <CompareBar label="ORIGINAL REPOS" v1={s1.original_repos} v2={s2.original_repos} u1={n1} u2={n2} />
                  <CompareBar label="TOTAL ISSUES"   v1={s1.total_repos * s1.mean_forks / 10} v2={s2.total_repos * s2.mean_forks / 10} u1={n1} u2={n2} />
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20, fontFamily: 'Share Tech Mono, monospace', fontSize: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 3, background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }}/>
                  <span style={{ color: 'var(--cyan)' }}>@{n1}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 3, background: 'var(--orange)', boxShadow: '0 0 6px var(--orange)' }}/>
                  <span style={{ color: 'var(--orange)' }}>@{n2}</span>
                </div>
              </div>
            </Panel>
          </div>
        )
      })()}
    </div>
  )
}