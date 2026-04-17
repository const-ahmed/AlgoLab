import { useState } from 'react'
import PlaybackControls from '../../components/ui/PlaybackControls'
import { DEFAULT_SPEED } from '../../components/ui/SpeedSlider'
import ExplanationPanel from '../../components/ui/ExplanationPanel'
import MetricChip from '../../components/ui/MetricChip'
import Button from '../../components/ui/Button'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import UseMeWhen from '../../components/ui/UseMeWhen'
import { TREE_NODES, TREE_EDGES, NODE_RADIUS, nodeState } from './engine'
import type { TraversalAlgorithm } from './engine'
import useTreeTraversal from './useTreeTraversal'
import styles from './TreeTraversalPage.module.css'

const ALGORITHM_TABS = [
  { id: 'preorder',   label: 'Pre-order' },
  { id: 'inorder',    label: 'In-order' },
  { id: 'postorder',  label: 'Post-order' },
  { id: 'levelorder', label: 'Level-order' },
]

const USE_WHEN: Record<TraversalAlgorithm, string> = {
  preorder:   'you need to copy or serialise a tree with parent nodes processed before their children.',
  inorder:    'you want sorted output from a binary search tree - guaranteed ascending order.',
  postorder:  'you need to delete a tree bottom-up, or evaluate expressions where children resolve before parents.',
  levelorder: 'you want to process nodes level by level, or find the shortest path in an unweighted tree.',
}

const TREE_W = 480
const TREE_H = 240

export default function TreeTraversalPage() {
  const [algorithm, setAlgorithm] = useState<TraversalAlgorithm>('preorder')
  const [speed, setSpeed] = useState(DEFAULT_SPEED)

  const { currentFrame, frameIdx, isPlaying, atStart, atEnd, goToFrame, togglePlay, pause, reset } = useTreeTraversal(algorithm, speed)

  function handleAlgorithmChange(id: string) {
    pause()
    setAlgorithm(id as TraversalAlgorithm)
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
          className={styles.treeWrap}
          style={{ width: TREE_W, height: TREE_H }}
          aria-label="Binary tree"
        >
          <svg
            className={styles.edgeSvg}
            width={TREE_W}
            height={TREE_H}
            aria-hidden="true"
          >
            {TREE_EDGES.map(([pId, cId]) => {
              const p = TREE_NODES[pId], c = TREE_NODES[cId]
              const dx = c.cx - p.cx, dy = c.cy - p.cy
              const len = Math.sqrt(dx * dx + dy * dy)
              const ux = dx / len, uy = dy / len
              const traversed = currentFrame != null &&
                (currentFrame.visited.includes(cId) || currentFrame.current === cId)
              return (
                <line
                  key={`${pId}-${cId}`}
                  x1={p.cx + ux * NODE_RADIUS}
                  y1={p.cy + uy * NODE_RADIUS}
                  x2={c.cx - ux * NODE_RADIUS}
                  y2={c.cy - uy * NODE_RADIUS}
                  className={traversed ? styles.edgeTraversed : styles.edge}
                />
              )
            })}
          </svg>

          {TREE_NODES.map(node => {
            const state = currentFrame ? nodeState(node.id, currentFrame) : 'idle'
            return (
              <div
                key={node.id}
                className={`${styles.node} ${styles[`node_${state}`]}`}
                style={{
                  left: node.cx - NODE_RADIUS,
                  top: node.cy - NODE_RADIUS,
                  width: NODE_RADIUS * 2,
                  height: NODE_RADIUS * 2,
                }}
                aria-label={`Node ${node.value}, ${state}`}
              >
                {node.value}
              </div>
            )
          })}
        </div>

        {currentFrame && currentFrame.order.length > 0 && (
          <div className={styles.orderRow} aria-label="Traversal order">
            {currentFrame.order.map((v, i) => (
              <span key={i} className={styles.orderItem}>{v}</span>
            ))}
          </div>
        )}

        <PlaybackControls
          isPlaying={isPlaying}
          atStart={atStart}
          atEnd={atEnd}
          onBack={() => goToFrame(frameIdx - 1)}
          onPlay={togglePlay}
          onForward={() => goToFrame(frameIdx + 1)}
          speed={speed}
          onSpeedChange={setSpeed}
        />

        {currentFrame && currentFrame.steps > 0 && (
          <div className={styles.metrics}>
            <MetricChip label="nodes visited" value={currentFrame.steps} />
          </div>
        )}

        {atEnd && (
          <div className={styles.footerRow}>
            <Button variant="pill" size="sm" onClick={reset}>replay</Button>
          </div>
        )}
      </div>

      <UseMeWhen content={USE_WHEN[algorithm]} />
    </div>
  )
}
