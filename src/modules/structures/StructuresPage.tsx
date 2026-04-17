import { useCallback, useState } from 'react'
import AlgorithmTabs from '../../components/ui/AlgorithmTabs'
import UseMeWhen from '../../components/ui/UseMeWhen'
import styles from './StructuresPage.module.css'
import ArrayViz from './ArrayViz'
import StackViz from './StackViz'
import QueueViz from './QueueViz'
import LinkedListViz from './LinkedListViz'
import BSTViz from './BSTViz'
import HashTableViz from './HashTableViz'

const STRUCTURE_TABS = [
  { id: 'array',     label: 'Array' },
  { id: 'stack',     label: 'Stack' },
  { id: 'queue',     label: 'Queue' },
  { id: 'linkedlist', label: 'Linked List' },
  { id: 'tree',      label: 'Tree' },
  { id: 'hashtable', label: 'Hash Table' },
]

const USE_WHEN: Record<string, string> = {
  array:      'you need to keep items in order and reach any item quickly by its position.',
  stack:      'you need the most recently added item to be the next one handled.',
  queue:      'you need items to be handled in the same order they were added.',
  linkedlist: 'you need to add or remove items by changing links, and quick position-based access does not matter.',
  tree:       'your data belongs in a hierarchy, with items connected through parent-child relationships.',
  hashtable:  'you need to find, add, update, or remove data quickly using a key.',
}

export default function StructuresPage() {
  const [structure, setStructure] = useState('array')
  const handleTabChange = useCallback((id: string) => setStructure(id), [])

  return (
    <div className={styles.page}>
      <AlgorithmTabs tabs={STRUCTURE_TABS} active={structure} onChange={handleTabChange} />
      <div className={styles.scene}>
        {structure === 'array'     && <ArrayViz />}
        {structure === 'stack'     && <StackViz />}
        {structure === 'queue'     && <QueueViz />}
        {structure === 'linkedlist' && <LinkedListViz />}
        {structure === 'tree'      && <BSTViz />}
        {structure === 'hashtable' && <HashTableViz />}
      </div>
      <UseMeWhen content={USE_WHEN[structure]} />
    </div>
  )
}
