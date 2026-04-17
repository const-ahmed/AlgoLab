import type { CellState } from "./engine";
import styles from "./SortCell.module.css";

export const CELL_SIZE = 60;
export const CELL_STRIDE = 70;
export const SWAP_DURATION = 260;

interface SortCellProps {
  value: number;
  position: number;
  state: CellState;
  left: number;
  onEdit: (pos: number) => void;
}

export default function SortCell({
  value,
  position,
  state,
  left,
  onEdit,
}: SortCellProps) {
  return (
    <div
      className={`${styles.cell} ${styles[state]}`}
      style={{
        left: `${left}px`,
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        animationDelay: '50ms',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Value ${value}, click to edit`}
      onClick={() => onEdit(position)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(position);
        }
      }}
    >
      {value}
    </div>
  );
}
