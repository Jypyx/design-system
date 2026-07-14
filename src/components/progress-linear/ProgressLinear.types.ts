/**
 * The 5 semantic colors, or any CSS color (hex, oklch(), named…)
 * used directly as the fill color
 */
export type ProgressLinearColor =
  'neutral' | 'primary' | 'success' | 'danger' | 'warning' | (string & {})

export interface ProgressLinearProps {
  /** Current progress, from 0 to max */
  value?: number
  /** Upper bound of value (aria-valuemax) */
  max?: number
  color?: ProgressLinearColor
  /** Bar thickness in px. Defaults to 8px, or 18px when showLabel is set. */
  height?: number
  /** Squared corners instead of the default pill shape */
  square?: boolean
  /**
   * Shows the progress ("42%") centered in the bar; override the text via
   * the default slot. The text flips color where the fill passes under it,
   * using contrast-color() over the fill; browsers without support fall
   * back to --progress-on-accent (overridable when passing a custom color).
   */
  showLabel?: boolean
  /** Continuous sliding animation for unknown durations; value and label are ignored */
  indeterminate?: boolean
  /** Accessible name of the progressbar (aria-label) */
  label?: string
  /** Human-readable value for screen readers (aria-valuetext), e.g. "3/10 steps" */
  valueText?: string
}
