<script setup lang="ts">
import './toggle-group.tokens.css'
import { computed, provide } from 'vue'
import { toggleGroupKey } from './ToggleGroup.types'
import type { ToggleGroupModelValue, ToggleGroupProps, ToggleGroupValue } from './ToggleGroup.types'

const props = defineProps<ToggleGroupProps>()

/** single mode: the pressed value or null — multiple mode: array of values */
const model = defineModel<ToggleGroupModelValue>({ default: null })

function isPressed(value: ToggleGroupValue) {
  return Array.isArray(model.value) ? model.value.includes(value) : model.value === value
}

function toggle(value: ToggleGroupValue) {
  if (props.multiple) {
    const current = Array.isArray(model.value) ? model.value : []
    model.value = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  } else {
    /* free deselection: pressing the active toggle empties the selection */
    model.value = model.value === value ? null : value
  }
}

provide(toggleGroupKey, {
  isPressed,
  toggle,
  size: computed(() => props.size),
  color: computed(() => props.color),
  variant: computed(() => props.variant),
  disabled: computed(() => props.disabled),
})
</script>

<template>
  <div
    class="ds-toggle-group"
    role="group"
    :aria-label="label"
    :data-attached="attached ? '' : undefined"
  >
    <slot />
  </div>
</template>

<style>
.ds-toggle-group {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  gap: var(--toggle-group-gap);
  isolation: isolate;
}

.ds-toggle-group > .ds-toggle {
  position: relative;
}

/* --- attached: glue ------------------------------------------------ */
/* toggles get a visible border so the glue reads even at rest (their
   fill-border token is aligned on it in toggle-group.tokens.css) */

.ds-toggle-group[data-attached] {
  gap: 0;
}

.ds-toggle-group[data-attached] > .ds-toggle {
  border-color: var(--toggle-group-border);
}

/* inner corners lose their radius, only the extremities of the group
   stay rounded (logical properties, so RTL comes for free) */
.ds-toggle-group[data-attached] > .ds-toggle:not(:first-child) {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
  /* collapse the double border where two toggles meet */
  margin-inline-start: -1px;
}

.ds-toggle-group[data-attached] > .ds-toggle:not(:last-child) {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

/* the hovered / focused / pressed toggle paints above its neighbors so
   its merged border and focus ring are never clipped by the next one */
.ds-toggle-group[data-attached] > .ds-toggle:is(:hover, :focus-visible, [aria-pressed='true']) {
  z-index: 1;
}
</style>
