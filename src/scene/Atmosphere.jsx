import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleAtmosphere, smoothstep } from './atmosphere'

const coolLight = new THREE.Color('#b8c8e0')
const goldLight = new THREE.Color('#ffc274')

/** FogExp2, matching sky color, lighting and a low sun, all driven by progress. */
export default function Atmosphere({ game }) {
  const fog = useRef()
  const sun = useRef()
  const key = useRef()
  const fill = useRef()
  const color = useMemo(() => new THREE.Color(), [])

  useFrame(({ scene }) => {
    const p = game.display
    let density = sampleAtmosphere(p, color)

    // A brief breath of clarity on each step.
    const sinceStep = (performance.now() - game.lastStepAt) / 1000
    if (game.started) density *= 1 - 0.14 * Math.exp(-sinceStep / 0.4)

    fog.current.color.copy(color)
    fog.current.density = density
    scene.background.copy(color)

    const warm = smoothstep(70, 100, p)
    key.current.color.copy(coolLight).lerp(goldLight, warm)
    key.current.intensity = 1.6 + 1.4 * warm
    fill.current.intensity = 0.9 + 0.9 * smoothstep(20, 85, p)

    sun.current.material.opacity = smoothstep(80, 100, p)
    sun.current.visible = sun.current.material.opacity > 0.01
  })

  return (
    <>
      <color attach="background" args={['#2e3135']} />
      <fogExp2 ref={fog} attach="fog" args={['#2e3135', 0.07]} />
      <ambientLight ref={fill} intensity={0.9} />
      <directionalLight ref={key} position={[-12, 26, -18]} intensity={1.6} />
      <mesh ref={sun} position={[0, 7, -150]}>
        <circleGeometry args={[11, 48]} />
        <meshBasicMaterial color="#fff4d0" transparent opacity={0} fog={false} toneMapped={false} />
      </mesh>
    </>
  )
}
