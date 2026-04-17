import { TREE_NODES, TREE_EDGES, NODE_RADIUS } from '../trees/engine'
export { TREE_NODES, TREE_EDGES, NODE_RADIUS }

export type SearchCellState = 'idle' | 'current' | 'found' | 'eliminated' | 'bound'
export type SearchAlgorithm = 'linear' | 'binary' | 'dfs' | 'bfs'
export type TreeSearchNodeState = 'idle' | 'current' | 'visited' | 'found'

export interface SearchFrame {
  arr: number[]
  target: number
  current: number | null
  found: number | null
  eliminated: number[]
  low: number | null
  high: number | null
  mid: number | null
  statusSymbol: string
  statusDetail: string
  comparisons: number
}

export function cellSearchState(i: number, frame: SearchFrame): SearchCellState {
  if (frame.found === i) return 'found'
  if (frame.current === i) return 'current'
  if (frame.eliminated.includes(i)) return 'eliminated'
  if (i === frame.mid) return 'current'
  if (frame.low !== null && frame.high !== null && (i === frame.low || i === frame.high)) return 'bound'
  return 'idle'
}


export function computeLinearSearchFrames(arr: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = []
  const n = arr.length
  let comparisons = 0
  const blank: Omit<SearchFrame, 'statusSymbol' | 'statusDetail' | 'comparisons'> = {
    arr, target, current: null, found: null, eliminated: [], low: null, high: null, mid: null,
  }

  frames.push({ ...blank, statusSymbol: '', statusDetail: `Searching for ${target} using linear scan.`, comparisons })

  const eliminated: number[] = []
  for (let i = 0; i < n; i++) {
    comparisons++
    frames.push({ arr, target, current: i, found: null, eliminated: [...eliminated], low: null, high: null, mid: null, statusSymbol: arr[i] === target ? `${arr[i]} = ${target}` : `${arr[i]} ≠ ${target}`, statusDetail: arr[i] === target ? `Found ${target} at index ${i}!` : `${arr[i]} ≠ ${target}, continue.`, comparisons })
    if (arr[i] === target) {
      frames.push({ arr, target, current: null, found: i, eliminated: [...eliminated], low: null, high: null, mid: null, statusSymbol: '✓', statusDetail: `${target} found at index ${i}. ${comparisons} comparison${comparisons > 1 ? 's' : ''}.`, comparisons })
      return frames
    }
    eliminated.push(i)
  }

  frames.push({ arr, target, current: null, found: null, eliminated: [...eliminated], low: null, high: null, mid: null, statusSymbol: '✗', statusDetail: `${target} not found. Checked all ${n} elements.`, comparisons })
  return frames
}


export function computeBinarySearchFrames(arr: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = []
  let comparisons = 0
  const eliminated: number[] = []
  let low = 0, high = arr.length - 1

  frames.push({ arr, target, current: null, found: null, eliminated: [], low, high, mid: null, statusSymbol: '', statusDetail: `Searching for ${target} in sorted array. Low=${low}, High=${high}.`, comparisons })

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    comparisons++
    frames.push({ arr, target, current: null, found: null, eliminated: [...eliminated], low, high, mid, statusSymbol: arr[mid] === target ? `${arr[mid]} = ${target}` : arr[mid] < target ? `${arr[mid]} < ${target}` : `${arr[mid]} > ${target}`, statusDetail: `Mid = ${mid}. Comparing arr[${mid}]=${arr[mid]} with target ${target}.`, comparisons })

    if (arr[mid] === target) {
      frames.push({ arr, target, current: null, found: mid, eliminated: [...eliminated], low, high, mid, statusSymbol: '✓', statusDetail: `${target} found at index ${mid}. ${comparisons} comparison${comparisons > 1 ? 's' : ''}.`, comparisons })
      return frames
    } else if (arr[mid] < target) {
      for (let i = low; i <= mid; i++) if (!eliminated.includes(i)) eliminated.push(i)
      frames.push({ arr, target, current: null, found: null, eliminated: [...eliminated], low, high, mid, statusSymbol: `${arr[mid]} < ${target}`, statusDetail: `${arr[mid]} < ${target} - eliminate left half. Search [${mid + 1}…${high}].`, comparisons })
      low = mid + 1
    } else {
      for (let i = mid; i <= high; i++) if (!eliminated.includes(i)) eliminated.push(i)
      frames.push({ arr, target, current: null, found: null, eliminated: [...eliminated], low, high, mid, statusSymbol: `${arr[mid]} > ${target}`, statusDetail: `${arr[mid]} > ${target} - eliminate right half. Search [${low}…${mid - 1}].`, comparisons })
      high = mid - 1
    }
  }

  for (let i = 0; i < arr.length; i++) if (!eliminated.includes(i)) eliminated.push(i)
  frames.push({ arr, target, current: null, found: null, eliminated, low: null, high: null, mid: null, statusSymbol: '✗', statusDetail: `${target} not found. ${comparisons} comparison${comparisons > 1 ? 's' : ''}.`, comparisons })
  return frames
}


export interface TreeSearchFrame {
  kind: 'tree'
  target: number
  current: number | null
  visited: number[]
  found: number | null
  statusSymbol: string
  statusDetail: string
  comparisons: number
}

export function treeSearchNodeState(id: number, frame: TreeSearchFrame): TreeSearchNodeState {
  if (frame.found === id) return 'found'
  if (frame.current === id) return 'current'
  if (frame.visited.includes(id)) return 'visited'
  return 'idle'
}

export function computeDFSTreeFrames(target: number): TreeSearchFrame[] {
  const frames: TreeSearchFrame[] = []
  const visited: number[] = []
  let comparisons = 0
  const push = (current: number | null, found: number | null, sym: string, detail: string) =>
    frames.push({ kind: 'tree', target, current, visited: [...visited], found, statusSymbol: sym, statusDetail: detail, comparisons })

  push(null, null, '', `DFS: searching for ${target}. Start at root.`)

  const stack: number[] = [0]
  while (stack.length > 0) {
    const id = stack.pop()!
    if (visited.includes(id)) continue
    const node = TREE_NODES[id]
    comparisons++
    push(id, null, node.value === target ? `${node.value} = ${target}` : `${node.value} ≠ ${target}`, node.value === target ? `Found ${target}!` : `${node.value} ≠ ${target}, continue.`)
    if (node.value === target) {
      visited.push(id)
      push(null, id, '✓', `${target} found in ${comparisons} comparison${comparisons > 1 ? 's' : ''}.`)
      return frames
    }
    visited.push(id)
    if (node.right !== null) stack.push(node.right)
    if (node.left  !== null) stack.push(node.left)
  }

  push(null, null, '✗', `${target} not in tree. Checked all ${comparisons} nodes.`)
  return frames
}

export function computeBFSTreeFrames(target: number): TreeSearchFrame[] {
  const frames: TreeSearchFrame[] = []
  const visited: number[] = []
  let comparisons = 0
  const push = (current: number | null, found: number | null, sym: string, detail: string) =>
    frames.push({ kind: 'tree', target, current, visited: [...visited], found, statusSymbol: sym, statusDetail: detail, comparisons })

  push(null, null, '', `BFS: searching for ${target}. Enqueue root.`)

  const queue: number[] = [0]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.includes(id)) continue
    const node = TREE_NODES[id]
    comparisons++
    push(id, null, node.value === target ? `${node.value} = ${target}` : `${node.value} ≠ ${target}`, node.value === target ? `Found ${target}!` : `${node.value} ≠ ${target}, continue.`)
    if (node.value === target) {
      visited.push(id)
      push(null, id, '✓', `${target} found in ${comparisons} comparison${comparisons > 1 ? 's' : ''}.`)
      return frames
    }
    visited.push(id)
    if (node.left  !== null) queue.push(node.left)
    if (node.right !== null) queue.push(node.right)
  }

  push(null, null, '✗', `${target} not in tree. Checked all ${comparisons} nodes.`)
  return frames
}

export type AnySearchFrame = SearchFrame | TreeSearchFrame

export function computeSearchFrames(algorithm: SearchAlgorithm, arr: number[], target: number): AnySearchFrame[] {
  if (algorithm === 'linear') return computeLinearSearchFrames(arr, target)
  if (algorithm === 'binary') return computeBinarySearchFrames(arr, target)
  if (algorithm === 'dfs')    return computeDFSTreeFrames(target)
  return computeBFSTreeFrames(target)
}
