/** xs = 28px, sm = 36px (default), md = 44px, lg = 52px */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

/** 'neutral' (default) renders a white button (dark grey in dark theme) */
export type ButtonColor = 'neutral' | 'primary' | 'success' | 'danger' | 'warning'

export type ButtonVariant = 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text'

export interface ButtonProps {
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
