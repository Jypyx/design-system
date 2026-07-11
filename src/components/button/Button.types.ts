/** xs = 28px, sm = 36px (default), md = 44px, lg = 52px */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

/** 'neutral' (default) renders a white button (dark grey in dark theme) */
export type ButtonColor = 'neutral' | 'primary' | 'success' | 'danger' | 'warning'

export type ButtonVariant = 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text'

/** 'square' (default) keeps the size's rounded corners; 'round' is a full circle */
export type ButtonShape = 'square' | 'round'

export interface ButtonProps {
  size?: ButtonSize
  color?: ButtonColor
  variant?: ButtonVariant
  /**
   * Icon-only button: the icon replaces the label and the button becomes
   * exactly as wide as it is tall. Same accepted values as iconStart; for
   * inline SVG markup set `label` and use the default slot instead.
   */
  icon?: string
  /**
   * Accessible name (rendered as aria-label) of an icon-only button —
   * required in that mode: the button has no visible text. Setting it (or
   * `icon`) switches the button to icon-only.
   */
  label?: string
  /** Only used on icon-only buttons */
  shape?: ButtonShape
  disabled?: boolean
  /** Renders an <a> instead of a <button>. The href is dropped when disabled. */
  href?: string
  /** Only used when href is set. With '_blank', rel defaults to 'noopener noreferrer'. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** Only used when href is set */
  rel?: string
  /**
   * Icon rendered before the label: a Material Symbols Rounded name, or an
   * image / SVG URL (anything containing '.', '/' or ':' is treated as a URL).
   * For inline SVG markup use the icon-start slot instead.
   */
  iconStart?: string
  /** Icon rendered after the label; same accepted values as iconStart (slot: icon-end) */
  iconEnd?: string
  /** Shows a spinner and dims the button; interaction is blocked while loading. */
  isLoading?: boolean
  /** Ignored when href is set */
  type?: 'button' | 'submit' | 'reset'
}
