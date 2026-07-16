import type { SemanticColor } from '../shared/types'

/** dot = 10px (no content), xs = 20px, sm = 26px (default), md = 32px, lg = 38px, xl = 42px */
export type BadgeSize = 'dot' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * The semantic names map to the theme colors; any other string is used as a
 * CSS accent color — background and text are derived from it with color-mix.
 */
export type BadgeColor = SemanticColor | (string & {})

export type BadgeVariant = 'filled' | 'tonal' | 'outlined'

export interface BadgeProps {
  /** Badge text (count, short label). Ignored in 'dot' size. */
  content?: string | number
  size?: BadgeSize
  color?: BadgeColor
  variant?: BadgeVariant
}
