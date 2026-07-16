/* ============================================================
 * Shared prop unions, aliased by the per-component *.types.ts
 * files (e.g. `ButtonSize = Size`) so every component keeps its
 * own exported names while the scales stay in sync.
 * ============================================================ */

/** Control scale shared by Button / Input / Combobox / Tabs / …: xs = 28px, sm = 36px, md = 44px, lg = 52px */
export type Size = 'xs' | 'sm' | 'md' | 'lg'

/** The five theme colors every colorable component understands */
export type SemanticColor = 'neutral' | 'primary' | 'success' | 'danger' | 'warning'

/** Side of the control its label sits on */
export type LabelPosition = 'left' | 'right'

/**
 * Preferred side of the anchor for popover overlays. Components
 * automatically flip to the opposite side (CSS position-try
 * fallbacks) when the preferred one would overflow the viewport.
 */
export type Placement =
  'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end' | 'left' | 'right'
