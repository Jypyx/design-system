export type PaginationSize = 'xs' | 'sm' | 'md' | 'lg'
export type PaginationColor = 'neutral' | 'primary' | 'success' | 'danger' | 'warning'
export type PaginationVariant = 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text'
/** prev / next rendering: hidden, icon-only, or icon + visible text */
export type PaginationNavButtons = 'hidden' | 'icon' | 'icon-text'

export interface PaginationProps {
  /** total number of pages */
  length: number
  size?: PaginationSize
  /** accent of the active page button */
  color?: PaginationColor
  /** variant of the inactive buttons (the active page always renders 'flat') */
  variant?: PaginationVariant
  navButtons?: PaginationNavButtons
  /** glue the buttons into a seamless ButtonGroup instead of spacing them with a gap */
  attached?: boolean
  /** Material Symbols name or image / SVG URL (same rules as Button icons) */
  prevIcon?: string
  nextIcon?: string
  /** hard cap on page slots (numbers + ellipses); the available width may reduce it further */
  totalVisible?: number
  disabled?: boolean
  /** accessible name of the nav landmark */
  label?: string
  /** aria-label in 'icon' mode, visible text in 'icon-text' mode */
  prevLabel?: string
  nextLabel?: string
  /** accessible name of a page button; defaults to `Page ${page}` */
  pageLabel?: (page: number) => string
}
