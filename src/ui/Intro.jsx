export default function Intro({ visible }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-black/55 px-6 text-center text-white transition-opacity duration-1000"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <h1 className="text-sm font-light uppercase tracking-[0.5em]">The Ascent</h1>
      <p className="mt-6 max-w-sm text-base font-light leading-relaxed text-white/80">
        Tap <kbd className="rounded border border-white/40 px-2 py-0.5 text-sm">Space</kbd> once with every
        pulse, about every 1.2 seconds. Keep the rhythm for one minute.
      </p>
      <p className="mt-10 animate-pulse text-xs uppercase tracking-[0.35em] text-white/60">
        Press Space to begin
      </p>
    </div>
  )
}
