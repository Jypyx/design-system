/** xs = 20px, sm = 26px (default), md = 32px, lg = 38px, xl = 42px — same scale as Badge */
export type ChipSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * The semantic names map to the theme colors; any other string is used as a
 * CSS accent color — background and text are derived from it with color-mix.
 */
export type ChipColor = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | (string & {})

export type ChipVariant = 'filled' | 'tonal' | 'outlined'

/** 'rounded' (default) has rounded rectangle corners; 'pill' is fully rounded */
export type ChipShape = 'rounded' | 'pill'

export interface ChipProps {
  /** Chip text; omit it for an icon-only chip (then pass an aria-label) */
  label?: string
  /**
   * Icon rendered before the label: a Material Symbols Rounded name, or an
   * image / SVG URL (anything containing '.', '/' or ':' is treated as a URL).
   * For inline SVG markup use the icon-start slot instead.
   */
  iconStart?: string
  /** Icon rendered after the label; same accepted values as iconStart (slot: icon-end) */
  iconEnd?: string
  size?: ChipSize
  color?: ChipColor
  variant?: ChipVariant
  shape?: ChipShape
  /** Greys the chip out and blocks click / close; only relevant when interactive or closable */
  disabled?: boolean
  /**
   * Shows a close button that emits 'close' (the parent removes the chip).
   * Delete / Backspace on the focused chip also emits 'close'.
   */
  closable?: boolean
  /** Icon of the close button; same accepted values as iconStart */
  closeIcon?: string
  /** Accessible name of the close button */
  closeLabel?: string
  /**
   * Toggle state (filter chip): emphasizes the chip and is exposed as
   * aria-pressed when the chip is clickable
   */
  selected?: boolean
  /** Renders the chip body as an <a>. The href is dropped when disabled. */
  href?: string
  /** Only used when href is set. With '_blank', rel defaults to 'noopener noreferrer'. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** Only used when href is set */
  rel?: string
  /** CSS max-width of the label; overflowing text is ellipsed and readable via the native title */
  maxWidth?: string
}
