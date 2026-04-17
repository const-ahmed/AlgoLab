import { useCallback, useEffect, useRef, useState } from 'react'
import { computeSearchFrames } from './engine'
import type { SearchAlgorithm, AnySearchFrame } from './engine'
import { SPEED_MS } from '../../components/ui/SpeedSlider'

const DEFAULT_ARR = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29]
const DEFAULT_TARGET = 17

export default function useSearching(algorithm: SearchAlgorithm = 'linear', speed = 2) {
  const [arr] = useState<number[]>(DEFAULT_ARR)
  const [target, setTarget] = useState(DEFAULT_TARGET)
  const [frames, setFrames] = useState<AnySearchFrame[]>([])
  const [frameIdx, setFrameIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setup = useCallback((t: number) => {
    if (playTimer.current) clearTimeout(playTimer.current)
    setIsPlaying(false)
    setFrames(computeSearchFrames(algorithm, arr, t))
    setFrameIdx(0)
  }, [algorithm, arr])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setup(target)
  }, [target, setup])

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
    playTimer.current = setTimeout(() => goToFrame(frameIdx + 1), SPEED_MS[speed])
    return () => { if (playTimer.current) clearTimeout(playTimer.current) }
  }, [isPlaying, frameIdx, frames.length, goToFrame, speed])

  const togglePlay = useCallback(() => {
    if (isPlaying) { pause() } else {
      if (frameIdx >= frames.length - 1) return
      setIsPlaying(true)
    }
  }, [isPlaying, pause, frameIdx, frames.length])

  const updateTarget = useCallback((t: number) => {
    pause()
    setTarget(t)
  }, [pause])

  const reset = useCallback(() => setup(target), [setup, target])

  const currentFrame = frames[frameIdx] ?? null
  const atStart = frameIdx === 0
  const atEnd = frameIdx >= frames.length - 1

  return { arr, target, frames, frameIdx, currentFrame, isPlaying, atStart, atEnd, goToFrame, togglePlay, pause, updateTarget, reset }
}
