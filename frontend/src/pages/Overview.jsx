import { useSearchParams } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import ErrorBox from '../components/ErrorBox'

function HealthRing({ pct }) {
  const r = 52, circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div style={{ position:'relative', width:140, height:140 }}>
      <svg width="140" height="140" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border2)" strokeWidth="8"/>
        <circle cx="70" cy="70" r={r} fill="none"
          stroke="var(--green)" strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter:'drop-shadow(0 0 8px var(--green))', transition:'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position:'absolute', inset:0,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          fontFamily:'Orbitron,monospace', fontSize:24,
          fontWeight:800, color:'var(--green)',
          textShadow:'0 0 20px var(--green)',
        }}>{pct}%</div>
        <div style={{
          fontFamily:'Share Tech Mono,monospace',
          fontSize:8, color:'var(--text2)', letterSpacing:2,
        }}>ACTIVE</div>
      </div>
    </div>
  )
}

function ArchetypeCard({ archetype }) {
  return (
    <div style={{
      background:'rgba(0,229,255,0.04)',
      border:'1px solid var(--cyan-dim)',
      padding:'20px', textAlign:'center',
      clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
    }}>
      <div style={{ fontSize:36, marginBottom:10 }}>{archetype.icon}</div>
      <div style={{
        fontFamily:'Orbitron,monospace', fontSize:13,
        fontWeight:700, color:'var(--cyan)',
        letterSpacing:3, marginBottom:8,
      }}>{archetype.type}</div>
      <div style={{
        fontFamily:'Share Tech Mono,monospace',
        fontSize:11, color:'var(--text)',
        lineHeight:1.6,
      }}>{archetype.desc}</div>
    </div>
  )
}

function LangTimeline({ timeline }) {
  const entries = Object.entries(timeline)
  return (
    <div style={{ display:'flex', gap:0 }}>
      {entries.map(([year, lang], i) => (
        <div key={year} style={{
          flex:1, textAlign:'center', padding:'12px 4px',
          borderLeft: i === 0 ? 'none' : '1px solid var(--border2)',
          background: i % 2 === 0 ? 'rgba(0,229,255,0.02)' : 'transparent',
        }}>
          <div style={{
            fontFamily:'Share Tech Mono,monospace',
            fontSize:9, color:'var(--text2)',
            letterSpacing:1, marginBottom:6,
          }}>{year}</div>
          <div style={{
            fontFamily:'Orbitron,monospace',
            fontSize:9, color:'var(--cyan)',
            fontWeight:600, letterSpacing:1,
          }}>{lang}</div>
        </div>
      ))}
    </div>
  )
}

export default function Overview() {
  const [params] = useSearchParams()
  const username = params.get('user')
  const { data, loading, error } = useProfile(username)

  if (!username) return <ErrorBox message="No username provided. Search for a user first." />
  if (loading)   return <Loader text={`SCANNING @${username}...`} />
  if (error)     return <ErrorBox message={error} />
  if (!data)     return null

  const { user, summary } = data
  const { stats, archetype, entropy, gini, active_count, language_timeline, languages } = summary

  const activePct = Math.round(active_count / stats.total_repos * 100) || 0

  return (
    <div style={{ padding:32, animation:'fadeIn 0.4s ease' }}>

      {/* Top bar label */}
      <div style={{
        fontFamily:'Share Tech Mono,monospace', fontSize:9,
        color:'var(--text2)', letterSpacing:4,
        marginBottom:20,
      }}>// OVERVIEW / @{user.login}</div>

      {/* Profile hero */}
      <div style={{
        display:'grid', gridTemplateColumns:'auto 1fr',
        gap:28, marginBottom:28,
        background:'var(--panel)',
        border:'1px solid var(--border2)',
        padding:24,
        clipPath:'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))',
      }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{
            position:'absolute', inset:-3,
            border:'1px solid var(--cyan)',
            clipPath:'polygon(8px 0%,100% 0%,100% calc(100% - 8px),calc(100% - 8px) 100%,0% 100%,0% 8px)',
          }}/>
          <img src={user.avatar_url} alt="avatar"
            style={{ width:88, height:88, display:'block',
              clipPath:'polygon(8px 0%,100% 0%,100% calc(100% - 8px),calc(100% - 8px) 100%,0% 100%,0% 8px)',
              filter:'saturate(0.85)',
            }}
          />
        </div>
        <div>
          <div style={{
            fontFamily:'Orbitron,monospace', fontSize:24,
            fontWeight:900, color:'var(--white)',
            marginBottom:4, lineHeight:1,
          }}>{user.name || user.login}</div>
          <div style={{
            fontFamily:'Share Tech Mono,monospace',
            fontSize:12, color:'var(--cyan)', marginBottom:10,
          }}>@{user.login}</div>
          {user.bio && <div style={{
            fontSize:14, color:'var(--text)',
            marginBottom:12, maxWidth:600,
            fontWeight:300, lineHeight:1.5,
          }}>{user.bio}</div>}
          <div style={{ display:'flex', flexWrap:'wrap', gap:20 }}>
            {[
              ['FOLLOWERS', user.followers],
              ['FOLLOWING', user.following],
              ['REPOS', user.public_repos],
              ['GISTS', user.public_gists],
            ].map(([k,v]) => (
              <div key={k} style={{ fontFamily:'Share Tech Mono,monospace', fontSize:11 }}>
                <span style={{ color:'var(--text2)', letterSpacing:2 }}>{k} </span>
                <span style={{ color:'var(--cyan)', fontWeight:700 }}>{v?.toLocaleString()}</span>
              </div>
            ))}
            {user.location && <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:11, color:'var(--text2)' }}>📡 {user.location}</div>}
            {user.company  && <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:11, color:'var(--text2)' }}>🏛 {user.company}</div>}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2, marginBottom:28, background:'var(--border2)' }}>
        <StatCard label="TOTAL STARS"    value={stats.total_stars_fmt} color="var(--yellow)" />
        <StatCard label="TOTAL FORKS"    value={stats.total_forks_fmt} color="var(--cyan)"   />
        <StatCard label="TOP LANGUAGE"   value={stats.top_language}    color="var(--green)"  />
        <StatCard label="ORIGINAL REPOS" value={stats.original_repos}  color="var(--orange)" />
      </div>

      {/* Second row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:20 }}>

        {/* Archetype */}
        <Panel title="// ARCHETYPE" badge="AI CLASSIFIED">
          <ArchetypeCard archetype={archetype} />
        </Panel>

        {/* Health ring */}
        <Panel title="// REPO HEALTH" badge="ACTIVITY SCORE">
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <HealthRing pct={activePct} />
            <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:10, color:'var(--text2)', textAlign:'center' }}>
              {active_count} / {stats.total_repos} REPOS ACTIVE IN LAST 365 DAYS
            </div>
            <div style={{ width:'100%' }}>
              {[
                ['ORIGINAL', stats.original_repos, 'var(--cyan)'],
                ['FORKED',   stats.forked_repos,   'var(--orange)'],
              ].map(([k,v,c]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontFamily:'Share Tech Mono,monospace', fontSize:10 }}>
                  <span style={{ color:'var(--text2)', letterSpacing:2 }}>{k}</span>
                  <span style={{ color:c, fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Academic */}
        <Panel title="// QUICK STATS" badge="DESCRIPTIVE">
          {[
            ['MEAN STARS',   stats.mean_stars,   'var(--yellow)'],
            ['MEDIAN STARS', stats.median_stars,  'var(--yellow)'],
            ['STD DEV (σ)',  stats.stdev_stars,   'var(--text)'],
            ['MEAN FORKS',   stats.mean_forks,    'var(--cyan)'],
            ['ENTROPY',      entropy.entropy,      'var(--green)'],
            ['GINI COEFF',   gini.gini,            'var(--orange)'],
          ].map(([k,v,c]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontFamily:'Share Tech Mono,monospace', fontSize:11 }}>
              <span style={{ color:'var(--text2)', letterSpacing:1 }}>{k}</span>
              <span style={{ color:c, fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </Panel>
      </div>

      {/* Language timeline */}
      {language_timeline && Object.keys(language_timeline).length > 0 && (
        <Panel title="// LANGUAGE EVOLUTION" badge={`${Object.keys(language_timeline).length} YEARS OF DATA`} style={{ marginBottom:20 }}>
          <LangTimeline timeline={language_timeline} />
        </Panel>
      )}

      {/* Language breakdown */}
      <Panel title="// LANGUAGE STACK" badge={`${languages.length} DETECTED`}>
        {languages.map(l => (
          <div key={l.language} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, fontFamily:'Share Tech Mono,monospace', fontSize:11 }}>
            <span style={{ color:'var(--white)', width:100, flexShrink:0 }}>{l.language}</span>
            <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
              <div style={{ width:l.percentage, height:'100%', background:'linear-gradient(90deg,var(--green),rgba(0,255,157,0.5))', boxShadow:'0 0 6px var(--green)' }}/>
            </div>
            <span style={{ color:'var(--green)', width:45, textAlign:'right' }}>{l.percentage}</span>
            <span style={{ color:'var(--text2)', width:40, textAlign:'right' }}>{l.count}r</span>
          </div>
        ))}
      </Panel>

    </div>
  )
}