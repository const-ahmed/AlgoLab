import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import SortingPage from './modules/sorting/SortingPage'
import SearchingPage from './modules/searching/SearchingPage'
import TreeTraversalPage from './modules/trees/TreeTraversalPage'
import StructuresPage from './modules/structures/StructuresPage'
import MemoryPage from './modules/memory/MemoryPage'
import SchedulingPage from './modules/scheduling/SchedulingPage'

export default function App() {
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
