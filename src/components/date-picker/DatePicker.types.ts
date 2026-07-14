import type { CalendarProps } from '../calendar/Calendar.types'

/** Same scale as Input / Button: xs = 28px, sm = 36px (default), md = 44px, lg = 52px */
export type DatePickerSize = 'xs' | 'sm' | 'md' | 'lg'

export type DatePickerPlacement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end'

/** All Calendar props are forwarded to the popover Calendar */
export interface DatePickerProps extends CalendarProps {
  size?: DatePickerSize
  /** Visible label above the field */
  label?: string
  placeholder?: string
  /** Muted helper text under the field */
  hint?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  /** Shows a button that clears the selection */
  clearable?: boolean
  /** Accessible name of the clear button */
  clearLabel?: string
  /**
   * Renders hidden input(s) holding 'yyyy-mm-dd' so native forms submit the
   * selection (the visible input holds display text, never a name); range
   * mode renders one input per bound
   */
  name?: string
  /** Popover placement relative to the field */
  placement?: DatePickerPlacement
  /** Close the popover once a date — or the range end — is picked */
  closeOnSelect?: boolean
  /** Intl options formatting the field value; defaults to { dateStyle: 'medium' } */
  formatOptions?: Intl.DateTimeFormatOptions
}
