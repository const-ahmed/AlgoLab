import styles from './AlgorithmTabs.module.css'

interface Tab {
  id: string
  label: string
}

interface AlgorithmTabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export default function AlgorithmTabs({ tabs, active, onChange }: AlgorithmTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Algorithm selection">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          role="tab"
          aria-selected={active === id}
          className={`${styles.tab} ${active === id ? styles.tabActive : ''}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
