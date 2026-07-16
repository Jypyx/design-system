import type { Size } from '../shared/types'

/** xs = 28px, sm = 36px (default), md = 44px, lg = 52px — same scale as Button */
export type InputSize = Size

/** Textual input types only — checkbox / radio / range have their own components */
export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'

export interface InputProps {
  size?: InputSize
  type?: InputType
  /** Text rendered above the field, linked to the input */
  label?: string
  /** Accessible name applied to the native input, for fields without a visible label */
  ariaLabel?: string
  placeholder?: string
  /** Helper text rendered below the field (turns red when invalid) */
  hint?: string
  /**
   * Icon rendered at the start of the field: a Material Symbols Rounded name,
   * or an image / SVG URL (anything containing '.', '/' or ':' is treated as
   * a URL). For inline SVG markup use the icon-start slot instead.
   */
  iconStart?: string
  /**
   * Icon rendered at the end of the field; same accepted values as iconStart
   * (slot: icon-end). Becomes a button when an @icon-end-click listener is
   * attached — set iconEndLabel in that case.
   */
  iconEnd?: string
  /** Accessible label of the end-icon button (required when @icon-end-click is used) */
  iconEndLabel?: string
  /** Shows a clear button at the end of the field whenever it has a value */
  clearable?: boolean
  /** Accessible label of the clear button */
  clearLabel?: string
  /** Shows a spinner at the end of the field (replaces iconEnd while active) */
  isLoading?: boolean
  /** Shows a character counter below the field; pairs with maxlength */
  showCount?: boolean
  /** Native maxlength, also used as the denominator of the counter */
  maxlength?: number
  /** Native min attribute (type="number") */
  min?: number | string
  /** Native max attribute (type="number") */
  max?: number | string
  /** Native step attribute (type="number") */
  step?: number | string
  /** Native name attribute */
  name?: string
  /** Native autocomplete attribute */
  autocomplete?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  /** Error styling + aria-invalid; pair with hint for the error message */
  invalid?: boolean
}
