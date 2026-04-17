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
}: PlaybackControlsProps) {
  return (
    <div className={styles.root} role="toolbar" aria-label="Playback controls">
      <Button
        onClick={onBack}
        disabled={atStart}
        aria-label="Step back"
        size="md"
      >
        ←
      </Button>
      <Button
        onClick={onPlay}
        disabled={atEnd && !isPlaying}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        size="md"
      >
        {isPlaying ? '⏸' : '▶'}
      </Button>
      <Button
        onClick={onForward}
        disabled={atEnd}
        aria-label="Step forward"
        size="md"
      >
        →
      </Button>

      {(onMinus || onPlus) && <div className={styles.sep} aria-hidden="true" />}

      {onMinus && (
        <Button onClick={onMinus} disabled={!canMinus} aria-label="Remove element" size="md">
          −
        </Button>
      )}
      {onPlus && (
        <Button onClick={onPlus} disabled={!canPlus} aria-label="Add element" size="md">
          +
        </Button>
      )}
    </div>
  )
}
