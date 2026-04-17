import { useState } from 'react'
import Button from '../../components/ui/Button'
import styles from './StructuresPage.module.css'

export default function ArrayViz() {
  const [arr, setArr] = useState([4, 2, 7, 1, 9, 3])
  const [highlight, setHighlight] = useState<number | null>(null)
  const [highlightKind, setHighlightKind] = useState<'access' | 'set' | 'insert'>('access')
  const [inputIdx, setInputIdx] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [msg, setMsg] = useState('Click an element to access it by index.')
  const [err, setErr] = useState(false)

  function ok(text: string) { setErr(false); setMsg(text) }
  function fail(text: string) {
    setErr(true); setMsg(text)
    setTimeout(() => setErr(false), 2000)
  }
  function flash(i: number, kind: 'access' | 'set' | 'insert') {
    setHighlight(i); setHighlightKind(kind)
    setTimeout(() => setHighlight(null), 1200)
  }

  function access(i: number) {
    flash(i, 'access')
    ok(`arr[${i}] = ${arr[i]} - O(1) random access`)
  }

  function runSet() {
    const i = parseInt(inputIdx), v = parseInt(inputVal)
    if (!inputIdx.trim() || !inputVal.trim()) { fail('Enter both an index and a value.'); return }
    if (isNaN(i) || isNaN(v) || i < 0 || i >= arr.length) { fail(`Index must be 0 - ${arr.length - 1}.`); return }
    setArr(a => { const n = [...a]; n[i] = v; return n })
    flash(i, 'set')
    ok(`arr[${i}] = ${v} - O(1) direct write`)
    setInputIdx(''); setInputVal('')
  }

  function runInsert() {
    const i = parseInt(inputIdx), v = parseInt(inputVal)
    if (!inputIdx.trim() || !inputVal.trim()) { fail('Enter both an index and a value.'); return }
    if (isNaN(i) || isNaN(v) || i < 0 || i > arr.length) { fail(`Index must be 0 - ${arr.length}.`); return }
    setArr(a => [...a.slice(0, i), v, ...a.slice(i)])
    flash(i, 'insert')
    ok(`Inserted ${v} at index ${i} - elements shifted right - O(n)`)
    setInputIdx(''); setInputVal('')
  }

  function append() {
    const v = Math.ceil(Math.random() * 9)
    setArr(a => [...a, v])
    flash(arr.length, 'insert')
    ok(`append(${v}) - added to end - O(1) amortised`)
  }

  function pop() {
    if (arr.length === 0) return
    const v = arr[arr.length - 1]
    setArr(a => a.slice(0, -1))
    ok(`pop()  -  ${v} - removed from end - O(1)`)
  }

  const cellClass = (i: number) => {
    if (highlight !== i) return styles.cellIdle
    if (highlightKind === 'set') return styles.cellFound
    return styles.cellLit
  }

  return (
    <div className={styles.vizWrap}>
      <p className={`${styles.msg} ${err ? styles.msgErr : ''}`}>{msg}</p>
      <div className={styles.arrayRow}>
        {arr.map((v, i) => (
          <div key={i} className={styles.cellWrap}>
            <button
              className={`${styles.cell} ${cellClass(i)}`}
              onClick={() => access(i)}
              aria-label={`arr[${i}] = ${v}`}
            >{v}</button>
            <span className={styles.cellIdx}>{i}</span>
          </div>
        ))}
      </div>
      <div className={styles.htInputRow}>
        <input className={styles.htInput} placeholder="index" value={inputIdx}
          onChange={e => setInputIdx(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSet()}
          type="number" min={0} max={arr.length} style={{ width: 72 }} />
        <input className={styles.htInput} placeholder="value" value={inputVal}
          onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSet()}
          type="number" style={{ width: 72 }} />
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={append} disabled={arr.length >= 9}>append</Button>
        <Button size="sm" onClick={pop} disabled={arr.length === 0}>pop</Button>
        <Button size="sm" onClick={runSet} disabled={arr.length === 0}>set</Button>
        <Button size="sm" onClick={runInsert} disabled={arr.length >= 9}>insert</Button>
      </div>
    </div>
  )
}
