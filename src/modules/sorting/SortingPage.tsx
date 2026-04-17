import { useRef, useState } from 'react'
import PlaybackControls from '../../components/ui/PlaybackControls'
import ExplanationPanel from '../../components/ui/ExplanationPanel'
import MetricChip from '../../components/ui/MetricChip'
import Button from '../../components/ui/Button'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import UseMeWhen from '../../components/ui/UseMeWhen'
import SortCell, { CELL_SIZE, CELL_STRIDE } from './SortCell'
import { cellState } from './engine'
import type { SortAlgorithm } from './engine'
import useSorting from './useSorting'
import styles from './SortingPage.module.css'

const ALGORITHM_TABS = [
  { id: 'bubble',    label: 'Bubble' },
  { id: 'selection', label: 'Selection' },
  { id: 'insertion', label: 'Insertion' },
  { id: 'merge',     label: 'Merge' },
  { id: 'quick',     label: 'Quick' },
]

const USE_WHEN: Record<SortAlgorithm, string> = {
  bubble:    'your data is nearly sorted and you want the simplest possible implementation.',
  selection: 'writes are expensive - selection sort makes at most n−1 swaps regardless of input.',
  insertion: 'data arrives in a stream or is nearly sorted. Fastest for small n in practice.',
  merge:     'guaranteed O(n log n) is required, stability matters, or you are sorting a linked list.',
  quick:     'average-case speed is the priority. Fastest in practice for most in-memory datasets.',
}

export default function SortingPage() {
  const [algorithm, setAlgorithm] = useState<SortAlgorithm>('bubble')

  const {
    initArr, currentFrame, positions,
    isPlaying, busy, atStart, atEnd,
    goToFrame, frameIdx, togglePlay, pause,
    editValue, addElement, removeElement, randomise, reset,
  } = useSorting(algorithm)

  const [editingPos, setEditingPos] = useState<number | null>(null)
  const [editValue_, setEditValue_] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const n = initArr.length
  const wrapWidth = n * CELL_SIZE + (n - 1) * (CELL_STRIDE - CELL_SIZE)

  function openEdit(pos: number) {
    if (busy) return
    pause()
    setEditingPos(pos)
    setEditValue_(String(initArr[pos]))
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commitEdit() {
    if (editingPos === null) return
    const v = parseInt(editValue_)
    if (!isNaN(v) && v >= 1 && v <= 9) editValue(editingPos, v)
    setEditingPos(null)
  }

  function handleAlgorithmChange(id: string) {
    pause()
    setAlgorithm(id as SortAlgorithm)
  }

  return (
    <div className={styles.page}>


      <AlgorithmTabs tabs={ALGORITHM_TABS} active={algorithm} onChange={handleAlgorithmChange} />

      <div className={styles.scene}>
        <ExplanationPanel
          status={currentFrame?.statusSymbol ?? ''}
          detail={currentFrame?.statusDetail}
        />

        <div
          className={styles.arrayWrap}
          style={{ width: wrapWidth, height: CELL_SIZE }}
          aria-label="Array visualisation"
        >
          {algorithm === 'merge' && currentFrame?.mergeGroups?.map(([start, end], gi) => {
            const isMerging = currentFrame.mergingRange != null &&
              start >= currentFrame.mergingRange[0] && end <= currentFrame.mergingRange[1]
            return (
              <div
                key={`mg-${gi}-${start}-${end}`}
                className={`${styles.mergeGroup} ${isMerging ? styles.mergeGroupActive : ''}`}
                style={{
                  left: start * CELL_STRIDE - 6,
                  width: (end - start) * CELL_STRIDE + CELL_SIZE + 12,
                }}
              />
            )
          })}

          {initArr.map((_, i) => {
            if (!currentFrame) return null
            const posLeft = positions[i]
            const logicalPos = Math.round(posLeft / CELL_STRIDE)
            const state = cellState(logicalPos, currentFrame)
            return (
              <SortCell
                key={i}
                value={initArr[i]}
                position={i}
                state={state}
                left={posLeft}
                onEdit={openEdit}
              />
            )
          })}

          {editingPos !== null && (
            <input
              ref={inputRef}
              className={styles.editInput}
              style={{ left: positions[editingPos] }}
              type="number"
              min={1}
              max={9}
              value={editValue_}
              onChange={(e) => setEditValue_(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit()
                if (e.key === 'Escape') setEditingPos(null)
              }}
              onBlur={commitEdit}
              aria-label={`Edit value at position ${editingPos}`}
            />
          )}
        </div>

        <PlaybackControls
          isPlaying={isPlaying}
          atStart={atStart}
          atEnd={atEnd}
          onBack={() => { if (!busy) goToFrame(frameIdx - 1) }}
          onPlay={() => { if (!busy) togglePlay() }}
          onForward={() => { if (!busy) goToFrame(frameIdx + 1) }}
          onMinus={() => { pause(); removeElement() }}
          onPlus={() => { pause(); addElement() }}
          canMinus={n > 2}
          canPlus={n < 9}
        />

        {currentFrame && (currentFrame.comparisons > 0 || currentFrame.swaps > 0) && (
          <div className={styles.metrics} aria-label="Metrics">
            <MetricChip label="comparisons" value={currentFrame.comparisons} />
            <MetricChip label="swaps" value={currentFrame.swaps} />
          </div>
        )}

        <div className={styles.footerRow}>
          <Button size="sm" onClick={randomise} aria-label="Randomise array">
            randomise
          </Button>
          {atEnd && (
            <Button variant="pill" size="sm" onClick={reset} aria-label="Replay">
              replay
            </Button>
          )}
        </div>
      </div>

      <UseMeWhen content={USE_WHEN[algorithm]} />
    </div>
  )
}
