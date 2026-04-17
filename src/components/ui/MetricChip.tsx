import styles from './MetricChip.module.css'

interface MetricChipProps {
  label: string
  value: string | number
}

export default function MetricChip({ label, value }: MetricChipProps) {
  return (
    <div className={styles.chip}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
