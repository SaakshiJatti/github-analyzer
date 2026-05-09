import { useSearchParams } from 'react-router-dom'
import { useAI } from '../hooks/useAI'
import Panel from '../components/Panel'
import ErrorBox from '../components/ErrorBox'

function AIButton({ onClick, loading, label, icon, color = 'var(--cyan)' }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{
        background: loading ? 'rgba(255,255,255,0.05)' : `${color}15`,
        border: `1px solid ${loading ? 'var(--border2)' : color}`,
        color: loading ? 'var(--text2)' : color,
        fontFamily: 'Orbitron, monospace',
        fontSize: 10, fontWeight: 700,
        padding: '12px 24px', cursor: loading ? 'not-allowed' : 'pointer',
        letterSpacing: 3, display: 'flex', alignItems: 'center', gap: 10,
        transition: 'all 0.2s',
        clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
      }}>
      <span>{icon}</span>
      {loading ? 'GENERATING...' : label}
      {loading && (
        <span style={{
          width: 12, height: 12,
          border: `2px solid ${color}`,
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 1s linear infinite',
        }}/>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </button>
  )
}

function AIResult({ text, color = 'var(--cyan)' }) {
  if (!text) return null
  return (
    <div style={{
      marginTop: 16,
      background: 'rgba(0,0,0,0.3)',
      border: `1px solid ${color}33`,
      padding: 20,
      animation: 'fadeIn 0.5s ease',
    }}>
      <div style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: 14, color: 'var(--text)',
        lineHeight: 1.9, fontWeight: 400,
        whiteSpace: 'pre-wrap',
      }}>{text}</div>
    </div>
  )
}

function TerminalTyping({ text, color }) {
  return (
    <div style={{
      fontFamily: 'Share Tech Mono, monospace',
      fontSize: 11, color,
      background: '#000',
      border: `1px solid ${color}33`,
      padding: 16, marginTop: 16,
      lineHeight: 2,
      whiteSpace: 'pre-wrap',
      animation: 'fadeIn 0.5s ease',
    }}>
      <span style={{ color: 'var(--text2)' }}>$ groq://llama-3.3-70b &gt; </span>
      {text}
      <span style={{ animation: 'blink 1s step-end infinite', color }}> █</span>
    </div>
  )
}

export default function AIPage() {
  const [params]  = useSearchParams()
  const username  = params.get('user')
  const { results, loading, fetch } = useAI()

  if (!username) return <ErrorBox message="No username provided." />

  const summary = results.summary
  const roast   = results.roast
  const career  = results.career

  return (
    <div style={{ padding: 32, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', letterSpacing: 4, marginBottom: 20 }}>
        // AI ANALYSIS / @{username} / POWERED BY GROQ · LLAMA 3.3 70B
      </div>

      <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid var(--cyan-dim)', padding: '12px 20px', marginBottom: 24, fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)', lineHeight: 1.8 }}>
        <span style={{ color: 'var(--cyan)' }}>// MODEL </span>
        Llama 3.3 70B via Groq inference API · Each analysis is generated fresh from live GitHub data · Results may vary between runs.
      </div>

      {/* Developer Intelligence Report */}
      <Panel title="// INTELLIGENCE REPORT" badge="AI GENERATED · LLAMA 3.3 70B" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8 }}>
          A data-driven 3-paragraph professional assessment of this developer's technical identity, open source impact, and trajectory. Cites actual metrics.
        </div>
        <AIButton
          onClick={() => fetch('summary', username)}
          loading={loading.summary}
          label="GENERATE REPORT"
          icon="📋"
          color="var(--cyan)"
        />
        {summary?.error  && <ErrorBox message={summary.error} />}
        {summary?.summary && <AIResult text={summary.summary} color="var(--cyan)" />}
      </Panel>

      {/* Career Trajectory */}
      <Panel title="// CAREER TRAJECTORY" badge="SENIOR RECRUITER ANALYSIS" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8 }}>
          Career stage assessment, technology pivot history, growth velocity analysis, and one specific actionable recommendation.
        </div>
        <AIButton
          onClick={() => fetch('career', username)}
          loading={loading.career}
          label="ANALYSE CAREER"
          icon="🚀"
          color="var(--green)"
        />
        {career?.error  && <ErrorBox message={career.error} />}
        {career?.career && <AIResult text={career.career} color="var(--green)" />}
      </Panel>

      {/* Roast Mode */}
      <Panel title="// ROAST MODE" badge="⚠ BRUTALLY HONEST">
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.8 }}>
          <span style={{ color: 'var(--orange)' }}>// WARNING: </span>
          Savage but fair. References actual stats. Always ends with a genuine compliment. Don't roast people you don't know.
        </div>
        <AIButton
          onClick={() => fetch('roast', username)}
          loading={loading.roast}
          label="ROAST THIS DEVELOPER"
          icon="🔥"
          color="var(--orange)"
        />
        {roast?.error && <ErrorBox message={roast.error} />}
        {roast?.roast && <TerminalTyping text={roast.roast} color="var(--orange)" />}
      </Panel>
    </div>
  )
}