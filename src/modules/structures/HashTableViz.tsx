import { useState } from 'react'
import Button from '../../components/ui/Button'
import styles from './StructuresPage.module.css'

const HT_BUCKETS = 7
const IDLE_MSG = 'A hash table maps keys to values using a hash function to find the right bucket in O(1).'

const HT_PAIRS: [string, string][] = [
  ['name', 'Ahmed'], ['city', 'Dubai'], ['lang', 'TypeScript'],
  ['role', 'Engineer'], ['team', 'Frontend'], ['age', '28'],
  ['country', 'UAE'], ['editor', 'VS Code'],
]

interface HTEntry { key: string; val: string }
type HTable = HTEntry[][]
type HTPhase = 'idle' | 'key' | 'hash' | 'mod' | 'store'

function htHash(key: string): number {
  return key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

const PHASE_DELAYS = { hash: 700, mod: 1500, store: 2300, idle: 3600 }

export default function HashTableViz() {
  const [table, setTable] = useState<HTable>(() => Array.from({ length: HT_BUCKETS }, () => []))
  const [pairIdx, setPairIdx] = useState(0)
  const [phase, setPhase] = useState<HTPhase>('idle')
  const [activeKey, setActiveKey] = useState('')
  const [activeVal, setActiveVal] = useState('')
  const [rawHash, setRawHash] = useState<number | null>(null)
  const [bucket, setBucket] = useState<number | null>(null)
  const [litKey, setLitKey] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [msg, setMsg] = useState(IDLE_MSG)

  function beginAnimation(key: string, h: number, b: number, label: string) {
    setActiveKey(key); setRawHash(h); setBucket(b)
    setPhase('key'); setMsg(label)
    setTimeout(() => { setPhase('hash'); setMsg(`hash("${key}") = ${h}`) }, PHASE_DELAYS.hash)
    setTimeout(() => { setPhase('mod');  setMsg(`${h} % ${HT_BUCKETS} = ${b}  -  bucket ${b}`) }, PHASE_DELAYS.mod)
  }

  function endAnimation() {
    setTimeout(() => {
      setPhase('idle'); setActiveKey(''); setActiveVal('')
      setRawHash(null); setBucket(null); setLitKey(null); setMsg(IDLE_MSG)
    }, PHASE_DELAYS.idle)
  }

  function runInsert() {
    if (phase !== 'idle') return
    const key = inputKey.trim(), val = inputVal.trim()
    const [pk, pv] = key && val ? [key, val] : HT_PAIRS[pairIdx % HT_PAIRS.length]
    if (!(key && val)) setPairIdx(i => i + 1)
    setInputKey(''); setInputVal('')
    const h = htHash(pk), b = h % HT_BUCKETS
    setActiveVal(pv)
    beginAnimation(pk, h, b, `Key: "${pk}"`)
    setTimeout(() => {
      setPhase('store')
      const collision = table[b].length > 0 && !table[b].some(e => e.key === pk)
      setMsg(collision
        ? `Bucket ${b} occupied - append to chain. O(1).`
        : `Store "${pk}" - "${pv}" at bucket ${b}.`)
      setTable(t => {
        const n = t.map(c => [...c])
        const ei = n[b].findIndex(e => e.key === pk)
        if (ei >= 0) n[b][ei] = { key: pk, val: pv }
        else n[b] = [...n[b], { key: pk, val: pv }]
        return n
      })
    }, PHASE_DELAYS.store)
    endAnimation()
  }

  function runLookup() {
    if (phase !== 'idle') return
    const all = table.flatMap(c => c.map(e => e.key))
    if (!all.length) { setMsg('Table is empty.'); return }
    const key = all[Math.floor(Math.random() * all.length)]
    const h = htHash(key), b = h % HT_BUCKETS
    beginAnimation(key, h, b, `lookup: "${key}"`)
    setTimeout(() => { setPhase('store'); setLitKey(key); setMsg(`Found "${key}" in bucket ${b}. O(1).`) }, PHASE_DELAYS.store)
    endAnimation()
  }

  function runDelete() {
    if (phase !== 'idle') return
    const all = table.flatMap(c => c.map(e => e.key))
    if (!all.length) { setMsg('Table is empty.'); return }
    const key = all[Math.floor(Math.random() * all.length)]
    const h = htHash(key), b = h % HT_BUCKETS
    beginAnimation(key, h, b, `Delete: "${key}"`)
    setTimeout(() => {
      setPhase('store'); setLitKey(key); setMsg(`Removed "${key}" from bucket ${b}.`)
      setTable(t => { const n = t.map(c => [...c]); n[b] = n[b].filter(e => e.key !== key); return n })
    }, PHASE_DELAYS.store)
    endAnimation()
  }

  const busy = phase !== 'idle'

  return (
    <div className={styles.vizWrap}>
      <div className={styles.htPipeline}>
        <div className={`${styles.htStep} ${phase !== 'idle' ? styles.htStepLit : ''}`}>
          <span className={styles.htStepLabel}>key</span>
          <span className={styles.htStepValue}>{activeKey ? `"${activeKey}"` : '-'}</span>
        </div>
        <span className={styles.htArrow}></span>
        <div className={`${styles.htStep} ${styles.htStepFn} ${phase === 'hash' || phase === 'mod' || phase === 'store' ? styles.htStepLit : ''}`}>
          <span className={styles.htStepLabel}>hash(key)</span>
          <span className={styles.htStepValue}>{rawHash !== null ? rawHash : '-'}</span>
        </div>
        <span className={styles.htArrow}></span>
        <div className={`${styles.htStep} ${phase === 'mod' || phase === 'store' ? styles.htStepLit : ''}`}>
          <span className={styles.htStepLabel}>% {HT_BUCKETS}</span>
          <span className={styles.htStepValue}>{bucket !== null ? bucket : '-'}</span>
        </div>
        <span className={styles.htArrow}></span>
        <div className={`${styles.htStep} ${phase === 'store' ? styles.htStepActive : ''}`}>
          <span className={styles.htStepLabel}>store</span>
          <span className={styles.htStepValue}>
            {activeKey && activeVal ? `"${activeKey}":"${activeVal}"` : bucket !== null ? bucket : '-'}
          </span>
        </div>
      </div>

      <p className={styles.msg}>{msg}</p>

      <div className={styles.hashTable}>
        {table.map((chain, idx) => (
          <div key={idx} className={`${styles.hashRow} ${bucket === idx && busy ? styles.hashRowLit : ''}`}>
            <div className={styles.hashIdx}>{idx}</div>
            <div className={styles.hashChain}>
              {chain.length === 0 ? (
                <span className={styles.hashNull}>-</span>
              ) : (
                chain.map((entry, ci) => (
                  <div key={ci} className={styles.hashEntryGroup}>
                    {ci > 0 && <span className={styles.hashPtr}></span>}
                    <div className={`${styles.hashEntry} ${litKey === entry.key || (phase === 'store' && bucket === idx && activeKey === entry.key) ? styles.cellLit : styles.cellIdle}`}>
                      <span className={styles.hashKey}>"{entry.key}"</span>
                      <span className={styles.hashSep}>:</span>
                      <span className={styles.hashVal}>"{entry.val}"</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <p className={styles.hint}>hash(key) = char code sum - index = hash % {HT_BUCKETS} - chaining for collisions</p>
      <div className={styles.htInputRow}>
        <input className={styles.htInput} placeholder="key" value={inputKey}
          onChange={e => setInputKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && runInsert()}
          disabled={busy} maxLength={16} />
        <span className={styles.htInputSep}>:</span>
        <input className={styles.htInput} placeholder="value" value={inputVal}
          onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && runInsert()}
          disabled={busy} maxLength={16} />
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={runInsert} disabled={busy}>
          {inputKey.trim() && inputVal.trim() ? 'insert' : 'insert preset'}
        </Button>
        <Button size="sm" onClick={runLookup} disabled={busy || table.every(c => c.length === 0)}>lookup</Button>
        <Button size="sm" onClick={runDelete} disabled={busy || table.every(c => c.length === 0)}>delete</Button>
      </div>
    </div>
  )
}
