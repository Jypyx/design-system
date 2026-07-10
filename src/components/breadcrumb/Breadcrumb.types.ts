export interface BreadcrumbItem {
  /** Text of the crumb */
  label: string
  /** Destination of the crumb; compared to currentPath for aria-current */
  href: string
  /**
   * Icon rendered before the label: a Material Symbols Rounded name, or an
   * image / SVG URL (anything containing '.', '/' or ':' is treated as a URL).
   */
  iconStart?: string
}

export interface BreadcrumbProps {
  /** Ordered list of ancestors, ending with the current page */
  items: BreadcrumbItem[]
  /**
   * Separator between crumbs: a Material Symbols Rounded name, or an
   * image / SVG URL (same detection as iconStart)
   */
  separator?: string
  /**
   * Collapse the trail when it holds more items than this: only the first,
   * second-to-last and last items stay visible, the rest moves into a menu
   * behind a "…" button. Ignored when the trail fits.
   */
  maxItems?: number
  /**
   * Path compared to each item's href to mark the active crumb with
   * aria-current="page". Defaults to window.location.pathname.
   */
  currentPath?: string
  /** Accessible name of the nav landmark */
  label?: string
  /** Accessible name of the "…" button revealing the collapsed items */
  moreLabel?: string
}
