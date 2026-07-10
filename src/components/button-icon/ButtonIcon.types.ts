import type { ButtonColor, ButtonSize, ButtonVariant } from '../button/Button.types'

/** 'square' (default) keeps the size's rounded corners; 'round' is a full circle */
export type ButtonIconShape = 'square' | 'round'

export interface ButtonIconProps {
  /** Accessible name (rendered as aria-label) — required: the button has no visible text */
  label: string
  /**
   * Icon: a Material Symbols Rounded name, or an image / SVG URL (anything
   * containing '.', '/' or ':' is treated as a URL).
   * For inline SVG markup use the default slot instead.
   */
  icon?: string
  shape?: ButtonIconShape
  size?: ButtonSize
  color?: ButtonColor
  variant?: ButtonVariant
  disabled?: boolean
  /** Renders an <a> instead of a <button>. The href is dropped when disabled. */
  href?: string
  /** Only used when href is set. With '_blank', rel defaults to 'noopener noreferrer'. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** Only used when href is set */
  rel?: string
  /** Shows a spinner and dims the button; interaction is blocked while loading. */
  isLoading?: boolean
  /** Ignored when href is set */
  type?: 'button' | 'submit' | 'reset'
}
