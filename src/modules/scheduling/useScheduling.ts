import { useCallback, useMemo } from 'react'
import { computeScheduleFrames, DEFAULT_PROCESSES } from './engine'
import type { SchedulingAlgorithm } from './engine'
import usePlayback from '../../hooks/usePlayback'

export default function useScheduling(algorithm: SchedulingAlgorithm = 'fcfs', speed = 2) {
  const frames = useMemo(() => computeScheduleFrames(algorithm, DEFAULT_PROCESSES), [algorithm])
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(frames, speed)
  const reset = useCallback(() => { pause(); goToFrame(0) }, [pause, goToFrame])

  return {
    frames, frameIdx,
    currentFrame: frames[frameIdx] ?? null,
    isPlaying, atStart, atEnd,
    goToFrame, pause, togglePlay, reset,
  }
}
