# The Ascent

A 60-second interactive transition that uses rhythmic entrainment to get you from
procrastinating into flow. Climb a procedural blizzard mountain by tapping
`Space` about once every 1.2 seconds.

## Run

```bash
npm install
npm run dev      # development
npm run build    # production build in dist/
npm test         # unit tests for the climb rules
```

## Rules

| Input | Result |
| --- | --- |
| Tap < 800 ms after the last step | Ignored, screen flashes red (a slip) |
| Tap 800 ms or later | Step: progress +2, footstep sound, terrain surge |
| No tap for > 2000 ms | Progress bleeds away (4 points/second) until you tap |
| 50 steps at 1.2 s | 100 progress, summit, about 60 seconds |

Tuning lives in `src/game/config.js`. The first `Space` press only starts the
audio (browsers require a gesture) and the climb.

## Layout

- `src/game/` rules (`ClimbGame.js`, framework-free and tested) and the `useClimb` hook
- `src/scene/` React Three Fiber side-view scene: layered faceted mountain (`Mountain.jsx`, `world.js`), pixel climber (`Climber.jsx`, `sprite.js`), fog/sky/lighting, snowfall. It renders at ~320x180 and is scaled up unfiltered for the pixel look.
- `src/audio/engine.js` all Tone.js synthesis (wind, footsteps, summit chord)
- `src/ui/` metronome vignette, slip flash, intro, end screen

At the summit the `ascent:begin-work` event fires on `window` when "Begin Work" is
clicked; hook your own next step onto it.
