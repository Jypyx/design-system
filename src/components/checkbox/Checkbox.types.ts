import type { LabelPosition } from '../shared/types'

export type CheckboxLabelPosition = LabelPosition

export interface CheckboxProps {
  /** Text label; the default slot overrides it */
  label?: string
  /** Side of the box the label is rendered on (default 'right') */
  labelPosition?: CheckboxLabelPosition
  /**
   * Pushes the label and the box to opposite edges of the container
   * (justify-content: space-between; the component becomes full-width)
   */
  spread?: boolean
  disabled?: boolean
  /** Visual "partially checked" state (e.g. a parent of a half-checked list) */
  indeterminate?: boolean
}
