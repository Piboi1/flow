import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Mountain from './Mountain'
import Climber from './Climber'
import Atmosphere from './Atmosphere'
import Snowfall from './Snowfall'
import { CAM_DIST, CAM_FOV, createWorld } from './world'

const RENDER_HEIGHT = 180 // internal pixel rows; CSS scales it up crisply

function usePixelRatio() {
  const calc = () => Math.min(1, RENDER_HEIGHT / window.innerHeight)
  const [ratio, setRatio] = useState(calc)
  useEffect(() => {
    const onResize = () => setRatio(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return ratio
}

/** Static side-on camera. The scene renders at ~320x180 and is scaled up unfiltered. */
export default function Scene({ game }) {
  const world = useMemo(createWorld, [])
  const dpr = usePixelRatio()
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, imageRendering: 'pixelated' }}
      dpr={dpr}
      camera={{ fov: CAM_FOV, near: 0.5, far: 500, position: [0, 0, CAM_DIST] }}
      flat
      gl={{ antialias: false }}
    >
      <Atmosphere game={game} />
      <Mountain game={game} world={world} />
      <Climber game={game} world={world} />
      <Snowfall game={game} />
    </Canvas>
  )
}
