/**
 * Determines both the text style and the default rendered tag:
 * h1–h6 render the matching heading, subtitle/body render <p>,
 * label/caption/overline render <span>.
 */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'caption'
  | 'overline'

/** Maps to the Layer 2 text color tokens (--text, --text-muted, …) */
export type TypographyColor = 'default' | 'muted' | 'disabled' | 'inverse'

/** Rendered element when the variant's default tag isn't right for the context */
export type TypographyTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'label'
  | 'legend'
  | 'figcaption'

export interface TypographyProps {
  variant?: TypographyVariant
  /**
   * Overrides the rendered tag while keeping the variant's style, e.g.
   * as="h2" variant="h5" to fit the document outline, or as="label" when
   * the text labels a form control (pass `for` as a normal attribute —
   * the 'label' variant renders a <span> by default because a <label>
   * without an associated control is an accessibility smell).
   */
  as?: TypographyTag
  /**
   * 'default' keeps the variant's own color (subtitle / caption / overline
   * are muted by design); the other values force a semantic text color.
   */
  color?: TypographyColor
  /** Single-line ellipsis (also forces display: block) */
  truncate?: boolean
}
