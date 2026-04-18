# AlgoLab

An interactive algorithm and data structure visualiser built to make CS fundamentals easier to understand. Each topic is broken into step-by-step animations you can play, pause, and scrub through at your own pace.

Live at [algolab.co.uk](https://algolab.co.uk)

---

## What it covers

- **Sorting** — Bubble, Selection, Insertion, Merge, Quick
- **Searching** — Linear, Binary
- **Data Structures** — Array, Stack, Queue, Linked List, BST, Hash Table
- **Tree Traversal** — Inorder, Preorder, Postorder, Level Order
- **Graph Traversal** — BFS, DFS
- **CPU Scheduling** — FCFS, SJF, Round Robin, Priority
- **Memory** — Call Stack, Heap, Function Frames, Value vs Reference

---

## Tech

- React 19, TypeScript, Vite
- React Router v7 (client-side routing)
- CSS Modules with a shared design token system
- Deployed on Vercel with continuous deployment from `main`

---

## Running locally

```bash
npm install
npm run dev
```

Build and type-check:

```bash
npm run build
```

---

## Project structure

```
src/
  hooks/          shared hooks (usePlayback)
  components/     reusable UI components
  modules/        one folder per topic, self-contained
```

Each module owns its own engine (frame computation), visualiser components, and styles. The `usePlayback` hook handles all playback state so each viz stays focused on its own logic.
