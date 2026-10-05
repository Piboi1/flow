import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothstep } from './atmosphere'

const COUNT = 3200
// Spans the camera's view out to ~45 units; the camera sits at z = 12.
const BOX = { x: 100, y: 30, z: 52 }
const NEAR_Z = 4

// Soft round flake sprite, drawn once.
function makeFlakeTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.7)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/** Wind-driven snow that thins out as the storm clears. */
export default function Snowfall({ game }) {
  const points = useRef()

  const flake = useMemo(makeFlakeTexture, [])

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * BOX.x
      arr[i * 3 + 1] = Math.random() * BOX.y
      arr[i * 3 + 2] = NEAR_Z - Math.random() * BOX.z
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const p = game.display
    const storm = 1 - smoothstep(35, 85, p)
    const sinceStep = (performance.now() - game.lastStepAt) / 1000
    const surge = game.started ? Math.exp(-sinceStep / 0.35) : 0

    const attr = points.current.geometry.attributes.position
    const arr = attr.array
    const wind = (9 + 14 * storm) * (1 + 0.3 * surge)
    const fall = 3 + 4 * storm
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3
      arr[j] -= wind * dt // blows left
      arr[j + 1] -= fall * dt
      arr[j + 2] += (3 + 6 * surge) * dt // drifts toward the viewer with the climb
      if (arr[j] < -BOX.x / 2) arr[j] += BOX.x
      if (arr[j + 1] < 0) arr[j + 1] += BOX.y
      if (arr[j + 2] > NEAR_Z) arr[j + 2] -= BOX.z
    }
    attr.needsUpdate = true

    const mat = points.current.material
    mat.opacity = 0.15 + 0.7 * storm
    mat.size = 0.2 + 0.14 * storm
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} usage={THREE.DynamicDrawUsage} />
      </bufferGeometry>
      <pointsMaterial map={flake} color="#ffffff" size={0.3} transparent opacity={0.8} depthWrite={false} fog={false} />
    </points>
  )
}
