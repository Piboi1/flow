// Tuning knobs for the climb. Times are in milliseconds unless noted.
export const CONFIG = {
  // Target cadence: one tap every 1.2 s. 50 steps x 1.2 s = 60 s of climbing.
  stepMs: 1200,
  stepsToSummit: 50,
  // Tapping sooner than this after the last accepted step is a "slip" (ignored).
  minIntervalMs: 800,
  // Waiting longer than this since the last accepted step bleeds momentum.
  maxIntervalMs: 2000,
  // Progress points lost per second while sluggish.
  decayPerSecond: 4,
  // How quickly displayed progress chases the true progress (1/s).
  smoothing: 3,
}

export const PROGRESS_PER_STEP = 100 / CONFIG.stepsToSummit
