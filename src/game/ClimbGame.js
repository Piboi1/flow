import { CONFIG, PROGRESS_PER_STEP } from './config.js'

/**
 * Framework-free climb state machine. `now` is always a millisecond timestamp
 * (performance.now()) supplied by the caller so the rules are easy to test.
 *
 * `progress` is the true 0-100 value driven by taps and decay. `display` is a
 * smoothed copy of it that the visuals and audio read, so a step reads as a
 * surge rather than a pop.
 */
export class ClimbGame {
  constructor(config = CONFIG) {
    this.config = config
    this.reset()
  }

  reset() {
    this.started = false
    this.finished = false
    this.progress = 0
    this.display = 0
    this.steps = 0
    this.startedAt = 0
    this.lastStepAt = 0
    this.lastSlipAt = -Infinity
    this.slips = 0
  }

  begin(now) {
    this.reset()
    this.started = true
    this.startedAt = now
    // The opening tap lands on the first metronome beat, so the first climbing
    // step is judged against it like every other step.
    this.lastStepAt = now
  }

  /** @returns {'step' | 'slip' | 'ignored'} */
  press(now) {
    if (!this.started || this.finished) return 'ignored'
    if (now - this.lastStepAt < this.config.minIntervalMs) {
      this.lastSlipAt = now
      this.slips += 1
      return 'slip'
    }

    // Anything slower than minIntervalMs counts, including a late recovery tap;
    // lateness is already punished by decay.
    this.lastStepAt = now
    this.steps += 1
    this.progress = Math.min(100, this.progress + PROGRESS_PER_STEP)
    if (this.progress >= 100) this.finished = true
    return 'step'
  }

  isSluggish(now) {
    return this.started && !this.finished && now - this.lastStepAt > this.config.maxIntervalMs
  }

  /** Advance decay and smoothing. `dt` is in seconds. */
  update(dt, now) {
    if (!this.started) return
    if (this.isSluggish(now)) {
      this.progress = Math.max(0, this.progress - this.config.decayPerSecond * dt)
    }
    const diff = this.progress - this.display
    this.display = Math.abs(diff) < 0.05
      ? this.progress
      : this.display + diff * (1 - Math.exp(-this.config.smoothing * dt))
  }

  /** True once the final step has landed and the visuals have caught up. */
  get atSummit() {
    return this.finished && this.display >= 99.9
  }
}
