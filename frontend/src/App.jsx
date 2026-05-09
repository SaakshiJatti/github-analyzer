import { Routes, Route, NavLink, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home         from './pages/Home'
import Overview     from './pages/Overview'
import Repositories from './pages/Repositories'
import Intelligence from './pages/Intelligence'
import DeepDive     from './pages/DeepDive'
import Compare      from './pages/Compare'
import Academic     from './pages/Academic'
import Predict      from './pages/Predict'
import AIPage       from './pages/AIPage'

const NAV = [
  { to: '/overview',      icon: '◈', label: 'OVERVIEW'      },
  { to: '/repositories',  icon: '◫', label: 'REPOSITORIES'  },
  { to: '/intelligence',  icon: '◉', label: 'INTELLIGENCE'  },
  { to: '/deepdive',      icon: '◎', label: 'DEEP DIVE'     },
  { to: '/academic',      icon: '∑', label: 'ACADEMIC'      },
  { to: '/predict',       icon: '◌', label: 'PREDICT'       },
  { to: '/ai',            icon: '⬡', label: 'AI ANALYSIS'   },
  { to: '/compare',       icon: '⊗', label: 'COMPARE'       },
]

function Sidebar({ username }) {
  const [input, setInput] = useState('')
  const navigate = useNavigate()

  // Recent searches
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ghxa_recent') || '[]') }
    catch { return [] }
  })

  // Dark mode
  const [dark, setDark] = useState(true)
  // Replace the dark mode useEffect entirely with this:
  useEffect(() => {
    if (dark) {
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
    }
  }, [dark])

  const go = (u) => {
    const val = (u || input).trim()
    if (!val) return
    // Save to recent
    const updated = [val, ...recent.filter(r => r !== val)].slice(0, 5)
    setRecent(updated)
    localStorage.setItem('ghxa_recent', JSON.stringify(updated))
    navigate(`/overview?user=${val}`)
  }

  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border2)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 100, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border2)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 900, color: 'var(--cyan)', letterSpacing: 6, textShadow: '0 0 30px rgba(0,229,255,0.6)', marginBottom: 4 }}>GHXA</div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 3 }}>INTELLIGENCE v3.0</div>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 16px 10px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 3, marginBottom: 8 }}>// TARGET</div>
        <div style={{ border: '1px solid var(--border2)', background: 'var(--bg3)', display: 'flex', flexDirection: 'column', gap: 6, padding: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="username..."
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: 'var(--white)', letterSpacing: 1 }}
          />
          <button onClick={() => go()} style={{ background: 'var(--cyan)', border: 'none', color: '#000', fontFamily: 'Orbitron, monospace', fontSize: 9, fontWeight: 700, padding: '6px 0', cursor: 'pointer', letterSpacing: 3, width: '100%' }}>SCAN</button>
        </div>
        {username && (
          <div style={{ marginTop: 8, padding: '5px 8px', background: 'rgba(0,229,255,0.06)', border: '1px solid var(--cyan-dim)', fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--cyan)', letterSpacing: 1 }}>
            ▶ @{username}
          </div>
        )}
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 3, marginBottom: 6 }}>// RECENT</div>
          {recent.map(r => (
            <button key={r} onClick={() => go(r)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'transparent', border: 'none',
              fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
              color: 'var(--text2)', padding: '4px 6px',
              cursor: 'pointer', letterSpacing: 1,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--cyan)'}
              onMouseLeave={e => e.target.style.color = 'var(--text2)'}
            >◂ @{r}</button>
          ))}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 0' }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'var(--text2)', letterSpacing: 3, padding: '6px 24px 10px' }}>// MODULES</div>
        {NAV.map((l, i) => (
          <NavLink key={l.to}
            to={`${l.to}${username ? `?user=${username}` : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 24px',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 10, letterSpacing: 2,
              color: isActive ? 'var(--cyan)' : 'var(--text2)',
              background: isActive ? 'rgba(0,229,255,0.07)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
              transition: 'all 0.2s', textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: 13, opacity: 0.8, flexShrink: 0 }}>{l.icon}</span>
            <span style={{ flex: 1 }}>{l.label}</span>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 7, color: 'var(--border)', opacity: 0.6 }}>{i + 1}</span>
          </NavLink>
        ))}
      </nav>

      {/* PDF export */}
      <div style={{ padding: '10px 16px', flexShrink: 0 }}>
        <button onClick={() => setDark(!dark)} style={{
          width: '100%', background: 'transparent',
          border: '1px solid var(--border2)',
          color: 'var(--text2)',
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: 9, padding: '8px 0',
          cursor: 'pointer', letterSpacing: 2,
          marginBottom: 8, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--yellow)'; e.currentTarget.style.borderColor = 'var(--yellow)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
        >
          {dark ? '☀ LIGHT MODE' : '◑ DARK MODE'}
        </button>
        <button onClick={() => window.print()} style={{
          width: '100%', background: 'transparent',
          border: '1px solid var(--border2)',
          color: 'var(--text2)',
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: 9, padding: '8px 0',
          cursor: 'pointer', letterSpacing: 2,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.borderColor = 'var(--cyan)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
        >⎙ EXPORT PDF</button>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border2)', fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', letterSpacing: 2, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', display: 'inline-block', animation: 'pulse 2s ease infinite' }}/>
          API ONLINE
        </div>
        <div>GITHUB REST v3</div>
        <div style={{ marginTop: 4, color: 'var(--border)', fontSize: 8 }}>PRESS 1-8 TO NAVIGATE</div>
      </div>
    </aside>
  )
}

function Layout() {
  const [params]  = useSearchParams()
  const username  = params.get('user') || ''
  const navigate  = useNavigate()

  // ── Keyboard shortcuts ── MUST be before return ──────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT'    ) return
      if (e.target.tagName === 'TEXTAREA' ) return
      if (e.target.tagName === 'BUTTON'   ) return
      const map = {
        '1': '/overview',
        '2': '/repositories',
        '3': '/intelligence',
        '4': '/deepdive',
        '5': '/academic',
        '6': '/predict',
        '7': '/ai',
        '8': '/compare',
      }
      if (map[e.key]) navigate(`${map[e.key]}${username ? `?user=${username}` : ''}`)
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [username, navigate])

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar username={username} />
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/"             element={<Home />}         />
          <Route path="/overview"     element={<Overview />}     />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/deepdive"     element={<DeepDive />}     />
          <Route path="/academic"     element={<Academic />}     />
          <Route path="/predict"      element={<Predict />}      />
          <Route path="/ai"           element={<AIPage />}       />
          <Route path="/compare"      element={<Compare />}      />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<Layout />} />
    </Routes>
  )
}