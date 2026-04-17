import { useCallback, useMemo } from 'react'
import { computeTraversalFrames } from './engine'
import type { TraversalAlgorithm } from './engine'
import usePlayback from '../../hooks/usePlayback'

export default function useTreeTraversal(algorithm: TraversalAlgorithm = 'preorder', speed = 2) {
  const frames = useMemo(() => computeTraversalFrames(algorithm), [algorithm])
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(frames, speed)
  const reset = useCallback(() => { pause(); goToFrame(0) }, [pause, goToFrame])

  return {
    frames, frameIdx,
    currentFrame: frames[frameIdx] ?? null,
    isPlaying, atStart, atEnd,
    goToFrame, pause, togglePlay, reset,
  }
}
