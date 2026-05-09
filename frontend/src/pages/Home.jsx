import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SUGGESTIONS = ['torvalds', 'gvanrossum', 'microsoft', 'google', 'facebook', 'antirez']

export default function Home() {
  const [input, setInput]   = useState('')
  const [focus, setFocus]   = useState(false)
  const navigate = useNavigate()

  const go = (user) => {
    const u = (user || input).trim()
    if (u) navigate(`/overview?user=${u}`)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 32,
      animation: 'fadeIn 0.6s ease',
      position: 'relative', zIndex: 1,
    }}>

      {/* Title */}
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: 'clamp(28px, 5vw, 56px)',
        fontWeight: 900, color: 'var(--white)',
        letterSpacing: 6, textAlign: 'center',
        marginBottom: 8,
        animation: 'glow 3s ease infinite',
      }}>
        GITHUB <span style={{ color: 'var(--cyan)' }}>ANALYZER</span>
      </div>

      <div style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 11, color: 'var(--text2)',
        letterSpacing: 6, marginBottom: 64,
        textAlign: 'center',
      }}>
        // REPOSITORY INTELLIGENCE SYSTEM v2.0 //
      </div>

      {/* Search box */}
      <div style={{
        width: '100%', maxWidth: 560,
        border: `1px solid ${focus ? 'var(--cyan)' : 'var(--border)'}`,
        background: 'var(--panel)',
        display: 'flex', gap: 0,
        boxShadow: focus ? '0 0 30px rgba(0,212,255,0.15)' : 'none',
        transition: 'all 0.3s',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        marginBottom: 32,
      }}>
        <span style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: 13, color: 'var(--cyan)',
          padding: '16px 16px 16px 20px',
          userSelect: 'none',
        }}>TARGET://</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder="enter github username"
          style={{
            flex: 1, background: 'transparent',
            border: 'none', outline: 'none',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: 14, color: 'var(--white)',
            letterSpacing: 2,
          }}
        />
        <button onClick={() => go()} style={{
          background: 'var(--cyan)',
          border: 'none', color: '#000',
          fontFamily: 'Orbitron, monospace',
          fontSize: 11, fontWeight: 700,
          padding: '0 28px', cursor: 'pointer',
          letterSpacing: 3,
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = 'var(--cyan2)'}
          onMouseLeave={e => e.target.style.background = 'var(--cyan)'}
        >SCAN</button>
      </div>

      {/* Suggestions */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: 9, color: 'var(--text2)',
          letterSpacing: 4, marginBottom: 14,
        }}>// KNOWN TARGETS</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => go(s)} style={{
              background: 'transparent',
              border: '1px solid var(--border2)',
              color: 'var(--text2)',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 11, padding: '6px 16px',
              cursor: 'pointer', letterSpacing: 1,
              transition: 'all 0.2s',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            }}
              onMouseEnter={e => { e.target.style.color='var(--cyan)'; e.target.style.borderColor='var(--cyan)' }}
              onMouseLeave={e => { e.target.style.color='var(--text2)'; e.target.style.borderColor='var(--border2)' }}
            >@{s}</button>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16, marginTop: 72,
        width: '100%', maxWidth: 720,
      }}>
        {[
          { icon: '⚡', label: 'Impact Scores',    desc: 'Composite repo scoring' },
          { icon: '🧬', label: 'Shannon Entropy',  desc: 'Language diversity index' },
          { icon: '📊', label: 'Gini + Lorenz',    desc: 'Star inequality analysis' },
          { icon: '🕐', label: 'Productivity Clock',desc: 'Commit hour heatmap' },
          { icon: '🔥', label: 'Commit Velocity',  desc: '12-week sparklines' },
          { icon: '⚔️', label: 'Compare Mode',     desc: 'Side-by-side battles' },
        ].map(f => (
          <div key={f.label} style={{
            background: 'var(--panel)',
            border: '1px solid var(--border2)',
            padding: '16px',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan-dim)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 9, fontWeight: 600,
              color: 'var(--cyan)', letterSpacing: 2, marginBottom: 4,
            }}>{f.label}</div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 10, color: 'var(--text2)',
            }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}