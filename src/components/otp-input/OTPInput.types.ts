import type { InputSize } from '../input/Input.types'

export type OTPInputFormat = 'numeric' | 'alpha' | 'alphanumeric'

export interface OTPInputProps {
  /** Number of characters in the code (ignored when pattern is set) */
  length?: number
  /** Characters the code accepts (default 'numeric') */
  format?: OTPInputFormat
  /** Field size, forwarded to the underlying Input */
  size?: InputSize
  /**
   * Material Symbols Rounded name rendered between every field
   * (e.g. 'remove' for a dash). Ignored when pattern is set — the
   * pattern's literal characters play that role instead.
   */
  separator?: string
  /**
   * Layout template: '#' is an input slot, any other run of characters
   * is rendered as literal text between the fields. Overrides length
   * and separator. Examples: 'GT - ###' → GT - [5][8][9],
   * '##.###.###' → [5][5].[5][5][5].[8][6][7]
   */
  pattern?: string
  /** Glues adjacent fields together (per group of slots when pattern is set) */
  attached?: boolean
  /** Marks the code as busy: fields become readonly and a spinner is shown */
  isLoading?: boolean
  disabled?: boolean
  /** Error styling + aria-invalid on every field */
  invalid?: boolean
  /** Accessible name of the group */
  label?: string
  /** Accessible name of one field, rendered as '<fieldLabel> N / total' */
  fieldLabel?: string
}
