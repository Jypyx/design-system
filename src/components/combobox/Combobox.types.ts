import type { Size } from '../shared/types'

/** Same scale as Input / Button: xs = 28px, sm = 36px (default), md = 44px, lg = 52px */
export type ComboboxSize = Size

export type ComboboxValue = string | number

export interface ComboboxOption {
  label: string
  value: ComboboxValue
  disabled?: boolean
  /** Options sharing the same group string render under a group header (like optgroup) */
  group?: string
}

/**
 * Single mode: a value or null. Multiple mode: an array of values.
 * The shape follows the `multiple` prop; there is no compile-time coupling
 * between the two (same trade-off as SliderModelValue).
 */
export type ComboboxModelValue = ComboboxValue | ComboboxValue[] | null

export interface ComboboxProps {
  /** The selectable options; a flat array, grouped by their `group` field */
  options: ComboboxOption[]
  /** Multi-select: v-model becomes an array and the listbox is aria-multiselectable */
  multiple?: boolean
  size?: ComboboxSize
  /** Visible label above the field */
  label?: string
  /** Accessible name when no visible label is rendered */
  ariaLabel?: string
  placeholder?: string
  /** Muted helper text under the field */
  hint?: string
  /** Shows a button that clears the selection and the search query */
  clearable?: boolean
  /** Accessible name of the clear button */
  clearLabel?: string
  /** Replaces the chevron with a spinner and sets aria-busy */
  isLoading?: boolean
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  /** Renders one hidden input per selected value so native forms submit the selection */
  name?: string
  /**
   * Multiple only — render the selection as closable Chips (true, default)
   * or as plain joined text (false)
   */
  chips?: boolean
  /**
   * Multiple only — how many selected items are shown in the field before
   * the rest collapses into a "+N" badge; omit to show all
   */
  maxVisible?: number
  /**
   * Icon shown on the right of selected options: a Material Symbols Rounded
   * name, or an image / SVG URL (anything containing '.', '/' or ':')
   */
  checkIcon?: string
  /** Text shown when the search matches nothing (slot: empty) */
  emptyText?: string
  /** Multiple only — pins a "select all / deselect all" row on top of the list */
  selectAll?: boolean
  /** Label of the select-all row */
  selectAllLabel?: string
}
