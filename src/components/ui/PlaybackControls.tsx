import Button from './Button'
import styles from './PlaybackControls.module.css'

interface PlaybackControlsProps {
  isPlaying: boolean
  atStart: boolean
  atEnd: boolean
  onBack: () => void
  onPlay: () => void
  onForward: () => void
  onMinus?: () => void
  onPlus?: () => void
  canMinus?: boolean
  canPlus?: boolean
  speed?: number
  onSpeedChange?: (speed: number) => void
}

export default function PlaybackControls({
  isPlaying,
  atStart,
  atEnd,
  onBack,
  onPlay,
  onForward,
  onMinus,
  onPlus,
  canMinus = true,
  canPlus = true,
  speed,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className={styles.root} role="toolbar" aria-label="Playback controls">
      <div className={styles.buttonsRow}>
        <Button onClick={onBack} disabled={atStart} aria-label="Step back" size="md">←</Button>
        <Button onClick={onPlay} disabled={atEnd && !isPlaying} aria-label={isPlaying ? 'Pause' : 'Play'} size="md">
          {isPlaying ? '⏸' : '▶'}
        </Button>
        <Button onClick={onForward} disabled={atEnd} aria-label="Step forward" size="md">→</Button>

        {(onMinus || onPlus) && <div className={styles.sep} aria-hidden="true" />}

        {onMinus && (
          <Button onClick={onMinus} disabled={!canMinus} aria-label="Remove element" size="md">−</Button>
        )}
        {onPlus && (
          <Button onClick={onPlus} disabled={!canPlus} aria-label="Add element" size="md">+</Button>
        )}
      </div>

      {onSpeedChange != null && speed != null && (
        <div className={styles.speedRow}>
          <span className={styles.speedLabel}>speed</span>
          <input
            type="range"
            className={styles.speedSlider}
            min={0}
            max={4}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            aria-label="Playback speed"
          />
          <span className={styles.speedVal}>{speed + 1}</span>
        </div>
      )}
    </div>
  )
}
