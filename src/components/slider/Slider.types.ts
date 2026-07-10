export type SliderOrientation = 'horizontal' | 'vertical'

/** A selectable value — a number, or a string when the options prop is used */
export type SliderValue = number | string

/** Single thumb: one value. Range (double thumb): a [start, end] tuple. */
export type SliderModelValue = SliderValue | [SliderValue, SliderValue]

export interface SliderProps {
  /** Accessible name of the slider — always provide one */
  label?: string
  min?: number
  max?: number
  /** Increment applied when dragging and with arrow keys */
  step?: number
  /**
   * Discrete allowed values (strings or numbers); replaces min / max / step.
   * modelValue must then be one of these values (or a tuple of two of them).
   */
  options?: SliderValue[]
  orientation?: SliderOrientation
  disabled?: boolean
  /**
   * Shows a number input at the end of the slider (and at the start too in
   * range mode). Ignored when options is set.
   */
  showInputs?: boolean
  /** Tick mark on the track at every step / option */
  ticks?: boolean
  /** Value (or option) label under every tick; implies ticks */
  tickLabels?: boolean
  /**
   * Tooltip above the thumb(s) on hover / focus / drag. Shows the value by
   * default; use the `tooltip` slot for rich content (icons, text…).
   */
  tooltip?: boolean
  /** aria-label suffix of the start thumb in range mode */
  labelStart?: string
  /** aria-label suffix of the end thumb in range mode */
  labelEnd?: string
}
