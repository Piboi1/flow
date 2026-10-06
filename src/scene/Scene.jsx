import { Canvas, useFrame } from '@react-three/fiber'
import Terrain from './Terrain'
import Atmosphere from './Atmosphere'
import Snowfall from './Snowfall'

const EYE_Y = 4.6

/** A wearer's head: a slow breath, and a small dip and sway with every step. */
function HeadMotion({ game }) {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime
    const since = (performance.now() - game.lastStepAt) / 1000
    const step = game.started && game.steps > 0 ? Math.exp(-since / 0.3) : 0
    const side = game.steps % 2 ? 1 : -1
    camera.position.y = EYE_Y + Math.sin(t * 1.7) * 0.03 - step * 0.16
    camera.position.x = Math.sin(t * 0.8) * 0.05 + side * step * 0.1
  })
  return null
}

/** The camera looks up the slope; the world streams toward it. */
export default function Scene({ game }) {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0 }}
      dpr={[1, 1.75]}
      camera={{ fov: 62, near: 0.1, far: 400, position: [0, EYE_Y, 12] }}
      onCreated={({ camera }) => camera.lookAt(0, 3.4, -30)}
      flat
      gl={{ antialias: true }}
    >
      <Atmosphere game={game} />
      <Terrain game={game} />
      <Snowfall game={game} />
      <HeadMotion game={game} />
    </Canvas>
  )
}
