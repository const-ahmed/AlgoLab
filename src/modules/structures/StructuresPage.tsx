import { useState, useCallback } from "react";
import Button from "../../components/ui/Button";
import AlgorithmTabs from "../../components/ui/AlgorithmTabs";
import UseMeWhen from "../../components/ui/UseMeWhen";
import styles from "./StructuresPage.module.css";

const STRUCTURE_TABS = [
  { id: "array", label: "Array" },
  { id: "stack", label: "Stack" },
  { id: "queue", label: "Queue" },
  { id: "linkedlist", label: "Linked List" },
  { id: "tree", label: "Tree" },
  { id: "hashtable", label: "Hash Table" },
];

function ArrayViz() {
  const [arr, setArr] = useState([4, 2, 7, 1, 9, 3]);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [highlightKind, setHighlightKind] = useState<
    "access" | "set" | "insert"
  >("access");
  const [inputIdx, setInputIdx] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [msg, setMsg] = useState("Click an element to access it by index.");
  const [err, setErr] = useState(false);

  function ok(text: string) {
    setErr(false);
    setMsg(text);
  }
  function fail(text: string) {
    setErr(true);
    setMsg(text);
    setTimeout(() => setErr(false), 2000);
  }

  function flash(i: number, kind: "access" | "set" | "insert") {
    setHighlight(i);
    setHighlightKind(kind);
    setTimeout(() => setHighlight(null), 1200);
  }

  function access(i: number) {
    flash(i, "access");
    ok(`arr[${i}] = ${arr[i]} - O(1) random access`);
  }

  function runSet() {
    const i = parseInt(inputIdx);
    const v = parseInt(inputVal);
    if (!inputIdx.trim() || !inputVal.trim()) {
      fail("Enter both an index and a value.");
      return;
    }
    if (isNaN(i) || isNaN(v) || i < 0 || i >= arr.length) {
      fail(`Index must be 0 – ${arr.length - 1}.`);
      return;
    }
    setArr((a) => {
      const n = [...a];
      n[i] = v;
      return n;
    });
    flash(i, "set");
    ok(`arr[${i}] = ${v} - O(1) direct write`);
    setInputIdx("");
    setInputVal("");
  }

  function runInsert() {
    const i = parseInt(inputIdx);
    const v = parseInt(inputVal);
    if (!inputIdx.trim() || !inputVal.trim()) {
      fail("Enter both an index and a value.");
      return;
    }
    if (isNaN(i) || isNaN(v) || i < 0 || i > arr.length) {
      fail(`Index must be 0 – ${arr.length}.`);
      return;
    }
    setArr((a) => [...a.slice(0, i), v, ...a.slice(i)]);
    flash(i, "insert");
    ok(`Inserted ${v} at index ${i} - elements shifted right - O(n)`);
    setInputIdx("");
    setInputVal("");
  }

  function append() {
    const v = Math.ceil(Math.random() * 9);
    setArr((a) => [...a, v]);
    flash(arr.length, "insert");
    ok(`append(${v}) - added to end - O(1) amortised`);
  }

  function pop() {
    if (arr.length === 0) return;
    const v = arr[arr.length - 1];
    setArr((a) => a.slice(0, -1));
    ok(`pop()  →  ${v} - removed from end - O(1)`);
  }

  const cellClass = (i: number) => {
    if (highlight !== i) return styles.cellIdle;
    if (highlightKind === "set") return styles.cellFound;
    if (highlightKind === "insert") return styles.cellLit;
    return styles.cellLit;
  };

  return (
    <div className={styles.vizWrap}>
      <p className={`${styles.msg} ${err ? styles.msgErr : ""}`}>{msg}</p>
      <div className={styles.arrayRow}>
        {arr.map((v, i) => (
          <div key={i} className={styles.cellWrap}>
            <button
              className={`${styles.cell} ${cellClass(i)}`}
              onClick={() => access(i)}
              aria-label={`arr[${i}] = ${v}`}
            >
              {v}
            </button>
            <span className={styles.cellIdx}>{i}</span>
          </div>
        ))}
      </div>
      <div className={styles.htInputRow}>
        <input
          className={styles.htInput}
          placeholder="index"
          value={inputIdx}
          onChange={(e) => setInputIdx(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSet()}
          type="number"
          min={0}
          max={arr.length}
          style={{ width: 72 }}
        />
        <input
          className={styles.htInput}
          placeholder="value"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSet()}
          type="number"
          style={{ width: 72 }}
        />
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={append} disabled={arr.length >= 9}>
          append
        </Button>
        <Button size="sm" onClick={pop} disabled={arr.length === 0}>
          pop
        </Button>
        <Button size="sm" onClick={runSet} disabled={arr.length === 0}>
          set
        </Button>
        <Button size="sm" onClick={runInsert} disabled={arr.length >= 9}>
          insert
        </Button>
      </div>
    </div>
  );
}

function StackViz() {
  const [stack, setStack] = useState([3, 1, 7, 2]);
  const [topFlash, setTopFlash] = useState(false);
  const [msg, setMsg] = useState("A stack is LIFO - last in, first out.");

  function push() {
    const v = Math.ceil(Math.random() * 9);
    setStack((s) => [...s, v]);
    setMsg(`Pushed ${v} onto the stack. O(1).`);
  }
  function pop() {
    if (stack.length === 0) return;
    const v = stack[stack.length - 1];
    setStack((s) => s.slice(0, -1));
    setMsg(`Popped ${v} from the top. O(1).`);
  }
  function peek() {
    if (stack.length === 0) return;
    setTopFlash(true);
    setMsg(`Top element: ${stack[stack.length - 1]}. O(1).`);
    setTimeout(() => setTopFlash(false), 1000);
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.stackCol}>
        {stack.length === 0 && <div className={styles.empty}>empty</div>}
        {[...stack].reverse().map((v, ri) => {
          const isTop = ri === 0;
          return (
            <div
              key={stack.length - 1 - ri}
              className={`${styles.stackItem} ${isTop && topFlash ? styles.cellLit : styles.cellIdle}`}
            >
              {v}
              {isTop && <span className={styles.pointer}>← top</span>}
            </div>
          );
        })}
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={push} disabled={stack.length >= 8}>
          push
        </Button>
        <Button size="sm" onClick={pop} disabled={stack.length === 0}>
          pop
        </Button>
        <Button size="sm" onClick={peek} disabled={stack.length === 0}>
          peek
        </Button>
      </div>
    </div>
  );
}

function QueueViz() {
  const [queue, setQueue] = useState([5, 8, 2, 6]);
  const [flashFront, setFlashFront] = useState(false);
  const [msg, setMsg] = useState("A queue is FIFO - first in, first out.");

  function enqueue() {
    const v = Math.ceil(Math.random() * 9);
    setQueue((q) => [...q, v]);
    setMsg(`Enqueued ${v} at the rear. O(1).`);
  }
  function dequeue() {
    if (queue.length === 0) return;
    const v = queue[0];
    setFlashFront(true);
    setTimeout(() => {
      setQueue((q) => q.slice(1));
      setFlashFront(false);
    }, 300);
    setMsg(`Dequeued ${v} from the front. O(1).`);
  }
  function peekFront() {
    if (queue.length === 0) return;
    setFlashFront(true);
    setMsg(`Front element: ${queue[0]}. O(1).`);
    setTimeout(() => setFlashFront(false), 1000);
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.queueRow}>
        {queue.length === 0 && <div className={styles.empty}>empty</div>}
        {queue.map((v, i) => (
          <div key={i} className={styles.cellWrap}>
            <div
              className={`${styles.cell} ${i === 0 && flashFront ? styles.cellLit : styles.cellIdle}`}
            >
              {v}
            </div>
            {i === 0 && <span className={styles.queueLabel}>front</span>}
            {i === queue.length - 1 && queue.length > 1 && (
              <span className={styles.queueLabel}>rear</span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={enqueue} disabled={queue.length >= 8}>
          enqueue
        </Button>
        <Button size="sm" onClick={dequeue} disabled={queue.length === 0}>
          dequeue
        </Button>
        <Button size="sm" onClick={peekFront} disabled={queue.length === 0}>
          peek
        </Button>
      </div>
    </div>
  );
}

function LinkedListViz() {
  const [list, setList] = useState([3, 1, 7, 2]);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [traversing, setTraversing] = useState(false);
  const [msg, setMsg] = useState(
    "Nodes are linked by pointers - no random access.",
  );

  function insert() {
    const v = Math.ceil(Math.random() * 9);
    setList((l) => [v, ...l]);
    setHighlight(0);
    setMsg(`insert(${v}) - prepended at head - O(1)`);
    setTimeout(() => setHighlight(null), 1200);
  }

  function del() {
    if (list.length === 0) return;
    const v = list[0];
    setList((l) => l.slice(1));
    setMsg(`delete() - removed head (${v}) - O(1)`);
  }

  function traverse() {
    if (list.length === 0 || traversing) return;
    setTraversing(true);
    let i = 0;
    setMsg(`traverse() - visiting node 0: ${list[0]}`);
    setHighlight(0);
    const iv = setInterval(() => {
      i++;
      if (i >= list.length) {
        clearInterval(iv);
        setHighlight(null);
        setTraversing(false);
        setMsg(`traverse() - visited all ${list.length} nodes - O(n)`);
        return;
      }
      setHighlight(i);
      setMsg(`traverse() - visiting node ${i}: ${list[i]}`);
    }, 500);
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.linkedRow}>
        <span className={styles.headPtr}>head</span>
        {list.length === 0 && <span className={styles.nullPtr}>→ null</span>}
        {list.map((v, i) => (
          <div key={i} className={styles.llNode}>
            <div
              className={`${styles.llCell} ${highlight === i ? styles.cellLit : styles.cellIdle}`}
            >
              {v}
            </div>
            <span className={styles.nextPtr}>
              {i === list.length - 1 ? "→ null" : "→"}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.opRow}>
        <Button
          size="sm"
          onClick={insert}
          disabled={list.length >= 8 || traversing}
        >
          insert
        </Button>
        <Button
          size="sm"
          onClick={del}
          disabled={list.length === 0 || traversing}
        >
          delete
        </Button>
        <Button
          size="sm"
          onClick={traverse}
          disabled={list.length === 0 || traversing}
        >
          traverse
        </Button>
      </div>
    </div>
  );
}

interface BSTNode {
  val: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

function bstInsert(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) return { ...root, left: bstInsert(root.left, val) };
  if (val > root.val) return { ...root, right: bstInsert(root.right, val) };
  return root;
}

function buildBST(vals: number[]): BSTNode | null {
  return vals.reduce<BSTNode | null>((root, v) => bstInsert(root, v), null);
}

interface NodePos {
  val: number;
  x: number;
  y: number;
  id: string;
}
interface EdgePos {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  id: string;
}

function layoutBST(
  root: BSTNode | null,
  x: number,
  y: number,
  gap: number,
  result: { nodes: NodePos[]; edges: EdgePos[] },
  parentX?: number,
  parentY?: number,
  id = "0",
) {
  if (!root) return;
  result.nodes.push({ val: root.val, x, y, id });
  if (parentX !== undefined && parentY !== undefined) {
    result.edges.push({ x1: parentX, y1: parentY, x2: x, y2: y, id: `e${id}` });
  }
  layoutBST(root.left, x - gap, y + 70, gap / 1.8, result, x, y, id + "l");
  layoutBST(root.right, x + gap, y + 70, gap / 1.8, result, x, y, id + "r");
}

function BSTViz() {
  const [values, setValues] = useState([5, 3, 7, 1, 4, 6, 8]);
  const [searchPath, setSearchPath] = useState<number[]>([]);
  const [foundVal, setFoundVal] = useState<number | null>(null);
  const [msg, setMsg] = useState("A BST: left subtree < node < right subtree.");

  const root = buildBST(values);
  const layout: { nodes: NodePos[]; edges: EdgePos[] } = {
    nodes: [],
    edges: [],
  };
  layoutBST(root, 220, 28, 110, layout);

  const W = 440,
    H = Math.max(...layout.nodes.map((n) => n.y)) + 60 || 80;
  const R = 22;

  function insert() {
    const v = Math.ceil(Math.random() * 9);
    if (values.includes(v)) {
      setMsg(`${v} already in tree.`);
      return;
    }
    setValues((vs) => [...vs, v]);
    setMsg(
      `Inserted ${v}. Compared values from root to find the correct leaf position.`,
    );
  }

  function search() {
    const target = values[Math.floor(Math.random() * values.length)];
    const path: number[] = [];
    let node = root;
    while (node) {
      path.push(node.val);
      if (node.val === target) break;
      node = target < node.val ? node.left : node.right;
    }
    setSearchPath(path);
    setFoundVal(target);
    setMsg(
      `Searching for ${target}. Path: ${path.join(" → ")}. O(log n) average.`,
    );
    setTimeout(
      () => {
        setSearchPath([]);
        setFoundVal(null);
      },
      path.length * 500 + 800,
    );
  }

  return (
    <div className={styles.vizWrap}>
      <p className={styles.msg}>{msg}</p>
      <div className={styles.treeContainer} style={{ width: W, height: H }}>
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            pointerEvents: "none",
          }}
        >
          {layout.edges.map((e) => (
            <line
              key={e.id}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="rgba(255,245,228,0.50)"
              strokeWidth={1.5}
            />
          ))}
        </svg>
        {layout.nodes.map((n) => {
          const inPath = searchPath.includes(n.val);
          const isFound = foundVal === n.val && inPath;
          return (
            <div
              key={n.id}
              className={`${styles.treeNode} ${isFound ? styles.cellFound : inPath ? styles.cellLit : styles.cellIdle}`}
              style={{
                left: n.x - R,
                top: n.y - R,
                width: R * 2,
                height: R * 2,
              }}
            >
              {n.val}
            </div>
          );
        })}
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={insert} disabled={values.length >= 10}>
          insert
        </Button>
        <Button size="sm" onClick={search}>
          search
        </Button>
      </div>
    </div>
  );
}

const HT_BUCKETS = 7;

function htHash(key: string): number {
  return key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

const HT_PAIRS: [string, string][] = [
  ["name", "Ahmed"],
  ["city", "Dubai"],
  ["lang", "TypeScript"],
  ["role", "Engineer"],
  ["team", "Frontend"],
  ["age", "28"],
  ["country", "UAE"],
  ["editor", "VS Code"],
];

interface HTEntry {
  key: string;
  val: string;
}
type HTable = HTEntry[][];
type HTPhase = "idle" | "key" | "hash" | "mod" | "store";

const IDLE_MSG =
  "A hash table maps keys to values using a hash function to find the right bucket in O(1).";

function HashTableViz() {
  const [table, setTable] = useState<HTable>(() =>
    Array.from({ length: HT_BUCKETS }, () => []),
  );
  const [pairIdx, setPairIdx] = useState(0);
  const [phase, setPhase] = useState<HTPhase>("idle");
  const [activeKey, setActiveKey] = useState<string>("");
  const [activeVal, setActiveVal] = useState<string>("");
  const [rawHash, setRawHash] = useState<number | null>(null);
  const [bucket, setBucket] = useState<number | null>(null);
  const [litKey, setLitKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [msg, setMsg] = useState(IDLE_MSG);

  function animate(key: string, val: string, currentTable: HTable) {
    const h = htHash(key);
    const b = h % HT_BUCKETS;

    setActiveKey(key);
    setActiveVal(val);
    setRawHash(h);
    setBucket(b);
    setPhase("key");
    setMsg(`Key: "${key}"`);

    setTimeout(() => {
      setPhase("hash");
      setMsg(`hash("${key}") = ${h}  (sum of char codes)`);
    }, 700);
    setTimeout(() => {
      setPhase("mod");
      setMsg(`${h} % ${HT_BUCKETS} = ${b}  →  bucket ${b}`);
    }, 1500);
    setTimeout(() => {
      setPhase("store");
      const collision =
        currentTable[b].length > 0 &&
        !currentTable[b].some((e) => e.key === key);
      setMsg(
        collision
          ? `Bucket ${b} occupied - append to chain. O(1).`
          : `Store "${key}" → "${val}" at bucket ${b}.`,
      );
      setTable((t) => {
        const n = t.map((c) => [...c]);
        const ei = n[b].findIndex((e) => e.key === key);
        if (ei >= 0) n[b][ei] = { key, val };
        else n[b] = [...n[b], { key, val }];
        return n;
      });
    }, 2300);

    setTimeout(() => {
      setPhase("idle");
      setActiveKey("");
      setActiveVal("");
      setRawHash(null);
      setBucket(null);
      setMsg(IDLE_MSG);
    }, 3600);
  }

  function runInsert() {
    if (phase !== "idle") return;
    const key = inputKey.trim();
    const val = inputVal.trim();
    if (key && val) {
      setInputKey("");
      setInputVal("");
      animate(key, val, table);
    } else {
      const [pk, pv] = HT_PAIRS[pairIdx % HT_PAIRS.length];
      setPairIdx((i) => i + 1);
      animate(pk, pv, table);
    }
  }

  function runLookup() {
    if (phase !== "idle") return;
    const all = table.flatMap((c) => c.map((e) => e.key));
    if (!all.length) {
      setMsg("Table is empty.");
      return;
    }
    const key = all[Math.floor(Math.random() * all.length)];
    const h = htHash(key);
    const b = h % HT_BUCKETS;

    setActiveKey(key);
    setRawHash(h);
    setBucket(b);
    setPhase("key");
    setMsg(`lookup: "${key}"`);
    setTimeout(() => {
      setPhase("hash");
      setMsg(`hash("${key}") = ${h}`);
    }, 700);
    setTimeout(() => {
      setPhase("mod");
      setMsg(`${h} % ${HT_BUCKETS} = ${b}  →  check bucket ${b}`);
    }, 1500);
    setTimeout(() => {
      setPhase("store");
      setLitKey(key);
      setMsg(`Found "${key}" in bucket ${b}. O(1).`);
    }, 2300);
    setTimeout(() => {
      setPhase("idle");
      setActiveKey("");
      setRawHash(null);
      setBucket(null);
      setLitKey(null);
      setMsg(IDLE_MSG);
    }, 3600);
  }

  function runDelete() {
    if (phase !== "idle") return;
    const all = table.flatMap((c) => c.map((e) => e.key));
    if (!all.length) {
      setMsg("Table is empty.");
      return;
    }
    const key = all[Math.floor(Math.random() * all.length)];
    const h = htHash(key);
    const b = h % HT_BUCKETS;

    setActiveKey(key);
    setRawHash(h);
    setBucket(b);
    setPhase("key");
    setMsg(`Delete: "${key}"`);
    setTimeout(() => {
      setPhase("hash");
      setMsg(`hash("${key}") = ${h}`);
    }, 700);
    setTimeout(() => {
      setPhase("mod");
      setMsg(`${h} % ${HT_BUCKETS} = ${b}  →  bucket ${b}`);
    }, 1500);
    setTimeout(() => {
      setPhase("store");
      setLitKey(key);
      setMsg(`Removed "${key}" from bucket ${b}.`);
      setTable((t) => {
        const n = t.map((c) => [...c]);
        n[b] = n[b].filter((e) => e.key !== key);
        return n;
      });
    }, 2300);
    setTimeout(() => {
      setPhase("idle");
      setActiveKey("");
      setRawHash(null);
      setBucket(null);
      setLitKey(null);
      setMsg(
        "A hash table maps keys to values using a hash function to find the right bucket in O(1).",
      );
    }, 3600);
  }

  const busy = phase !== "idle";

  return (
    <div className={styles.vizWrap}>
      <div className={styles.htPipeline}>
        <div
          className={`${styles.htStep} ${phase === "key" || phase === "hash" || phase === "mod" || phase === "store" ? styles.htStepLit : ""}`}
        >
          <span className={styles.htStepLabel}>key</span>
          <span className={styles.htStepValue}>
            {activeKey ? `"${activeKey}"` : "-"}
          </span>
        </div>
        <span className={styles.htArrow}>→</span>
        <div
          className={`${styles.htStep} ${styles.htStepFn} ${phase === "hash" || phase === "mod" || phase === "store" ? styles.htStepLit : ""}`}
        >
          <span className={styles.htStepLabel}>hash(key)</span>
          <span className={styles.htStepValue}>
            {rawHash !== null ? rawHash : "-"}
          </span>
        </div>
        <span className={styles.htArrow}>→</span>
        <div
          className={`${styles.htStep} ${phase === "mod" || phase === "store" ? styles.htStepLit : ""}`}
        >
          <span className={styles.htStepLabel}>% {HT_BUCKETS}</span>
          <span className={styles.htStepValue}>
            {bucket !== null ? bucket : "-"}
          </span>
        </div>
        <span className={styles.htArrow}>→</span>
        <div
          className={`${styles.htStep} ${phase === "store" ? styles.htStepActive : ""}`}
        >
          <span className={styles.htStepLabel}>store</span>
          <span className={styles.htStepValue}>
            {activeKey && activeVal ? `"${activeKey}":"${activeVal}"` : bucket !== null ? bucket : "-"}
          </span>
        </div>
      </div>

      <p className={styles.msg}>{msg}</p>

      <div className={styles.hashTable}>
        {table.map((chain, idx) => (
          <div
            key={idx}
            className={`${styles.hashRow} ${bucket === idx && busy ? styles.hashRowLit : ""}`}
          >
            <div className={styles.hashIdx}>{idx}</div>
            <div className={styles.hashChain}>
              {chain.length === 0 ? (
                <span className={styles.hashNull}>-</span>
              ) : (
                chain.map((entry, ci) => (
                  <div key={ci} className={styles.hashEntryGroup}>
                    {ci > 0 && <span className={styles.hashPtr}>→</span>}
                    <div
                      className={`${styles.hashEntry} ${litKey === entry.key || (phase === "store" && bucket === idx && activeKey === entry.key) ? styles.cellLit : styles.cellIdle}`}
                    >
                      <span className={styles.hashKey}>"{entry.key}"</span>
                      <span className={styles.hashSep}>:</span>
                      <span className={styles.hashVal}>"{entry.val}"</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <p className={styles.hint}>
        hash(key) = Σ char codes - index = hash % {HT_BUCKETS} - chaining for
        collisions
      </p>
      <div className={styles.htInputRow}>
        <input
          className={styles.htInput}
          placeholder="key"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runInsert()}
          disabled={busy}
          maxLength={16}
        />
        <span className={styles.htInputSep}>:</span>
        <input
          className={styles.htInput}
          placeholder="value"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runInsert()}
          disabled={busy}
          maxLength={16}
        />
      </div>
      <div className={styles.opRow}>
        <Button size="sm" onClick={runInsert} disabled={busy}>
          {inputKey.trim() && inputVal.trim() ? "insert" : "insert preset"}
        </Button>
        <Button
          size="sm"
          onClick={runLookup}
          disabled={busy || table.every((c) => c.length === 0)}
        >
          lookup
        </Button>
        <Button
          size="sm"
          onClick={runDelete}
          disabled={busy || table.every((c) => c.length === 0)}
        >
          delete
        </Button>
      </div>
    </div>
  );
}

const DEFINITIONS: Record<
  string,
  { desc: string; ops: string[]; when: string }
> = {
  array: {
    desc: "An ordered structure where each item has a position, making it easy to access items by index.",
    ops: ["access", "set", "append", "pop", "insert"],
    when: "...you need to keep items in order and reach any item quickly by its position.",
  },
  stack: {
    desc: "A structure where the last item added is the first item removed.",
    ops: ["push", "pop", "peek"],
    when: "...you need the most recently added item to be the next one handled.",
  },
  queue: {
    desc: "A structure where the first item added is the first item removed.",
    ops: ["enqueue", "dequeue", "peek"],
    when: "...you need items to be handled in the same order they were added.",
  },
  linkedlist: {
    desc: "A structure made of connected nodes, where each node points to the next one.",
    ops: ["insert", "delete", "traverse"],
    when: "...you need to add or remove items by changing links, and quick position-based access does not matter.",
  },
  tree: {
    desc: "A branching structure of connected nodes with parent-child relationships.",
    ops: ["insert", "delete", "traverse", "search"],
    when: "...your data belongs in a hierarchy, with items connected through parent-child relationships.",
  },
  hashtable: {
    desc: "A structure that stores values using keys, so they can be inserted, found, updated, or removed quickly.",
    ops: ["insert", "lookup", "delete", "update"],
    when: "...you need to find, add, update, or remove data quickly using a key.",
  },
};

export default function StructuresPage() {
  const [structure, setStructure] = useState("array");

  const handleTabChange = useCallback((id: string) => setStructure(id), []);

  const def = DEFINITIONS[structure];

  return (
    <div className={styles.page}>
      <AlgorithmTabs
        tabs={STRUCTURE_TABS}
        active={structure}
        onChange={handleTabChange}
      />

      <div className={styles.scene}>
        {structure === "array" && <ArrayViz />}
        {structure === "stack" && <StackViz />}
        {structure === "queue" && <QueueViz />}
        {structure === "linkedlist" && <LinkedListViz />}
        {structure === "tree" && <BSTViz />}
        {structure === "hashtable" && <HashTableViz />}
      </div>

      {def && <UseMeWhen content={def.when.replace(/^\.\.\./, "")} />}
    </div>
  );
}
