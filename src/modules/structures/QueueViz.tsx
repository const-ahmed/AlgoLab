import { useState } from 'react'
import Button from '../../components/ui/Button'
import styles from './StructuresPage.module.css'

export default function QueueViz() {
  const [queue, setQueue] = useState([5, 8, 2, 6])
  const [flashFront, setFlashFront] = useState(false)
  const [msg, setMsg] = useState('A queue is FIFO - first in, first out.')

  function enqueue() {
    const v = Math.ceil(Math.random() * 9)
    setQueue(q => [...q, v])
    setMsg(`Enqueued ${v} at the rear. O(1).`)
  }

  function dequeue() {
    if (queue.length === 0) return
    const v = queue[0]
    setFlashFront(true)
    setTimeout(() => { setQueue(q => q.slice(1)); setFlashFront(false) }, 300)
    setMsg(`Dequeued ${v} from the front. O(1).`)
  }

  function peekFront() {
    if (queue.length === 0) return
    setFlashFront(true)
    setMsg(`Front element: ${queue[0]}. O(1).`)
    setTimeout(() => setFlashFront(false), 1000)
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.queueRow}>
        {queue.length === 0 && <div className={styles.empty}>empty</div>}
        {queue.map((v, i) => (
          <div key={i} className={styles.cellWrap}>
            <div className={`${styles.cell} ${i === 0 && flashFront ? styles.cellLit : styles.cellIdle}`}>{v}</div>
            {i === 0 && <span className={styles.queueLabel}>front</span>}
            {i === queue.length - 1 && queue.length > 1 && <span className={styles.queueLabel}>rear</span>}
          </div>
        ))}
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={enqueue} disabled={queue.length >= 8}>enqueue</Button>
        <Button size="sm" onClick={dequeue} disabled={queue.length === 0}>dequeue</Button>
        <Button size="sm" onClick={peekFront} disabled={queue.length === 0}>peek</Button>
      </div>
    </div>
  )
}
