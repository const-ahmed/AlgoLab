export type CellState = 'idle' | 'comparing' | 'swapping' | 'done'

export interface SortFrame {
  arr: number[]
  comparing: [number, number] | null
  sorted: number[]
  mergeGroups?: [number, number][]
  mergingRange?: [number, number]
  statusSymbol: string
  statusDetail: string
  comparisons: number
  swaps: number
}

export type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'


export function computeBubbleSortFrames(input: number[]): SortFrame[] {
  const frames: SortFrame[] = []
  const a = [...input]
  const n = a.length
  let comparisons = 0
  let swaps = 0
  const sorted: number[] = []

  frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: '', comparisons, swaps })

  outer: for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      const vL = a[j], vR = a[j + 1]
      comparisons++
      frames.push({ arr: [...a], comparing: [j, j + 1], sorted: [...sorted], statusSymbol: vL > vR ? `${vL} > ${vR}` : `${vL} ≤ ${vR}`, statusDetail: vL > vR ? `Comparing ${vL} and ${vR} - ${vL} > ${vR}, swap needed.` : `Comparing ${vL} and ${vR} - already in order, no swap.`, comparisons, swaps })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swaps++
        frames.push({ arr: [...a], comparing: [j, j + 1], sorted: [...sorted], statusSymbol: '↕', statusDetail: `Swapped ${vL} and ${vR}.`, comparisons, swaps })
        swapped = true
      }
      frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: '', comparisons, swaps })
    }
    sorted.push(n - 1 - i)
    frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: `${a[n - 1 - i]} is in its final position.`, comparisons, swaps })
    if (!swapped) {
      const all = Array.from({ length: n }, (_, k) => k)
      frames.push({ arr: [...a], comparing: null, sorted: all, statusSymbol: '✓', statusDetail: 'No swaps this pass - array is sorted.', comparisons, swaps })
      break outer
    }
  }

  const last = frames[frames.length - 1]
  if (last.sorted.length < n) {
    const all = Array.from({ length: n }, (_, k) => k)
    frames.push({ arr: [...a], comparing: null, sorted: all, statusSymbol: '✓', statusDetail: 'Sorted.', comparisons, swaps })
  }
  return frames
}


export function computeSelectionSortFrames(input: number[]): SortFrame[] {
  const frames: SortFrame[] = []
  const a = [...input]
  const n = a.length
  let comparisons = 0, swaps = 0
  const sorted: number[] = []

  frames.push({ arr: [...a], comparing: null, sorted: [], statusSymbol: '', statusDetail: '', comparisons, swaps })

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: `Finding minimum in positions ${i}–${n - 1}. Current minimum: ${a[minIdx]} at position ${minIdx}.`, comparisons, swaps })

    for (let j = i + 1; j < n; j++) {
      comparisons++
      frames.push({ arr: [...a], comparing: [j, minIdx], sorted: [...sorted], statusSymbol: a[j] < a[minIdx] ? `${a[j]} < ${a[minIdx]}` : `${a[j]} ≥ ${a[minIdx]}`, statusDetail: a[j] < a[minIdx] ? `${a[j]} < ${a[minIdx]}, new minimum found.` : `${a[j]} ≥ ${a[minIdx]}, keep current minimum.`, comparisons, swaps })
      if (a[j] < a[minIdx]) minIdx = j
    }

    if (minIdx !== i) {
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      swaps++
      frames.push({ arr: [...a], comparing: [i, minIdx], sorted: [...sorted], statusSymbol: '↕', statusDetail: `Swapped ${a[minIdx]} and ${a[i]} - minimum placed at position ${i}.`, comparisons, swaps })
    } else {
      frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: `${a[i]} is already the minimum - no swap needed.`, comparisons, swaps })
    }

    sorted.push(i)
    frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: `${a[i]} is in its final position.`, comparisons, swaps })
  }

  sorted.push(n - 1)
  const all = Array.from({ length: n }, (_, k) => k)
  frames.push({ arr: [...a], comparing: null, sorted: all, statusSymbol: '✓', statusDetail: 'Sorted.', comparisons, swaps })
  return frames
}


export function computeInsertionSortFrames(input: number[]): SortFrame[] {
  const frames: SortFrame[] = []
  const a = [...input]
  const n = a.length
  let comparisons = 0, swaps = 0
  const sorted: number[] = [0]

  frames.push({ arr: [...a], comparing: null, sorted: [0], statusSymbol: '', statusDetail: 'First element is trivially sorted.', comparisons, swaps })

  for (let i = 1; i < n; i++) {
    frames.push({ arr: [...a], comparing: [i, i], sorted: [...sorted], statusSymbol: `${a[i]}`, statusDetail: `Picking up ${a[i]} to insert into the sorted portion.`, comparisons, swaps })

    let j = i
    while (j > 0) {
      const prev = a[j - 1], curr = a[j]
      comparisons++
      frames.push({ arr: [...a], comparing: [j - 1, j], sorted: [...sorted], statusSymbol: prev > curr ? `${prev} > ${curr}` : `${prev} ≤ ${curr}`, statusDetail: prev > curr ? `${prev} > ${curr} - swap.` : `${prev} ≤ ${curr} - in place.`, comparisons, swaps })
      if (prev > curr) {
        ;[a[j - 1], a[j]] = [a[j], a[j - 1]]
        swaps++
        frames.push({ arr: [...a], comparing: [j - 1, j], sorted: [...sorted], statusSymbol: '↕', statusDetail: `Swapped ${curr} and ${prev}.`, comparisons, swaps })
        j--
      } else {
        break
      }
    }

    sorted.push(i)
    sorted.sort((x, y) => x - y)
    frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: `${a[j]} is now in its correct position.`, comparisons, swaps })
  }

  const all = Array.from({ length: n }, (_, k) => k)
  frames.push({ arr: [...a], comparing: null, sorted: all, statusSymbol: '✓', statusDetail: 'Sorted.', comparisons, swaps })
  return frames
}

export function computeMergeSortFrames(input: number[]): SortFrame[] {
  const frames: SortFrame[] = []
  const a = [...input]
  const n = a.length
  let comparisons = 0, swaps = 0

  let groups: [number, number][] = a.map((_, i) => [i, i] as [number, number])

  const push = (comparing: [number, number] | null, sym: string, detail: string, mergingRange?: [number, number]) =>
    frames.push({ arr: [...a], comparing, sorted: [], mergeGroups: groups.map(g => [...g] as [number, number]), mergingRange, statusSymbol: sym, statusDetail: detail, comparisons, swaps })

  push(null, '', `Array split into ${n} individual elements - each is trivially sorted.`)

  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left < n; left += 2 * width) {
      const mid = Math.min(left + width, n)
      const right = Math.min(left + 2 * width, n)
      if (mid >= right) continue

      const range: [number, number] = [left, right - 1]
      push(null, '↔', `Merging [${left}…${mid - 1}] and [${mid}…${right - 1}].`, range)

      let i = left, j = mid
      while (i < j && j < right) {
        comparisons++
        push([i, j], a[i] <= a[j] ? `${a[i]} ≤ ${a[j]}` : `${a[i]} > ${a[j]}`, a[i] <= a[j] ? `${a[i]} ≤ ${a[j]}, already in place.` : `${a[i]} > ${a[j]}, rotate ${a[j]} left.`, range)
        if (a[i] <= a[j]) {
          i++
        } else {
          for (let k = j; k > i; k--) {
            const vL = a[k - 1], vR = a[k]
            ;[a[k - 1], a[k]] = [a[k], a[k - 1]]
            swaps++
            push([k - 1, k], '↕', `Swapped ${vL} and ${vR}.`, range)
          }
          i++
          j++
        }
      }

      groups = groups.filter(([s, e]) => e < left || s >= right)
      groups.push([left, right - 1])
      groups.sort((p, q) => p[0] - q[0])

      push(null, '', `Merged into sorted subarray [${left}…${right - 1}].`)
    }
  }

  const all = Array.from({ length: n }, (_, k) => k)
  frames.push({ arr: [...a], comparing: null, sorted: all, mergeGroups: [[0, n - 1]], statusSymbol: '✓', statusDetail: 'Sorted.', comparisons, swaps })
  return frames
}


export function computeQuickSortFrames(input: number[]): SortFrame[] {
  const frames: SortFrame[] = []
  const a = [...input]
  const n = a.length
  let comparisons = 0, swaps = 0
  const sorted: number[] = []

  frames.push({ arr: [...a], comparing: null, sorted: [], statusSymbol: '', statusDetail: '', comparisons, swaps })

  const stack: [number, number][] = [[0, n - 1]]

  while (stack.length > 0) {
    const [low, high] = stack.pop()!
    if (low >= high) {
      if (low === high && !sorted.includes(low)) sorted.push(low)
      continue
    }

    const pivot = a[high]
    frames.push({ arr: [...a], comparing: [high, high], sorted: [...sorted], statusSymbol: `pivot: ${pivot}`, statusDetail: `Pivot is ${pivot} at index ${high}. Partitioning [${low}…${high}].`, comparisons, swaps })

    let i = low - 1
    for (let j = low; j < high; j++) {
      comparisons++
      frames.push({ arr: [...a], comparing: [j, high], sorted: [...sorted], statusSymbol: a[j] <= pivot ? `${a[j]} ≤ ${pivot}` : `${a[j]} > ${pivot}`, statusDetail: a[j] <= pivot ? `${a[j]} ≤ pivot ${pivot}, move to left partition.` : `${a[j]} > pivot ${pivot}, stays in right partition.`, comparisons, swaps })
      if (a[j] <= pivot) {
        i++
        if (i !== j) {
          ;[a[i], a[j]] = [a[j], a[i]]
          swaps++
          frames.push({ arr: [...a], comparing: [i, j], sorted: [...sorted], statusSymbol: '↕', statusDetail: `Swapped ${a[j]} and ${a[i]}.`, comparisons, swaps })
        }
      }
    }

    const pivotIdx = i + 1
    if (pivotIdx !== high) {
      ;[a[pivotIdx], a[high]] = [a[high], a[pivotIdx]]
      swaps++
    }
    if (!sorted.includes(pivotIdx)) sorted.push(pivotIdx)
    frames.push({ arr: [...a], comparing: null, sorted: [...sorted], statusSymbol: '', statusDetail: `Pivot ${a[pivotIdx]} placed at its final position ${pivotIdx}.`, comparisons, swaps })

    stack.push([low, pivotIdx - 1])
    stack.push([pivotIdx + 1, high])
  }

  const all = Array.from({ length: n }, (_, k) => k)
  if (frames[frames.length - 1].sorted.length < n) {
    frames.push({ arr: [...a], comparing: null, sorted: all, statusSymbol: '✓', statusDetail: 'Sorted.', comparisons, swaps })
  }
  return frames
}


export function computeSortFrames(algorithm: SortAlgorithm, arr: number[]): SortFrame[] {
  switch (algorithm) {
    case 'bubble':    return computeBubbleSortFrames(arr)
    case 'selection': return computeSelectionSortFrames(arr)
    case 'insertion': return computeInsertionSortFrames(arr)
    case 'merge':     return computeMergeSortFrames(arr)
    case 'quick':     return computeQuickSortFrames(arr)
  }
}


export function cellState(pos: number, frame: SortFrame): CellState {
  if (frame.sorted.includes(pos)) return 'done'
  if (frame.comparing?.includes(pos)) return 'comparing'
  return 'idle'
}
