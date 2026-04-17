import { useCallback, useMemo } from 'react'
import { computeGraphFrames } from './engine'
import type { GraphAlgorithm } from './engine'
import usePlayback from '../../hooks/usePlayback'

export default function useGraphTraversal(algorithm: GraphAlgorithm = 'dfs', speed = 2) {
  const frames = useMemo(() => computeGraphFrames(algorithm), [algorithm])
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(frames, speed)
  const reset = useCallback(() => { pause(); goToFrame(0) }, [pause, goToFrame])

  return {
    frames, frameIdx,
    currentFrame: frames[frameIdx] ?? null,
    isPlaying, atStart, atEnd,
    goToFrame, pause, togglePlay, reset,
  }
}
