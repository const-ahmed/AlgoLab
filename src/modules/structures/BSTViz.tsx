import { useState } from 'react'
import Button from '../../components/ui/Button'
import styles from './StructuresPage.module.css'

interface BSTNode { val: number; left: BSTNode | null; right: BSTNode | null }
interface NodePos { val: number; x: number; y: number; id: string }
interface EdgePos { x1: number; y1: number; x2: number; y2: number; id: string }

function bstInsert(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val, left: null, right: null }
  if (val < root.val) return { ...root, left: bstInsert(root.left, val) }
  if (val > root.val) return { ...root, right: bstInsert(root.right, val) }
  return root
}

function buildBST(vals: number[]): BSTNode | null {
  return vals.reduce<BSTNode | null>((root, v) => bstInsert(root, v), null)
}

function layoutBST(
  root: BSTNode | null, x: number, y: number, gap: number,
  result: { nodes: NodePos[]; edges: EdgePos[] },
  parentX?: number, parentY?: number, id = '0',
) {
  if (!root) return
  result.nodes.push({ val: root.val, x, y, id })
  if (parentX !== undefined && parentY !== undefined)
    result.edges.push({ x1: parentX, y1: parentY, x2: x, y2: y, id: `e${id}` })
  layoutBST(root.left,  x - gap, y + 70, gap / 1.8, result, x, y, id + 'l')
  layoutBST(root.right, x + gap, y + 70, gap / 1.8, result, x, y, id + 'r')
}

const W = 440
const R = 22

export default function BSTViz() {
  const [values, setValues] = useState([5, 3, 7, 1, 4, 6, 8])
  const [searchPath, setSearchPath] = useState<number[]>([])
  const [foundVal, setFoundVal] = useState<number | null>(null)
  const [msg, setMsg] = useState('A BST: left subtree < node < right subtree.')

  const root = buildBST(values)
  const layout: { nodes: NodePos[]; edges: EdgePos[] } = { nodes: [], edges: [] }
  layoutBST(root, 220, 28, 110, layout)
  const H = Math.max(...layout.nodes.map(n => n.y)) + 60 || 80

  function insert() {
    const v = Math.ceil(Math.random() * 9)
    if (values.includes(v)) { setMsg(`${v} already in tree.`); return }
    setValues(vs => [...vs, v])
    setMsg(`Inserted ${v}. Compared values from root to find the correct leaf position.`)
  }

  function search() {
    const target = values[Math.floor(Math.random() * values.length)]
    const path: number[] = []
    let node = root
    while (node) {
      path.push(node.val)
      if (node.val === target) break
      node = target < node.val ? node.left : node.right
    }
    setSearchPath(path)
    setFoundVal(target)
    setMsg(`Searching for ${target}. Path: ${path.join(' - ')}. O(log n) average.`)
    setTimeout(() => { setSearchPath([]); setFoundVal(null) }, path.length * 500 + 800)
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.treeContainer} style={{ width: W, height: H }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, pointerEvents: 'none' }}>
          {layout.edges.map(e => (
            <line key={e.id} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="rgba(255,245,228,0.50)" strokeWidth={1.5} />
          ))}
        </svg>
        {layout.nodes.map(n => {
          const inPath = searchPath.includes(n.val)
          const isFound = foundVal === n.val && inPath
          return (
            <div key={n.id}
              className={`${styles.treeNode} ${isFound ? styles.cellFound : inPath ? styles.cellLit : styles.cellIdle}`}
              style={{ left: n.x - R, top: n.y - R, width: R * 2, height: R * 2 }}
            >{n.val}</div>
          )
        })}
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={insert} disabled={values.length >= 10}>insert</Button>
        <Button size="sm" onClick={search}>search</Button>
      </div>
    </div>
  )
}
