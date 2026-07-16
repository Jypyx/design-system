import type { Placement } from '../shared/types'

/**
 * Preferred side of the anchor. The tooltip automatically flips to the
 * opposite side (CSS position-try fallbacks) when it would overflow the
 * viewport.
 */
export type TooltipPlacement = Placement

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
  /**
   * Controlled mode: when set (true / false) the tooltip is shown and hidden
   * programmatically and the built-in hover / focus / Escape triggers (and
   * the disabled prop) are ignored. Leave undefined for the default behavior.
   */
  open?: boolean
}
