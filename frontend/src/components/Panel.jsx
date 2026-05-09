export default function Panel({ title, badge, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border2)',
      clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}>
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
        opacity: 0.5,
      }}/>

      {/* Header */}
      {(title || badge) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border2)',
          background: 'rgba(0,212,255,0.02)',
        }}>
            {title && <span style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 11, fontWeight: 600,        // was 10
                color: 'var(--cyan)', letterSpacing: '0.15em',
            }}>{title}</span>}
            {badge && <span style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: 10, color: 'var(--text2)', letterSpacing: '0.08em',  // was 9
            }}>{badge}</span>}
        </div>
      )}

      <div style={{ padding: 18 }}>
        {children}
      </div>
    </div>
  )
}