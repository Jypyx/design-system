import type { SemanticColor } from '../shared/types'

/** 'neutral' (default) renders the emphasis bubble (dark in both themes) */
export type ToastColor = SemanticColor

export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

/** sm = 300px, md = 360px (default), lg = 440px wide */
export type ToastSize = 'sm' | 'md' | 'lg'

export interface ToastOptions {
  /** Optional heading rendered above the message */
  title?: string
  color?: ToastColor
  /** Screen corner/edge the toast stacks into (default 'bottom-right') */
  position?: ToastPosition
  /** Width preset (default 'md') */
  size?: ToastSize
  /** Shows a dismiss button (default true) */
  closable?: boolean
  /**
   * Auto-dismiss delay in ms (default 5000). Hovering a toast pauses the
   * countdown. 0 keeps the toast on screen until dismissed.
   */
  duration?: number
  /**
   * Icon shown at the top-left: a Material Symbols Rounded name, or an
   * image / SVG URL (anything containing '.', '/' or ':' is treated as a
   * URL). Defaults to an icon matching the color.
   */
  icon?: string
}

/** A queued toast, as rendered by the Toaster outlet */
export interface ToastItem extends Required<Omit<ToastOptions, 'title'>> {
  id: number
  message: string
  title?: string
}
