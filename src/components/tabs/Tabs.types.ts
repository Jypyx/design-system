import type { ComputedRef, InjectionKey } from 'vue'
import type { ButtonColor, ButtonSize } from '../button/Button.types'

/** Identity shared by a Tab and its TabPanel */
export type TabsValue = string | number

/** Value of the selected tab (null before anything is selected) */
export type TabsModelValue = TabsValue | null

/**
 * 'inset' — the selected tab is an elevated pill inside a grey track;
 * 'line' (default) — text tabs with an underline on the selected one
 * (the line moves to the inline-start edge in vertical orientation)
 */
export type TabsVariant = 'line' | 'inset'

export type TabsOrientation = 'horizontal' | 'vertical'

/**
 * Alignment of the tabs inside the bar: start / center / end reads as
 * left / center / right when horizontal, top / middle / bottom when vertical
 */
export type TabsPlacement = 'start' | 'center' | 'end'

export interface TabsProps {
  /** Accessible name of the tablist (rendered as aria-label) */
  label?: string
  /** Same scale as Button: xs = 28px, sm = 36px (default), md = 44px, lg = 52px */
  size?: ButtonSize
  /** Accent of the selected tab */
  color?: ButtonColor
  variant?: TabsVariant
  orientation?: TabsOrientation
  placement?: TabsPlacement
  /** The tabs share all the available space equally (placement is moot) */
  stretch?: boolean
  /**
   * Shows a scroll button at each end of the bar whenever the tabs
   * overflow; each one disables when its end is reached. The bar is
   * always scrollable (wheel / trackpad / keyboard) regardless.
   */
  scrollButtons?: boolean
  /** Icon of the backward scroll button; defaults to a chevron matching the orientation */
  scrollPrevIcon?: string
  /** Icon of the forward scroll button; defaults to a chevron matching the orientation */
  scrollNextIcon?: string
  /** Accessible name of the backward scroll button */
  scrollPrevLabel?: string
  /** Accessible name of the forward scroll button */
  scrollNextLabel?: string
}

export interface TabProps {
  /** Links the tab to the TabPanel carrying the same value */
  value: TabsValue
  disabled?: boolean
  /**
   * Icon rendered before the label: a Material Symbols Rounded name, or an
   * image / SVG URL (anything containing '.', '/' or ':' is treated as a URL).
   * For inline SVG markup use the icon slot instead.
   */
  iconStart?: string
  /**
   * Icon-only tab: the icon replaces the label and the tab becomes exactly
   * as wide as it is tall. Same accepted values as iconStart.
   */
  icon?: string
  /**
   * Accessible name (rendered as aria-label) of an icon-only tab —
   * required in that mode: the tab has no visible text.
   */
  label?: string
}

export interface TabPanelProps {
  /** Links the panel to the Tab carrying the same value */
  value: TabsValue
}

/** @internal registered by each Tab so the group can pick a fallback tab stop */
export interface TabRegistration {
  value: ComputedRef<TabsValue>
  disabled: ComputedRef<boolean>
}

/**
 * @internal shared between Tabs, Tab and TabPanel — the group owns the
 * selection and the aria wiring (ids), the children render against it.
 */
export interface TabsContext {
  isSelected: (value: TabsValue) => boolean
  select: (value: TabsValue) => void
  /** roving tabindex: true for the single tab that is a tab stop */
  isTabbable: (value: TabsValue) => boolean
  register: (tab: TabRegistration) => () => void
  tabId: (value: TabsValue) => string
  panelId: (value: TabsValue) => string
  variant: ComputedRef<TabsVariant>
  orientation: ComputedRef<TabsOrientation>
}

export const tabsKey = Symbol('ds-tabs') as InjectionKey<TabsContext>
