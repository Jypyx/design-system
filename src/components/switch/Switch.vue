<script setup lang="ts">
import './switch.tokens.css'
import Typography from '../typography/Typography.vue'
import type { SwitchProps } from './Switch.types'

withDefaults(defineProps<SwitchProps>(), {
  labelPosition: 'right',
  spread: false,
  disabled: false,
})

const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <label
    class="ds-switch"
    :data-label-position="labelPosition"
    :data-spread="spread ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <span class="ds-switch-control">
      <input
        v-model="checked"
        class="ds-switch-input"
        type="checkbox"
        role="switch"
        :disabled="disabled"
      />
      <span class="ds-switch-thumb" aria-hidden="true"></span>
    </span>
    <Typography v-if="label || $slots.default" as="span" variant="body" class="ds-switch-label"
      ><slot>{{ label }}</slot></Typography
    >
  </label>
</template>

<style>
.ds-switch {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--switch-gap);
  color: var(--switch-label-color);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* text follows the root color (label color + disabled state) */
.ds-typography.ds-switch-label {
  --typo-size: var(--switch-font-size);
  --typo-line-height: 1.25;
  --typo-color: currentcolor;
}

/* the input stays first in the DOM (the thumb is its CSS sibling);
   the label side is purely visual */
.ds-switch[data-label-position='left'] {
  flex-direction: row-reverse;
}

/* label and track pushed to opposite edges of the container */
.ds-switch[data-spread] {
  display: flex;
  justify-content: space-between;
}

.ds-switch[data-disabled] {
  cursor: not-allowed;
}

/* --- track ---------------------------------------------------------- */

.ds-switch-control {
  position: relative;
  display: inline-flex;
  flex: none;
}

.ds-switch-input {
  box-sizing: border-box;
  appearance: none;
  margin: 0;
  width: var(--switch-width);
  height: var(--switch-height);
  border: none;
  border-radius: var(--switch-radius);
  background-color: var(--switch-track-color);
  cursor: inherit;
  transition: background-color var(--duration-150) var(--ease-out);
}

.ds-switch-input:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.ds-switch-input:checked {
  background-color: var(--switch-accent);
}

.ds-switch:hover .ds-switch-input:not(:disabled, :checked) {
  background-color: color-mix(in oklab, var(--switch-track-color) 85%, var(--text));
}

.ds-switch:hover .ds-switch-input:checked:not(:disabled) {
  background-color: color-mix(in oklab, var(--switch-accent) 90%, var(--switch-thumb-color));
}

/* --- thumb ---------------------------------------------------------- */

.ds-switch-thumb {
  position: absolute;
  inset-block-start: var(--switch-padding);
  inset-inline-start: var(--switch-padding);
  width: var(--switch-thumb-size);
  height: var(--switch-thumb-size);
  border-radius: var(--switch-radius);
  background-color: var(--switch-thumb-color);
  pointer-events: none;
  transition: translate var(--duration-150) var(--ease-out);
}

.ds-switch-input:checked + .ds-switch-thumb {
  translate: calc(var(--switch-width) - var(--switch-thumb-size) - 2 * var(--switch-padding)) 0;
}
</style>
