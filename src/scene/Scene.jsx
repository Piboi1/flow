import { Canvas } from '@react-three/fiber'
import Terrain from './Terrain'
import Atmosphere from './Atmosphere'
import Snowfall from './Snowfall'

/** The single static camera never moves; the world streams past it. */
export default function Scene({ game }) {
  return (
    <Canvas
      style={{ position: "fixed", inset: 0 }}
      dpr={[1, 1.75]}
      camera={{ fov: 62, near: 0.1, far: 400, position: [0, 4.6, 12] }}
      onCreated={({ camera }) => camera.lookAt(0, 3.4, -30)}
      flat
      gl={{ antialias: true }}
    >
      <Atmosphere game={game} />
      <Terrain game={game} />
      <Snowfall game={game} />
    </Canvas>
  )
}
