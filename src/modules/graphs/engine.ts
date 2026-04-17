export type GraphAlgorithm = 'dfs' | 'bfs'
export type GraphNodeState = 'idle' | 'current' | 'visited' | 'frontier'

export interface GraphNode {
  id: number
  label: string
  cx: number
  cy: number
}

export interface GraphEdge {
  a: number
  b: number
}

export interface GraphFrame {
  current: number | null
  visited: number[]
  frontier: number[]
  statusSymbol: string
  statusDetail: string
  steps: number
}

export const GRAPH_NODES: GraphNode[] = [
  { id: 0, label: 'A', cx: 80,  cy: 60  },
  { id: 1, label: 'B', cx: 240, cy: 40  },
  { id: 2, label: 'C', cx: 400, cy: 60  },
  { id: 3, label: 'D', cx: 80,  cy: 200 },
  { id: 4, label: 'E', cx: 240, cy: 220 },
  { id: 5, label: 'F', cx: 400, cy: 200 },
]

export const GRAPH_EDGES: GraphEdge[] = [
  { a: 0, b: 1 }, { a: 0, b: 3 },
  { a: 1, b: 2 }, { a: 1, b: 4 },
  { a: 2, b: 5 },
  { a: 3, b: 4 },
  { a: 4, b: 5 },
]

const ADJ: number[][] = GRAPH_NODES.map(() => [])
GRAPH_EDGES.forEach(({ a, b }) => { ADJ[a].push(b); ADJ[b].push(a) })

export const NODE_R = 26
export const GRAPH_W = 480
export const GRAPH_H = 280

export function graphNodeState(id: number, frame: GraphFrame): GraphNodeState {
  if (frame.current === id) return 'current'
  if (frame.visited.includes(id)) return 'visited'
  if (frame.frontier.includes(id)) return 'frontier'
  return 'idle'
}

function push(frames: GraphFrame[], current: number | null, visited: number[], frontier: number[], sym: string, detail: string) {
  frames.push({ current, visited: [...visited], frontier: [...frontier], statusSymbol: sym, statusDetail: detail, steps: visited.length })
}


export function computeDFSFrames(): GraphFrame[] {
  const frames: GraphFrame[] = []
  const visited: number[] = []
  const stack: number[] = [0]

  push(frames, null, [], [0], '', `DFS from node A. Push A onto the stack.`)

  while (stack.length > 0) {
    const id = stack.pop()!
    if (visited.includes(id)) continue

    const node = GRAPH_NODES[id]
    push(frames, id, visited, [...stack], node.label, `Pop ${node.label} from stack. Visit it.`)
    visited.push(id)

    const neighbours = [...ADJ[id]].reverse()
    const unvisited = neighbours.filter(n => !visited.includes(n))
    unvisited.forEach(n => { if (!stack.includes(n)) stack.push(n) })

    push(frames, null, visited, [...stack], '', unvisited.length > 0 ? `Push unvisited neighbours of ${node.label}: ${unvisited.map(n => GRAPH_NODES[n].label).join(', ')}.` : `${node.label} has no unvisited neighbours.`)
  }

  push(frames, null, visited, [], '✓', `DFS complete. Visited: ${visited.map(id => GRAPH_NODES[id].label).join(' → ')}.`)
  return frames
}


export function computeBFSFrames(): GraphFrame[] {
  const frames: GraphFrame[] = []
  const visited: number[] = [0]
  const queue: number[] = [0]

  push(frames, null, [], [0], '', `BFS from node A. Enqueue A.`)

  while (queue.length > 0) {
    const id = queue.shift()!
    const node = GRAPH_NODES[id]

    push(frames, id, visited.filter(v => v !== id), [...queue], node.label, `Dequeue ${node.label}. Visit it.`)

    const unvisited = ADJ[id].filter(n => !visited.includes(n))
    unvisited.forEach(n => { visited.push(n); queue.push(n) })

    push(frames, null, visited, [...queue], '', unvisited.length > 0 ? `Enqueue unvisited neighbours: ${unvisited.map(n => GRAPH_NODES[n].label).join(', ')}.` : `${node.label} has no unvisited neighbours.`)
  }

  push(frames, null, visited, [], '✓', `BFS complete. Visited: ${visited.map(id => GRAPH_NODES[id].label).join(' → ')}.`)
  return frames
}

export function computeGraphFrames(algorithm: GraphAlgorithm): GraphFrame[] {
  return algorithm === 'dfs' ? computeDFSFrames() : computeBFSFrames()
}
