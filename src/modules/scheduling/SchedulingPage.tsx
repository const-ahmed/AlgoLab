import { useState, useEffect } from 'react'
import PlaybackControls from '../../components/ui/PlaybackControls'
import ExplanationPanel from '../../components/ui/ExplanationPanel'
import Button from '../../components/ui/Button'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import UseMeWhen from '../../components/ui/UseMeWhen'
import { DEFAULT_PROCESSES } from './engine'
import type { SchedulingAlgorithm } from './engine'
import useScheduling from './useScheduling'
import styles from './SchedulingPage.module.css'

const ALGORITHM_TABS = [
  { id: 'fcfs',     label: 'FCFS' },
  { id: 'sjf',      label: 'SJF' },
  { id: 'rr',       label: 'Round Robin' },
  { id: 'priority', label: 'Priority' },
]

interface AlgoInfo {
  fullName: string
  desc: string
  preemptive: boolean
  bestWhen: string
  watchOut: string
}

const ALGO_INFO: Record<SchedulingAlgorithm, AlgoInfo> = {
  fcfs: {
    fullName: 'First Come First Served',
    desc: 'Processes run in the exact order they arrive - first in, first served. Once the CPU (Central Processing Unit) is given to a process, it runs until completely finished before the next one starts.',
    preemptive: false,
    bestWhen: 'All jobs are roughly the same length and arrival order is an acceptable measure of fairness.',
    watchOut: 'Convoy effect - one long process forces all shorter jobs to wait behind it, inflating average waiting time.',
  },
  sjf: {
    fullName: 'Shortest Job First',
    desc: 'Among all processes that have arrived and are waiting, the one with the smallest burst time (total CPU time needed) is selected next. Like FCFS, once selected it runs without interruption.',
    preemptive: false,
    bestWhen: 'Burst times are known or predictable in advance. SJF provably minimises average waiting time.',
    watchOut: 'Starvation - long processes may wait indefinitely if short ones keep arriving. Also requires knowing future burst times, which is rarely possible in real operating systems.',
  },
  rr: {
    fullName: 'Round Robin',
    desc: 'Each process takes turns on the CPU (Central Processing Unit) for a fixed time slice called a quantum - here, 2 time units. When its quantum expires the process is preempted (interrupted) and placed at the back of the ready queue to wait for the next turn.',
    preemptive: true,
    bestWhen: 'Interactive or time-sharing systems where responsiveness matters. No process ever waits longer than (n − 1) × quantum, regardless of burst length.',
    watchOut: 'Quantum size is critical: too small causes high context-switch overhead; too large and it degrades to FCFS behaviour.',
  },
  priority: {
    fullName: 'Priority Scheduling',
    desc: 'Each process is assigned a numeric priority. The ready process with the lowest number (highest urgency) is always selected next and runs to completion. In this simulation, lower number = higher priority.',
    preemptive: false,
    bestWhen: 'Real-time or mixed workloads where some tasks are genuinely more urgent than others (e.g. OS interrupts vs. background tasks).',
    watchOut: 'Starvation - low-priority processes may never get CPU time if high-priority ones keep arriving. Solved in practice by "aging" (gradually raising the priority of waiting processes).',
  },
}

const TOTAL_TIME = DEFAULT_PROCESSES.reduce((s, p) => s + p.burst, 0) + 2

export default function SchedulingPage() {
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('fcfs')
  const [openWhat, setOpenWhat] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  useEffect(() => {
    if (!showTermsModal) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowTermsModal(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showTermsModal])

  const { currentFrame, frameIdx, isPlaying, atStart, atEnd, goToFrame, togglePlay, pause, reset } = useScheduling(algorithm)

  function handleAlgorithmChange(id: string) {
    pause()
    setAlgorithm(id as SchedulingAlgorithm)
  }

  const maxTime = currentFrame
    ? Math.max(TOTAL_TIME, currentFrame.gantt.reduce((m, g) => Math.max(m, g.end), 0))
    : TOTAL_TIME

  const algoInfo = ALGO_INFO[algorithm]
  const lastTick = Math.floor(maxTime / 2) * 2

  return (
    <div className={styles.page}>
      <div className={styles.pageLayout}>

        <aside className={styles.sidebar}>
          <div className={styles.sideAccordion}>
            <div className={`${styles.infoItem} ${openWhat ? styles.infoItemOpen : ''}`}>
              <button
                className={styles.infoSummary}
                onClick={() => setOpenWhat(v => !v)}
                aria-expanded={openWhat}
              >
                <span className={styles.infoArrow}>›</span>
                what is process scheduling?
              </button>
              <div className={styles.infoBodyWrap}>
                <div className={styles.infoBody}>
                  <div className={styles.infoBodyInner}>
                    <p className={styles.infoText}>
                      A computer has one CPU (Central Processing Unit) but many processes - running programs - all wanting to use it at the same time. Process scheduling is how the operating system decides who gets the CPU next, and for how long.
                    </p>
                    <p className={styles.infoText}>
                      Good scheduling keeps the CPU busy, responds quickly to interactive tasks, and ensures no process waits forever. Different algorithms make different tradeoffs between these goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button variant="pill" size="sm" onClick={() => setShowTermsModal(true)}>key terms</Button>
        </aside>

        <div className={styles.mainCol}>
        <AlgorithmTabs tabs={ALGORITHM_TABS} active={algorithm} onChange={handleAlgorithmChange} />

      <div className={styles.scene}>
        <ExplanationPanel
          status={currentFrame?.statusSymbol ?? ''}
          detail={currentFrame?.statusDetail}
        />

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Process</th>
                <th>Arrival<span className={styles.thSub}>time t</span></th>
                <th>Burst<span className={styles.thSub}>total CPU needed</span></th>
                <th>Priority<span className={styles.thSub}>lower = more urgent</span></th>
                <th>Remaining<span className={styles.thSub}>CPU time left</span></th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_PROCESSES.map(p => {
                const rem = currentFrame ? currentFrame.remaining[p.id] : p.burst
                const isRunning = currentFrame?.runningId === p.id
                const isDone = rem === 0
                return (
                  <tr key={p.id} className={isRunning ? styles.rowRunning : isDone ? styles.rowDone : ''}>
                    <td>
                      <span className={styles.processTag}>
                        {p.name}
                      </span>
                    </td>
                    <td>{p.arrival}</td>
                    <td>{p.burst}</td>
                    <td>{p.priority}</td>
                    <td className={isDone ? styles.tdDone : isRunning ? styles.tdRunning : ''}>
                      {rem}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.ganttSection}>
          <p className={styles.ganttTitle}>CPU timeline</p>
          <div className={styles.ganttWrap}>
            {DEFAULT_PROCESSES.map(p => (
              <div key={p.id} className={styles.ganttRow}>
                <span className={styles.ganttRowLabel}>{p.name}</span>
                <div className={styles.ganttTrack}>
                  {currentFrame?.gantt
                    .filter(g => g.processId === p.id)
                    .map((g, i) => (
                      <div
                        key={i}
                        className={styles.ganttBar}
                        style={{
                          left: `${(g.start / maxTime) * 100}%`,
                          width: `${((g.end - g.start) / maxTime) * 100}%`,
                        }}
                        aria-label={`${p.name} t=${g.start}–${g.end}`}
                      />
                    ))}
                  {currentFrame?.runningId === p.id && (
                    <div
                      className={styles.ganttCurrent}
                      style={{
                        left: `${((currentFrame.time - 1) / maxTime) * 100}%`,
                        width: `${(1 / maxTime) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
            <div className={styles.ganttAxis}>
              <span className={styles.ganttRowLabel} />
              <div className={styles.ganttTrack}>
                {Array.from({ length: maxTime + 1 }, (_, t) => (
                  t % 2 === 0 && (
                    <span
                      key={t}
                      className={styles.axisTick}
                      style={
                        t === 0
                          ? { left: '3px', transform: 'none' }
                          : t === lastTick
                          ? { right: '3px', left: 'auto', transform: 'none' }
                          : { left: `${(t / maxTime) * 100}%` }
                      }
                    >
                      {t}
                    </span>
                  )
                ))}
                {currentFrame && (
                  <div
                    className={styles.timeCursor}
                    style={{ left: `${(currentFrame.time / maxTime) * 100}%` }}
                    aria-label={`Current time: ${currentFrame.time}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {currentFrame && currentFrame.readyQueue.length > 0 && (
          <div className={styles.queueRow}>
            <span className={styles.queueLabel}>ready queue</span>
            {currentFrame.readyQueue.map(id => (
              <span
                key={id}
                className={styles.queueItem}
              >
                {DEFAULT_PROCESSES[id].name}
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
        />

        {atEnd && (
          <div className={styles.footerRow}>
            <Button variant="pill" size="sm" onClick={reset}>replay</Button>
          </div>
        )}
      </div>

      <UseMeWhen content={algoInfo.bestWhen} />
        </div>
      </div>

      {showTermsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Key terms">
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>key terms</span>
              <button className={styles.modalClose} onClick={() => setShowTermsModal(false)} aria-label="Close">✕</button>
            </div>
            <dl className={styles.modalGrid}>
              <div className={styles.termRow}><dt className={styles.termName}>CPU</dt><dd className={styles.termDef}>Central Processing Unit - the chip that executes instructions. Only one process can run on it at a time.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Process</dt><dd className={styles.termDef}>A running program. Each has an arrival time, a burst time, and optionally a priority.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Arrival time</dt><dd className={styles.termDef}>The moment a process first becomes available for scheduling.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Burst time</dt><dd className={styles.termDef}>The total CPU time a process needs to finish. It never changes - only the remaining time counts down.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Remaining</dt><dd className={styles.termDef}>Burst time still needed. Starts at burst, counts down to 0. When it reaches 0 the process is done.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Ready queue</dt><dd className={styles.termDef}>The set of processes that have arrived and are waiting for CPU time. The scheduler picks from here.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Gantt chart</dt><dd className={styles.termDef}>A horizontal timeline showing which process occupied the CPU during each time unit.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Preemptive</dt><dd className={styles.termDef}>A preemptive scheduler can interrupt a running process mid-burst. Non-preemptive lets it finish completely first.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Quantum</dt><dd className={styles.termDef}>The fixed time slice used by Round Robin (RR). When a process exhausts its quantum it is preempted and re-queued.</dd></div>
              <div className={styles.termRow}><dt className={styles.termName}>Starvation</dt><dd className={styles.termDef}>When a process waits so long it never gets CPU time - common in priority and SJF schedulers with heavy high-priority traffic.</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
