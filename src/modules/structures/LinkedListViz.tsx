import { useState } from 'react'
import Button from '../../components/ui/Button'
import styles from './StructuresPage.module.css'

export default function LinkedListViz() {
  const [list, setList] = useState([3, 1, 7, 2])
  const [highlight, setHighlight] = useState<number | null>(null)
  const [traversing, setTraversing] = useState(false)
  const [msg, setMsg] = useState('Nodes are linked by pointers - no random access.')

  function insert() {
    const v = Math.ceil(Math.random() * 9)
    setList(l => [v, ...l])
    setHighlight(0)
    setMsg(`insert(${v}) - prepended at head - O(1)`)
    setTimeout(() => setHighlight(null), 1200)
  }

  function del() {
    if (list.length === 0) return
    const v = list[0]
    setList(l => l.slice(1))
    setMsg(`delete() - removed head (${v}) - O(1)`)
  }

  function traverse() {
    if (list.length === 0 || traversing) return
    setTraversing(true)
    let i = 0
    setMsg(`traverse() - visiting node 0: ${list[0]}`)
    setHighlight(0)
    const iv = setInterval(() => {
      i++
      if (i >= list.length) {
        clearInterval(iv)
        setHighlight(null)
        setTraversing(false)
        setMsg(`traverse() - visited all ${list.length} nodes - O(n)`)
        return
      }
      setHighlight(i)
      setMsg(`traverse() - visiting node ${i}: ${list[i]}`)
    }, 500)
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.linkedRow}>
        <span className={styles.headPtr}>head</span>
        {list.length === 0 && <span className={styles.nullPtr}>null</span>}
        {list.map((v, i) => (
          <div key={i} className={styles.llNode}>
            <div className={`${styles.llCell} ${highlight === i ? styles.cellLit : styles.cellIdle}`}>{v}</div>
            <span className={styles.nextPtr}>{i === list.length - 1 ? 'null' : ''}</span>
          </div>
        ))}
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={insert} disabled={list.length >= 8 || traversing}>insert</Button>
        <Button size="sm" onClick={del} disabled={list.length === 0 || traversing}>delete</Button>
        <Button size="sm" onClick={traverse} disabled={list.length === 0 || traversing}>traverse</Button>
      </div>
    </div>
  )
}
