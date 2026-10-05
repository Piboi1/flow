import test from 'node:test'
import assert from 'node:assert/strict'
import { ClimbGame } from './ClimbGame.js'
import { CONFIG, PROGRESS_PER_STEP } from './config.js'

const started = () => {
  const g = new ClimbGame()
  g.begin(0)
  return g
}

test('ignores taps before the climb begins', () => {
  assert.equal(new ClimbGame().press(1000), 'ignored')
})

test('taps faster than 800ms are slips and change nothing', () => {
  const g = started()
  assert.equal(g.press(799), 'slip')
  assert.equal(g.progress, 0)
  assert.equal(g.press(800), 'step')
})

test('a slip does not reset the rhythm clock', () => {
  const g = started()
  g.press(1200)
  assert.equal(g.press(1500), 'slip')
  // 800ms after the accepted step at 1200, not after the slip at 1500.
  assert.equal(g.press(2000), 'step')
})

test('a perfect tap advances progress by one step', () => {
  const g = started()
  g.press(1200)
  assert.equal(g.progress, PROGRESS_PER_STEP)
  assert.equal(g.steps, 1)
})

test('no decay inside the 2s window, decay after it', () => {
  const g = started()
  g.press(1200)
  g.update(0.5, 3000)
  assert.equal(g.progress, PROGRESS_PER_STEP)
  g.update(0.5, 3300)
  assert.equal(g.progress, PROGRESS_PER_STEP - CONFIG.decayPerSecond * 0.5)
})

test('progress never goes below zero', () => {
  const g = started()
  g.press(1200)
  for (let t = 4000; t < 20000; t += 100) g.update(0.1, t)
  assert.equal(g.progress, 0)
})

test('late taps still count as steps', () => {
  const g = started()
  assert.equal(g.press(5000), 'step')
})

test('50 steps at the 1.2s cadence reach the summit in 60 seconds', () => {
  const g = started()
  let t = 0
  for (let i = 0; i < CONFIG.stepsToSummit; i++) {
    t += CONFIG.stepMs
    assert.equal(g.press(t), 'step')
  }
  assert.equal(t, 60000)
  assert.equal(g.progress, 100)
  assert.ok(g.finished)
})

test('display catches up before the summit is reported, and input locks', () => {
  const g = started()
  let t = 0
  for (let i = 0; i < CONFIG.stepsToSummit; i++) {
    t += CONFIG.stepMs
    g.press(t)
    g.update(CONFIG.stepMs / 1000, t)
  }
  assert.equal(g.atSummit, true)
  assert.equal(g.press(t + 5000), 'ignored')
})
