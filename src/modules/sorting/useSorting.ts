import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { computeSortFrames } from './engine'
import type { SortAlgorithm } from './engine'
import { CELL_STRIDE, SWAP_DURATION } from './SortCell'
import { SPEED_MS } from '../../components/ui/SpeedSlider'

const DEFAULT_ARRAY = [5, 3, 8, 1, 6, 2, 7, 4]

export default function useSorting(algorithm: SortAlgorithm = 'bubble', speed = 2) {
  const [initArr, setInitArr] = useState<number[]>(DEFAULT_ARRAY)
  const [positions, setPositions] = useState<number[]>(() => DEFAULT_ARRAY.map((_, i) => i * CELL_STRIDE))
  const [frameIdx, setFrameIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [busy, setBusy] = useState(false)

  const positionsRef = useRef<number[]>(positions)
  const busyRef = useRef(false)
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const frames = useMemo(() => computeSortFrames(algorithm, initArr), [algorithm, initArr])

  useEffect(() => {
    busyRef.current = false
    setBusy(false)
    const p = initArr.map((_, i) => i * CELL_STRIDE)
    positionsRef.current = p
    setPositions(p)
    if (playTimer.current) clearTimeout(playTimer.current)
    setIsPlaying(false)
    setFrameIdx(0)
  }, [initArr, algorithm])

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

      setTimeout(() => { busyRef.current = false; setBusy(false) }, SWAP_DURATION)
    } else {
      setFrameIdx(clamped)
    }
  }, [frames, frameIdx])

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
    playTimer.current = setTimeout(
      () => goToFrame(frameIdx + 1),
      Math.max(SWAP_DURATION + 60, SPEED_MS[speed]),
    )
    return () => { if (playTimer.current) clearTimeout(playTimer.current) }
  }, [isPlaying, frameIdx, frames.length, goToFrame, speed])

  const togglePlay = useCallback(() => {
    if (isPlaying) pause()
    else if (frameIdx < frames.length - 1) setIsPlaying(true)
  }, [isPlaying, pause, frameIdx, frames.length])

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

  const reset = useCallback(() => {
    setInitArr(prev => [...prev])
  }, [])

  return {
    initArr, frames, frameIdx, positions,
    currentFrame: frames[frameIdx] ?? null,
    isPlaying, busy,
    atStart: frameIdx === 0,
    atEnd: frameIdx >= frames.length - 1,
    goToFrame, togglePlay, pause,
    editValue, addElement, removeElement, randomise, reset,
  }
}
