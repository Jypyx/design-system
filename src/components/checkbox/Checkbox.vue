<script setup lang="ts">
import './checkbox.tokens.css'
import Typography from '../typography/Typography.vue'
import type { CheckboxProps } from './Checkbox.types'

withDefaults(defineProps<CheckboxProps>(), {
  labelPosition: 'right',
  spread: false,
  disabled: false,
  indeterminate: false,
})

const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <label
    class="ds-checkbox"
    :data-label-position="labelPosition"
    :data-spread="spread ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <span class="ds-checkbox-control">
      <input
        v-model="checked"
        class="ds-checkbox-input"
        type="checkbox"
        :disabled="disabled"
        :indeterminate="indeterminate"
      />
      <svg class="ds-checkbox-mark" viewBox="0 0 20 20" aria-hidden="true">
        <path class="ds-checkbox-check" d="M5.5 10.5l3 3 6-7" />
        <path class="ds-checkbox-dash" d="M6 10h8" />
      </svg>
    </span>
    <Typography v-if="label || $slots.default" as="span" variant="body" class="ds-checkbox-label"
      ><slot>{{ label }}</slot></Typography
    >
  </label>
</template>

<style>
.ds-checkbox {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--checkbox-gap);
  color: var(--checkbox-label-color);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* text follows the root color (label color + disabled state) */
.ds-typography.ds-checkbox-label {
  --typo-size: var(--checkbox-font-size);
  --typo-line-height: 1.25;
  --typo-color: currentcolor;
}

/* the input stays first in the DOM (the mark is its CSS sibling);
   the label side is purely visual */
.ds-checkbox[data-label-position='left'] {
  flex-direction: row-reverse;
}

/* label and box pushed to opposite edges of the container */
.ds-checkbox[data-spread] {
  display: flex;
  justify-content: space-between;
}

.ds-checkbox[data-disabled] {
  cursor: not-allowed;
}

/* --- box ---------------------------------------------------------- */

.ds-checkbox-control {
  position: relative;
  display: inline-flex;
  flex: none;
}

.ds-checkbox-input {
  box-sizing: border-box;
  appearance: none;
  margin: 0;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border: var(--checkbox-border-width) solid var(--checkbox-border-color);
  border-radius: var(--checkbox-radius);
  background-color: transparent;
  cursor: inherit;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out);
}

.ds-checkbox-input:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.ds-checkbox-input:is(:checked, :indeterminate) {
  background-color: var(--checkbox-accent);
  border-color: var(--checkbox-accent);
}

.ds-checkbox:hover .ds-checkbox-input:not(:disabled, :checked, :indeterminate) {
  border-color: color-mix(in oklab, var(--checkbox-border-color) 50%, var(--text));
}

.ds-checkbox:hover .ds-checkbox-input:is(:checked, :indeterminate):not(:disabled) {
  background-color: color-mix(in oklab, var(--checkbox-accent) 90%, var(--checkbox-on-accent));
  border-color: color-mix(in oklab, var(--checkbox-accent) 90%, var(--checkbox-on-accent));
}

/* --- mark (check / indeterminate dash) ----------------------------- */

.ds-checkbox-mark {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  color: var(--checkbox-on-accent);
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ds-checkbox-check,
.ds-checkbox-dash {
  opacity: 0;
  transition: opacity var(--duration-150) var(--ease-out);
}

/* indeterminate wins over checked, like the native rendering */
.ds-checkbox-input:checked:not(:indeterminate) + .ds-checkbox-mark .ds-checkbox-check {
  opacity: 1;
}

.ds-checkbox-input:indeterminate + .ds-checkbox-mark .ds-checkbox-dash {
  opacity: 1;
}
</style>
