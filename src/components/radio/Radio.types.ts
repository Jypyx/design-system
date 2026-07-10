export type RadioLabelPosition = 'left' | 'right'

export interface RadioProps {
  /** Value assigned to the v-model when this radio is selected */
  value: string | number | boolean
  /** Native name attribute, groups radios of the same form */
  name?: string
  /** Text label; the default slot overrides it */
  label?: string
  /** Side of the button the label is rendered on (default 'right') */
  labelPosition?: RadioLabelPosition
  /**
   * Pushes the label and the button to opposite edges of the container
   * (justify-content: space-between; the component becomes full-width)
   */
  spread?: boolean
  disabled?: boolean
}
