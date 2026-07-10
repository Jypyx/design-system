/**
 * Preferred side of the anchor. The tooltip automatically flips to the
 * opposite side (CSS position-try fallbacks) when it would overflow the
 * viewport.
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right'

export interface TooltipProps {
  /** Plain-text content; use the #content slot for rich markup instead */
  content?: string
  placement?: TooltipPlacement
  /** Delay in ms before showing on hover (focus always shows immediately) */
  openDelay?: number
  /** Delay in ms before hiding once the pointer leaves */
  closeDelay?: number
  /** Never show the tooltip */
  disabled?: boolean
}
