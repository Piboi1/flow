import { useCallback, useEffect, useRef, useState } from 'react'
import { ClimbGame } from './ClimbGame'
import { createAudioEngine } from '../audio/engine'

/**
 * Wires the ClimbGame to the keyboard, Tone.js and a single animation loop.
 * Phases: 'intro' -> 'climbing' -> 'summit'.
 */
export function useClimb() {
  const game = useRef(null)
  if (!game.current) game.current = new ClimbGame()

  const [phase, setPhase] = useState('intro')
  const [percent, setPercent] = useState(0)
  const [slipKey, setSlipKey] = useState(0)

  const phaseRef = useRef('intro')
  const audio = useRef(null)
  const starting = useRef(false)
  const closeTimer = useRef(null)

  const goto = useCallback((next) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const releaseAudio = useCallback(() => {
    clearTimeout(closeTimer.current)
    audio.current?.dispose()
    audio.current = null
  }, [])

  // Keyboard: the first Space starts audio and the climb; later ones are steps.
  useEffect(() => {
    const onKeyDown = async (e) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (e.repeat) return // holding the key down is not a rhythm

      if (phaseRef.current === 'intro') {
        if (starting.current) return
        starting.current = true
        try {
          audio.current = await createAudioEngine()
        } catch (err) {
          console.warn('Audio unavailable, continuing silently.', err)
        }
        game.current.begin(performance.now())
        goto('climbing')
        return
      }

      if (phaseRef.current !== 'climbing') return
      const result = game.current.press(performance.now())
      if (result === 'step') audio.current?.footstep(game.current.progress)
      else if (result === 'slip') setSlipKey((k) => k + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goto])

  // One loop: decay, smoothing, wind, progress UI, and the summit hand-off.
  useEffect(() => {
    if (phase !== 'climbing') return
    let raf
    let last = performance.now()
    const loop = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const g = game.current
      g.update(dt, now)
      audio.current?.setWind(g.display, now / 1000)
      setPercent(Math.floor(g.display))

      if (g.atSummit) {
        // Unmount the canvas right away; the chord is allowed to ring out.
        audio.current?.summit()
        const tail = audio.current?.chordTailMs ?? 0
        closeTimer.current = setTimeout(releaseAudio, tail)
        goto('summit')
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase, goto, releaseAudio])

  useEffect(() => releaseAudio, [releaseAudio])

  const beginWork = useCallback(() => {
    releaseAudio()
    window.dispatchEvent(new CustomEvent('ascent:begin-work'))
  }, [releaseAudio])

  return { game: game.current, phase, percent, slipKey, beginWork }
}
