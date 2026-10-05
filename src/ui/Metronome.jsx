/**
 * A frosted white vignette that breathes once per 1.2s beat. It is mounted when
 * the climb starts so its first beat lines up with the opening tap, and it
 * fades away for good once `visible` goes false (progress >= 30).
 */
export default function Metronome({ visible }) {
  const edge = 'radial-gradient(ellipse at center, transparent 42%, black 100%)'
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 transition-opacity duration-[2500ms] ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="absolute inset-0 animate-breathe"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0) 40%, rgba(232,241,255,0.5) 75%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          maskImage: edge,
          WebkitMaskImage: edge,
        }}
      />
    </div>
  )
}
