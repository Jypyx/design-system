import type { SemanticColor } from '../shared/types'

/**
 * The 5 semantic colors, or any CSS color (hex, oklch(), named…)
 * used directly as the ring color
 */
export type ProgressCircularColor = SemanticColor | (string & {})

export interface ProgressCircularProps {
  /** Current progress, from 0 to max */
  value?: number
  /** Upper bound of value (aria-valuemax) */
  max?: number
  color?: ProgressCircularColor
  /** Outer diameter of the donut in px */
  size?: number
  /** Ring thickness in px */
  thickness?: number
  /** Squared arc ends instead of the default rounded caps */
  square?: boolean
  /**
   * Shows the progress ("42%") centered in the donut hole. The default
   * slot replaces the text and renders even without showLabel, so anything
   * (an icon, a custom value…) can live in the hole.
   */
  showLabel?: boolean
  /** Continuous spinning animation for unknown durations; value and label are ignored */
  indeterminate?: boolean
  /** Accessible name of the progressbar (aria-label) */
  label?: string
  /** Human-readable value for screen readers (aria-valuetext), e.g. "3/10 steps" */
  valueText?: string
}
