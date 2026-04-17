import { NavLink, Outlet } from 'react-router-dom'
import styles from './AppShell.module.css'

const NAV_ITEMS = [
  { path: '/sorting',    label: 'Sorting' },
  { path: '/searching',  label: 'Searching' },
  { path: '/trees',      label: 'Tree Traversal' },
  { path: '/structures', label: 'Data Structures' },
  { path: '/memory',     label: 'Memory Model' },
  { path: '/scheduling', label: 'Scheduling' },
]

export default function AppShell() {
  return (
    <div className={styles.shell}>
      <header className={styles.header} aria-label="Modules">
        <span className={styles.wordmark}>algolab</span>
        <nav>
          <ul className={styles.navList} role="list">
            {NAV_ITEMS.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Ahmed Hassan</span>
        <span>-</span>
        <span>All rights reserved</span>
      </footer>
    </div>
  )
}
