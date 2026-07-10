export type SwitchLabelPosition = 'left' | 'right'

export interface SwitchProps {
  /** Text label; the default slot overrides it */
  label?: string
  /** Side of the track the label is rendered on (default 'right') */
  labelPosition?: SwitchLabelPosition
  /**
   * Pushes the label and the track to opposite edges of the container
   * (justify-content: space-between; the component becomes full-width)
   */
  spread?: boolean
  disabled?: boolean
}
