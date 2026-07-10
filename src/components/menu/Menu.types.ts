/**
 * Preferred side of the trigger. The menu automatically flips to the
 * opposite side (CSS position-try fallbacks) when it would overflow the
 * viewport. Submenus always open sideways and handle their own flips.
 */
export type MenuPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'left'
  | 'right'

export interface MenuProps {
  placement?: MenuPlacement
  /** Never open the menu */
  disabled?: boolean
  /** Tighter vertical rhythm and smaller icons; submenus inherit it */
  dense?: boolean
}

export type MenuItemColor = 'neutral' | 'primary' | 'danger'

export interface MenuItemProps {
  /** Main line of the item */
  label: string
  /** Muted second line rendered under the label */
  sublabel?: string
  /** Material Symbols name or image URL, before the label */
  iconStart?: string
  /**
   * Material Symbols name or image URL, at the far end. Ignored when the
   * item has a submenu — a chevron takes over automatically.
   */
  iconEnd?: string
  color?: MenuItemColor
  disabled?: boolean
}

export interface MenuLabelProps {
  /** Plain-text group heading; use the default slot for custom markup */
  label?: string
}
