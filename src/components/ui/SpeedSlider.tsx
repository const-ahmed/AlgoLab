import styles from './SpeedSlider.module.css'

export const SPEED_MS = [1600, 1100, 700, 400, 200]
export const DEFAULT_SPEED = 2

interface Props {
  speed: number
  onChange: (speed: number) => void
}

export default function SpeedSlider({ speed, onChange }: Props) {
  return (
    <div className={styles.speedRow}>
      <span className={styles.speedLabel}>speed</span>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={4}
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Playback speed"
      />
      <span className={styles.speedVal}>{speed + 1}</span>
    </div>
  )
}
