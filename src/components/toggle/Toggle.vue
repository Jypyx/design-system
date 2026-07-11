<script setup lang="ts">
import './toggle.tokens.css'
import { computed, inject } from 'vue'
import Icon from '../icon/Icon.vue'
import { toggleGroupKey } from '../toggle-group/ToggleGroup.types'
import type { ToggleProps } from './Toggle.types'

/* disabled must stay undefined when absent (Vue casts missing boolean
   props to false) so the group's disabled can be inherited below */
const props = withDefaults(defineProps<ToggleProps>(), { disabled: undefined })

/** standalone pressed state — inside a ToggleGroup the group model wins */
const model = defineModel<boolean>({ default: false })

const group = inject(toggleGroupKey, undefined)

const pressed = computed(() =>
  group && props.value !== undefined ? group.isPressed(props.value) : model.value,
)

/* group props are inherited defaults; the toggle's own props win
   (no withDefaults on these — a fixed default would mask the group's) */
const size = computed(() => props.size ?? group?.size.value ?? 'sm')
const color = computed(() => props.color ?? group?.color.value ?? 'neutral')
const variant = computed(() => props.variant ?? group?.variant.value ?? 'tonal')
const disabled = computed(() => props.disabled ?? group?.disabled.value ?? false)

function onClick() {
  if (group && props.value !== undefined) group.toggle(props.value)
  else model.value = !model.value
}

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })
</script>

<template>
  <button
    type="button"
    class="ds-toggle"
    :aria-pressed="pressed ? 'true' : 'false'"
    :aria-label="label"
    :disabled="disabled"
    :data-size="size"
    :data-color="color"
    :data-variant="variant"
    :data-icon-only="icon && !$slots.default ? '' : undefined"
    @click="onClick"
  >
    <slot name="icon-start">
      <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
    </slot>
    <slot>
      <Icon v-if="icon" v-bind="iconProps(icon)" />
    </slot>
    <slot name="icon-end">
      <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
    </slot>
  </button>
</template>

<style>
.ds-toggle {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--toggle-gap);
  height: var(--toggle-height);
  padding: 0 var(--toggle-padding-inline);
  border: 1px solid transparent;
  border-radius: var(--toggle-radius);
  background-color: transparent;
  color: var(--toggle-tint);
  font-family: var(--font-sans);
  font-size: var(--toggle-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out),
    color var(--duration-150) var(--ease-out);
}

.ds-toggle:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

/* --- rest: transparent for both variants (Button text recipes) --- */

.ds-toggle:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--toggle-tint) 10%, transparent);
}

.ds-toggle:active:not(:disabled) {
  background-color: color-mix(in oklab, var(--toggle-tint) 16%, transparent);
}

/* --- pressed: tonal (Button tonal recipes) ------------------------ */

.ds-toggle[aria-pressed='true'][data-variant='tonal'] {
  background-color: color-mix(in oklab, var(--toggle-tint) 14%, transparent);
}

.ds-toggle[aria-pressed='true'][data-variant='tonal']:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--toggle-tint) 22%, transparent);
}

.ds-toggle[aria-pressed='true'][data-variant='tonal']:active:not(:disabled) {
  background-color: color-mix(in oklab, var(--toggle-tint) 30%, transparent);
}

/* --- pressed: flat (Button flat recipes) -------------------------- */

.ds-toggle[aria-pressed='true'][data-variant='flat'] {
  background-color: var(--toggle-accent);
  border-color: var(--toggle-fill-border);
  color: var(--toggle-on-accent);
}

.ds-toggle[aria-pressed='true'][data-variant='flat']:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--toggle-accent) 90%, var(--toggle-on-accent));
}

.ds-toggle[aria-pressed='true'][data-variant='flat']:active:not(:disabled) {
  background-color: color-mix(in oklab, var(--toggle-accent) 82%, var(--toggle-on-accent));
}

/* --- icon-only: exactly as wide as it is tall ---------------------- */

.ds-toggle[data-icon-only] {
  width: var(--toggle-height);
  padding: 0;
  flex: none;
}

/* --- disabled ------------------------------------------------------ */
/* colors are greyed out via the token overrides in toggle.tokens.css */

.ds-toggle:disabled {
  cursor: not-allowed;
}

/* --- icons ---------------------------------------------------------- */

.ds-toggle > .ds-icon {
  --icon-size: var(--toggle-icon-size);
}
</style>
