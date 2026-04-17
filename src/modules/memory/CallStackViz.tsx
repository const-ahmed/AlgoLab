import { useCallback, useMemo, useState } from 'react'
import PlaybackControls from '../../components/ui/PlaybackControls'
import Button from '../../components/ui/Button'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import MetricChip from '../../components/ui/MetricChip'
import { DEFAULT_SPEED } from '../../components/ui/SpeedSlider'
import usePlayback from '../../hooks/usePlayback'
import { type MemAlgorithm, computeMemoryFrames, PSEUDOCODE, N_RANGE, SOD_PRESETS } from './engine'
import styles from './MemoryPage.module.css'

const CS_ALGO_TABS = [
  { id: 'factorial',  label: 'Factorial' },
  { id: 'fibonacci',  label: 'Fibonacci' },
  { id: 'power',      label: 'Power' },
  { id: 'sumofdigits', label: 'Sum of Digits' },
]

export default function CallStackViz() {
  const [algo, setAlgo] = useState<MemAlgorithm>('factorial')
  const [n, setN] = useState(N_RANGE['factorial'].default)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)

  const frames = useMemo(() => computeMemoryFrames(algo, n), [algo, n])
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(frames, speed)
  const cf = frames[frameIdx] ?? frames[frames.length - 1]

  const handleAlgo = useCallback((id: string) => {
    setAlgo(id as MemAlgorithm)
    setN(N_RANGE[id as MemAlgorithm].default)
  }, [])

  const range = N_RANGE[algo]
  const topFrame = cf.stack.length > 0 ? cf.stack[cf.stack.length - 1] : null
  const inputLabel = algo === 'power' ? `2^${n}` : algo === 'sumofdigits' ? `n = ${SOD_PRESETS[n]}` : `n = ${n}`

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <AlgorithmTabs tabs={CS_ALGO_TABS} active={algo} onChange={handleAlgo} />

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>input</span>
          <div className={styles.sliderRow}>
            <input type="range" className={styles.slider} min={range.min} max={range.max} value={n}
              onChange={e => setN(Number(e.target.value))} />
            <span className={styles.sliderVal}>{inputLabel}</span>
          </div>
          {algo === 'sumofdigits' && (
            <div className={styles.presetRow}>
              {SOD_PRESETS.map((v, i) => (
                <button key={v}
                  className={`${styles.presetChip} ${n === i ? styles.presetChipActive : ''}`}
                  onClick={() => setN(i)}
                >{v}</button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>playback</span>
          <PlaybackControls
            isPlaying={isPlaying} atStart={atStart} atEnd={atEnd}
            onBack={() => { pause(); goToFrame(frameIdx - 1) }}
            onPlay={togglePlay}
            onForward={() => { pause(); goToFrame(frameIdx + 1) }}
            speed={speed} onSpeedChange={setSpeed}
          />
          <div className={styles.playbackMeta}>
            <span className={styles.stepCounter}>Step {frameIdx + 1} / {frames.length}</span>
          </div>
          {atEnd && (
            <Button variant="pill" size="sm" onClick={() => { pause(); goToFrame(0) }}>replay</Button>
          )}
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>what's happening</span>
          {cf.sym && <p className={styles.csSymLabel}>{cf.sym}</p>}
          <p className={styles.stepDetail}>{cf.detail}</p>
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>pseudocode</span>
          <div className={styles.pseudocode}>
            {PSEUDOCODE[algo].map((line, i) => (
              <div key={i} className={`${styles.codeLine} ${cf.activeLine === i ? styles.codeLineActive : ''}`}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>statistics</span>
          <div className={styles.statsGrid}>
            <MetricChip label="total calls" value={cf.totalCalls} />
            <MetricChip label="max depth"   value={cf.maxDepth} />
            <MetricChip label="result"      value={cf.finalResult ?? '-'} />
            <MetricChip label="base cases"  value={cf.baseCases} />
          </div>
        </div>
      </div>

      <div className={styles.csRight}>
        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>call stack</span>
            {topFrame?.isBase && !topFrame.returning && <span className={styles.badge}>base case</span>}
            {topFrame?.returning && (
              <span className={`${styles.badge} ${styles.badgeReturn}`}>returning {topFrame.result}</span>
            )}
          </div>
          <div className={styles.csFrames}>
            {cf.stack.length === 0 && cf.activeLine === -1 && (
              <div className={styles.csDone}>stack empty - result = {cf.finalResult}</div>
            )}
            {cf.stack.length === 0 && cf.activeLine !== -1 && (
              <div className={styles.csEmpty}>empty</div>
            )}
            {[...cf.stack].reverse().map((frame, ri) => {
              const isTop = ri === 0
              return (
                <div key={frame.id} className={styles.csFrameRow}>
                  <span className={`${styles.spLabel} ${isTop ? styles.spLabelVisible : ''}`}>SP -</span>
                  <div className={`${styles.csFrame} ${
                    isTop && frame.returning ? styles.csFrameReturning
                    : isTop && frame.isBase  ? styles.csFrameBase
                    : isTop                  ? styles.csFrameTop
                    : styles.csFrameIdle
                  }`}>
                    <span className={styles.csFrameName}>{frame.label}</span>
                    <span className={styles.csFrameDepth}>depth: {frame.depth}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {cf.stack.length > 0 && <div className={styles.csStackBase}>Stack Base (Bottom)</div>}
        </div>

        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>variable state</span>
          </div>
          <div className={styles.csVarList}>
            {cf.stack.length === 0 && <div className={styles.csEmpty}>no active frames</div>}
            {[...cf.stack].reverse().map(frame => (
              <div key={frame.id} className={styles.csVarFrame}>
                <div className={styles.csVarFrameHeader}>
                  {frame.label.split('(')[0]}()
                  <span className={styles.csVarFrameDepth}> [depth {frame.depth}]</span>
                </div>
                {frame.vars.map(v => (
                  <div key={v.name} className={styles.frameVar}>
                    <span className={styles.varName}>{v.name}</span>
                    <span className={styles.varVal}>{v.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
