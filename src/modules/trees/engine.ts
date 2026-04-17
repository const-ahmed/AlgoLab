export type TraversalAlgorithm = 'preorder' | 'inorder' | 'postorder' | 'levelorder'
export type NodeState = 'idle' | 'current' | 'visited' | 'queued'

export interface TreeNode {
  id: number
  value: number
  left: number | null
  right: number | null
  cx: number  // center x in px
  cy: number  // center y in px
}

export interface TraversalFrame {
  current: number | null
  visited: number[]
  queued: number[]
  order: number[]   // traversal order so far (values)
  statusSymbol: string
  statusDetail: string
  steps: number
}

export const TREE_NODES: TreeNode[] = [
  { id: 0, value: 4, left: 1, right: 2, cx: 240, cy: 32 },
  { id: 1, value: 2, left: 3, right: 4, cx: 120, cy: 112 },
  { id: 2, value: 6, left: 5, right: 6, cx: 360, cy: 112 },
  { id: 3, value: 1, left: null, right: null, cx: 60,  cy: 192 },
  { id: 4, value: 3, left: null, right: null, cx: 180, cy: 192 },
  { id: 5, value: 5, left: null, right: null, cx: 300, cy: 192 },
  { id: 6, value: 7, left: null, right: null, cx: 420, cy: 192 },
]

export const TREE_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
]

export const NODE_RADIUS = 24

export function nodeState(id: number, frame: TraversalFrame): NodeState {
  if (frame.current === id) return 'current'
  if (frame.visited.includes(id)) return 'visited'
  if (frame.queued.includes(id)) return 'queued'
  return 'idle'
}

function push(frames: TraversalFrame[], current: number | null, visited: number[], queued: number[], order: number[], sym: string, detail: string) {
  frames.push({ current, visited: [...visited], queued: [...queued], order: [...order], statusSymbol: sym, statusDetail: detail, steps: visited.length + (current !== null ? 1 : 0) })
}


export function computePreorderFrames(): TraversalFrame[] {
  const frames: TraversalFrame[] = []
  const visited: number[] = []
  const order: number[] = []

  push(frames, null, [], [], [], '', 'Pre-order (DFS): visit root first, then left subtree, then right subtree.')

  function traverse(id: number | null) {
    if (id === null) return
    const node = TREE_NODES[id]
    push(frames, id, visited, [], order, `${node.value}`, `Visiting node ${node.value}.`)
    visited.push(id)
    order.push(node.value)
    push(frames, null, visited, [], order, '', `${node.value} visited. Go left.`)
    traverse(node.left)
    push(frames, null, visited, [], order, '', `Back at ${node.value}. Go right.`)
    traverse(node.right)
  }

  traverse(0)
  push(frames, null, visited, [], order, '✓', `Pre-order complete: ${order.join(' → ')}.`)
  return frames
}


export function computeInorderFrames(): TraversalFrame[] {
  const frames: TraversalFrame[] = []
  const visited: number[] = []
  const order: number[] = []

  push(frames, null, [], [], [], '', 'In-order (DFS): visit left subtree, then root, then right subtree. Produces sorted output on a BST.')

  function traverse(id: number | null) {
    if (id === null) return
    const node = TREE_NODES[id]
    push(frames, null, visited, [], order, '', `At node ${node.value}. Descend left first.`)
    traverse(node.left)
    push(frames, id, visited, [], order, `${node.value}`, `Visiting node ${node.value}.`)
    visited.push(id)
    order.push(node.value)
    push(frames, null, visited, [], order, '', `${node.value} visited. Go right.`)
    traverse(node.right)
  }

  traverse(0)
  push(frames, null, visited, [], order, '✓', `In-order complete: ${order.join(' → ')}. Array is sorted!`)
  return frames
}


export function computePostorderFrames(): TraversalFrame[] {
  const frames: TraversalFrame[] = []
  const visited: number[] = []
  const order: number[] = []

  push(frames, null, [], [], [], '', 'Post-order (DFS): visit left subtree, right subtree, then root last. Used in tree deletion and expression evaluation.')

  function traverse(id: number | null) {
    if (id === null) return
    const node = TREE_NODES[id]
    push(frames, null, visited, [], order, '', `At node ${node.value}. Descend left.`)
    traverse(node.left)
    push(frames, null, visited, [], order, '', `Back at ${node.value}. Go right.`)
    traverse(node.right)
    push(frames, id, visited, [], order, `${node.value}`, `Both subtrees done. Visiting ${node.value}.`)
    visited.push(id)
    order.push(node.value)
  }

  traverse(0)
  push(frames, null, visited, [], order, '✓', `Post-order complete: ${order.join(' → ')}.`)
  return frames
}


export function computeLevelorderFrames(): TraversalFrame[] {
  const frames: TraversalFrame[] = []
  const visited: number[] = []
  const order: number[] = []
  const queue: number[] = [0]

  push(frames, null, [], [0], [], '', 'Level-order (BFS): use a queue. Enqueue root.')

  while (queue.length > 0) {
    const id = queue.shift()!
    const node = TREE_NODES[id]

    push(frames, id, visited, [...queue], order, `${node.value}`, `Dequeue node ${node.value}. Visit it.`)
    visited.push(id)
    order.push(node.value)

    const children: number[] = []
    if (node.left !== null) { queue.push(node.left); children.push(node.value) }
    if (node.right !== null) { queue.push(node.right); children.push(node.value) }

    const enqueued = [node.left, node.right].filter(c => c !== null) as number[]
    const childValues = enqueued.map(c => TREE_NODES[c].value)
    push(frames, null, visited, [...queue], order, '', enqueued.length > 0 ? `Enqueue children: ${childValues.join(', ')}.` : `Node ${node.value} has no children.`)
  }

  push(frames, null, visited, [], order, '✓', `Level-order complete: ${order.join(' → ')}.`)
  return frames
}

export function computeTraversalFrames(algorithm: TraversalAlgorithm): TraversalFrame[] {
  switch (algorithm) {
    case 'preorder':   return computePreorderFrames()
    case 'inorder':    return computeInorderFrames()
    case 'postorder':  return computePostorderFrames()
    case 'levelorder': return computeLevelorderFrames()
  }
}
