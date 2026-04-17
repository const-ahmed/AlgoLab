import type { SearchCellState } from './engine'
import styles from './SearchCell.module.css'

export const CELL_SIZE = 56
export const CELL_STRIDE = 66

interface SearchCellProps {
  value: number
  index: number
  state: SearchCellState
  showIndex?: boolean
}

export default function SearchCell({ value, index, state, showIndex = true }: SearchCellProps) {
  return (
    <div className={styles.wrap} style={{ animationDelay: '40ms' }}>
      <div className={`${styles.cell} ${styles[state]}`}>
        {value}
      </div>
      {showIndex && <span className={styles.idx}>{index}</span>}
    </div>
  )
}
