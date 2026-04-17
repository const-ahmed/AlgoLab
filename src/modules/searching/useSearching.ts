import { useCallback, useMemo, useState } from 'react'
import { computeSearchFrames } from './engine'
import type { SearchAlgorithm } from './engine'
import usePlayback from '../../hooks/usePlayback'

const DEFAULT_ARR = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29]
const DEFAULT_TARGET = 17

export default function useSearching(algorithm: SearchAlgorithm = 'linear', speed = 2) {
  const [arr] = useState(DEFAULT_ARR)
  const [target, setTarget] = useState(DEFAULT_TARGET)

  const frames = useMemo(() => computeSearchFrames(algorithm, arr, target), [algorithm, arr, target])
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(frames, speed)

  const updateTarget = useCallback((t: number) => { pause(); setTarget(t) }, [pause])
  const reset = useCallback(() => { pause(); goToFrame(0) }, [pause, goToFrame])

  return {
    arr, target, frames, frameIdx,
    currentFrame: frames[frameIdx] ?? null,
    isPlaying, atStart, atEnd,
    goToFrame, togglePlay, pause, updateTarget, reset,
  }
}
