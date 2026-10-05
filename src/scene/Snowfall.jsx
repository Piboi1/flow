import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { smoothstep } from './atmosphere'

const COUNT = 1500
const BOX = { x: 56, y: 26, z: 22 }
const FRONT_Z = 18

/** Square, single-pixel snow driven hard against the climber, thinning with progress. */
export default function Snowfall({ game }) {
  const points = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * BOX.x
      arr[i * 3 + 1] = (Math.random() - 0.5) * BOX.y
      arr[i * 3 + 2] = FRONT_Z - Math.random() * BOX.z
    }
    return arr
  }, [])

  useFrame(({ viewport }, delta) => {
    const dt = Math.min(delta, 0.1)
    const storm = 1 - smoothstep(35, 85, game.display)
    const surge = game.started ? Math.exp(-(performance.now() - game.lastStepAt) / 1000 / 0.35) : 0

    const attr = points.current.geometry.attributes.position
    const arr = attr.array
    const wind = (8 + 18 * storm) * (1 + 0.25 * surge) // blows left, into the climber
    const fall = 2 + 4 * storm
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3
      arr[j] -= wind * dt
      arr[j + 1] -= fall * dt
      if (arr[j] < -BOX.x / 2) arr[j] += BOX.x
      if (arr[j + 1] < -BOX.y / 2) arr[j + 1] += BOX.y
    }
    attr.needsUpdate = true

    const mat = points.current.material
    mat.opacity = 0.2 + 0.7 * storm
    // Points are sized in drawing-buffer pixels times dpr; ask for 1-2 render pixels.
    mat.size = (1 + storm) / viewport.dpr
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} usage={THREE.DynamicDrawUsage} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={4} sizeAttenuation={false} transparent opacity={0.8} depthWrite={false} fog={false} />
    </points>
  )
}
