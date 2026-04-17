import styles from './UseMeWhen.module.css'

interface UseMeWhenProps {
  content: string
}

export default function UseMeWhen({ content }: UseMeWhenProps) {
  return (
    <aside className={styles.box}>
      <span className={styles.title}>Use me when...</span>
      <p className={styles.body}>{content}</p>
    </aside>
  )
}
