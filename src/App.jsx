import Scene from './scene/Scene'
import Metronome from './ui/Metronome'
import SlipFlash from './ui/SlipFlash'
import Intro from './ui/Intro'
import Goggles from './ui/Goggles'
import Hud from './ui/Hud'
import EndScreen from './ui/EndScreen'
import { useClimb } from './game/useClimb'

export default function App() {
  const { game, phase, percent, slipKey, beginWork } = useClimb()

  if (phase === 'summit') return <EndScreen onBegin={beginWork} />

  return (
    <>
      <Scene game={game} />
      {phase === 'climbing' && <Metronome visible={percent < 30} />}
      <SlipFlash flashKey={slipKey} />
      <Goggles percent={percent} />
      {phase === 'climbing' && <Hud game={game} />}
      <Intro visible={phase === 'intro'} />
    </>
  )
}
