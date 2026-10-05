/** A brief red wash. Changing `flashKey` restarts the animation. */
export default function SlipFlash({ flashKey }) {
  if (!flashKey) return null
  return (
    <div
      key={flashKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 animate-slip bg-red-600/25"
    />
  )
}
