export type SchedulingAlgorithm = 'fcfs' | 'sjf' | 'rr' | 'priority'

export interface Process {
  id: number
  name: string
  arrival: number
  burst: number
  priority: number
}

export interface GanttEntry {
  processId: number | null
  name: string
  start: number
  end: number
}

export interface ScheduleFrame {
  time: number
  runningId: number | null
  remaining: number[]       // remaining burst per process
  readyQueue: number[]      // process ids in ready queue
  gantt: GanttEntry[]       // completed time slices so far
  statusSymbol: string
  statusDetail: string
}

export const DEFAULT_PROCESSES: Process[] = [
  { id: 0, name: 'P1', arrival: 0, burst: 6, priority: 3 },
  { id: 1, name: 'P2', arrival: 1, burst: 4, priority: 1 },
  { id: 2, name: 'P3', arrival: 2, burst: 8, priority: 4 },
  { id: 3, name: 'P4', arrival: 3, burst: 3, priority: 2 },
  { id: 4, name: 'P5', arrival: 4, burst: 5, priority: 2 },
]

function frame(time: number, runningId: number | null, remaining: number[], readyQueue: number[], gantt: GanttEntry[], sym: string, detail: string): ScheduleFrame {
  return { time, runningId, remaining: [...remaining], readyQueue: [...readyQueue], gantt: [...gantt], statusSymbol: sym, statusDetail: detail }
}


export function computeFCFSFrames(procs: Process[]): ScheduleFrame[] {
  const frames: ScheduleFrame[] = []
  const remaining = procs.map(p => p.burst)
  const gantt: GanttEntry[] = []
  const done = new Set<number>()
  let time = 0

  const queue = [...procs].sort((a, b) => a.arrival - b.arrival)
  frames.push(frame(0, null, remaining, [], gantt, '', 'FCFS: processes run in arrival order, non-preemptive.'))

  for (const p of queue) {
    if (time < p.arrival) {
      gantt.push({ processId: null, name: 'idle', start: time, end: p.arrival })
      frames.push(frame(p.arrival, null, remaining, [], gantt, '', `CPU idle from t=${time} to t=${p.arrival}.`))
      time = p.arrival
    }
    const readyQueue = procs.filter(x => x.arrival <= time && !done.has(x.id) && x.id !== p.id).map(x => x.id)
    frames.push(frame(time, p.id, remaining, readyQueue, gantt, p.name, `Run ${p.name} (burst=${p.burst}). Ready: ${readyQueue.map(id => procs[id].name).join(', ') || '-'}.`))

    for (let t = 0; t < p.burst; t++) {
      time++
      remaining[p.id]--
      const rq = procs.filter(x => x.arrival <= time && !done.has(x.id) && x.id !== p.id).map(x => x.id)
      frames.push(frame(time, p.id, remaining, rq, gantt, p.name, `t=${time}: ${p.name} running. Remaining=${remaining[p.id]}.`))
    }

    gantt.push({ processId: p.id, name: p.name, start: time - p.burst, end: time })
    done.add(p.id)
    frames.push(frame(time, null, remaining, [], [...gantt], '', `${p.name} finished at t=${time}.`))
  }

  frames.push(frame(time, null, remaining, [], gantt, '✓', `All processes complete at t=${time}.`))
  return frames
}


export function computeSJFFrames(procs: Process[]): ScheduleFrame[] {
  const frames: ScheduleFrame[] = []
  const remaining = procs.map(p => p.burst)
  const gantt: GanttEntry[] = []
  const done = new Set<number>()
  let time = 0

  frames.push(frame(0, null, remaining, [], gantt, '', 'SJF: at each step, pick the ready process with shortest burst.'))

  while (done.size < procs.length) {
    const ready = procs.filter(p => p.arrival <= time && !done.has(p.id))
    if (ready.length === 0) {
      const next = procs.filter(p => !done.has(p.id)).sort((a, b) => a.arrival - b.arrival)[0]
      gantt.push({ processId: null, name: 'idle', start: time, end: next.arrival })
      frames.push(frame(next.arrival, null, remaining, [], gantt, '', `No process ready. CPU idle until t=${next.arrival}.`))
      time = next.arrival
      continue
    }

    const p = ready.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival)[0]
    const readyQueue = ready.filter(x => x.id !== p.id).map(x => x.id)
    frames.push(frame(time, p.id, remaining, readyQueue, gantt, p.name, `Shortest burst: ${p.name} (burst=${p.burst}). Run to completion.`))

    for (let t = 0; t < p.burst; t++) {
      time++
      remaining[p.id]--
      frames.push(frame(time, p.id, remaining, readyQueue, gantt, p.name, `t=${time}: ${p.name} running. Remaining=${remaining[p.id]}.`))
    }

    gantt.push({ processId: p.id, name: p.name, start: time - p.burst, end: time })
    done.add(p.id)
    frames.push(frame(time, null, remaining, [], [...gantt], '', `${p.name} finished at t=${time}.`))
  }

  frames.push(frame(time, null, remaining, [], gantt, '✓', `All processes complete at t=${time}.`))
  return frames
}


export function computeRRFrames(procs: Process[], quantum = 2): ScheduleFrame[] {
  const frames: ScheduleFrame[] = []
  const remaining = procs.map(p => p.burst)
  const gantt: GanttEntry[] = []
  const done = new Set<number>()
  const queue: number[] = []
  let time = 0
  let nextArrivalIdx = 0

  const sorted = [...procs].sort((a, b) => a.arrival - b.arrival)

  function enqueueArrivals(upTo: number) {
    while (nextArrivalIdx < sorted.length && sorted[nextArrivalIdx].arrival <= upTo) {
      if (!done.has(sorted[nextArrivalIdx].id)) queue.push(sorted[nextArrivalIdx].id)
      nextArrivalIdx++
    }
  }

  enqueueArrivals(0)
  frames.push(frame(0, null, remaining, [...queue], gantt, '', `Round Robin (quantum=${quantum}): each process runs for at most ${quantum} time units.`))

  while (done.size < procs.length) {
    if (queue.length === 0) {
      const nextArr = sorted.find(p => !done.has(p.id) && p.arrival > time)
      if (!nextArr) break
      gantt.push({ processId: null, name: 'idle', start: time, end: nextArr.arrival })
      frames.push(frame(nextArr.arrival, null, remaining, [], gantt, '', `Queue empty. Idle until t=${nextArr.arrival}.`))
      time = nextArr.arrival
      enqueueArrivals(time)
      continue
    }

    const id = queue.shift()!
    const p = procs[id]
    const run = Math.min(quantum, remaining[id])
    frames.push(frame(time, id, remaining, [...queue], gantt, p.name, `Run ${p.name} for up to ${quantum} units. Remaining=${remaining[id]}.`))

    const sliceStart = time
    for (let t = 0; t < run; t++) {
      time++
      remaining[id]--
      enqueueArrivals(time)
      frames.push(frame(time, id, remaining, [...queue], gantt, p.name, `t=${time}: ${p.name} running. Remaining=${remaining[id]}.`))
    }

    gantt.push({ processId: id, name: p.name, start: sliceStart, end: time })

    if (remaining[id] === 0) {
      done.add(id)
      frames.push(frame(time, null, remaining, [...queue], [...gantt], '', `${p.name} finished at t=${time}.`))
    } else {
      enqueueArrivals(time)
      queue.push(id)
      frames.push(frame(time, null, remaining, [...queue], [...gantt], '', `${p.name} preempted. Remaining=${remaining[id]}. Re-queued.`))
    }
  }

  frames.push(frame(time, null, remaining, [], gantt, '✓', `All processes complete at t=${time}.`))
  return frames
}


export function computePriorityFrames(procs: Process[]): ScheduleFrame[] {
  const frames: ScheduleFrame[] = []
  const remaining = procs.map(p => p.burst)
  const gantt: GanttEntry[] = []
  const done = new Set<number>()
  let time = 0

  frames.push(frame(0, null, remaining, [], gantt, '', 'Priority scheduling: run the highest-priority ready process (lower number = higher priority).'))

  while (done.size < procs.length) {
    const ready = procs.filter(p => p.arrival <= time && !done.has(p.id))
    if (ready.length === 0) {
      const next = procs.filter(p => !done.has(p.id)).sort((a, b) => a.arrival - b.arrival)[0]
      gantt.push({ processId: null, name: 'idle', start: time, end: next.arrival })
      frames.push(frame(next.arrival, null, remaining, [], gantt, '', `No ready process. Idle until t=${next.arrival}.`))
      time = next.arrival
      continue
    }

    const p = ready.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival)[0]
    const readyQueue = ready.filter(x => x.id !== p.id).map(x => x.id)
    frames.push(frame(time, p.id, remaining, readyQueue, gantt, p.name, `Highest priority ready: ${p.name} (priority=${p.priority}). Run to completion.`))

    for (let t = 0; t < p.burst; t++) {
      time++
      remaining[p.id]--
      const rq = procs.filter(x => x.arrival <= time && !done.has(x.id) && x.id !== p.id).map(x => x.id)
      frames.push(frame(time, p.id, remaining, rq, gantt, p.name, `t=${time}: ${p.name} running. Remaining=${remaining[p.id]}.`))
    }

    gantt.push({ processId: p.id, name: p.name, start: time - p.burst, end: time })
    done.add(p.id)
    frames.push(frame(time, null, remaining, [], [...gantt], '', `${p.name} finished at t=${time}.`))
  }

  frames.push(frame(time, null, remaining, [], gantt, '✓', `All processes complete at t=${time}.`))
  return frames
}

export function computeScheduleFrames(algorithm: SchedulingAlgorithm, procs: Process[]): ScheduleFrame[] {
  switch (algorithm) {
    case 'fcfs':     return computeFCFSFrames(procs)
    case 'sjf':      return computeSJFFrames(procs)
    case 'rr':       return computeRRFrames(procs)
    case 'priority': return computePriorityFrames(procs)
  }
}
