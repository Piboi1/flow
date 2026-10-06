import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import { smoothstep } from './atmosphere'

const WIDTH = 170
const DEPTH = 210
const SEG_X = 120
const SEG_Y = 150
const AMP_MAX = 15
const BASE_SPEED = 2.2 // world units / second while climbing
const SURGE = 7 // extra speed right after a step

const snowLow = new THREE.Color('#aab4c4')
const snowHigh = new THREE.Color('#fff0d4')

/**
 * A big PlaneGeometry whose local Z (the plane normal, which points up once the
 * mesh is laid flat) is rewritten from simplex noise every frame. The camera
 * never moves; instead the noise is sampled further along the plane's Y axis
 * each frame so the mountain streams toward the viewer.
 */
export default function Terrain({ game }) {
  const mesh = useRef()
  const scroll = useRef(0)
  const noise = useMemo(() => createNoise2D(), [])

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(WIDTH, DEPTH, SEG_X, SEG_Y)
    g.attributes.position.setUsage(THREE.DynamicDrawUsage)
    return g
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const now = performance.now()
    const progress = game.display

    // Scroll speed: a steady crawl, a surge on each step, a stall when sluggish.
    const sinceStep = (now - game.lastStepAt) / 1000
    const surge = game.started ? Math.exp(-sinceStep / 0.35) : 0
    const stalled = game.isSluggish(now) ? 0.15 : 1
    const climbing = game.started ? 1 : 0.35
    scroll.current += (BASE_SPEED * climbing * stalled + SURGE * surge) * dt

    // Peaks flatten toward a summit plateau as progress approaches 100.
    const amp = AMP_MAX * (1 - smoothstep(10, 100, progress)) + 0.15

    const pos = geometry.attributes.position
    const arr = pos.array
    const s = scroll.current
    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3]
      const y = arr[i * 3 + 1]
      const ny = y + s

      // Ridged fractal noise gives sharp mountain crests.
      let h = 0
      let f = 0.035
      let a = 1
      for (let o = 0; o < 4; o++) {
        const n = 1 - Math.abs(noise(x * f, ny * f))
        h += n * n * a
        f *= 2.1
        a *= 0.5
      }

      // Keep a trail through the middle; walls rise on either side.
      const ax = Math.abs(x)
      const trail = smoothstep(3, 22, ax)
      const wall = (ax / (WIDTH / 2)) ** 2
      arr[i * 3 + 2] = (h * trail * 0.62 + wall * 0.5) * amp
    }
    pos.needsUpdate = true

    mesh.current.material.color.copy(snowLow).lerp(snowHigh, smoothstep(55, 100, progress))
  })

  return (
    <mesh ref={mesh} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -70]}>
      <meshStandardMaterial color="#aab4c4" roughness={1} metalness={0} flatShading />
    </mesh>
  )
}
