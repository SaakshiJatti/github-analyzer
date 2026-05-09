import { useSearchParams } from 'react-router-dom'
import { usePredict } from '../hooks/usePredict'
import Panel from '../components/Panel'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
  Legend, Cell, BarChart
} from 'recharts'

// ── Forecast chart for one repo ───────────────────────────────────────────────
function VelocityForecast({ repo }) {
  const trendColor = {
    'RAPIDLY GROWING':   'var(--green)',
    'GROWING':           'var(--cyan)',
    'STABLE':            'var(--yellow)',
    'DECLINING':         'var(--orange)',
    'RAPIDLY DECLINING': 'var(--red)',
  }[repo.trend] || 'var(--text)'

  // Combine recent + forecast into one timeline
  const chartData = [
    ...repo.recent.map((v, i) => ({ week: `W${i + 1}`, actual: v, forecast: null })),
    ...repo.forecast.map((v, i) => ({ week: `F${i + 1}`, actual: null, forecast: v })),
  ]

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>{repo.repo}</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: trendColor, background: `${trendColor}15`, border: `1px solid ${trendColor}44`, padding: '3px 10px' }}>{repo.trend}</span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)' }}>R²={repo.r_squared}</span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: repo.slope > 0 ? 'var(--green)' : 'var(--red)' }}>slope={repo.slope > 0 ? '+' : ''}{repo.slope}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <XAxis dataKey="week" tick={{ fontFamily: 'Share Tech Mono', fontSize: 8, fill: '#6a9bb5' }}/>
          <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 8, fill: '#6a9bb5' }}/>
          <Tooltip contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}/>
          <ReferenceLine x={`W${repo.recent.length}`} stroke="var(--border)" strokeDasharray="4 4"/>
          <Bar  dataKey="actual"   fill="rgba(0,229,255,0.3)" name="actual commits"/>
          <Line dataKey="forecast" stroke={trendColor} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: trendColor }} name="forecast" connectNulls={false}/>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Star projections ──────────────────────────────────────────────────────────
function StarProjections({ projections }) {
  return (
    <div>
      {projections.map(repo => (
        <div key={repo.name} style={{ marginBottom: 16, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border2)', padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{repo.name}</span>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--yellow)' }}>
              ★ {repo.current.toLocaleString()} now · +{repo.stars_per_day}/day
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              ['30 DAYS',  repo.projections['30d'],  'var(--cyan)'],
              ['90 DAYS',  repo.projections['90d'],  'var(--green)'],
              ['1 YEAR',   repo.projections['365d'], 'var(--yellow)'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: 'center', background: `${color}08`, border: `1px solid ${color}33`, padding: '8px 4px' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, color }}>{val.toLocaleString()}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 2, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Cohort trend ──────────────────────────────────────────────────────────────
function CohortTrend({ trend, direction, r2 }) {
  const dirColor = direction === 'IMPROVING' ? 'var(--green)' : direction === 'DECLINING' ? 'var(--red)' : 'var(--text2)'
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[
          ['TRAJECTORY', direction, dirColor],
          ['R² FIT',     r2,        'var(--cyan)'],
        ].map(([k, v, c]) => (
          <div key={k} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border2)', padding: '10px 14px' }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 2, marginBottom: 4 }}>{k}</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={trend} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="cohortGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={dirColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={dirColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="year" tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }}/>
          <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }}/>
          <Tooltip contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }} formatter={(v) => [v.toLocaleString(), 'avg stars']}/>
          <Area dataKey="avg_stars" stroke={dirColor} fill="url(#cohortGrad)" strokeWidth={2} dot={{ r: 4, fill: dirColor }} name="avg stars per cohort"/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Trajectory gauge ──────────────────────────────────────────────────────────
function TrajectoryGauge({ score, label }) {
  const color = score > 70 ? 'var(--green)' : score > 40 ? 'var(--cyan)' : score > 20 ? 'var(--yellow)' : 'var(--text2)'
  const r = 52, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border2)" strokeWidth="8"/>
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 24, fontWeight: 800, color, textShadow: `0 0 20px ${color}` }}>{score}</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 7, color: 'var(--text2)', letterSpacing: 2 }}>/ 100</div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 900, color, letterSpacing: 3, marginBottom: 8 }}>{label}</div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)', lineHeight: 2 }}>
          <div>STARS WEIGHT   <span style={{ color }}>40%</span></div>
          <div>ACTIVITY WEIGHT <span style={{ color }}>30%</span></div>
          <div>FORKS WEIGHT   <span style={{ color }}>30%</span></div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Predict() {
  const [params]  = useSearchParams()
  const username  = params.get('user')
  const { data, loading, error } = usePredict(username)

  if (!username) return <ErrorBox message="No username provided." />
  if (loading)   return <Loader text="COMPUTING PREDICTIONS..." />
  if (error)     return <ErrorBox message={error} />
  if (!data)     return null

  const { velocity_forecasts, star_projections, cohort_trend, cohort_direction, cohort_r2, trajectory_score, trajectory_label } = data

  return (
    <div style={{ padding: 32, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', letterSpacing: 4, marginBottom: 20 }}>
        // PREDICT / @{username} / FORECASTING ENGINE
      </div>

      <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid var(--cyan-dim)', padding: '12px 20px', marginBottom: 24, fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)', lineHeight: 1.8 }}>
        <span style={{ color: 'var(--cyan)' }}>// DISCLAIMER </span>
        Forecasts use linear regression on commit velocity data. R² indicates model fit quality. Projections assume constant growth rate. Not financial advice.
      </div>

      {/* Trajectory gauge */}
      <Panel title="// DEVELOPER TRAJECTORY SCORE" badge="COMPOSITE MOMENTUM" style={{ marginBottom: 20 }}>
        <TrajectoryGauge score={trajectory_score} label={trajectory_label} />
      </Panel>

      {/* Commit velocity forecasts */}
      <Panel title="// COMMIT VELOCITY FORECAST" badge="LINEAR REGRESSION · 8-WEEK HORIZON" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8 }}>
          <span style={{ color: 'var(--cyan)' }}>// METHOD: </span>
          Bars = actual weekly commits. Dashed line = OLS linear regression forecast. Slope indicates trend direction.
        </div>
        {velocity_forecasts.length === 0
          ? <div style={{ textAlign: 'center', padding: 40, fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'var(--text2)' }}>GitHub may still be computing stats. Try again in a few seconds.</div>
          : velocity_forecasts.map(r => <VelocityForecast key={r.repo} repo={r} />)
        }
      </Panel>

      {/* Star projections + cohort trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel title="// STAR GROWTH PROJECTIONS" badge="LINEAR EXTRAPOLATION">
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8 }}>
            <span style={{ color: 'var(--cyan)' }}>// FORMULA: </span>
            projected = current + (stars/age_days) × horizon_days. Assumes constant growth rate.
          </div>
          <StarProjections projections={star_projections} />
        </Panel>
        <Panel title="// COHORT PERFORMANCE TREND" badge="YEAR-OVER-YEAR">
          <CohortTrend trend={cohort_trend} direction={cohort_direction} r2={cohort_r2} />
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 12, lineHeight: 1.8 }}>
            <span style={{ color: 'var(--cyan)' }}>// INSIGHT: </span>
            Each point = average stars of repos created that year. {cohort_direction === 'IMPROVING' ? 'Recent repos are outperforming older ones.' : 'Older repos still dominate by average stars.'}
          </div>
        </Panel>
      </div>
    </div>
  )
}