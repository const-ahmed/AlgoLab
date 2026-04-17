import PlaybackControls from '../../components/ui/PlaybackControls'
import Button from '../../components/ui/Button'
import usePlayback from '../../hooks/usePlayback'
import styles from './MemoryPage.module.css'

interface RefStep {
  pVars: { name: string; val: number; lit: boolean }[]
  rVars: { name: string; lit: boolean }[]
  heapAge: number | null
  litHeap: boolean
  activeSide: 'prim' | 'ref' | null
  sym: string
  detail: string
}

const REF_STEPS: RefStep[] = [
  { pVars: [], rVars: [], heapAge: null, litHeap: false, activeSide: null, sym: '', detail: 'Primitives (numbers, strings, booleans) are stored by value. Objects are stored by reference. Step through to see what that means.' },
  { pVars: [{ name: 'a', val: 5, lit: true }], rVars: [], heapAge: null, litHeap: false, activeSide: 'prim', sym: 'let a = 5', detail: 'a is a number. Its value (5) is stored directly in the variable.' },
  { pVars: [{ name: 'a', val: 5, lit: false }, { name: 'b', val: 5, lit: true }], rVars: [], heapAge: null, litHeap: false, activeSide: 'prim', sym: 'let b = a', detail: 'b = a copies the value. b gets its own independent copy of 5. a and b are separate.' },
  { pVars: [{ name: 'a', val: 5, lit: false }, { name: 'b', val: 10, lit: true }], rVars: [], heapAge: null, litHeap: false, activeSide: 'prim', sym: 'b = 10', detail: 'b is changed to 10. a is still 5. They are completely independent - changing b never affects a.' },
  { pVars: [{ name: 'a', val: 5, lit: false }, { name: 'b', val: 10, lit: false }], rVars: [{ name: 'p', lit: true }], heapAge: 25, litHeap: true, activeSide: 'ref', sym: 'let p = { age: 25 }', detail: 'An object is created on the heap. p holds a reference - a pointer to the object, not the object itself.' },
  { pVars: [{ name: 'a', val: 5, lit: false }, { name: 'b', val: 10, lit: false }], rVars: [{ name: 'p', lit: false }, { name: 'q', lit: true }], heapAge: 25, litHeap: false, activeSide: 'ref', sym: 'let q = p', detail: 'q = p copies the reference, not the object. Both p and q now point to the same heap object.' },
  { pVars: [{ name: 'a', val: 5, lit: false }, { name: 'b', val: 10, lit: false }], rVars: [{ name: 'p', lit: true }, { name: 'q', lit: true }], heapAge: 30, litHeap: true, activeSide: 'ref', sym: 'q.age = 30', detail: 'Mutating through q changes the shared heap object. p.age is now also 30 - both variables see the same change.' },
]

export default function ReferencesViz() {
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(REF_STEPS, 2)
  const cf = REF_STEPS[frameIdx]

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>value vs reference</span>
          <p className={styles.stepDetail}>{cf.detail}</p>
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>playback</span>
          <PlaybackControls
            isPlaying={isPlaying} atStart={atStart} atEnd={atEnd}
            onBack={() => { pause(); goToFrame(frameIdx - 1) }}
            onPlay={togglePlay}
            onForward={() => { pause(); goToFrame(frameIdx + 1) }}
          />
          <div className={styles.playbackMeta}>
            <span className={styles.stepCounter}>Step {frameIdx + 1} / {REF_STEPS.length}</span>
          </div>
          {atEnd && <Button variant="pill" size="sm" onClick={() => { pause(); goToFrame(0) }}>replay</Button>}
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>current operation</span>
          <div className={styles.csPanel}>
            <div className={styles.csPanelHeader}>
              <span className={styles.csPanelTitle}>{cf.sym || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.csRight}>
        <div className={`${styles.csPanel} ${cf.activeSide === 'prim' ? styles.csPanelActive : ''}`}>
          <div className={styles.csPanelHeader}><span className={styles.csPanelTitle}>primitive - by value</span></div>
          <div style={{ padding: 'var(--sp-3) var(--sp-4)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center', minHeight: 64 }}>
            {cf.pVars.length === 0 && <span className={styles.stepMuted}>-</span>}
            {cf.pVars.map(v => (
              <div key={v.name} className={styles.refBox}>
                <span className={styles.refBoxLabel}>{v.name}</span>
                <span className={v.lit ? styles.cellLit2 : styles.cellIdle2}>{v.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.csPanel} ${cf.activeSide === 'ref' ? styles.csPanelActive : ''}`}>
          <div className={styles.csPanelHeader}><span className={styles.csPanelTitle}>object - by reference</span></div>
          <div style={{ padding: 'var(--sp-3) var(--sp-4)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center', minHeight: 64 }}>
            {cf.rVars.length === 0 && <span className={styles.stepMuted}>-</span>}
            {cf.rVars.map(v => (
              <div key={v.name} className={styles.refBox}>
                <span className={styles.refBoxLabel}>{v.name}</span>
                <span className={`${styles.refPtr} ${v.lit ? styles.refPtrLit : ''}`}></span>
              </div>
            ))}
            {cf.heapAge !== null && (
              <div className={`${styles.refBox} ${styles.refHeapBox} ${cf.litHeap ? styles.refHeapBoxLit : ''}`}>
                <span className={styles.refBoxLabel}>heap</span>
                <span className={cf.litHeap ? styles.cellLit2 : styles.cellIdle2}>age: {cf.heapAge}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
