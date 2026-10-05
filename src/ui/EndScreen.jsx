import { useEffect, useState } from 'react'

/** Pure white fade-in with a single call to action. */
export default function EndScreen({ onBegin }) {
  const [shown, setShown] = useState(false)
  const [buttonShown, setButtonShown] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    const t = setTimeout(() => setButtonShown(true), 1800)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white transition-opacity duration-[2500ms] ease-in-out"
      style={{ opacity: shown ? 1 : 0 }}
    >
      <button
        type="button"
        onClick={onBegin}
        className="rounded-sm bg-neutral-800 px-10 py-4 text-sm font-light uppercase tracking-[0.3em] text-white transition-opacity duration-1000 hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-4"
        style={{ opacity: buttonShown ? 1 : 0, pointerEvents: buttonShown ? 'auto' : 'none' }}
      >
        Begin Work
      </button>
    </div>
  )
}
