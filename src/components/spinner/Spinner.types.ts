export interface SpinnerProps {
  /**
   * Accessible label announced by screen readers (role="img"). Omitted, the
   * spinner is decorative (aria-hidden) — hosts convey the busy state
   * themselves, e.g. through aria-busy on the loading control.
   */
  label?: string
}
