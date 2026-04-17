import { useCallback, useEffect, useRef, useState } from 'react'
import { computeScheduleFrames, DEFAULT_PROCESSES } from './engine'
import type { SchedulingAlgorithm, ScheduleFrame } from './engine'

const PLAY_INTERVAL = 400

export default function useScheduling(algorithm: SchedulingAlgorithm = 'fcfs') {
  const [frames, setFrames] = useState<ScheduleFrame[]>([])
  const [frameIdx, setFrameIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setup = useCallback(() => {
    if (playTimer.current) clearTimeout(playTimer.current)
    setIsPlaying(false)
    setFrames(computeScheduleFrames(algorithm, DEFAULT_PROCESSES))
    setFrameIdx(0)
  }, [algorithm])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setup()
  }, [setup])

  const goToFrame = useCallback((idx: number) => {
    setFrameIdx(Math.max(0, Math.min(frames.length - 1, idx)))
  }, [frames.length])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (playTimer.current) { clearTimeout(playTimer.current); playTimer.current = null }
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    if (frameIdx >= frames.length - 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false)
      return
    }
    playTimer.current = setTimeout(() => goToFrame(frameIdx + 1), PLAY_INTERVAL)
    return () => { if (playTimer.current) clearTimeout(playTimer.current) }
  }, [isPlaying, frameIdx, frames.length, goToFrame])

  const togglePlay = useCallback(() => {
    if (isPlaying) { pause() } else {
      if (frameIdx >= frames.length - 1) return
      setIsPlaying(true)
    }
  }, [isPlaying, pause, frameIdx, frames.length])

  const reset = useCallback(() => setup(), [setup])

  const currentFrame = frames[frameIdx] ?? null
  return {
    frames, frameIdx, currentFrame, isPlaying,
    atStart: frameIdx === 0,
    atEnd: frameIdx >= frames.length - 1,
    goToFrame, togglePlay, pause, reset,
  }
}
