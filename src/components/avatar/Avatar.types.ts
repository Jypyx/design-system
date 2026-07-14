/** xs = 28px, sm = 36px (default), md = 44px, lg = 52px, xl = 64px */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * 'auto' (default) derives a stable hue from the avatar content (name / text /
 * icon); the semantic names map to the theme colors; any other string is used
 * verbatim as a CSS background color (the foreground flips to black or white
 * based on its lightness).
 */
export type AvatarColor =
  'auto' | 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | (string & {})

export interface AvatarProps {
  /**
   * Person (or entity) name: source of the fallback initials, seed of the
   * auto color, default tooltip text and accessible label.
   */
  name?: string
  /** Image URL; falls back to icon / text / initials if it fails to load */
  src?: string
  /** Image alt text; defaults to name */
  alt?: string
  /**
   * Icon shown when there is no image: a Material Symbols Rounded name, or an
   * image / SVG URL (anything containing '.', '/' or ':' is treated as a URL).
   */
  icon?: string
  /** Explicit short text; takes precedence over the initials derived from name */
  text?: string
  size?: AvatarSize
  color?: AvatarColor
  /** true shows the name in a Tooltip; a string overrides the tooltip text */
  tooltip?: boolean | string
  /** Renders an <a> instead of a <span> */
  href?: string
  /** Only used when href is set. With '_blank', rel defaults to 'noopener noreferrer'. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** Only used when href is set */
  rel?: string
}

export interface AvatarGroupProps {
  /**
   * Maximum number of circles rendered. When the children exceed it, the
   * first maxItems - 1 avatars are shown followed by a "+X" overflow chip.
   */
  maxItems?: number
  /** Uniform size applied to every child avatar (wins over their own size prop) */
  size?: AvatarSize
  /** Accessible label of the group */
  label?: string
}
