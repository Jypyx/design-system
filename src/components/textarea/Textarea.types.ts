/** Same scale as Input / Button; drives font size, padding, radius and icon size */
export type TextareaSize = 'xs' | 'sm' | 'md' | 'lg'

export interface TextareaProps {
  size?: TextareaSize
  /** Text rendered above the field, linked to the textarea */
  label?: string
  placeholder?: string
  /** Helper text rendered below the field (turns red when invalid) */
  hint?: string
  /** Native rows attribute — the initial visible height in text lines */
  rows?: number
  /**
   * Grows and shrinks with the content (CSS field-sizing: content — zero JS);
   * rows then acts as the minimum height. Browsers without field-sizing
   * support keep the fixed rows height.
   */
  autoResize?: boolean
  /**
   * Icon rendered at the start of the field, aligned with the first text
   * line: a Material Symbols Rounded name, or an image / SVG URL (anything
   * containing '.', '/' or ':' is treated as a URL). For inline SVG markup
   * use the icon-start slot instead.
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
