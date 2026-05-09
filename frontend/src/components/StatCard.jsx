import { useEffect, useState } from 'react'

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target || isNaN(target)) return
    let start = 0
    const num   = parseFloat(String(target).replace(/[^0-9.]/g, ''))
    const step  = num / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setVal(num); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return val
}

export default function StatCard({ label, value, color = 'var(--white)', sub }) {
  const isNum   = !isNaN(parseFloat(String(value).replace(/[^0-9.]/g, '')))
  const counted = useCountUp(isNum ? parseFloat(String(value).replace(/[^0-9.]/g, '')) : 0)
  const display = isNum ? counted.toLocaleString() : value

  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border2)',
      padding: '20px 16px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--panel)'}
    >
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: color, opacity: 0, transition: 'opacity 0.2s',
      }}/>
      <div style={{
        fontFamily: 'Orbitron, monospace', fontSize: 26,
        fontWeight: 800, color, lineHeight: 1, marginBottom: 6,
        textShadow: `0 0 20px ${color}66`,
        transition: 'all 0.1s',
      }}>{display}</div>
      <div style={{
        fontFamily: 'Share Tech Mono, monospace', fontSize: 9,
        color: 'var(--text2)', letterSpacing: 3, textTransform: 'uppercase',
      }}>{label}</div>
      {sub && <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}