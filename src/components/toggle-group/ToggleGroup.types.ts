import type { ComputedRef, InjectionKey } from 'vue'
import type { ButtonColor, ButtonSize } from '../button/Button.types'
import type { ToggleVariant } from '../toggle/Toggle.types'

/** Identity carried by each Toggle's value prop */
export type ToggleGroupValue = string | number

/** Single value (or null) in single mode, array in multiple mode */
export type ToggleGroupModelValue = ToggleGroupValue | ToggleGroupValue[] | null

export interface ToggleGroupProps {
  /** Several toggles can be pressed at once; the v-model becomes an array */
  multiple?: boolean
  /** Glues the toggles: inner corners squared, borders merged */
  attached?: boolean
  /** Accessible name of the group (rendered as aria-label on role="group") */
  label?: string
  /** Defaults inherited by the child Toggles (their own props win) */
  size?: ButtonSize
  color?: ButtonColor
  variant?: ToggleVariant
  disabled?: boolean
}

/**
 * @internal shared between ToggleGroup and Toggle — the group owns the
 * selection (isPressed / toggle) and exposes its props as inherited
 * defaults for the child Toggles.
 */
export interface ToggleGroupContext {
  isPressed: (value: ToggleGroupValue) => boolean
  toggle: (value: ToggleGroupValue) => void
  size: ComputedRef<ButtonSize | undefined>
  color: ComputedRef<ButtonColor | undefined>
  variant: ComputedRef<ToggleVariant | undefined>
  disabled: ComputedRef<boolean | undefined>
}

export const toggleGroupKey = Symbol('ds-toggle-group') as InjectionKey<ToggleGroupContext>
