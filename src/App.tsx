import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import SortingPage from './modules/sorting/SortingPage'
import SearchingPage from './modules/searching/SearchingPage'
import TreeTraversalPage from './modules/trees/TreeTraversalPage'
import StructuresPage from './modules/structures/StructuresPage'
import MemoryPage from './modules/memory/MemoryPage'
import SchedulingPage from './modules/scheduling/SchedulingPage'

const MIN_WIDTH = 768

function useViewport() {
  const [state, setState] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handler = () => setState({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    return () => { window.removeEventListener('resize', handler); window.removeEventListener('orientationchange', handler) }
  }, [])
  return state
}

const blockStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: '12px',
  background: 'linear-gradient(135deg, #D2D9D8, #BF9B7A)',
  fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
  color: 'rgba(30,13,4,0.9)', textAlign: 'center', padding: '2rem',
}

export default function App() {
  const { width, height } = useViewport()
  const portrait = height > width

  if (width < MIN_WIDTH) return (
    <div style={blockStyle}>
      <span style={{ fontSize: '2.5rem' }}>📱</span>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Please use a larger device</p>
      <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>AlgoLab is designed for desktop screens</p>
    </div>
  )

  if (portrait) return (
    <div style={blockStyle}>
      <span style={{ fontSize: '2.5rem' }}>🔄</span>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Rotate to landscape</p>
      <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>AlgoLab works best in landscape orientation</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/sorting" replace />} />
          <Route path="sorting"    element={<SortingPage />} />
          <Route path="searching"  element={<SearchingPage />} />
          <Route path="trees"      element={<TreeTraversalPage />} />
          <Route path="structures" element={<StructuresPage />} />
          <Route path="memory"     element={<MemoryPage />} />
          <Route path="scheduling" element={<SchedulingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
