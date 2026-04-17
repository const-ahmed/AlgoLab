import { useState } from 'react'
import Button from '../../components/ui/Button'
import styles from './StructuresPage.module.css'

export default function StackViz() {
  const [stack, setStack] = useState([3, 1, 7, 2])
  const [topFlash, setTopFlash] = useState(false)
  const [msg, setMsg] = useState('A stack is LIFO - last in, first out.')

  function push() {
    const v = Math.ceil(Math.random() * 9)
    setStack(s => [...s, v])
    setMsg(`Pushed ${v} onto the stack. O(1).`)
  }

  function pop() {
    if (stack.length === 0) return
    const v = stack[stack.length - 1]
    setStack(s => s.slice(0, -1))
    setMsg(`Popped ${v} from the top. O(1).`)
  }

  function peek() {
    if (stack.length === 0) return
    setTopFlash(true)
    setMsg(`Top element: ${stack[stack.length - 1]}. O(1).`)
    setTimeout(() => setTopFlash(false), 1000)
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.stackCol}>
        {stack.length === 0 && <div className={styles.empty}>empty</div>}
        {[...stack].reverse().map((v, ri) => {
          const isTop = ri === 0
          return (
            <div
              key={stack.length - 1 - ri}
              className={`${styles.stackItem} ${isTop && topFlash ? styles.cellLit : styles.cellIdle}`}
            >
              {v}
              {isTop && <span className={styles.pointer}>← top</span>}
            </div>
          )
        })}
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={push} disabled={stack.length >= 8}>push</Button>
        <Button size="sm" onClick={pop} disabled={stack.length === 0}>pop</Button>
        <Button size="sm" onClick={peek} disabled={stack.length === 0}>peek</Button>
      </div>
    </div>
  )
}
