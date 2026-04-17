import { useCallback, useEffect, useRef, useState } from 'react'
import { computeTraversalFrames } from './engine'
import type { TraversalAlgorithm, TraversalFrame } from './engine'

const PLAY_INTERVAL = 700

export default function useTreeTraversal(algorithm: TraversalAlgorithm = 'preorder') {
  const [frames, setFrames] = useState<TraversalFrame[]>([])
  const [frameIdx, setFrameIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setup = useCallback(() => {
    if (playTimer.current) clearTimeout(playTimer.current)
    setIsPlaying(false)
    setFrames(computeTraversalFrames(algorithm))
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
  const atStart = frameIdx === 0
  const atEnd = frameIdx >= frames.length - 1

  return { frames, frameIdx, currentFrame, isPlaying, atStart, atEnd, goToFrame, togglePlay, pause, reset }
}
