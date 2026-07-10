export interface IconProps {
  /**
   * Material Symbols Rounded ligature name (e.g. 'favorite', 'arrow_forward').
   * The font is not bundled — the consumer must load 'Material Symbols Rounded'
   * (e.g. via Google Fonts). Takes precedence over `src`.
   */
  name?: string
  /** Image URL, used when `name` is not set */
  src?: string
  /** Material Symbols only: renders the filled style of the glyph */
  filled?: boolean
  /** Accessible label. When omitted the icon is decorative (aria-hidden). */
  label?: string
}
