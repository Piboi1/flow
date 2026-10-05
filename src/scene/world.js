import { createNoise2D } from 'simplex-noise'
import { smoothstep } from './atmosphere'

// The camera is static, side-on, at z = CAM_DIST looking down -z. Each mountain
// layer is a flat strip drawn in "apparent" screen units and pushed back in
// depth by scaling it, so fog sees its true distance while its size on screen
// stays what we authored.
export const CAM_DIST = 20
export const CAM_FOV = 56
export const CHAR_X = -8 // where the climber stands, in apparent x

// s: depth scale (distance = s * CAM_DIST)   y0 -> y1: base height at progress 0 -> 100
// amp/slope: peak height and uphill slope at progress 0 (both flatten toward 100)
// par: how fast the layer scrolls relative to the climber (parallax)
export const LAYERS = [
  { s: 1, y0: -6, y1: -6, amp: 3.2, slope: 0.46, freq: 0.1, par: 1, color: '#aab4c4' },
  { s: 1.8, y0: -1, y1: -4.3, amp: 6, slope: 0.14, freq: 0.075, par: 0.55, color: '#9ba7b9' },
  { s: 3, y0: 0.5, y1: -3.2, amp: 7.5, slope: 0.1, freq: 0.055, par: 0.35, color: '#919eb3' },
  { s: 5, y0: 1.5, y1: -2.2, amp: 8, slope: 0.06, freq: 0.04, par: 0.2, color: '#8795ac' },
  { s: 8, y0: 2.5, y1: -1.4, amp: 8.5, slope: 0, freq: 0.03, par: 0.1, color: '#7d8ba5' },
]

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Shared by the mountain layers and the climber so they always agree. */
export function createWorld() {
  const noises = LAYERS.map((_, i) => createNoise2D(rng(1234 + i * 77)))
  const facet = createNoise2D(rng(99))

  // Ridged fractal noise in roughly 0..1; sharp crests like real peaks.
  function ridge(i, u) {
    const n = noises[i]
    let h = 0
    let sum = 0
    let f = LAYERS[i].freq
    let a = 1
    for (let o = 0; o < 3; o++) {
      const v = 1 - Math.abs(n(u * f, o * 11.7))
      h += v * v * a
      sum += a
      f *= 2.3
      a *= 0.5
    }
    return h / sum
  }

  /** Height of layer i's ridge line at apparent x. */
  function top(i, x, scroll, progress) {
    const L = LAYERS[i]
    const flat = 1 - smoothstep(10, 100, progress) // peaks relax into a summit
    const rise = smoothstep(0, 100, progress) // distant ranges sink as we climb
    const base = L.y0 + (L.y1 - L.y0) * rise
    return base + L.slope * flat * (x - CHAR_X) + L.amp * flat * ridge(i, scroll * L.par + x)
  }

  return { scroll: 0, top, facet }
}
