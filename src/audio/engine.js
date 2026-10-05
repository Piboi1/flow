import * as Tone from 'tone'

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const SUMMIT_CHORD = ['D3', 'A3', 'F#4', 'C#5', 'E5']
const CHORD_HOLD_S = 7
const CHORD_RELEASE_S = 7

/**
 * Everything is synthesized; there are no audio files. Call from a user
 * gesture (the first Spacebar press) so the browser allows the context.
 */
export async function createAudioEngine() {
  await Tone.start()

  const master = new Tone.Limiter(-3).toDestination()

  // --- Wind: pink noise through a low-pass that opens as the storm thins. ---
  const windGain = new Tone.Gain(0).connect(master)
  const windFilter = new Tone.Filter({ type: 'lowpass', frequency: 180, Q: 1.2 }).connect(windGain)
  const wind = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 3, decay: 0, sustain: 1, release: 2 },
  }).connect(windFilter)
  wind.triggerAttack()

  // --- Footsteps: membrane thud -> ice axe (metal) -> clean metal ping. ---
  const thudGain = new Tone.Gain(1).connect(master)
  const thud = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 2.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.1 },
  }).connect(thudGain)

  const clinkGain = new Tone.Gain(0).connect(master)
  const clink = new Tone.MetalSynth({
    harmonicity: 5.1,
    modulationIndex: 28,
    resonance: 3800,
    octaves: 1.4,
    envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
  }).connect(clinkGain)
  clink.volume.value = -14

  // --- Summit chord: slow attack and release, lots of room. ---
  const reverb = new Tone.Reverb({ decay: 9, wet: 0.55 }).connect(master)
  const chordGain = new Tone.Gain(0.5).connect(reverb)
  const chord = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsine', count: 3, spread: 18 },
    envelope: { attack: 3, decay: 1, sustain: 0.85, release: CHORD_RELEASE_S },
  }).connect(chordGain)
  chord.volume.value = -14
  reverb.generate()

  let gone = false
  let summited = false

  /** Called every frame with the smoothed progress (0-100). */
  function setWind(progress, seconds) {
    if (gone || summited) return
    // Low, muffled roar at the start; thin and bright by 90.
    const open = Math.min(1, progress / 90)
    const gust = 1 + 0.18 * Math.sin(seconds * 0.9) + 0.1 * Math.sin(seconds * 2.3)
    windFilter.frequency.rampTo(180 * Math.pow(4200 / 180, open) * gust, 0.1)
    // Volume reaches exactly zero at progress 90.
    const level = progress >= 90 ? 0 : Math.pow(1 - progress / 90, 1.4)
    windGain.gain.rampTo(2.2 * level, 0.15)
  }

  /** Fire on every accepted step. */
  function footstep(progress) {
    if (gone || summited) return
    const now = Tone.now()
    // Early: all snow crunch. Mid: crossfade to the axe. Late: only the ping.
    const thudLevel = 1 - smoothstep(30, 72, progress)
    const clinkLevel = smoothstep(18, 50, progress)

    if (thudLevel > 0.02) {
      thudGain.gain.value = thudLevel
      const note = ['C1', 'D1', 'Eb1'][Math.floor(Math.random() * 3)]
      thud.triggerAttackRelease(note, '8n', now, 0.7 + Math.random() * 0.3)
    }
    if (clinkLevel > 0.02) {
      clinkGain.gain.value = clinkLevel
      const late = smoothstep(72, 95, progress)
      clink.envelope.decay = 0.1 + late * 0.5
      clink.envelope.release = 0.05 + late * 0.4
      clink.harmonicity = 5.1 - late * 2.5 // purer, less clangy
      const freq = 220 + progress * 5 + (Math.random() - 0.5) * 20
      clink.triggerAttackRelease(freq, '16n', now + 0.005, 0.8)
    }
  }

  /** Silence the storm and steps immediately; let the chord ring out. */
  function summit() {
    if (gone || summited) return
    summited = true
    const now = Tone.now()
    windGain.gain.cancelScheduledValues(now)
    windGain.gain.rampTo(0, 0.05)
    wind.triggerRelease(now)
    chord.triggerAttackRelease(SUMMIT_CHORD, CHORD_HOLD_S, now + 0.05)
    for (const node of [wind, windFilter, windGain, thud, thudGain, clink, clinkGain]) {
      node.dispose()
    }
  }

  /** Tear down the whole Tone.js context. */
  function dispose() {
    if (gone) return
    gone = true
    Tone.getContext().dispose()
    // Tone keeps a reference to the closed context; give it a fresh one so a
    // later engine (e.g. after a hot reload) can start cleanly.
    Tone.setContext(new Tone.Context())
  }

  // How long the chord keeps sounding after summit().
  const chordTailMs = (CHORD_HOLD_S + CHORD_RELEASE_S + 1) * 1000

  return { setWind, footstep, summit, dispose, chordTailMs }
}
