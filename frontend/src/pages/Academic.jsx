import { useSearchParams } from 'react-router-dom'
import { useAcademic } from '../hooks/useAcademic'
import Panel from '../components/Panel'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend
} from 'recharts'

// ── Zipf Curve ────────────────────────────────────────────────────────────────
function ZipfChart({ zipf }) {
  const { points, r_squared, exponent, fits_zipf } = zipf
  if (!points.length) return <div style={{ color: 'var(--text2)', fontFamily: 'Share Tech Mono, monospace', fontSize: 11 }}>Insufficient data for Zipf analysis.</div>

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[
          ['R² FIT',    r_squared,         r_squared > 0.85 ? 'var(--green)' : 'var(--orange)'],
          ['EXPONENT',  exponent,           'var(--cyan)'],
          ['VERDICT',   fits_zipf ? 'FITS ✓' : 'DEVIATES ✗', fits_zipf ? 'var(--green)' : 'var(--red)'],
        ].map(([k, v, c]) => (
          <div key={k} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border2)', padding: '10px 14px' }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 2, marginBottom: 4 }}>{k}</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={points} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <XAxis dataKey="rank" tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }} label={{ value: 'rank', position: 'insideBottom', offset: -5, fill: '#6a9bb5', fontSize: 9 }}/>
          <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }}/>
          <Tooltip contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
            formatter={(v, n) => [v.toLocaleString(), n]}
            labelFormatter={l => `Rank #${l}`}
          />
          <Legend wrapperStyle={{ fontFamily: 'Share Tech Mono', fontSize: 9 }}/>
          <Line dataKey="actual"      stroke="var(--cyan)"   strokeWidth={2} dot={{ r: 3, fill: 'var(--cyan)' }}   name="actual stars"/>
          <Line dataKey="theoretical" stroke="var(--orange)" strokeWidth={1} dot={false} strokeDasharray="4 4"     name="zipf prediction"/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 8, lineHeight: 1.8 }}>
        <span style={{ color: 'var(--cyan)' }}>// ZIPF'S LAW: </span>
        The nth most popular repo should have 1/n the stars of the most popular. R²={r_squared} means the fit explains {Math.round(r_squared * 100)}% of the variance.
      </div>
    </div>
  )
}

// ── Benford Chart ─────────────────────────────────────────────────────────────
function BenfordChart({ benford }) {
  const { points, chi2, p_value, follows_benford, sample_size } = benford
  if (!points.length) return null

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[
          ['χ² STATISTIC', chi2,            'var(--yellow)'],
          ['P-VALUE',       p_value,         p_value > 0.05 ? 'var(--green)' : 'var(--red)'],
          ['VERDICT',       follows_benford ? 'NATURAL ✓' : 'ANOMALOUS ✗', follows_benford ? 'var(--green)' : 'var(--red)'],
          ['SAMPLE SIZE',   sample_size,     'var(--cyan)'],
        ].map(([k, v, c]) => (
          <div key={k} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border2)', padding: '10px 12px' }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 2, marginBottom: 4 }}>{k}</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={points} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <XAxis dataKey="digit" tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }} label={{ value: 'leading digit', position: 'insideBottom', offset: -5, fill: '#6a9bb5', fontSize: 9 }}/>
          <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#6a9bb5', fontSize: 9 }}/>
          <Tooltip contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
            formatter={(v, n) => [`${v}%`, n]}
          />
          <Legend wrapperStyle={{ fontFamily: 'Share Tech Mono', fontSize: 9 }}/>
          <Bar dataKey="observed" fill="var(--cyan)"   fillOpacity={0.8} name="observed %"/>
          <Bar dataKey="expected" fill="var(--orange)" fillOpacity={0.6} name="benford expected %"/>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 8, lineHeight: 1.8 }}>
        <span style={{ color: 'var(--cyan)' }}>// BENFORD'S LAW: </span>
        In naturally occurring data, ~30% of numbers start with 1. p={p_value} — {p_value > 0.05 ? 'data appears organic (p > 0.05)' : 'possible anomaly detected (p ≤ 0.05)'}.
      </div>
    </div>
  )
}

// ── Pearson Heatmap ───────────────────────────────────────────────────────────
function PearsonHeatmap({ pearson }) {
  const { matrix, labels } = pearson
  const getColor = (v) => {
    if (v >= 0.7)  return { bg: 'rgba(0,229,255,0.6)',   text: '#000' }
    if (v >= 0.3)  return { bg: 'rgba(0,229,255,0.3)',   text: 'var(--white)' }
    if (v >= 0)    return { bg: 'rgba(0,229,255,0.08)',  text: 'var(--text)' }
    if (v >= -0.3) return { bg: 'rgba(255,112,67,0.15)', text: 'var(--text)' }
    return              { bg: 'rgba(255,112,67,0.5)',   text: '#000' }
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 60 }}/>
              {labels.map(l => (
                <th key={l} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', letterSpacing: 2, padding: '6px 8px', textAlign: 'center', fontWeight: 400 }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={row.label}>
                <td style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', padding: '4px 8px', letterSpacing: 2 }}>{row.label}</td>
                {row.values.map((val, j) => {
                  const { bg, text } = getColor(val)
                  return (
                    <td key={j} style={{
                      background: bg, color: text,
                      fontFamily: 'Orbitron, monospace', fontSize: 10, fontWeight: 600,
                      padding: '10px 8px', textAlign: 'center',
                      border: '1px solid var(--bg)',
                      transition: 'all 0.2s',
                    }}>{val.toFixed(2)}</td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)' }}>
        {[['STRONG +', 'rgba(0,229,255,0.6)'], ['WEAK +', 'rgba(0,229,255,0.2)'], ['NEUTRAL', 'rgba(255,255,255,0.05)'], ['WEAK −', 'rgba(255,112,67,0.2)'], ['STRONG −', 'rgba(255,112,67,0.5)']].map(([l, bg]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, background: bg, display: 'inline-block' }}/>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Z-Score table ─────────────────────────────────────────────────────────────
function ZScoreTable({ zscores }) {
  const labelColor = {
    VIRAL:      'var(--green)',
    'ABOVE AVG': 'var(--cyan)',
    NORMAL:     'var(--text)',
    'BELOW AVG': 'var(--text2)',
  }
  return (
    <div>
      {zscores.map(r => (
        <div key={r.name} style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto auto',
          gap: 12, padding: '8px 0',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: r.outlier ? 'var(--white)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--yellow)', whiteSpace: 'nowrap' }}>★ {r.stars.toLocaleString()}</span>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: r.z_score > 0 ? 'var(--cyan)' : 'var(--text2)', whiteSpace: 'nowrap' }}>z={r.z_score > 0 ? '+' : ''}{r.z_score}</span>
          <span style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
            color: labelColor[r.label] || 'var(--text2)',
            background: `${labelColor[r.label] || 'var(--text2)'}15`,
            border: `1px solid ${labelColor[r.label] || 'var(--text2)'}44`,
            padding: '2px 8px', whiteSpace: 'nowrap',
          }}>{r.label}</span>
        </div>
      ))}
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 12, lineHeight: 1.8 }}>
        <span style={{ color: 'var(--cyan)' }}>// Z-SCORE: </span>
        Measures how many standard deviations a repo's stars are from the mean. |z| &gt; 2 = statistical outlier (VIRAL).
      </div>
    </div>
  )
}

// ── Kolmogorov table ──────────────────────────────────────────────────────────
function KolmogorovTable({ data }) {
  const labelColor = { TRIVIAL: 'var(--text2)', SIMPLE: 'var(--cyan2)', MODERATE: 'var(--cyan)', COMPLEX: 'var(--yellow)', ARCANE: 'var(--red)' }
  return (
    <div>
      {data.slice(0, 10).map(r => (
        <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{r.name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)' }}>DESC:{r.desc_len}ch</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)' }}>TOPICS:{r.topics}</span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)' }}>SIZE:{r.size_kb}kb</span>
            </div>
          </div>
          <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ width: `${r.complexity}%`, height: '100%', background: labelColor[r.label], boxShadow: `0 0 4px ${labelColor[r.label]}` }}/>
          </div>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: labelColor[r.label], background: `${labelColor[r.label]}15`, border: `1px solid ${labelColor[r.label]}44`, padding: '2px 8px', whiteSpace: 'nowrap' }}>{r.label}</span>
        </div>
      ))}
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 12, lineHeight: 1.8 }}>
        <span style={{ color: 'var(--cyan)' }}>// KOLMOGOROV PROXY: </span>
        Estimates conceptual complexity using description richness, topic breadth, codebase size, and issue depth as information density signals.
      </div>
    </div>
  )
}

// ── Cohort chart ──────────────────────────────────────────────────────────────
function CohortChart({ cohorts }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={cohorts} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <XAxis dataKey="year" tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }}/>
        <YAxis tick={{ fontFamily: 'Share Tech Mono', fontSize: 9, fill: '#6a9bb5' }}/>
        <Tooltip contentStyle={{ background: '#0a1e2e', border: '1px solid #144568', fontFamily: 'Share Tech Mono', fontSize: 10 }}
          formatter={(v, n) => [v.toLocaleString(), n]}
        />
        <Bar dataKey="avg_stars" name="avg stars" radius={0}>
          {cohorts.map((c, i) => (
            <Cell key={i} fill={i === cohorts.length - 1 ? 'var(--cyan)' : 'rgba(0,229,255,0.3)'}/>
          ))}
        </Bar>
        <Bar dataKey="count" name="repo count" fill="rgba(255,215,64,0.3)"/>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Cluster view ──────────────────────────────────────────────────────────────
function ClusterView({ clusters }) {
  const colors = { ALPHA: 'var(--cyan)', BETA: 'var(--green)', GAMMA: 'var(--orange)' }
  const groups = {}
  clusters.forEach(r => {
    if (!groups[r.cluster]) groups[r.cluster] = []
    groups[r.cluster].push(r)
  })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {Object.entries(groups).map(([cluster, repos]) => (
        <div key={cluster} style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${colors[cluster]}44`, padding: 14 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, fontWeight: 700, color: colors[cluster], letterSpacing: 3, marginBottom: 12 }}>
            CLUSTER {cluster}
          </div>
          {repos.map(r => (
            <div key={r.name} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text)', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'var(--white)' }}>{r.name}</span>
              <span style={{ float: 'right', color: 'var(--text2)' }}>★{r.stars.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 8 }}>
            avg ★ {Math.round(repos.reduce((s, r) => s + r.stars, 0) / repos.length).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Academic() {
  const [params]  = useSearchParams()
  const username  = params.get('user')
  const { data, loading, error } = useAcademic(username)

  if (!username) return <ErrorBox message="No username provided." />
  if (loading)   return <Loader text="RUNNING ACADEMIC ANALYSIS..." />
  if (error)     return <ErrorBox message={error} />
  if (!data)     return null

  const { zipf, benford, kolmogorov, zscores, clusters, pearson, cohorts } = data

  return (
    <div style={{ padding: 32, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', letterSpacing: 4, marginBottom: 20 }}>
        // ACADEMIC / @{username} / MATHEMATICAL ANALYSIS
      </div>

      {/* Info banner */}
      <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid var(--cyan-dim)', padding: '12px 20px', marginBottom: 24, fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)', lineHeight: 1.8 }}>
        <span style={{ color: 'var(--cyan)' }}>// METHODOLOGY </span>
        Applies Zipf's Power Law, Benford's Law (χ² test), Kolmogorov Complexity proxies, Z-score outlier detection, K-Means clustering, Pearson correlation, and cohort analysis to repository data.
      </div>

      {/* Row 1: Zipf + Benford */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Panel title="// ZIPF'S LAW" badge="POWER LAW DISTRIBUTION">
          <ZipfChart zipf={zipf} />
        </Panel>
        <Panel title="// BENFORD'S LAW" badge="χ² GOODNESS OF FIT">
          <BenfordChart benford={benford} />
        </Panel>
      </div>

      {/* Row 2: Z-Score + Kolmogorov */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Panel title="// Z-SCORE OUTLIER DETECTION" badge="σ DEVIATION ANALYSIS">
          <ZScoreTable zscores={zscores} />
        </Panel>
        <Panel title="// KOLMOGOROV COMPLEXITY" badge="INFORMATION DENSITY">
          <KolmogorovTable data={kolmogorov} />
        </Panel>
      </div>

      {/* Row 3: Pearson full width */}
      <Panel title="// PEARSON CORRELATION MATRIX" badge="LINEAR RELATIONSHIPS" style={{ marginBottom: 20 }}>
        <PearsonHeatmap pearson={pearson} />
      </Panel>

      {/* Row 4: Clusters + Cohorts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel title="// K-MEANS CLUSTERS" badge="k=3 PURE NUMPY">
          <ClusterView clusters={clusters} />
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 12, lineHeight: 1.8 }}>
            <span style={{ color: 'var(--cyan)' }}>// METHOD: </span>
            K-Means on [stars, forks, size, issues] — normalized, 50 iterations, seed=42.
          </div>
        </Panel>
        <Panel title="// COHORT ANALYSIS" badge="REPOS BY CREATION YEAR">
          <CohortChart cohorts={cohorts} />
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 12, lineHeight: 1.8 }}>
            <span style={{ color: 'var(--cyan)' }}>// INSIGHT: </span>
            Are newer repos outperforming older ones? Each bar = avg stars for repos created that year.
          </div>
        </Panel>
      </div>
    </div>
  )
}