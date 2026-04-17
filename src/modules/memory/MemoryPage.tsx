import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import PlaybackControls from "../../components/ui/PlaybackControls";

import Button from "../../components/ui/Button";
import AlgorithmTabs from "../../components/ui/AlgorithmTabs";
import UseMeWhen from "../../components/ui/UseMeWhen";
import MetricChip from "../../components/ui/MetricChip";
import styles from "./MemoryPage.module.css";
import {
  type MemAlgorithm,
  computeMemoryFrames,
  PSEUDOCODE,
  N_RANGE,
  SOD_PRESETS,
} from "./engine";

const MEMORY_TABS = [
  { id: "callstack", label: "Call Stack" },
  { id: "heap", label: "Heap" },
  { id: "frames", label: "Function Frames" },
  { id: "references", label: "Variables & References" },
];

const CS_ALGO_TABS = [
  { id: "factorial", label: "Factorial" },
  { id: "fibonacci", label: "Fibonacci" },
  { id: "power", label: "Power" },
  { id: "sumofdigits", label: "Sum of Digits" },
];

const SPEED_MS = [1600, 1100, 700, 400, 200];

function CallStackViz() {
  const [algo, setAlgo] = useState<MemAlgorithm>("factorial");
  const [n, setN] = useState(N_RANGE["factorial"].default);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 0–4 index into SPEED_MS
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frames = useMemo(() => computeMemoryFrames(algo, n), [algo, n]);
  const cf = frames[idx] ?? frames[frames.length - 1];
  const atEnd = idx >= frames.length - 1;

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [algo, n]);

  const handleAlgo = useCallback((id: string) => {
    setAlgo(id as MemAlgorithm);
    setN(N_RANGE[id as MemAlgorithm].default);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setIdx((i) => i + 1), SPEED_MS[speed]);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, idx, atEnd, speed]);

  const stepBack = () => {
    setPlaying(false);
    setIdx((i) => Math.max(0, i - 1));
  };
  const stepForward = () => {
    setPlaying(false);
    setIdx((i) => Math.min(frames.length - 1, i + 1));
  };
  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else if (!atEnd) setPlaying(true);
  };

  const range = N_RANGE[algo];
  const topFrame = cf.stack.length > 0 ? cf.stack[cf.stack.length - 1] : null;

  const inputLabel =
    algo === "power"
      ? `2^${n}`
      : algo === "sumofdigits"
        ? `n = ${SOD_PRESETS[n]}`
        : `n = ${n}`;

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <AlgorithmTabs
          tabs={CS_ALGO_TABS}
          active={algo}
          onChange={handleAlgo}
        />

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>input</span>
          <div className={styles.sliderRow}>
            <input
              type="range"
              className={styles.slider}
              min={range.min}
              max={range.max}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
            />
            <span className={styles.sliderVal}>{inputLabel}</span>
          </div>
          {algo === "sumofdigits" && (
            <div className={styles.presetRow}>
              {SOD_PRESETS.map((v, i) => (
                <button
                  key={v}
                  className={`${styles.presetChip} ${n === i ? styles.presetChipActive : ""}`}
                  onClick={() => setN(i)}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>playback</span>
          <PlaybackControls
            isPlaying={playing}
            atStart={idx === 0}
            atEnd={atEnd}
            onBack={stepBack}
            onPlay={togglePlay}
            onForward={stepForward}
          />
          <div className={styles.playbackMeta}>
            <span className={styles.stepCounter}>
              Step {idx + 1} / {frames.length}
            </span>
            <div className={styles.speedRow}>
              <span className={styles.speedLabel}>speed</span>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={4}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <span className={styles.speedVal}>{speed + 1}</span>
            </div>
          </div>
          {atEnd && (
            <Button
              variant="pill"
              size="sm"
              onClick={() => {
                setIdx(0);
                setPlaying(false);
              }}
            >
              replay
            </Button>
          )}
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>what's happening</span>
          {cf.sym && <p className={styles.csSymLabel}>{cf.sym}</p>}
          <p className={styles.stepDetail}>{cf.detail}</p>
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>pseudocode</span>
          <div className={styles.pseudocode}>
            {PSEUDOCODE[algo].map((line, i) => (
              <div
                key={i}
                className={`${styles.codeLine} ${cf.activeLine === i ? styles.codeLineActive : ""}`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>statistics</span>
          <div className={styles.statsGrid}>
            <MetricChip label="total calls" value={cf.totalCalls} />
            <MetricChip label="max depth" value={cf.maxDepth} />
            <MetricChip label="result" value={cf.finalResult ?? "-"} />
            <MetricChip label="base cases" value={cf.baseCases} />
          </div>
        </div>
      </div>

      <div className={styles.csRight}>
        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>call stack</span>
            {topFrame?.isBase && !topFrame.returning && (
              <span className={styles.badge}>base case</span>
            )}
            {topFrame?.returning && (
              <span className={`${styles.badge} ${styles.badgeReturn}`}>
                returning {topFrame.result}
              </span>
            )}
          </div>

          <div className={styles.csFrames}>
            {cf.stack.length === 0 && cf.activeLine === -1 && (
              <div className={styles.csDone}>
                stack empty - result = {cf.finalResult}
              </div>
            )}
            {cf.stack.length === 0 && cf.activeLine !== -1 && (
              <div className={styles.csEmpty}>empty</div>
            )}

            {[...cf.stack].reverse().map((frame, ri) => {
              const isTop = ri === 0;
              return (
                <div key={frame.id} className={styles.csFrameRow}>
                  <span
                    className={`${styles.spLabel} ${isTop ? styles.spLabelVisible : ""}`}
                  >
                    SP →
                  </span>
                  <div
                    className={`${styles.csFrame} ${
                      isTop && frame.returning
                        ? styles.csFrameReturning
                        : isTop && frame.isBase
                          ? styles.csFrameBase
                          : isTop
                            ? styles.csFrameTop
                            : styles.csFrameIdle
                    }`}
                  >
                    <span className={styles.csFrameName}>{frame.label}</span>
                    <span className={styles.csFrameDepth}>
                      depth: {frame.depth}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {cf.stack.length > 0 && (
            <div className={styles.csStackBase}>Stack Base (Bottom)</div>
          )}
        </div>

        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>variable state</span>
          </div>
          <div className={styles.csVarList}>
            {cf.stack.length === 0 && (
              <div className={styles.csEmpty}>no active frames</div>
            )}
            {[...cf.stack].reverse().map((frame) => (
              <div key={frame.id} className={styles.csVarFrame}>
                <div className={styles.csVarFrameHeader}>
                  {frame.label.split("(")[0]}()
                  <span className={styles.csVarFrameDepth}>
                    {" "}
                    [depth {frame.depth}]
                  </span>
                </div>
                {frame.vars.map((v) => (
                  <div key={v.name} className={styles.frameVar}>
                    <span className={styles.varName}>{v.name}</span>
                    <span className={styles.varVal}>{v.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface HeapStep {
  stackVars: { name: string; ref: string | null; val: string | null }[];
  heapObjects: { id: string; label: string; fields: [string, string][] }[];
  highlight: string[];
  sym: string;
  detail: string;
}

const HEAP_STEPS: HeapStep[] = [
  {
    stackVars: [],
    heapObjects: [],
    highlight: [],
    sym: "",
    detail:
      "The heap stores objects and arrays. Stack variables hold references (pointers) to heap objects.",
  },
  {
    stackVars: [{ name: "name", ref: null, val: '"Alice"' }],
    heapObjects: [],
    highlight: ["name"],
    sym: 'let name = "Alice"',
    detail:
      "Primitive values (strings, numbers, booleans) are stored directly on the stack - no heap needed.",
  },
  {
    stackVars: [
      { name: "name", ref: null, val: '"Alice"' },
      { name: "obj", ref: "obj1", val: null },
    ],
    heapObjects: [
      {
        id: "obj1",
        label: "Object",
        fields: [
          ["name", '"Alice"'],
          ["age", "25"],
        ],
      },
    ],
    highlight: ["obj", "obj1"],
    sym: "let obj = {…}",
    detail:
      "Objects live on the heap. obj on the stack holds a reference (memory address) pointing to the heap object.",
  },
  {
    stackVars: [
      { name: "name", ref: null, val: '"Alice"' },
      { name: "obj", ref: "obj1", val: null },
      { name: "arr", ref: "arr1", val: null },
    ],
    heapObjects: [
      {
        id: "obj1",
        label: "Object",
        fields: [
          ["name", '"Alice"'],
          ["age", "25"],
        ],
      },
      {
        id: "arr1",
        label: "Array",
        fields: [
          ["0", "1"],
          ["1", "2"],
          ["2", "3"],
        ],
      },
    ],
    highlight: ["arr", "arr1"],
    sym: "let arr = […]",
    detail:
      "Arrays also live on the heap. arr holds a reference to the array object, not the array itself.",
  },
  {
    stackVars: [
      { name: "name", ref: null, val: '"Alice"' },
      { name: "obj", ref: "obj1", val: null },
      { name: "arr", ref: "arr1", val: null },
      { name: "copy", ref: "obj1", val: null },
    ],
    heapObjects: [
      {
        id: "obj1",
        label: "Object",
        fields: [
          ["name", '"Alice"'],
          ["age", "25"],
        ],
      },
      {
        id: "arr1",
        label: "Array",
        fields: [
          ["0", "1"],
          ["1", "2"],
          ["2", "3"],
        ],
      },
    ],
    highlight: ["obj", "copy", "obj1"],
    sym: "copy = obj",
    detail:
      "copy = obj copies the reference, not the object. Both obj and copy point to the same heap address - mutating one affects the other.",
  },
];

function useStepThrough(length: number) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const atEnd = idx >= length - 1;

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [length]);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setIdx((i) => i + 1), 1000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, idx, atEnd]);

  return {
    idx,
    atEnd,
    stepBack: () => {
      setPlaying(false);
      setIdx((i) => Math.max(0, i - 1));
    },
    stepForward: () => {
      setPlaying(false);
      setIdx((i) => Math.min(length - 1, i + 1));
    },
    togglePlay: () => {
      if (playing) setPlaying(false);
      else if (!atEnd) setPlaying(true);
    },
    replay: () => {
      setIdx(0);
      setPlaying(false);
    },
    playing,
  };
}

function HeapViz() {
  const { idx, atEnd, stepBack, stepForward, togglePlay, replay, playing } =
    useStepThrough(HEAP_STEPS.length);
  const cf = HEAP_STEPS[idx];

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>what is the heap</span>
          <p className={styles.stepDetail}>{cf.detail}</p>
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>playback</span>
          <PlaybackControls
            isPlaying={playing}
            atStart={idx === 0}
            atEnd={atEnd}
            onBack={stepBack}
            onPlay={togglePlay}
            onForward={stepForward}
          />
          <div className={styles.playbackMeta}>
            <span className={styles.stepCounter}>
              Step {idx + 1} / {HEAP_STEPS.length}
            </span>
          </div>
          {atEnd && (
            <Button variant="pill" size="sm" onClick={replay}>
              replay
            </Button>
          )}
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>current operation</span>
          <div className={styles.csPanel}>
            <div className={styles.csPanelHeader}>
              <span className={styles.csPanelTitle}>{cf.sym || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.csRight}>
        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>stack</span>
          </div>
          <div
            className={styles.heapStack}
            style={{ padding: "var(--sp-3) var(--sp-4)" }}
          >
            {cf.stackVars.length === 0 && (
              <div className={styles.csEmpty}>empty</div>
            )}
            {cf.stackVars.map((v) => (
              <div
                key={v.name}
                className={`${styles.heapVar} ${cf.highlight.includes(v.name) ? styles.heapVarLit : ""}`}
              >
                <span className={styles.varName}>{v.name}</span>
                {v.val ? (
                  <span className={styles.varVal}>{v.val}</span>
                ) : (
                  <span className={styles.varRef}>ref →</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>heap</span>
          </div>
          <div
            className={styles.heapObjects}
            style={{ padding: "var(--sp-3) var(--sp-4)" }}
          >
            {cf.heapObjects.length === 0 && (
              <div className={styles.csEmpty}>empty</div>
            )}
            {cf.heapObjects.map((obj) => (
              <div
                key={obj.id}
                className={`${styles.heapObj} ${cf.highlight.includes(obj.id) ? styles.heapObjLit : ""}`}
              >
                <div className={styles.heapObjLabel}>
                  {obj.label}{" "}
                  <span className={styles.heapObjId}>@{obj.id}</span>
                </div>
                {obj.fields.map(([k, v]) => (
                  <div key={k} className={styles.frameVar}>
                    <span className={styles.varName}>{k}</span>
                    <span className={styles.varVal}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScopeStep {
  scopes: {
    name: string;
    vars: [string, string][];
    level: number;
    active: boolean;
  }[];
  sym: string;
  detail: string;
}

const SCOPE_STEPS: ScopeStep[] = [
  {
    scopes: [{ name: "global scope", vars: [], level: 0, active: true }],
    sym: "program starts",
    detail:
      "The global scope is created. It exists for the entire lifetime of the program.",
  },
  {
    scopes: [
      {
        name: "global scope",
        vars: [
          ["PI", "3.14"],
          ["greeting", '"hello"'],
        ],
        level: 0,
        active: true,
      },
    ],
    sym: "globals declared",
    detail:
      "Global variables are declared. They live in the global scope and are accessible from anywhere.",
  },
  {
    scopes: [
      {
        name: "global scope",
        vars: [
          ["PI", "3.14"],
          ["greeting", '"hello"'],
        ],
        level: 0,
        active: false,
      },
      { name: "outer()", vars: [], level: 1, active: true },
    ],
    sym: "outer() called",
    detail:
      "Calling outer() pushes a new frame. It has its own isolated scope.",
  },
  {
    scopes: [
      {
        name: "global scope",
        vars: [
          ["PI", "3.14"],
          ["greeting", '"hello"'],
        ],
        level: 0,
        active: false,
      },
      {
        name: "outer()",
        vars: [
          ["x", "10"],
          ["y", "20"],
        ],
        level: 1,
        active: true,
      },
    ],
    sym: "x = 10, y = 20",
    detail: "outer() declares x=10 and y=20. These are local to outer's frame.",
  },
  {
    scopes: [
      {
        name: "global scope",
        vars: [
          ["PI", "3.14"],
          ["greeting", '"hello"'],
        ],
        level: 0,
        active: false,
      },
      {
        name: "outer()",
        vars: [
          ["x", "10"],
          ["y", "20"],
        ],
        level: 1,
        active: false,
      },
      { name: "inner()", vars: [], level: 2, active: true },
    ],
    sym: "inner() called",
    detail:
      "inner() is called inside outer(). A new frame is pushed on top. Both outer and global scopes remain on the stack.",
  },
  {
    scopes: [
      {
        name: "global scope",
        vars: [
          ["PI", "3.14"],
          ["greeting", '"hello"'],
        ],
        level: 0,
        active: false,
      },
      {
        name: "outer()",
        vars: [
          ["x", "10"],
          ["y", "20"],
        ],
        level: 1,
        active: false,
      },
      {
        name: "inner()",
        vars: [
          ["x", "99"],
          ["z", "5"],
        ],
        level: 2,
        active: true,
      },
    ],
    sym: "x = 99 (shadow)",
    detail:
      "inner() declares its own x=99. This shadows outer's x=10 - inside inner(), x resolves to 99. outer's x is untouched.",
  },
  {
    scopes: [
      {
        name: "global scope",
        vars: [
          ["PI", "3.14"],
          ["greeting", '"hello"'],
        ],
        level: 0,
        active: false,
      },
      {
        name: "outer()",
        vars: [
          ["x", "10"],
          ["y", "20"],
        ],
        level: 1,
        active: true,
      },
    ],
    sym: "inner() returns",
    detail:
      "inner() returns. Its frame is popped and all its local variables are gone. outer's x=10 is in scope again.",
  },
  {
    scopes: [
      {
        name: "global scope",
        vars: [
          ["PI", "3.14"],
          ["greeting", '"hello"'],
        ],
        level: 0,
        active: true,
      },
    ],
    sym: "outer() returns",
    detail:
      "outer() returns. Its frame is popped. Only the global scope remains. x and y no longer exist.",
  },
];

function FunctionFramesViz() {
  const { idx, atEnd, stepBack, stepForward, togglePlay, replay, playing } =
    useStepThrough(SCOPE_STEPS.length);
  const cf = SCOPE_STEPS[idx];

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>
            what is a function frame
          </span>
          <p className={styles.stepDetail}>{cf.detail}</p>
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>playback</span>
          <PlaybackControls
            isPlaying={playing}
            atStart={idx === 0}
            atEnd={atEnd}
            onBack={stepBack}
            onPlay={togglePlay}
            onForward={stepForward}
          />
          <div className={styles.playbackMeta}>
            <span className={styles.stepCounter}>
              Step {idx + 1} / {SCOPE_STEPS.length}
            </span>
          </div>
          {atEnd && (
            <Button variant="pill" size="sm" onClick={replay}>
              replay
            </Button>
          )}
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>current operation</span>
          <div className={styles.csPanel}>
            <div className={styles.csPanelHeader}>
              <span className={styles.csPanelTitle}>{cf.sym}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.csRight}>
        <div className={styles.csPanel}>
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>scope chain</span>
          </div>
          <div
            className={styles.framesDemo}
            style={{ padding: "var(--sp-3) var(--sp-4)" }}
          >
            {cf.scopes.map((scope) => (
              <div
                key={scope.name}
                className={`${styles.demoFrame} ${scope.active ? styles.demoFrameActive : ""}`}
                style={{ marginLeft: scope.level * 24 }}
              >
                <div className={styles.demoFrameName}>{scope.name}</div>
                <div className={styles.demoFrameVars}>
                  {scope.vars.length === 0 && (
                    <span className={styles.stepMuted}>no variables yet</span>
                  )}
                  {scope.vars.map(([k, v]) => (
                    <div key={k} className={styles.frameVar}>
                      <span className={styles.varName}>{k}</span>
                      <span className={styles.varVal}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RefStep {
  pVars: { name: string; val: number; lit: boolean }[];
  rVars: { name: string; lit: boolean }[];
  heapAge: number | null;
  litHeap: boolean;
  activeSide: "prim" | "ref" | null;
  sym: string;
  detail: string;
}

const REF_STEPS: RefStep[] = [
  {
    pVars: [],
    rVars: [],
    heapAge: null,
    litHeap: false,
    activeSide: null,
    sym: "",
    detail:
      "Primitives (numbers, strings, booleans) are stored by value. Objects are stored by reference. Step through to see what that means.",
  },
  {
    pVars: [{ name: "a", val: 5, lit: true }],
    rVars: [],
    heapAge: null,
    litHeap: false,
    activeSide: "prim",
    sym: "let a = 5",
    detail: "a is a number. Its value (5) is stored directly in the variable.",
  },
  {
    pVars: [
      { name: "a", val: 5, lit: false },
      { name: "b", val: 5, lit: true },
    ],
    rVars: [],
    heapAge: null,
    litHeap: false,
    activeSide: "prim",
    sym: "let b = a",
    detail:
      "b = a copies the value. b gets its own independent copy of 5. a and b are separate.",
  },
  {
    pVars: [
      { name: "a", val: 5, lit: false },
      { name: "b", val: 10, lit: true },
    ],
    rVars: [],
    heapAge: null,
    litHeap: false,
    activeSide: "prim",
    sym: "b = 10",
    detail:
      "b is changed to 10. a is still 5. They are completely independent - changing b never affects a.",
  },
  {
    pVars: [
      { name: "a", val: 5, lit: false },
      { name: "b", val: 10, lit: false },
    ],
    rVars: [{ name: "p", lit: true }],
    heapAge: 25,
    litHeap: true,
    activeSide: "ref",
    sym: "let p = { age: 25 }",
    detail:
      "An object is created on the heap. p holds a reference - a pointer to the object, not the object itself.",
  },
  {
    pVars: [
      { name: "a", val: 5, lit: false },
      { name: "b", val: 10, lit: false },
    ],
    rVars: [
      { name: "p", lit: false },
      { name: "q", lit: true },
    ],
    heapAge: 25,
    litHeap: false,
    activeSide: "ref",
    sym: "let q = p",
    detail:
      "q = p copies the reference, not the object. Both p and q now point to the same heap object.",
  },
  {
    pVars: [
      { name: "a", val: 5, lit: false },
      { name: "b", val: 10, lit: false },
    ],
    rVars: [
      { name: "p", lit: true },
      { name: "q", lit: true },
    ],
    heapAge: 30,
    litHeap: true,
    activeSide: "ref",
    sym: "q.age = 30",
    detail:
      "Mutating through q changes the shared heap object. p.age is now also 30 - both variables see the same change.",
  },
];

function ReferencesViz() {
  const { idx, atEnd, stepBack, stepForward, togglePlay, replay, playing } =
    useStepThrough(REF_STEPS.length);
  const cf = REF_STEPS[idx];

  return (
    <div className={styles.csLayout}>
      <div className={styles.csLeft}>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>value vs reference</span>
          <p className={styles.stepDetail}>{cf.detail}</p>
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>playback</span>
          <PlaybackControls
            isPlaying={playing}
            atStart={idx === 0}
            atEnd={atEnd}
            onBack={stepBack}
            onPlay={togglePlay}
            onForward={stepForward}
          />
          <div className={styles.playbackMeta}>
            <span className={styles.stepCounter}>
              Step {idx + 1} / {REF_STEPS.length}
            </span>
          </div>
          {atEnd && (
            <Button variant="pill" size="sm" onClick={replay}>
              replay
            </Button>
          )}
        </div>
        <div className={styles.csSection}>
          <span className={styles.csSectionLabel}>current operation</span>
          <div className={styles.csPanel}>
            <div className={styles.csPanelHeader}>
              <span className={styles.csPanelTitle}>{cf.sym || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.csRight}>
        {/* Primitive side */}
        <div
          className={`${styles.csPanel} ${cf.activeSide === "prim" ? styles.csPanelActive : ""}`}
        >
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>primitive - by value</span>
          </div>
          <div
            style={{
              padding: "var(--sp-3) var(--sp-4)",
              display: "flex",
              gap: "var(--sp-3)",
              flexWrap: "wrap",
              alignItems: "center",
              minHeight: 64,
            }}
          >
            {cf.pVars.length === 0 && (
              <span className={styles.stepMuted}>-</span>
            )}
            {cf.pVars.map((v) => (
              <div key={v.name} className={styles.refBox}>
                <span className={styles.refBoxLabel}>{v.name}</span>
                <span className={v.lit ? styles.cellLit2 : styles.cellIdle2}>
                  {v.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reference side */}
        <div
          className={`${styles.csPanel} ${cf.activeSide === "ref" ? styles.csPanelActive : ""}`}
        >
          <div className={styles.csPanelHeader}>
            <span className={styles.csPanelTitle}>object - by reference</span>
          </div>
          <div
            style={{
              padding: "var(--sp-3) var(--sp-4)",
              display: "flex",
              gap: "var(--sp-3)",
              flexWrap: "wrap",
              alignItems: "center",
              minHeight: 64,
            }}
          >
            {cf.rVars.length === 0 && (
              <span className={styles.stepMuted}>-</span>
            )}
            {cf.rVars.map((v) => (
              <div key={v.name} className={styles.refBox}>
                <span className={styles.refBoxLabel}>{v.name}</span>
                <span
                  className={`${styles.refPtr} ${v.lit ? styles.refPtrLit : ""}`}
                >
                  →
                </span>
              </div>
            ))}
            {cf.heapAge !== null && (
              <div
                className={`${styles.refBox} ${styles.refHeapBox} ${cf.litHeap ? styles.refHeapBoxLit : ""}`}
              >
                <span className={styles.refBoxLabel}>heap</span>
                <span
                  className={cf.litHeap ? styles.cellLit2 : styles.cellIdle2}
                >
                  age: {cf.heapAge}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MEMORY_USE_WHEN: Record<string, string> = {
  callstack:
    "you want to see exactly how function calls grow and shrink the stack, and how recursion unwinds.",
  heap: "you want to understand how objects are allocated dynamically outside the call stack.",
  frames:
    "you want to see how nested calls create isolated scopes and why closures retain outer variables.",
  references:
    "you want to understand why objects can be mutated by a caller while primitives cannot.",
};

export default function MemoryPage() {
  const [view, setView] = useState("callstack");
  const handleChange = useCallback((id: string) => setView(id), []);

  return (
    <div className={styles.page}>
      <AlgorithmTabs tabs={MEMORY_TABS} active={view} onChange={handleChange} />
      <div className={styles.scene}>
        {view === "callstack" && <CallStackViz />}
        {view === "heap" && <HeapViz />}
        {view === "frames" && <FunctionFramesViz />}
        {view === "references" && <ReferencesViz />}
      </div>

      <UseMeWhen content={MEMORY_USE_WHEN[view]} />
    </div>
  );
}
