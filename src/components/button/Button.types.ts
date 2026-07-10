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
  type?: 'button' | 'submit' | 'reset'
}
