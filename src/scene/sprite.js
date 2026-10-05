import * as THREE from 'three'

export const SPRITE_W = 16
export const SPRITE_H = 24

const C = {
  hat: '#d94b4b',
  fur: '#f4f4f4',
  skin: '#f2c9a0',
  eye: '#1b1d24',
  scarf: '#f2a33a',
  jacket: '#3a7bd5',
  shade: '#2c5fae',
  belt: '#1f2430',
  pack: '#c47a2c',
  packShade: '#9c5d1d',
  pants: '#343845',
  boot: '#5b3a29',
  glove: '#e8b04a',
  wood: '#8b6b3d',
  steel: '#c9d3dd',
}

const POSES = {
  // Axe carried at the side, boots planted.
  idle: { dx: 0, legs: 'stand', arm: 'carry' },
  // Front knee up, axe raised for the next bite.
  stepA: { dx: 0, legs: 'lift', arm: 'raised' },
  // Weight forward, axe driven into the slope.
  stepB: { dx: 1, legs: 'forward', arm: 'planted' },
  // Feet skid out from under the climber.
  slip: { dx: -1, legs: 'splay', arm: 'flail' },
}
export const POSE_NAMES = Object.keys(POSES)

function draw(ctx, pose) {
  const r = (x, y, w, h, c) => {
    ctx.fillStyle = c
    ctx.fillRect(x, y, w, h)
  }
  const { dx, legs, arm } = POSES[pose]

  // Backpack, then body, head and scarf, all shifted by dx for lean.
  r(2 + dx, 9, 3, 6, C.pack)
  r(2 + dx, 13, 3, 2, C.packShade)
  r(5 + dx, 9, 7, 7, C.jacket)
  r(5 + dx, 9, 2, 7, C.shade)
  r(5 + dx, 15, 7, 1, C.belt)
  r(7 + dx, 0, 2, 1, C.fur)
  r(5 + dx, 1, 6, 3, C.hat)
  r(5 + dx, 4, 7, 1, C.fur)
  r(6 + dx, 5, 5, 3, C.skin)
  r(9 + dx, 6, 1, 1, C.eye)
  r(5 + dx, 8, 7, 1, C.scarf)

  // Legs and boots.
  if (legs === 'stand') {
    r(5, 16, 3, 6, C.pants)
    r(8, 16, 3, 6, C.pants)
    r(4, 22, 4, 2, C.boot)
    r(8, 22, 4, 2, C.boot)
  } else if (legs === 'lift') {
    r(5, 16, 3, 6, C.pants)
    r(4, 22, 4, 2, C.boot)
    r(8, 16, 4, 2, C.pants)
    r(11, 17, 2, 3, C.pants)
    r(11, 20, 3, 2, C.boot)
  } else if (legs === 'forward') {
    r(6, 16, 3, 6, C.pants)
    r(9, 16, 3, 6, C.pants)
    r(5, 22, 4, 2, C.boot)
    r(9, 22, 4, 2, C.boot)
  } else {
    r(3, 16, 3, 5, C.pants)
    r(1, 21, 4, 2, C.boot)
    r(9, 16, 3, 4, C.pants)
    r(11, 19, 4, 2, C.boot)
  }

  // Arm and ice axe.
  if (arm === 'carry') {
    r(10, 10, 2, 5, C.shade)
    r(10, 15, 2, 1, C.glove)
    r(12, 10, 1, 9, C.wood)
    r(12, 9, 3, 1, C.steel)
  } else if (arm === 'raised') {
    r(10, 9, 4, 2, C.shade)
    r(13, 8, 2, 2, C.glove)
    r(14, 3, 1, 6, C.wood)
    r(13, 2, 3, 1, C.steel)
    r(15, 3, 1, 1, C.steel)
  } else if (arm === 'planted') {
    r(10 + dx, 11, 4, 2, C.shade)
    r(13, 11, 2, 2, C.glove)
    r(14, 12, 1, 10, C.wood)
    r(13, 11, 3, 1, C.steel)
  } else {
    r(9 + dx, 7, 3, 2, C.shade)
    r(11, 5, 2, 2, C.glove)
    r(13, 1, 1, 6, C.wood)
    r(12, 0, 3, 1, C.steel)
  }
}

/** One crisp, unfiltered texture per pose. Caller disposes them. */
export function makePoseTextures() {
  const out = {}
  for (const name of POSE_NAMES) {
    const canvas = document.createElement('canvas')
    canvas.width = SPRITE_W
    canvas.height = SPRITE_H
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    draw(ctx, name)
    const tex = new THREE.CanvasTexture(canvas)
    tex.magFilter = THREE.NearestFilter
    tex.minFilter = THREE.NearestFilter
    tex.generateMipmaps = false
    tex.colorSpace = THREE.SRGBColorSpace
    out[name] = tex
  }
  return out
}
