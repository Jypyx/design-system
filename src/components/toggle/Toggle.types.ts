import type { ButtonColor, ButtonSize } from '../button/Button.types'
import type { ToggleGroupValue } from '../toggle-group/ToggleGroup.types'

/** Pressed look; the rest state is transparent for both */
export type ToggleVariant = 'tonal' | 'flat'

export interface ToggleProps {
  /**
   * Look of the pressed state: 'tonal' (default) fills with a tint of the
   * color, 'flat' fills with the solid accent. At rest both are transparent.
   */
  variant?: ToggleVariant
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
