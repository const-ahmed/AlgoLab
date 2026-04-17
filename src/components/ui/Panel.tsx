import type { HTMLAttributes } from 'react'
import type { ElementType } from 'react'
import styles from './Panel.module.css'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType
}

export default function Panel({ as: Tag = 'div', className = '', children, ...props }: PanelProps) {
  const El = Tag as 'div'
  return (
    <El className={[styles.panel, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </El>
  )
}
