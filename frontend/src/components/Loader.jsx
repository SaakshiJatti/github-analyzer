export default function Loader({ text = 'SCANNING...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 24,
    }}>
      <div style={{
        width: 60, height: 60,
        border: '2px solid var(--border2)',
        borderTop: '2px solid var(--cyan)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}/>
        <div style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 14, color: 'var(--cyan)',   // was 12
        letterSpacing: '0.2em',
        animation: 'pulse 1.5s ease infinite',
        }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}