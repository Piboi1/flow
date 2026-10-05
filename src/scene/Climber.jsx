import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CAM_DIST, CHAR_X } from './world'
import { SPRITE_H, SPRITE_W, makePoseTextures } from './sprite'

const Z = 0.6

/** The pixel climber: a billboard whose pixels line up with the render grid. */
export default function Climber({ game, world }) {
  const mesh = useRef()
  const textures = useMemo(makePoseTextures, [])
  useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures])

  useFrame(({ camera, size, viewport }) => {
    const now = performance.now()
    const progress = game.display

    // World units covered by one render pixel at the climber's depth.
    const u =
      (2 * Math.tan((camera.fov * Math.PI) / 360) * (CAM_DIST - Z)) / (size.height * viewport.dpr)

    const since = now - game.lastStepAt
    const stepping = game.started && game.steps > 0
    let pose = 'idle'
    if (now - game.lastSlipAt < 450) pose = 'slip'
    else if (stepping && since < 150) pose = 'stepA'
    else if (stepping && since < 360) pose = 'stepB'
    else if (progress > 97) pose = 'stepA' // axe overhead at the top

    const sluggish = game.isSluggish(now)
    const shiverX = sluggish ? Math.floor(now / 90) % 2 : 0
    const breatheY = !sluggish && pose === 'idle' ? Math.floor(now / 600) % 2 : 0

    const feetY = world.top(0, CHAR_X, world.scroll, progress)
    const snap = (v) => Math.round(v / u) * u
    mesh.current.material.map = textures[pose]
    mesh.current.scale.setScalar(u)
    mesh.current.position.set(
      snap(CHAR_X) + shiverX * u,
      snap(feetY) + (SPRITE_H / 2 - 1 - breatheY) * u,
      Z,
    )
  })

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[SPRITE_W, SPRITE_H]} />
      <meshBasicMaterial map={textures.idle} transparent alphaTest={0.5} fog={false} toneMapped={false} />
    </mesh>
  )
}
