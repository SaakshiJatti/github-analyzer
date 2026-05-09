export default function ErrorBox({ message }) {
  return (
    <div style={{
      margin: '40px auto', maxWidth: 500,
      background: 'rgba(255,45,85,0.08)',
      border: '1px solid rgba(255,45,85,0.3)',
      padding: 24, textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: 12, color: 'var(--red)',
        letterSpacing: 3, marginBottom: 12,
      }}>⚠ ERROR</div>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 12, color: 'var(--text)',
      }}>{message}</div>
    </div>
  )
}