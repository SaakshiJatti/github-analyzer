import { useSearchParams } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import Panel from '../components/Panel'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'

// ── Lorenz Curve ──────────────────────────────────────────────────────────────
function LorenzCurve({ points, gini }) {
  if (!points || points.length === 0) return null
  const equality = [{ x: 0, y: 0 }, { x: 100, y: 100 }]

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
          <XAxis
            dataKey="x" type="number" domain={[0, 100]}
            tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }}
            label={{ value: 'cumulative % of repos', position: 'insideBottom', offset: -10, fill: '#6a9bb5', fontSize: 9, fontFamily: 'Share Tech Mono' }}
          />
          <YAxis
            type="number" domain={[0, 100]}
            tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }}
            label={{ value: 'cumulative % of stars', angle: -90, position: 'insideLeft', fill: '#6a9bb5', fontSize: 9, fontFamily: 'Share Tech Mono' }}
          />
          <Tooltip
            contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
            formatter={(v) => [`${v}%`]}
          />
          {/* Perfect equality line */}
          <Line
            data={equality} dataKey="y"
            stroke="#144568" strokeWidth={1}
            strokeDasharray="4 4" dot={false}
            name="perfect equality"
          />
          {/* Lorenz curve */}
          <Line
            data={points} dataKey="y"
            stroke="#00e5ff" strokeWidth={2}
            dot={false} name="actual distribution"
            style={{ filter: 'drop-shadow(0 0 4px #00e5ff)' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 24,
        fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
        color: 'var(--text2)', marginTop: 8,
      }}>
        <span><span style={{ color: '#144568' }}>── </span>perfect equality</span>
        <span><span style={{ color: 'var(--cyan)' }}>── </span>actual distribution</span>
      </div>
    </div>
  )
}

// ── Entropy Gauge ─────────────────────────────────────────────────────────────
function EntropyGauge({ entropy }) {
  const { entropy: val, max_entropy, normalised, label, languages } = entropy
  const pct = Math.round(normalised * 100)
  const color = pct > 66 ? 'var(--green)' : pct > 33 ? 'var(--yellow)' : 'var(--orange)'

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Big number */}
      <div style={{
        fontFamily: 'Orbitron, monospace', fontSize: 52,
        fontWeight: 900, color,
        textShadow: `0 0 30px ${color}`,
        lineHeight: 1, marginBottom: 8,
      }}>{val}</div>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 9, color: 'var(--text2)',
        letterSpacing: 3, marginBottom: 20,
      }}>SHANNON ENTROPY (bits)</div>

      {/* Progress bar */}
      <div style={{
        height: 6, background: 'rgba(255,255,255,0.05)',
        marginBottom: 8, position: 'relative',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 8px ${color}`,
          transition: 'width 1s ease',
        }}/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)' }}>0 (MONO)</span>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)' }}>{max_entropy} (MAX)</span>
      </div>

      {/* Label */}
      <div style={{
        display: 'inline-block',
        background: `${color}15`,
        border: `1px solid ${color}66`,
        padding: '8px 24px',
        fontFamily: 'Orbitron, monospace',
        fontSize: 13, fontWeight: 700, color,
        letterSpacing: 4, marginBottom: 20,
      }}>{label}</div>

      {/* Details */}
      {[
        ['LANGUAGES DETECTED', languages],
        ['NORMALISED ENTROPY', `${(normalised * 100).toFixed(1)}%`],
        ['MAX POSSIBLE ENTROPY', max_entropy],
      ].map(([k, v]) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          fontFamily: 'Share Tech Mono, monospace', fontSize: 11,
        }}>
          <span style={{ color: 'var(--text2)', letterSpacing: 1 }}>{k}</span>
          <span style={{ color, fontWeight: 700 }}>{v}</span>
        </div>
      ))}

      {/* Formula */}
      <div style={{
        marginTop: 16, padding: 12,
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border2)',
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 10, color: 'var(--text2)',
        lineHeight: 1.8, textAlign: 'left',
      }}>
        <div style={{ color: 'var(--cyan)', marginBottom: 4 }}>// FORMULA</div>
        <div>H = -Σ p(x) · log₂(p(x))</div>
        <div>where p(x) = lang_repos / total_repos</div>
      </div>
    </div>
  )
}

// ── Gini Panel ────────────────────────────────────────────────────────────────
function GiniPanel({ gini, lorenz }) {
  const { gini: val, label } = gini
  const color = val > 0.7 ? 'var(--red)' : val > 0.4 ? 'var(--orange)' : 'var(--green)'

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          fontFamily: 'Orbitron, monospace', fontSize: 52,
          fontWeight: 900, color,
          textShadow: `0 0 30px ${color}`,
          lineHeight: 1, marginBottom: 8,
        }}>{val}</div>
        <div style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: 9, color: 'var(--text2)',
          letterSpacing: 3, marginBottom: 12,
        }}>GINI COEFFICIENT</div>
        <div style={{
          display: 'inline-block',
          background: `${color}15`,
          border: `1px solid ${color}66`,
          padding: '6px 20px',
          fontFamily: 'Orbitron, monospace',
          fontSize: 12, fontWeight: 700, color,
          letterSpacing: 3,
        }}>{label}</div>
      </div>

      {/* Scale */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 8, background: 'linear-gradient(90deg, var(--green), var(--yellow), var(--orange), var(--red))', marginBottom: 6, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -2, bottom: -2,
            left: `${val * 100}%`,
            width: 3, background: 'var(--white)',
            boxShadow: '0 0 8px white',
            transform: 'translateX(-50%)',
            transition: 'left 1s ease',
          }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)' }}>
          <span>0 EQUAL</span>
          <span>0.3 BALANCED</span>
          <span>0.6 SKEWED</span>
          <span>1.0 MONOPOLY</span>
        </div>
      </div>

      {/* Formula */}
      <div style={{
        padding: 12, background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border2)',
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 10, color: 'var(--text2)',
        lineHeight: 1.8, marginBottom: 16,
      }}>
        <div style={{ color: 'var(--cyan)', marginBottom: 4 }}>// FORMULA</div>
        <div>G = (2·Σ(i·yᵢ)) / (n·Σyᵢ) - (n+1)/n</div>
        <div>where yᵢ = star count of repo i (sorted asc)</div>
      </div>

      {/* Lorenz curve */}
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--cyan)', letterSpacing: 3, marginBottom: 12 }}>// LORENZ CURVE</div>
      <LorenzCurve points={lorenz} gini={val} />
    </div>
  )
}

// ── Tech Debt Chart ───────────────────────────────────────────────────────────
function TechDebtChart({ repos }) {
  const data = repos
    .slice(0, 15)
    .map(r => ({ name: r.name, debt: r.tech_debt, stars: r.stars }))
    .sort((a, b) => b.debt - a.debt)

  return (
    <div>
      {data.map((r, i) => {
        const color = r.debt >= 7 ? 'var(--red)' : r.debt >= 4 ? 'var(--orange)' : 'var(--green)'
        return (
          <div key={r.name} style={{ marginBottom: 12 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 10, marginBottom: 4,
            }}>
              <span style={{ color: 'var(--white)' }}>{r.name}</span>
              <span style={{ color }}>DEBT {r.debt}/10</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <div style={{
                width: `${r.debt * 10}%`, height: '100%',
                background: `linear-gradient(90deg, ${color}, ${color}88)`,
                boxShadow: `0 0 6px ${color}`,
                transition: 'width 0.8s ease',
              }}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Star vs Forks scatter ─────────────────────────────────────────────────────
function StarForkScatter({ repos }) {
  const data = repos.map(r => ({
    name: r.name,
    stars: r.stars,
    forks: r.forks,
    impact: r.impact_score,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontFamily: 'Share Tech Mono', fontSize: 8, fill: '#6a9bb5' }}
          angle={-30} textAnchor="end"
        />
        <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 8, fill: '#6a9bb5' }}/>
        <Tooltip
          contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
        />
        <Area dataKey="stars" stroke="var(--yellow)" fill="rgba(255,215,64,0.08)"
          strokeWidth={2} name="stars"
          style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,64,0.4))' }}
        />
        <Area dataKey="forks" stroke="var(--cyan)" fill="rgba(0,229,255,0.05)"
          strokeWidth={1.5} name="forks"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Intelligence() {
  const [params]  = useSearchParams()
  const username  = params.get('user')
  const { data, loading, error } = useProfile(username)

  if (!username) return <ErrorBox message="No username provided." />
  if (loading)   return <Loader text="COMPUTING INTELLIGENCE..." />
  if (error)     return <ErrorBox message={error} />
  if (!data)     return null

  const { summary } = data
  const { entropy, gini, lorenz, repos, stats } = summary

  return (
    <div style={{ padding: 32, animation: 'fadeIn 0.4s ease' }}>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
        color: 'var(--text2)', letterSpacing: 4, marginBottom: 20,
      }}>// INTELLIGENCE / @{username} / ACADEMIC ANALYSIS</div>

      {/* Info banner */}
      <div style={{
        background: 'rgba(0,229,255,0.04)',
        border: '1px solid var(--cyan-dim)',
        padding: '12px 20px', marginBottom: 24,
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 10, color: 'var(--text2)',
        lineHeight: 1.8,
      }}>
        <span style={{ color: 'var(--cyan)' }}>// NOTE </span>
        This page applies information theory and economic inequality metrics to GitHub repository data.
        Shannon Entropy measures language diversity. Gini Coefficient measures star distribution inequality.
        The Lorenz Curve visualises cumulative distribution. Tech Debt estimates maintenance burden.
      </div>

      {/* Top row — Entropy + Gini */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Panel title="// SHANNON ENTROPY" badge="INFORMATION THEORY">
          <EntropyGauge entropy={entropy} />
        </Panel>
        <Panel title="// GINI COEFFICIENT + LORENZ CURVE" badge="INEQUALITY ANALYSIS">
          <GiniPanel gini={gini} lorenz={lorenz} />
        </Panel>
      </div>

      {/* Bottom row — Tech Debt + Star/Fork area chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel title="// TECHNICAL DEBT SCORES" badge="RISK ASSESSMENT">
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
            color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8,
          }}>
            <span style={{ color: 'var(--cyan)' }}>// FORMULA: </span>
            debt = issue_penalty + size_penalty + age_penalty + fork_gap_penalty (max 10)
          </div>
          <TechDebtChart repos={repos} />
          <div style={{
            display: 'flex', gap: 16, marginTop: 16,
            fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
          }}>
            {[
              ['0-3', 'LOW RISK',  'var(--green)'],
              ['4-6', 'MODERATE',  'var(--orange)'],
              ['7+',  'HIGH RISK', 'var(--red)'],
            ].map(([range, label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, background: color }}/>
                <span style={{ color: 'var(--text2)' }}>{range} {label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="// STARS vs FORKS DISTRIBUTION" badge="ENGAGEMENT ANALYSIS">
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
            color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8,
          }}>
            <span style={{ color: 'var(--cyan)' }}>// INSIGHT: </span>
            High stars/low forks = admired but not forked. High forks/low stars = heavily used as template.
          </div>
          <StarForkScatter repos={repos} />

          {/* Summary stats */}
          <div style={{ marginTop: 16 }}>
            {[
              ['MEAN STARS',   stats.mean_stars,    'var(--yellow)'],
              ['MEAN FORKS',   stats.mean_forks,    'var(--cyan)'],
              ['MEDIAN STARS', stats.median_stars,  'var(--yellow)'],
              ['STD DEV (σ)',  stats.stdev_stars,   'var(--text)'],
            ].map(([k, v, c]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
              }}>
                <span style={{ color: 'var(--text2)', letterSpacing: 1 }}>{k}</span>
                <span style={{ color: c, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}