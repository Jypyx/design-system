export type DialogRole = 'dialog' | 'alertdialog'

export interface DialogProps {
  /** Heading rendered in the header; also names the dialog (aria-labelledby) */
  title?: string
  /** Muted line under the title */
  subtitle?: string
  /**
   * Any CSS width (e.g. '800px', '60ch'); defaults to 560px. The dialog
   * never grows past the viewport minus a gutter, whatever the value.
   */
  width?: string
  /** Renders the close X in the header */
  closable?: boolean
  /** Closes on backdrop click (light dismiss). Escape always closes. */
  dismissible?: boolean
  /** 'alertdialog' marks an urgent interruption; the body becomes the accessible description */
  role?: DialogRole
  /** aria-label of the close X */
  closeLabel?: string
}

export interface DialogAlertProps {
  /** Heading rendered in the header; also names the dialog (aria-labelledby) */
  title?: string
  /** Muted line under the title */
  subtitle?: string
  /** Any CSS width (e.g. '480px'); defaults to 400px, viewport-capped */
  width?: string
}
