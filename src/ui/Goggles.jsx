const FRAME = '#0d1013'
const LENS = { inset: '6vh 3vw 7vh 3vw', borderRadius: '13vmin' }

const DROPLETS = [
  { x: 14, y: 22, s: 14 },
  { x: 24, y: 68, s: 9 },
  { x: 71, y: 16, s: 11 },
  { x: 83, y: 58, s: 16 },
  { x: 47, y: 83, s: 8 },
  { x: 9, y: 49, s: 10 },
  { x: 90, y: 30, s: 7 },
]

/**
 * The wearer's goggles: a dark frame with a lens-shaped window, plus the things
 * that live on the glass itself. Frost and droplets melt away as `percent`
 * climbs and the air warms.
 */
export default function Goggles({ percent }) {
  const frost = Math.max(0, 1 - percent / 65)
  const wet = Math.max(0, 1 - percent / 85)

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Lens glass */}
      <div className="absolute" style={{ ...LENS, overflow: 'hidden' }}>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(110,165,255,0.10), rgba(255,170,70,0.07))' }}
        />
        {/* Glare streaks */}
        <div
          className="absolute -inset-y-10 left-[18%] w-[9%] -skew-x-[18deg]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
        />
        <div
          className="absolute -inset-y-10 left-[30%] w-[2.5%] -skew-x-[18deg]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        />
        {/* Frost creeping in from the rim */}
        <div
          className="absolute inset-0 transition-opacity duration-[1500ms]"
          style={{
            opacity: frost,
            background:
              'radial-gradient(ellipse at center, transparent 52%, rgba(214,232,255,0.38) 82%, rgba(240,247,255,0.8) 100%)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
        {/* Droplets */}
        <div className="absolute inset-0 transition-opacity duration-[1500ms]" style={{ opacity: wet }}>
          {DROPLETS.map((d, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: `${d.s}px`,
                height: `${d.s * 1.25}px`,
                background:
                  'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.65), rgba(255,255,255,0.12) 55%, rgba(255,255,255,0.03) 100%)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Frame: everything outside the lens window, plus the nose bridge. */}
      <div
        className="absolute"
        style={{
          ...LENS,
          boxShadow: `0 0 0 100vmax ${FRAME}, inset 0 0 0 3px rgba(255,255,255,0.10), inset 0 0 70px 6px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          className="absolute bottom-0 left-1/2 h-[10%] w-[13%] -translate-x-1/2"
          style={{ background: FRAME, borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
        />
      </div>
    </div>
  )
}
