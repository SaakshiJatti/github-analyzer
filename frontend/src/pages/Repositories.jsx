import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import Panel from '../components/Panel'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'

const SORT_OPTIONS = ['stars','forks','impact_score','open_issues','age_days']

function ImpactBar({ score }) {
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : score >= 20 ? 'var(--orange)' : 'var(--text2)'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:60, height:4, background:'rgba(255,255,255,0.05)', overflow:'hidden', flexShrink:0 }}>
        <div style={{ width:`${score}%`, height:'100%', background:color, boxShadow:`0 0 6px ${color}`, transition:'width 0.5s' }}/>
      </div>
      <span style={{ fontFamily:'Orbitron,monospace', fontSize:10, color, fontWeight:700 }}>{score}</span>
    </div>
  )
}

function Badge({ text, type = 'default' }) {
  const colors = {
    ADMIRED:    ['var(--yellow)',  'rgba(255,215,64,0.08)'],
    UTILISED:   ['var(--cyan)',    'rgba(0,229,255,0.08)'],
    COMMUNITY:  ['var(--green)',   'rgba(0,255,157,0.08)'],
    SOLO:       ['var(--text2)',   'rgba(255,255,255,0.04)'],
    MAINTAINED: ['var(--green)',   'rgba(0,255,157,0.08)'],
    THRIVING:   ['var(--cyan)',    'rgba(0,229,255,0.08)'],
    BACKLOGGED: ['var(--orange)',  'rgba(255,112,67,0.08)'],
    ABANDONED:  ['var(--red)',     'rgba(255,23,68,0.08)'],
  }
  const [color, bg] = colors[text] || ['var(--text2)', 'transparent']
  return (
    <span style={{
      fontFamily:'Share Tech Mono,monospace', fontSize:8,
      color, background:bg,
      border:`1px solid ${color}44`,
      padding:'2px 6px', letterSpacing:1,
      whiteSpace:'nowrap',
    }}>{text}</span>
  )
}

export default function Repositories() {
  const [params] = useSearchParams()
  const username = params.get('user')
  const { data, loading, error } = useProfile(username)
  const [sortBy,    setSortBy]    = useState('stars')
  const [sortDesc,  setSortDesc]  = useState(true)
  const [search,    setSearch]    = useState('')

  if (!username) return <ErrorBox message="No username provided." />
  if (loading)   return <Loader text="LOADING REPOSITORIES..." />
  if (error)     return <ErrorBox message={error} />
  if (!data)     return null

  const { summary } = data
  let repos = [...summary.repos]

  // Filter
  if (search) repos = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.language.toLowerCase().includes(search.toLowerCase())
  )

  // Sort
  repos.sort((a, b) => sortDesc ? (b[sortBy] - a[sortBy]) : (a[sortBy] - b[sortBy]))

  return (
    <div style={{ padding:32, animation:'fadeIn 0.4s ease' }}>
      <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--text2)', letterSpacing:4, marginBottom:20 }}>
        // REPOSITORIES / @{username} / {repos.length} ENTRIES
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="filter by name or language..."
          style={{
            flex:1, background:'var(--panel)',
            border:'1px solid var(--border2)', outline:'none',
            fontFamily:'Share Tech Mono,monospace',
            fontSize:11, color:'var(--white)',
            padding:'8px 14px', letterSpacing:1,
          }}
        />
        <div style={{ display:'flex', gap:6 }}>
          {SORT_OPTIONS.map(s => (
            <button key={s} onClick={() => { if (sortBy === s) setSortDesc(!sortDesc); else { setSortBy(s); setSortDesc(true) }}}
              style={{
                background: sortBy === s ? 'var(--cyan)' : 'var(--panel)',
                border:`1px solid ${sortBy === s ? 'var(--cyan)' : 'var(--border2)'}`,
                color: sortBy === s ? '#000' : 'var(--text2)',
                fontFamily:'Share Tech Mono,monospace',
                fontSize:9, padding:'6px 12px',
                cursor:'pointer', letterSpacing:2,
                display:'flex', alignItems:'center', gap:4,
              }}>
              {s.replace('_',' ').toUpperCase()}
              {sortBy === s && <span>{sortDesc ? '↓' : '↑'}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Panel title="// REPOSITORY MATRIX" badge={`SORTED BY ${sortBy.toUpperCase()}`}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['#','REPOSITORY','LANG','STARS','FORKS','IMPACT','CLASS','VELOCITY','DEBT','UPDATED'].map(h => (
                  <th key={h} style={{
                    fontFamily:'Share Tech Mono,monospace', fontSize:8,
                    color:'var(--text2)', letterSpacing:2,
                    textAlign:'left', padding:'8px 10px',
                    borderBottom:'1px solid var(--border2)',
                    background:'rgba(0,0,0,0.2)', whiteSpace:'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repos.map((repo, i) => (
                <tr key={repo.name}
                  onClick={() => window.open(repo.url, '_blank')}
                  style={{ borderBottom:'1px solid rgba(20,69,104,0.3)', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding:'12px 10px', fontFamily:'Orbitron,monospace', fontSize:10, color:'var(--text2)' }}>
                    {String(i+1).padStart(2,'0')}
                  </td>
                  <td style={{ padding:'12px 10px', maxWidth:180 }}>
                    <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:14, fontWeight:700, color:'var(--white)', marginBottom:2 }}>{repo.name}</div>
                    <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:170 }}>{repo.desc_short}</div>
                  </td>
                  <td style={{ padding:'12px 10px' }}>
                    <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--cyan)', background:'rgba(0,229,255,0.06)', border:'1px solid var(--cyan-dim)', padding:'2px 6px', whiteSpace:'nowrap' }}>
                      {repo.language}
                    </span>
                  </td>
                  <td style={{ padding:'12px 10px', fontFamily:'Share Tech Mono,monospace', fontSize:12, color:'var(--yellow)', whiteSpace:'nowrap' }}>
                    ★ {repo.stars_fmt}
                  </td>
                  <td style={{ padding:'12px 10px', fontFamily:'Share Tech Mono,monospace', fontSize:11, color:'var(--text2)', whiteSpace:'nowrap' }}>
                    ⑂ {repo.forks_fmt}
                  </td>
                  <td style={{ padding:'12px 10px' }}>
                    <ImpactBar score={repo.impact_score} />
                  </td>
                  <td style={{ padding:'12px 10px' }}>
                    <Badge text={repo.classification} />
                  </td>
                  <td style={{ padding:'12px 10px' }}>
                    <Badge text={repo.issue_velocity} />
                  </td>
                  <td style={{ padding:'12px 10px' }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:10, color: repo.tech_debt >= 7 ? 'var(--red)' : repo.tech_debt >= 4 ? 'var(--orange)' : 'var(--green)' }}>
                      {repo.tech_debt}/10
                    </div>
                  </td>
                  <td style={{ padding:'12px 10px', fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--text2)', whiteSpace:'nowrap' }}>
                    {repo.updated_fmt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}