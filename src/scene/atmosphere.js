import * as THREE from 'three'

// Fog/background keyframes by progress. Density is FogExp2 density.
//   0-25   dense, dark grey blizzard
//   25-75  brightens to white-blue as the density falls
//   75-100 clears completely into a golden-hour sky
const KEYS = [
  { p: 0, color: '#2e3135', density: 0.07 },
  { p: 25, color: '#494e56', density: 0.058 },
  { p: 75, color: '#bcd3ee', density: 0.015 },
  { p: 100, color: '#ffcf93', density: 0.0035 },
]

const a = new THREE.Color()
const b = new THREE.Color()

/** Writes the sampled color into `out` and returns the density. */
export function sampleAtmosphere(progress, out) {
  const p = Math.min(100, Math.max(0, progress))
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++
  const k0 = KEYS[i]
  const k1 = KEYS[i + 1]
  const t = (p - k0.p) / (k1.p - k0.p)
  const s = t * t * (3 - 2 * t)
  out.copy(a.set(k0.color)).lerp(b.set(k1.color), s)
  return k0.density + (k1.density - k0.density) * s
}

export const smoothstep = (lo, hi, x) => {
  const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo)))
  return t * t * (3 - 2 * t)
}
