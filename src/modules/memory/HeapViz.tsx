import PlaybackControls from '../../components/ui/PlaybackControls'
import Button from '../../components/ui/Button'
import usePlayback from '../../hooks/usePlayback'
import styles from './MemoryPage.module.css'

interface HeapStep {
  stackVars: { name: string; ref: string | null; val: string | null }[]
  heapObjects: { id: string; label: string; fields: [string, string][] }[]
  highlight: string[]
  sym: string
  detail: string
}

const HEAP_STEPS: HeapStep[] = [
  { stackVars: [], heapObjects: [], highlight: [], sym: '', detail: 'The heap stores objects and arrays. Stack variables hold references (pointers) to heap objects.' },
  { stackVars: [{ name: 'name', ref: null, val: '"Alice"' }], heapObjects: [], highlight: ['name'], sym: 'let name = "Alice"', detail: 'Primitive values (strings, numbers, booleans) are stored directly on the stack - no heap needed.' },
  {
    stackVars: [{ name: 'name', ref: null, val: '"Alice"' }, { name: 'obj', ref: 'obj1', val: null }],
    heapObjects: [{ id: 'obj1', label: 'Object', fields: [['name', '"Alice"'], ['age', '25']] }],
    highlight: ['obj', 'obj1'], sym: 'let obj = {…}',
    detail: 'Objects live on the heap. obj on the stack holds a reference (memory address) pointing to the heap object.',
  },
  {
    stackVars: [{ name: 'name', ref: null, val: '"Alice"' }, { name: 'obj', ref: 'obj1', val: null }, { name: 'arr', ref: 'arr1', val: null }],
    heapObjects: [
      { id: 'obj1', label: 'Object', fields: [['name', '"Alice"'], ['age', '25']] },
      { id: 'arr1', label: 'Array',  fields: [['0', '1'], ['1', '2'], ['2', '3']] },
    ],
    highlight: ['arr', 'arr1'], sym: 'let arr = […]',
    detail: 'Arrays also live on the heap. arr holds a reference to the array object, not the array itself.',
  },
  {
    stackVars: [{ name: 'name', ref: null, val: '"Alice"' }, { name: 'obj', ref: 'obj1', val: null }, { name: 'arr', ref: 'arr1', val: null }, { name: 'copy', ref: 'obj1', val: null }],
    heapObjects: [
      { id: 'obj1', label: 'Object', fields: [['name', '"Alice"'], ['age', '25']] },
      { id: 'arr1', label: 'Array',  fields: [['0', '1'], ['1', '2'], ['2', '3']] },
    ],
    highlight: ['obj', 'copy', 'obj1'], sym: 'copy = obj',
    detail: 'copy = obj copies the reference, not the object. Both obj and copy point to the same heap address - mutating one affects the other.',
  },
]

export default function HeapViz() {
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(HEAP_STEPS, 2)
  const cf = HEAP_STEPS[frameIdx]

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>what is the heap</span>
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
            <span className={styles.stepCounter}>Step {frameIdx + 1} / {HEAP_STEPS.length}</span>
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
        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}><span className={styles.csPanelTitle}>stack</span></div>
          <div className={styles.heapStack} style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {cf.stackVars.length === 0 && <div className={styles.csEmpty}>empty</div>}
            {cf.stackVars.map(v => (
              <div key={v.name} className={`${styles.heapVar} ${cf.highlight.includes(v.name) ? styles.heapVarLit : ''}`}>
                <span className={styles.varName}>{v.name}</span>
                {v.val ? <span className={styles.varVal}>{v.val}</span> : <span className={styles.varRef}>ref -</span>}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}><span className={styles.csPanelTitle}>heap</span></div>
          <div className={styles.heapObjects} style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {cf.heapObjects.length === 0 && <div className={styles.csEmpty}>empty</div>}
            {cf.heapObjects.map(obj => (
              <div key={obj.id} className={`${styles.heapObj} ${cf.highlight.includes(obj.id) ? styles.heapObjLit : ''}`}>
                <div className={styles.heapObjLabel}>{obj.label} <span className={styles.heapObjId}>@{obj.id}</span></div>
                {obj.fields.map(([k, v]) => (
                  <div key={k} className={styles.frameVar}>
                    <span className={styles.varName}>{k}</span>
                    <span className={styles.varVal}>{v}</span>
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
