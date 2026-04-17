import styles from './ExplanationPanel.module.css'

interface ExplanationPanelProps {
  status: string
  detail?: string
}

export default function ExplanationPanel({ status, detail }: ExplanationPanelProps) {
  return (
    <div className={styles.root} aria-live="polite" aria-atomic="true">
      {status && <p className={styles.status}>{status}</p>}
      {detail && <p className={styles.detail}>{detail}</p>}
    </div>
  )
}
