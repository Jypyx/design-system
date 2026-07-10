<script setup lang="ts">
import './radio.tokens.css'
import type { RadioProps } from './Radio.types'

withDefaults(defineProps<RadioProps>(), {
  labelPosition: 'right',
  spread: false,
  disabled: false,
})

const model = defineModel<string | number | boolean | null>()
</script>

<template>
  <label
    class="ds-radio"
    :data-label-position="labelPosition"
    :data-spread="spread ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <span class="ds-radio-control">
      <input
        v-model="model"
        class="ds-radio-input"
        type="radio"
        :value="value"
        :name="name"
        :disabled="disabled"
      />
      <svg class="ds-radio-mark" viewBox="0 0 20 20" aria-hidden="true">
        <circle class="ds-radio-dot" cx="10" cy="10" r="4" />
      </svg>
    </span>
    <span v-if="label || $slots.default" class="ds-radio-label"><slot>{{ label }}</slot></span>
  </label>
</template>

<style>
.ds-radio {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--radio-gap);
  font-family: var(--font-sans);
  font-size: var(--radio-font-size);
  line-height: 1.25;
  color: var(--radio-label-color);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* the input stays first in the DOM (the mark is its CSS sibling);
   the label side is purely visual */
.ds-radio[data-label-position='left'] {
  flex-direction: row-reverse;
}

/* label and button pushed to opposite edges of the container */
.ds-radio[data-spread] {
  display: flex;
  justify-content: space-between;
}

.ds-radio[data-disabled] {
  cursor: not-allowed;
}

/* --- button --------------------------------------------------------- */

.ds-radio-control {
  position: relative;
  display: inline-flex;
  flex: none;
}

.ds-radio-input {
  box-sizing: border-box;
  appearance: none;
  margin: 0;
  width: var(--radio-size);
  height: var(--radio-size);
  border: var(--radio-border-width) solid var(--radio-border-color);
  border-radius: var(--radius-full);
  background-color: transparent;
  cursor: inherit;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out);
}

.ds-radio-input:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.ds-radio-input:checked {
  background-color: var(--radio-accent);
  border-color: var(--radio-accent);
}

.ds-radio:hover .ds-radio-input:not(:disabled, :checked) {
  border-color: color-mix(in oklab, var(--radio-border-color) 50%, var(--text));
}

.ds-radio:hover .ds-radio-input:checked:not(:disabled) {
  background-color: color-mix(in oklab, var(--radio-accent) 90%, var(--radio-on-accent));
  border-color: color-mix(in oklab, var(--radio-accent) 90%, var(--radio-on-accent));
}

/* --- dot ------------------------------------------------------------ */

.ds-radio-mark {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  color: var(--radio-on-accent);
  fill: currentColor;
}

.ds-radio-dot {
  opacity: 0;
  transition: opacity var(--duration-150) var(--ease-out);
}

.ds-radio-input:checked + .ds-radio-mark .ds-radio-dot {
  opacity: 1;
}
</style>
