export type MemAlgorithm = 'factorial' | 'fibonacci' | 'power' | 'sumofdigits'

export interface CallFrame {
  id: string
  label: string
  vars: { name: string; value: number }[]
  depth: number
  isBase: boolean
  returning: boolean
  result: number | null
}

export interface MemoryFrame {
  stack: CallFrame[]      // index 0 = deepest/oldest, last index = top/newest
  activeLine: number      // index into PSEUDOCODE[algorithm]; -1 = done
  totalCalls: number
  baseCases: number
  maxDepth: number
  finalResult: number | null
  sym: string             // short label for current operation
  detail: string          // prose explanation of what is happening
}

export const PSEUDOCODE: Record<MemAlgorithm, string[]> = {
  factorial: [
    'function factorial(n):',
    '  if n ≤ 1:',
    '    return 1',
    '  return n × factorial(n − 1)',
  ],
  fibonacci: [
    'function fibonacci(n):',
    '  if n ≤ 1:',
    '    return n',
    '  a ← fibonacci(n − 1)',
    '  b ← fibonacci(n − 2)',
    '  return a + b',
  ],
  power: [
    'function power(base, exp):',
    '  if exp = 0:',
    '    return 1',
    '  return base × power(base, exp − 1)',
  ],
  sumofdigits: [
    'function sumOfDigits(n):',
    '  if n < 10:',
    '    return n',
    '  return (n mod 10) + sumOfDigits(⌊n ÷ 10⌋)',
  ],
}

export const N_RANGE: Record<MemAlgorithm, { min: number; max: number; default: number }> = {
  factorial:   { min: 1, max: 7,   default: 5   },
  fibonacci:   { min: 1, max: 7,   default: 5   },
  power:       { min: 1, max: 8,   default: 5   },
  sumofdigits: { min: 0, max: 3,   default: 2   }, // index into SOD_PRESETS
}

export const SOD_PRESETS = [12, 23, 123, 456]


export function computeMemoryFrames(algorithm: MemAlgorithm, n: number): MemoryFrame[] {
  switch (algorithm) {
    case 'factorial':   return factorialFrames(n)
    case 'fibonacci':   return fibonacciFrames(n)
    case 'power':       return powerFrames(2, n)
    case 'sumofdigits': return sumOfDigitsFrames(SOD_PRESETS[n] ?? SOD_PRESETS[0])
  }
}


function snap(stack: CallFrame[]): CallFrame[] {
  return stack.map(f => ({ ...f, vars: [...f.vars] }))
}


function factorialFrames(n: number): MemoryFrame[] {
  const frames: MemoryFrame[] = []
  const stack: CallFrame[] = []
  let totalCalls = 0, baseCases = 0, maxDepth = 0, seq = 0

  function emit(line: number, sym: string, detail: string, final: number | null = null) {
    frames.push({ stack: snap(stack), activeLine: line, totalCalls, baseCases, maxDepth, finalResult: final, sym, detail })
  }

  function fact(n: number): number {
    totalCalls++
    const frame: CallFrame = {
      id: String(seq++), label: `factorial(${n})`,
      vars: [{ name: 'n', value: n }],
      depth: stack.length, isBase: n <= 1, returning: false, result: null,
    }
    stack.push(frame)
    maxDepth = Math.max(maxDepth, stack.length)
    emit(1, `factorial(${n})`,
      n <= 1
        ? `factorial(${n}) is called. n = ${n} ≤ 1 - this is the base case. No further recursion needed.`
        : `factorial(${n}) is called. n = ${n} > 1 - this frame will recurse. It stays on the stack while factorial(${n - 1}) runs.`
    )

    let result: number
    if (n <= 1) {
      baseCases++
      emit(2, `return 1`,
        `Base case reached. n = ${n} ≤ 1, so we return 1 immediately. This unwinds the recursion.`
      )
      result = 1
    } else {
      emit(3, `factorial(${n - 1})`,
        `Calling factorial(${n - 1}). This frame pauses at this line - it is frozen on the stack until the sub-call returns.`
      )
      result = n * fact(n - 1)
      frame.result = result; frame.returning = true
      emit(3, `return ${result}`,
        `factorial(${n - 1}) returned ${result / n}. Now computing ${n} × ${result / n} = ${result}. This frame is done and will be popped.`
      )
    }
    stack.pop()
    return result
  }

  const finalResult = fact(n)
  emit(-1, `done`, `All frames have been popped. The call stack is empty. factorial(${n}) = ${finalResult}.`, finalResult)
  return frames
}


function fibonacciFrames(n: number): MemoryFrame[] {
  const frames: MemoryFrame[] = []
  const stack: CallFrame[] = []
  let totalCalls = 0, baseCases = 0, maxDepth = 0, seq = 0

  function emit(line: number, sym: string, detail: string, final: number | null = null) {
    frames.push({ stack: snap(stack), activeLine: line, totalCalls, baseCases, maxDepth, finalResult: final, sym, detail })
  }

  function fib(n: number): number {
    totalCalls++
    const frame: CallFrame = {
      id: String(seq++), label: `fibonacci(${n})`,
      vars: [{ name: 'n', value: n }],
      depth: stack.length, isBase: n <= 1, returning: false, result: null,
    }
    stack.push(frame)
    maxDepth = Math.max(maxDepth, stack.length)
    emit(1, `fibonacci(${n})`,
      n <= 1
        ? `fibonacci(${n}) is called. n = ${n} ≤ 1 - base case. Returns ${n} immediately.`
        : `fibonacci(${n}) is called. n = ${n} > 1. Fibonacci requires two sub-calls: fibonacci(${n - 1}) first, then fibonacci(${n - 2}).`
    )

    let result: number
    if (n <= 1) {
      baseCases++
      emit(2, `return ${n}`,
        `Base case: n = ${n} ≤ 1. Returning n (= ${n}) directly. This stops this branch of recursion.`
      )
      result = n
    } else {
      emit(3, `fibonacci(${n - 1})`,
        `Starting the first sub-call: fibonacci(${n - 1}). This frame pauses and waits on the stack.`
      )
      const a = fib(n - 1)
      frame.vars = [{ name: 'n', value: n }, { name: 'a', value: a }]
      emit(4, `a = ${a}  →  fibonacci(${n - 2})`,
        `fibonacci(${n - 1}) returned ${a}. Stored as a = ${a}. Now starting the second sub-call: fibonacci(${n - 2}).`
      )
      const b = fib(n - 2)
      result = a + b
      frame.vars = [{ name: 'n', value: n }, { name: 'a', value: a }, { name: 'b', value: b }]
      frame.result = result; frame.returning = true
      emit(5, `return ${a} + ${b} = ${result}`,
        `fibonacci(${n - 2}) returned ${b}. Computing a + b = ${a} + ${b} = ${result}. Returning ${result} and popping this frame.`
      )
    }
    stack.pop()
    return result
  }

  const finalResult = fib(n)
  emit(-1, `done`, `All frames have been popped. The call stack is empty. fibonacci(${n}) = ${finalResult}.`, finalResult)
  return frames
}


function powerFrames(base: number, exp: number): MemoryFrame[] {
  const frames: MemoryFrame[] = []
  const stack: CallFrame[] = []
  let totalCalls = 0, baseCases = 0, maxDepth = 0, seq = 0

  function emit(line: number, sym: string, detail: string, final: number | null = null) {
    frames.push({ stack: snap(stack), activeLine: line, totalCalls, baseCases, maxDepth, finalResult: final, sym, detail })
  }

  function pow(base: number, exp: number): number {
    totalCalls++
    const frame: CallFrame = {
      id: String(seq++), label: `power(${base}, ${exp})`,
      vars: [{ name: 'base', value: base }, { name: 'exp', value: exp }],
      depth: stack.length, isBase: exp === 0, returning: false, result: null,
    }
    stack.push(frame)
    maxDepth = Math.max(maxDepth, stack.length)
    emit(1, `power(${base}, ${exp})`,
      exp === 0
        ? `power(${base}, ${exp}) is called. exp = 0 - base case. Any number to the power of 0 is 1.`
        : `power(${base}, ${exp}) is called. exp = ${exp} > 0. Will compute ${base} × power(${base}, ${exp - 1}) - this frame waits on the stack.`
    )

    let result: number
    if (exp === 0) {
      baseCases++
      emit(2, `return 1`,
        `Base case: exp = 0. By definition, ${base}⁰ = 1. Returning 1.`
      )
      result = 1
    } else {
      emit(3, `power(${base}, ${exp - 1})`,
        `Calling power(${base}, ${exp - 1}). This frame is paused at this line, frozen on the stack, until the sub-call returns.`
      )
      result = base * pow(base, exp - 1)
      frame.result = result; frame.returning = true
      emit(3, `return ${result}`,
        `power(${base}, ${exp - 1}) returned ${result / base}. Computing ${base} × ${result / base} = ${result}. Popping this frame.`
      )
    }
    stack.pop()
    return result
  }

  const finalResult = pow(base, exp)
  emit(-1, `done`, `All frames have been popped. The call stack is empty. power(${base}, ${exp}) = ${finalResult}.`, finalResult)
  return frames
}


function sumOfDigitsFrames(n: number): MemoryFrame[] {
  const frames: MemoryFrame[] = []
  const stack: CallFrame[] = []
  let totalCalls = 0, baseCases = 0, maxDepth = 0, seq = 0

  function emit(line: number, sym: string, detail: string, final: number | null = null) {
    frames.push({ stack: snap(stack), activeLine: line, totalCalls, baseCases, maxDepth, finalResult: final, sym, detail })
  }

  function sod(n: number): number {
    totalCalls++
    const lastDigit = n % 10
    const remaining = Math.floor(n / 10)
    const frame: CallFrame = {
      id: String(seq++), label: `sumOfDigits(${n})`,
      vars: [{ name: 'n', value: n }],
      depth: stack.length, isBase: n < 10, returning: false, result: null,
    }
    stack.push(frame)
    maxDepth = Math.max(maxDepth, stack.length)
    emit(1, `sumOfDigits(${n})`,
      n < 10
        ? `sumOfDigits(${n}) is called. n = ${n} < 10 - single digit, base case. Returns ${n} directly.`
        : `sumOfDigits(${n}) is called. n = ${n} ≥ 10. Last digit is ${lastDigit}, remaining is ${remaining}. Will add ${lastDigit} + sumOfDigits(${remaining}).`
    )

    let result: number
    if (n < 10) {
      baseCases++
      emit(2, `return ${n}`,
        `Base case: n = ${n} < 10, so it is already a single digit. Returning ${n}.`
      )
      result = n
    } else {
      emit(3, `sumOfDigits(${remaining})`,
        `Last digit: ${n} mod 10 = ${lastDigit}. Remaining digits: ⌊${n} ÷ 10⌋ = ${remaining}. Calling sumOfDigits(${remaining}) - this frame pauses and waits.`
      )
      result = lastDigit + sod(remaining)
      frame.result = result; frame.returning = true
      emit(3, `return ${lastDigit} + ${result - lastDigit} = ${result}`,
        `sumOfDigits(${remaining}) returned ${result - lastDigit}. Adding the last digit: ${lastDigit} + ${result - lastDigit} = ${result}. Popping this frame.`
      )
    }
    stack.pop()
    return result
  }

  const finalResult = sod(n)
  emit(-1, `done`, `All frames have been popped. The call stack is empty. sumOfDigits(${n}) = ${finalResult}.`, finalResult)
  return frames
}
