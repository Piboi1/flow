/** A hairline at the bottom edge; deliberately quiet. */
export default function ProgressLine({ percent }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 h-px bg-white/10">
      <div className="h-full bg-white/60 transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
    </div>
  )
}
