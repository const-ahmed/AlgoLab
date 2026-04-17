import { useCallback, useState } from 'react'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import UseMeWhen from '../../components/ui/UseMeWhen'
import styles from './MemoryPage.module.css'
import CallStackViz from './CallStackViz'
import HeapViz from './HeapViz'
import FunctionFramesViz from './FunctionFramesViz'
import ReferencesViz from './ReferencesViz'

const MEMORY_TABS = [
  { id: 'callstack',  label: 'Call Stack' },
  { id: 'heap',       label: 'Heap' },
  { id: 'frames',     label: 'Function Frames' },
  { id: 'references', label: 'Variables & References' },
]

const USE_WHEN: Record<string, string> = {
  callstack:  'you want to see exactly how function calls grow and shrink the stack, and how recursion unwinds.',
  heap:       'you want to understand how objects are allocated dynamically outside the call stack.',
  frames:     'you want to see how nested calls create isolated scopes and why closures retain outer variables.',
  references: 'you want to understand why objects can be mutated by a caller while primitives cannot.',
}

export default function MemoryPage() {
  const [view, setView] = useState('callstack')
  const handleChange = useCallback((id: string) => setView(id), [])

  return (
    <div className={styles.page}>
      <AlgorithmTabs tabs={MEMORY_TABS} active={view} onChange={handleChange} />
      <div className={styles.scene}>
        {view === 'callstack'  && <CallStackViz />}
        {view === 'heap'       && <HeapViz />}
        {view === 'frames'     && <FunctionFramesViz />}
        {view === 'references' && <ReferencesViz />}
      </div>
      <UseMeWhen content={USE_WHEN[view]} />
    </div>
  )
}
