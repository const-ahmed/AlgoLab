import { useRef, useState } from 'react'
import PlaybackControls from '../../components/ui/PlaybackControls'
import ExplanationPanel from '../../components/ui/ExplanationPanel'
import MetricChip from '../../components/ui/MetricChip'
import Button from '../../components/ui/Button'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import UseMeWhen from '../../components/ui/UseMeWhen'
import SearchCell, { CELL_SIZE } from './SearchCell'
import { cellSearchState, treeSearchNodeState, TREE_NODES, TREE_EDGES, NODE_RADIUS } from './engine'
import type { SearchAlgorithm, SearchFrame, TreeSearchFrame } from './engine'
import useSearching from './useSearching'
import styles from './SearchingPage.module.css'

const ALGORITHM_TABS = [
  { id: 'linear', label: 'Linear' },
  { id: 'binary', label: 'Binary' },
  { id: 'dfs',    label: 'DFS' },
  { id: 'bfs',    label: 'BFS' },
]

const USE_WHEN: Record<SearchAlgorithm, string> = {
  linear: 'the list is unsorted, very small, or you only need to search it once.',
  binary: 'the list is sorted and you need fast repeated lookups - O(log n) vs. O(n).',
  dfs:    'you want to exhaustively explore paths, detect cycles, or the target is likely deep in the tree.',
  bfs:    'you need the shortest path in an unweighted structure, or the target is likely near the root.',
}

const ARRAY_PRESETS = [5, 11, 17, 23, 29, 7]
const TREE_PRESETS  = [1, 2, 3, 4, 5, 6, 7]
const CELL_GAP    = 7   // matches var(--sp-2)
const CELL_STRIDE = CELL_SIZE + CELL_GAP
const TREE_W = 480
const TREE_H = 240

export default function SearchingPage() {
  const [algorithm, setAlgorithm] = useState<SearchAlgorithm>('linear')
  const [editingTarget, setEditingTarget] = useState(false)
  const [editTargetValue, setEditTargetValue] = useState('')
  const targetInputRef = useRef<HTMLInputElement>(null)

  const {
    arr, target, currentFrame, frameIdx, isPlaying, atStart, atEnd,
    goToFrame, togglePlay, pause, updateTarget, reset,
  } = useSearching(algorithm)

  const isTreeAlgorithm = algorithm === 'dfs' || algorithm === 'bfs'
  const treeFrame  = (currentFrame && 'kind' in currentFrame && currentFrame.kind === 'tree')
    ? currentFrame as TreeSearchFrame : null
  const arrayFrame = (currentFrame && !('kind' in currentFrame))
    ? currentFrame as SearchFrame : null
  const presets = isTreeAlgorithm ? TREE_PRESETS : ARRAY_PRESETS

  function handleAlgorithmChange(id: string) {
    pause()
    setAlgorithm(id as SearchAlgorithm)
  }

  function openTargetEdit() {
    pause()
    setEditTargetValue(String(target))
    setEditingTarget(true)
    setTimeout(() => { targetInputRef.current?.select() }, 0)
  }

  function commitTargetEdit() {
    const v = parseInt(editTargetValue)
    if (!isNaN(v) && v >= 1 && v <= 99) updateTarget(v)
    setEditingTarget(false)
  }

  return (
    <div className={styles.page}>


      <AlgorithmTabs tabs={ALGORITHM_TABS} active={algorithm} onChange={handleAlgorithmChange} />

      <div className={styles.scene}>
        <ExplanationPanel
          status={currentFrame?.statusSymbol ?? ''}
          detail={currentFrame?.statusDetail}
        />

        <div className={styles.targetRow}>
          <span className={styles.targetLabel}>target</span>
          {editingTarget ? (
            <input
              ref={targetInputRef}
              className={styles.targetInput}
              type="number"
              min={1}
              max={99}
              value={editTargetValue}
              onChange={(e) => setEditTargetValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTargetEdit()
                if (e.key === 'Escape') setEditingTarget(false)
              }}
              onBlur={commitTargetEdit}
              aria-label="Edit search target"
            />
          ) : (
            <button
              className={styles.targetValue}
              onClick={openTargetEdit}
              aria-label={`Search target ${target}, click to edit`}
            >
              {target}
            </button>
          )}
        </div>

        {!isTreeAlgorithm && (
          <div className={styles.arrayWrap} aria-label="Array">
            {algorithm === 'binary' && arrayFrame?.low != null && arrayFrame.high != null && (
              <div
                className={styles.searchPartition}
                style={{
                  left:  arrayFrame.low  * CELL_STRIDE - 6,
                  width: (arrayFrame.high - arrayFrame.low) * CELL_STRIDE + CELL_SIZE + 12,
                }}
              />
            )}
            <div className={styles.arrayRow}>
              {arr.map((v, i) => (
                <SearchCell
                  key={i}
                  value={v}
                  index={i}
                  state={arrayFrame ? cellSearchState(i, arrayFrame) : 'idle'}
                />
              ))}
            </div>
          </div>
        )}

        {isTreeAlgorithm && (
          <div
            className={styles.treeWrap}
            style={{ width: TREE_W, height: TREE_H }}
            aria-label="Binary tree"
          >
            <svg className={styles.treeSvg} width={TREE_W} height={TREE_H} aria-hidden="true">
              {TREE_EDGES.map(([pId, cId]) => {
                const p = TREE_NODES[pId], c = TREE_NODES[cId]
                const dx = c.cx - p.cx, dy = c.cy - p.cy
                const len = Math.sqrt(dx * dx + dy * dy)
                const ux = dx / len, uy = dy / len
                const traversed = treeFrame != null &&
                  (treeFrame.visited.includes(cId) || treeFrame.current === cId || treeFrame.found === cId)
                return (
                  <line
                    key={`${pId}-${cId}`}
                    x1={p.cx + ux * NODE_RADIUS} y1={p.cy + uy * NODE_RADIUS}
                    x2={c.cx - ux * NODE_RADIUS} y2={c.cy - uy * NODE_RADIUS}
                    className={traversed ? styles.treeEdgeTraversed : styles.treeEdge}
                  />
                )
              })}
            </svg>
            {TREE_NODES.map(node => {
              const state = treeFrame ? treeSearchNodeState(node.id, treeFrame) : 'idle'
              return (
                <div
                  key={node.id}
                  className={`${styles.treeNode} ${styles[`treeNode_${state}`]}`}
                  style={{
                    left: node.cx - NODE_RADIUS,
                    top:  node.cy - NODE_RADIUS,
                    width:  NODE_RADIUS * 2,
                    height: NODE_RADIUS * 2,
                  }}
                  aria-label={`Node ${node.value}, ${state}`}
                >
                  {node.value}
                </div>
              )
            })}
          </div>
        )}

        <PlaybackControls
          isPlaying={isPlaying}
          atStart={atStart}
          atEnd={atEnd}
          onBack={() => goToFrame(frameIdx - 1)}
          onPlay={togglePlay}
          onForward={() => goToFrame(frameIdx + 1)}
        />

        {currentFrame && currentFrame.comparisons > 0 && (
          <div className={styles.metrics}>
            <MetricChip label="comparisons" value={currentFrame.comparisons} />
          </div>
        )}

        <div className={styles.footerRow}>
          <span className={styles.presetLabel}>search for</span>
          {presets.map(t => (
            <Button
              key={t}
              size="sm"
              variant={t === target ? 'pill' : 'default'}
              onClick={() => updateTarget(t)}
            >
              {t}
            </Button>
          ))}
          {atEnd && (
            <Button variant="pill" size="sm" onClick={reset}>replay</Button>
          )}
        </div>
      </div>

      <UseMeWhen content={USE_WHEN[algorithm]} />
    </div>
  )
}
