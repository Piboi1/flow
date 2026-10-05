import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothstep } from './atmosphere'
import { CAM_DIST, LAYERS } from './world'

const WIDTH = 84
const THICK = 30
const SEG_X = 80
const SEG_Y = 30 // roughly square cells so flat shading gives crag-like facets
const FACET = 2.2

const BASE_SPEED = 2.0 // apparent units / second while climbing
const SURGE = 9 // extra speed right after a step

const snowWarm = new THREE.Color('#fff0d4')
const tmp = new THREE.Color()

/**
 * Side-on mountain: a stack of PlaneGeometry strips. Every frame the top edge of
 * each strip is rewritten from ridged simplex noise (Y) and the interior is
 * given small Z offsets so flat shading reads as faceted rock. The whole world
 * scrolls past the static camera; as progress nears 100 the peaks flatten into a
 * summit plateau.
 */
export default function Mountain({ game, world }) {
  const mats = useRef([])
  const geometries = useMemo(
    () =>
      LAYERS.map(() => {
        const g = new THREE.PlaneGeometry(WIDTH, THICK, SEG_X, SEG_Y)
        g.attributes.position.setUsage(THREE.DynamicDrawUsage)
        return g
      }),
    [],
  )
  const tops = useMemo(() => new Float32Array(SEG_X + 1), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const now = performance.now()
    const progress = game.display

    // Steady crawl, a surge on each step, a stumble on a slip, and a slide
    // backward while the climber is sluggish.
    const surge = game.started ? Math.exp(-(now - game.lastStepAt) / 1000 / 0.35) : 0
    const slipping = now - game.lastSlipAt < 450
    let speed = BASE_SPEED * (game.started ? 1 : 0.35) + SURGE * surge
    if (slipping) speed = 0.2
    if (game.isSluggish(now)) speed = -1.2
    world.scroll += speed * dt

    const warm = smoothstep(55, 100, progress)

    LAYERS.forEach((L, i) => {
      const pos = geometries[i].attributes.position
      const arr = pos.array
      const cols = SEG_X + 1
      const colW = WIDTH / SEG_X

      for (let ix = 0; ix < cols; ix++) {
        tops[ix] = world.top(i, -WIDTH / 2 + ix * colW, world.scroll, progress)
      }
      for (let iy = 0; iy <= SEG_Y; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const k = (iy * cols + ix) * 3
          const x = -WIDTH / 2 + ix * colW
          arr[k] = x
          arr[k + 1] = tops[ix] - (iy / SEG_Y) * THICK
          arr[k + 2] = world.facet((x + world.scroll * L.par) * 0.42 + i * 40, iy * 0.55 + i * 13) * FACET
        }
      }
      pos.needsUpdate = true

      mats.current[i].color.copy(tmp.set(L.color)).lerp(snowWarm, warm)
    })
  })

  return (
    <>
      {LAYERS.map((L, i) => (
        <group key={i} position={[0, 0, CAM_DIST * (1 - L.s)]} scale={[L.s, L.s, 1]}>
          <mesh geometry={geometries[i]} frustumCulled={false}>
            <meshStandardMaterial ref={(m) => (mats.current[i] = m)} color={L.color} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </>
  )
}
