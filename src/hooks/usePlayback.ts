import { useCallback, useEffect, useRef, useState } from 'react'
import { SPEED_MS } from '../components/ui/SpeedSlider'

export default function usePlayback<T>(frames: T[], speed: number) {
  const [frameIdx, setFrameIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setFrameIdx(0)
    setIsPlaying(false)
    if (playTimer.current) { clearTimeout(playTimer.current); playTimer.current = null }
  }, [frames])

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
      setIsPlaying(false)
      return
    }
    playTimer.current = setTimeout(() => goToFrame(frameIdx + 1), SPEED_MS[speed])
    return () => { if (playTimer.current) clearTimeout(playTimer.current) }
  }, [isPlaying, frameIdx, frames.length, goToFrame, speed])

  const togglePlay = useCallback(() => {
    if (isPlaying) pause()
    else if (frameIdx < frames.length - 1) setIsPlaying(true)
  }, [isPlaying, pause, frameIdx, frames.length])

  return {
    frameIdx,
    isPlaying,
    atStart: frameIdx === 0,
    atEnd: frameIdx >= frames.length - 1,
    goToFrame,
    pause,
    togglePlay,
  }
}
