import type { ComputedRef, InjectionKey } from 'vue'

export type AccordionVariant = 'card' | 'flat'

export interface AccordionProps {
  /**
   * Allow several items open at once. By default opening an item closes
   * the others (native `name` grouping on the underlying `<details>`).
   */
  multiple?: boolean
  /** Tighter vertical rhythm and smaller icons */
  dense?: boolean
  /** 'card' — bordered, rounded group (default); 'flat' — separators between items only */
  variant?: AccordionVariant
}

export interface AccordionItemProps {
  /** Main line of the header */
  label: string
  /** Muted second line rendered under the label */
  sublabel?: string
  /** Material Symbols name or image URL, before the label */
  icon?: string
  /**
   * Initially open; the browser owns the state afterwards. When the group
   * is exclusive, only the last item declaring `open` stays open.
   */
  open?: boolean
  /** Header cannot be toggled or focused */
  disabled?: boolean
}

/**
 * @internal shared between Accordion and AccordionItem — carries the
 * generated `name` that groups the `<details>` elements for native
 * exclusive behavior (undefined when `multiple` or standalone).
 */
export const accordionGroupKey = Symbol('ds-accordion-group') as InjectionKey<
  ComputedRef<string | undefined>
>
