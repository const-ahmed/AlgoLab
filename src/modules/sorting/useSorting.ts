import { useCallback, useEffect, useRef, useState } from 'react'
import { computeSortFrames } from './engine'
import type { SortAlgorithm, SortFrame } from './engine'
import { CELL_STRIDE, SWAP_DURATION } from './SortCell'

const DEFAULT_ARRAY = [5, 3, 8, 1, 6, 2, 7, 4]
const PLAY_INTERVAL = 500

export default function useSorting(algorithm: SortAlgorithm = 'bubble') {
  const [initArr, setInitArr] = useState<number[]>(DEFAULT_ARRAY)
  const [frames, setFrames] = useState<SortFrame[]>([])
  const [frameIdx, setFrameIdx] = useState(0)
  const [positions, setPositions] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [busy, setBusy] = useState(false)

  const positionsRef = useRef<number[]>([])
  const busyRef = useRef(false)
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Setup ───────────────────────────────────────────────────────────────
  const setup = useCallback((arr: number[]) => {
    if (playTimer.current) clearTimeout(playTimer.current)
    busyRef.current = false
    const initialPositions = arr.map((_, i) => i * CELL_STRIDE)
    positionsRef.current = initialPositions
    setIsPlaying(false)
    setBusy(false)
    setFrames(computeSortFrames(algorithm, arr))
    setFrameIdx(0)
    setPositions(initialPositions)
  }, [algorithm])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setup(initArr)
  }, [initArr, setup])

  // ─── Frame navigation ────────────────────────────────────────────────────
  const goToFrame = useCallback((target: number) => {
    if (busyRef.current) return
    const clamped = Math.max(0, Math.min(frames.length - 1, target))
    const prev = frames[frameIdx]
    const curr = frames[clamped]

    const diffs = prev?.arr.reduce<number[]>(
      (acc, v, i) => (curr.arr[i] !== v ? [...acc, i] : acc), [],
    )

    if (diffs && diffs.length === 2) {
      const [j, k] = diffs
      const cur = positionsRef.current
      const elemAtJ = cur.findIndex((p) => Math.round(p / CELL_STRIDE) === j)
      const elemAtK = cur.findIndex((p) => Math.round(p / CELL_STRIDE) === k)
      if (elemAtJ === -1 || elemAtK === -1) return

      busyRef.current = true
      setBusy(true)

      const newPos = [...positionsRef.current]
      ;[newPos[elemAtJ], newPos[elemAtK]] = [newPos[elemAtK], newPos[elemAtJ]]
      positionsRef.current = newPos
      setPositions(newPos)
      setFrameIdx(clamped)

      setTimeout(() => {
        busyRef.current = false
        setBusy(false)
      }, SWAP_DURATION)
    } else {
      setFrameIdx(clamped)
    }
  }, [frames, frameIdx])

  // ─── Playback ────────────────────────────────────────────────────────────
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
    playTimer.current = setTimeout(() => { goToFrame(frameIdx + 1) }, PLAY_INTERVAL)
    return () => { if (playTimer.current) clearTimeout(playTimer.current) }
  }, [isPlaying, frameIdx, frames.length, goToFrame])

  const play = useCallback(() => {
    if (frameIdx >= frames.length - 1) return
    setIsPlaying(true)
  }, [frameIdx, frames.length])

  const togglePlay = useCallback(() => {
    if (isPlaying) { pause() } else { play() }
  }, [isPlaying, pause, play])

  // ─── Array editing ───────────────────────────────────────────────────────
  const editValue = useCallback((pos: number, value: number) => {
    setInitArr(prev => { const next = [...prev]; next[pos] = value; return next })
  }, [])

  const addElement = useCallback(() => {
    setInitArr(prev => prev.length < 9 ? [...prev, Math.ceil(Math.random() * 9)] : prev)
  }, [])

  const removeElement = useCallback(() => {
    setInitArr(prev => prev.length > 2 ? prev.slice(0, -1) : prev)
  }, [])

  const randomise = useCallback(() => {
    setInitArr(prev => prev.map(() => Math.ceil(Math.random() * 9)))
  }, [])

  const reset = useCallback(() => { setup(initArr) }, [initArr, setup])

  const currentFrame = frames[frameIdx] ?? null
  const atStart = frameIdx === 0
  const atEnd = frameIdx >= frames.length - 1

  return {
    initArr, frames, frameIdx, positions, currentFrame,
    isPlaying, busy, atStart, atEnd,
    goToFrame, togglePlay, pause,
    editValue, addElement, removeElement, randomise, reset,
  }
}
