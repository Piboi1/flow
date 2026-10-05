import Scene from './scene/Scene'
import Metronome from './ui/Metronome'
import SlipFlash from './ui/SlipFlash'
import Intro from './ui/Intro'
import ProgressLine from './ui/ProgressLine'
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
      <ProgressLine percent={percent} />
      <Intro visible={phase === 'intro'} />
    </>
  )
}
