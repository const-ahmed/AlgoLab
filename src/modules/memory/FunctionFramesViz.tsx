import PlaybackControls from '../../components/ui/PlaybackControls'
import Button from '../../components/ui/Button'
import usePlayback from '../../hooks/usePlayback'
import styles from './MemoryPage.module.css'

interface ScopeStep {
  scopes: { name: string; vars: [string, string][]; level: number; active: boolean }[]
  sym: string
  detail: string
}

const SCOPE_STEPS: ScopeStep[] = [
  { scopes: [{ name: 'global scope', vars: [], level: 0, active: true }], sym: 'program starts', detail: 'The global scope is created. It exists for the entire lifetime of the program.' },
  { scopes: [{ name: 'global scope', vars: [['PI', '3.14'], ['greeting', '"hello"']], level: 0, active: true }], sym: 'globals declared', detail: 'Global variables are declared. They live in the global scope and are accessible from anywhere.' },
  { scopes: [{ name: 'global scope', vars: [['PI', '3.14'], ['greeting', '"hello"']], level: 0, active: false }, { name: 'outer()', vars: [], level: 1, active: true }], sym: 'outer() called', detail: 'Calling outer() pushes a new frame. It has its own isolated scope.' },
  { scopes: [{ name: 'global scope', vars: [['PI', '3.14'], ['greeting', '"hello"']], level: 0, active: false }, { name: 'outer()', vars: [['x', '10'], ['y', '20']], level: 1, active: true }], sym: 'x = 10, y = 20', detail: "outer() declares x=10 and y=20. These are local to outer's frame." },
  { scopes: [{ name: 'global scope', vars: [['PI', '3.14'], ['greeting', '"hello"']], level: 0, active: false }, { name: 'outer()', vars: [['x', '10'], ['y', '20']], level: 1, active: false }, { name: 'inner()', vars: [], level: 2, active: true }], sym: 'inner() called', detail: 'inner() is called inside outer(). A new frame is pushed on top. Both outer and global scopes remain on the stack.' },
  { scopes: [{ name: 'global scope', vars: [['PI', '3.14'], ['greeting', '"hello"']], level: 0, active: false }, { name: 'outer()', vars: [['x', '10'], ['y', '20']], level: 1, active: false }, { name: 'inner()', vars: [['x', '99'], ['z', '5']], level: 2, active: true }], sym: 'x = 99 (shadow)', detail: "inner() declares its own x=99. This shadows outer's x=10 - inside inner(), x resolves to 99. outer's x is untouched." },
  { scopes: [{ name: 'global scope', vars: [['PI', '3.14'], ['greeting', '"hello"']], level: 0, active: false }, { name: 'outer()', vars: [['x', '10'], ['y', '20']], level: 1, active: true }], sym: 'inner() returns', detail: "inner() returns. Its frame is popped and all its local variables are gone. outer's x=10 is in scope again." },
  { scopes: [{ name: 'global scope', vars: [['PI', '3.14'], ['greeting', '"hello"']], level: 0, active: true }], sym: 'outer() returns', detail: 'outer() returns. Its frame is popped. Only the global scope remains. x and y no longer exist.' },
]

export default function FunctionFramesViz() {
  const { frameIdx, isPlaying, atStart, atEnd, goToFrame, pause, togglePlay } = usePlayback(SCOPE_STEPS, 2)
  const cf = SCOPE_STEPS[frameIdx]

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>what is a function frame</span>
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
            <span className={styles.stepCounter}>Step {frameIdx + 1} / {SCOPE_STEPS.length}</span>
          </div>
          {atEnd && <Button variant="pill" size="sm" onClick={() => { pause(); goToFrame(0) }}>replay</Button>}
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>current operation</span>
          <div className={styles.csPanel}>
            <div className={styles.csPanelHeader}>
              <span className={styles.csPanelTitle}>{cf.sym}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.csRight}>
        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}><span className={styles.csPanelTitle}>scope chain</span></div>
          <div className={styles.framesDemo} style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
            {cf.scopes.map(scope => (
              <div key={scope.name}
                className={`${styles.demoFrame} ${scope.active ? styles.demoFrameActive : ''}`}
                style={{ marginLeft: scope.level * 24 }}
              >
                <div className={styles.demoFrameName}>{scope.name}</div>
                <div className={styles.demoFrameVars}>
                  {scope.vars.length === 0 && <span className={styles.stepMuted}>no variables yet</span>}
                  {scope.vars.map(([k, v]) => (
                    <div key={k} className={styles.frameVar}>
                      <span className={styles.varName}>{k}</span>
                      <span className={styles.varVal}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
