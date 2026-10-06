import { useEffect, useRef } from 'react'

// A winding route up the mountain, in a 100x100 box.
const ROUTE = 'M28 90 C40 82 46 74 36 66 S60 62 52 50 S70 44 58 33 S66 22 50 10'
const SUMMIT_ALT = 4810
const BASE_ALT = 3200

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * The goggles' heads-up display: compass bezel, route map with a climber dot,
 * and a few readouts. Values are written straight to the DOM every frame so
 * React never re-renders for them.
 */
export default function Hud({ game }) {
  const ring = useRef()
  const dot = useRef()
  const trail = useRef()
  const route = useRef()
  const alt = useRef()
  const hdg = useRef()
  const temp = useRef()
  const wind = useRef()
  const step = useRef()

  useEffect(() => {
    const total = route.current.getTotalLength()
    let raf
    const tick = (now) => {
      if (!ring.current) return // unmounted between commit and effect cleanup
      const p = game.display
      const t = now / 1000
      const heading = (38 + 14 * Math.sin(t * 0.3) + 6 * Math.sin(t * 0.77) + 360) % 360

      ring.current.setAttribute('transform', `rotate(${-heading} 60 60)`)
      const pt = route.current.getPointAtLength((p / 100) * total)
      dot.current.setAttribute('cx', pt.x)
      dot.current.setAttribute('cy', pt.y)
      trail.current.style.strokeDasharray = `${p} 100`

      alt.current.textContent = Math.round(BASE_ALT + ((SUMMIT_ALT - BASE_ALT) * p) / 100).toLocaleString('en-US')
      hdg.current.textContent = String(Math.round(heading)).padStart(3, '0')
      temp.current.textContent = Math.round(-24 + 17 * (p / 100))
      wind.current.textContent = Math.round(6 + 56 * (1 - smooth(35, 90, p)))
      step.current.textContent = `${String(game.steps).padStart(2, '0')}/50`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [game])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-[11vh] right-[6.5vw] flex items-end gap-3 font-mono text-cyan-200"
      style={{ textShadow: '0 0 6px rgba(120,230,255,0.55)', fontSize: 'clamp(9px, 1.5vmin, 12px)' }}
    >
      <div className="rounded-md border border-cyan-200/20 bg-black/35 px-3 py-2 leading-[1.5] backdrop-blur-sm">
        <div className="flex justify-between gap-4"><span className="opacity-60">ALT</span><span><span ref={alt}>3,200</span> m</span></div>
        <div className="flex justify-between gap-4"><span className="opacity-60">HDG</span><span><span ref={hdg}>038</span>°</span></div>
        <div className="flex justify-between gap-4"><span className="opacity-60">TMP</span><span><span ref={temp}>-24</span>°C</span></div>
        <div className="flex justify-between gap-4"><span className="opacity-60">WND</span><span><span ref={wind}>62</span> km/h</span></div>
        <div className="flex justify-between gap-4"><span className="opacity-60">STP</span><span ref={step}>00/50</span></div>
      </div>

      <svg viewBox="0 0 120 120" style={{ width: 'clamp(104px, 17vmin, 168px)' }}>
        <defs>
          <clipPath id="hud-disc"><circle cx="60" cy="60" r="42" /></clipPath>
        </defs>
        <circle cx="60" cy="60" r="54" fill="rgba(0,0,0,0.38)" stroke="rgba(150,235,255,0.35)" strokeWidth="1" />
        {/* Compass bezel: turns as the heading drifts. */}
        <g ref={ring} transform="rotate(-38 60 60)" stroke="currentColor" fill="currentColor">
          {Array.from({ length: 36 }, (_, i) => (
            <line key={i} x1="60" y1="7" x2="60" y2={i % 9 === 0 ? 14 : 10} strokeWidth={i % 9 === 0 ? 1.6 : 0.8} opacity={i % 9 === 0 ? 1 : 0.6} transform={`rotate(${i * 10} 60 60)`} />
          ))}
          <text x="60" y="25" textAnchor="middle" fontSize="9" stroke="none" fill="#ff8a7a">N</text>
          <text x="95" y="63" textAnchor="middle" fontSize="8" stroke="none">E</text>
          <text x="60" y="102" textAnchor="middle" fontSize="8" stroke="none">S</text>
          <text x="25" y="63" textAnchor="middle" fontSize="8" stroke="none">W</text>
        </g>
        {/* Route map */}
        <g clipPath="url(#hud-disc)" transform="translate(10 10) scale(0.83)">
          <path d="M0 78 Q20 70 40 76 T100 70 M0 56 Q25 50 45 58 T100 50 M0 36 Q22 30 50 38 T100 30" fill="none" stroke="rgba(150,235,255,0.14)" strokeWidth="1" />
          <path ref={route} d={ROUTE} fill="none" stroke="rgba(150,235,255,0.35)" strokeWidth="1.6" strokeDasharray="3 3" />
          <path ref={trail} d={ROUTE} pathLength="100" fill="none" stroke="#9ff3ff" strokeWidth="2.2" strokeLinecap="round" style={{ strokeDasharray: '0 100' }} />
          <path d="M50 3 L50 12 M50 3 L58 6 L50 9" fill="#ffd27a" stroke="#ffd27a" strokeWidth="1" />
          <circle ref={dot} cx="28" cy="90" r="3.2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  )
}
