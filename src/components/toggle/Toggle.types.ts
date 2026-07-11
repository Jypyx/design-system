import type { ButtonColor, ButtonSize } from '../button/Button.types'
import type { ToggleGroupValue } from '../toggle-group/ToggleGroup.types'

/**
 * Off → on state pair. Single names rest transparent: 'tonal' and 'flat'
 * name the pressed look only. Compound names spell both states:
 * 'outlined-tonal' / 'outlined-flat' rest outlined, 'tonal-flat' rests tonal.
 */
export type ToggleVariant = 'tonal' | 'flat' | 'outlined-tonal' | 'outlined-flat' | 'tonal-flat'

export interface ToggleProps {
  /**
   * Off → on look: 'tonal' (default) and 'flat' are transparent at rest and
   * fill with a tint / the solid accent when pressed; 'outlined-tonal' and
   * 'outlined-flat' rest outlined; 'tonal-flat' rests tonal, presses flat.
   */
  variant?: ToggleVariant
  /** Fills the Material Symbols icons while pressed (FILL variation axis) */
  fillIcon?: boolean
  size?: ButtonSize
  color?: ButtonColor
  disabled?: boolean
  /**
   * Icon-only toggle (square, like an icon-only Button): a Material Symbols Rounded
   * name, or an image / SVG URL (anything containing '.', '/' or ':' is
   * treated as a URL). Pass `label` for the accessible name.
   */
  icon?: string
  /** Accessible name (rendered as aria-label) — required with icon-only usage */
  label?: string
  /** Icon rendered before the label; same accepted values as icon (slot: icon-start) */
  iconStart?: string
  /** Icon rendered after the label; same accepted values as icon (slot: icon-end) */
  iconEnd?: string
  /** Identity of this toggle within a ToggleGroup (ignored standalone) */
  value?: ToggleGroupValue
}
