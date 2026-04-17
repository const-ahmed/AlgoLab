import { useState } from 'react'
import PlaybackControls from '../../components/ui/PlaybackControls'
import { DEFAULT_SPEED } from '../../components/ui/SpeedSlider'
import ExplanationPanel from '../../components/ui/ExplanationPanel'
import MetricChip from '../../components/ui/MetricChip'
import Button from '../../components/ui/Button'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import UseMeWhen from '../../components/ui/UseMeWhen'
import { GRAPH_NODES, GRAPH_EDGES, NODE_R, GRAPH_W, GRAPH_H, graphNodeState } from './engine'
import type { GraphAlgorithm } from './engine'
import useGraphTraversal from './useGraphTraversal'
import styles from './GraphTraversalPage.module.css'

const ALGORITHM_TABS = [
  { id: 'dfs', label: 'Depth-First (DFS)' },
  { id: 'bfs', label: 'Breadth-First (BFS)' },
]

const USE_WHEN: Record<GraphAlgorithm, string> = {
  dfs: 'you need to detect cycles, explore all paths exhaustively, or memory is limited.',
  bfs: 'you need the shortest path in an unweighted graph, or want to visit all immediate neighbours before going deeper.',
}

export default function GraphTraversalPage() {
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>('dfs')
  const [speed, setSpeed] = useState(DEFAULT_SPEED)

  const { currentFrame, frameIdx, isPlaying, atStart, atEnd, goToFrame, togglePlay, pause, reset } = useGraphTraversal(algorithm, speed)

  function handleAlgorithmChange(id: string) {
    pause()
    setAlgorithm(id as GraphAlgorithm)
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
          className={styles.graphWrap}
          style={{ width: GRAPH_W, height: GRAPH_H }}
          aria-label="Graph"
        >
          <svg
            className={styles.edgeSvg}
            width={GRAPH_W}
            height={GRAPH_H}
            aria-hidden="true"
          >
            {GRAPH_EDGES.map(({ a, b }) => {
              const na = GRAPH_NODES[a], nb = GRAPH_NODES[b]
              const dx = nb.cx - na.cx, dy = nb.cy - na.cy
              const len = Math.sqrt(dx * dx + dy * dy)
              const ux = dx / len, uy = dy / len
              const isActive = currentFrame && (
                (currentFrame.visited.includes(a) || currentFrame.current === a) &&
                (currentFrame.visited.includes(b) || currentFrame.current === b)
              )
              return (
                <line
                  key={`${a}-${b}`}
                  x1={na.cx + ux * NODE_R}
                  y1={na.cy + uy * NODE_R}
                  x2={nb.cx - ux * NODE_R}
                  y2={nb.cy - uy * NODE_R}
                  className={isActive ? styles.edgeActive : styles.edge}
                />
              )
            })}
          </svg>

          {GRAPH_NODES.map(node => {
            const state = currentFrame ? graphNodeState(node.id, currentFrame) : 'idle'
            return (
              <div
                key={node.id}
                className={`${styles.node} ${styles[`node_${state}`]}`}
                style={{
                  left: node.cx - NODE_R,
                  top: node.cy - NODE_R,
                  width: NODE_R * 2,
                  height: NODE_R * 2,
                }}
                aria-label={`Node ${node.label}, ${state}`}
              >
                {node.label}
              </div>
            )
          })}
        </div>

        {currentFrame && currentFrame.frontier.length > 0 && (
          <div className={styles.frontierRow}>
            <span className={styles.frontierLabel}>
              {algorithm === 'dfs' ? 'stack' : 'queue'}
            </span>
            {currentFrame.frontier.map((id, i) => (
              <span key={i} className={styles.frontierItem}>
                {GRAPH_NODES[id].label}
              </span>
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
