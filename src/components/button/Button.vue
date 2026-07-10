<script setup lang="ts">
import './button.tokens.css'
import type { ButtonProps } from './Button.types'

withDefaults(defineProps<ButtonProps>(), {
  size: 'sm',
  color: 'neutral',
  variant: 'elevated',
  disabled: false,
  type: 'button',
})
</script>

<template>
  <button
    class="ds-btn"
    :type="type"
    :disabled="disabled"
    :data-size="size"
    :data-color="color"
    :data-variant="variant"
  >
    <slot />
  </button>
</template>

<style>
.ds-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--btn-gap);
  height: var(--btn-height);
  padding-inline: var(--btn-padding-inline);
  border: 1px solid transparent;
  border-radius: var(--btn-radius);
  font-family: var(--font-sans);
  font-size: var(--btn-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out),
    box-shadow var(--duration-150) var(--ease-out);
}

.ds-btn:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

/* --- filled variants: elevated + flat -------------------------- */

.ds-btn[data-variant='elevated'],
.ds-btn[data-variant='flat'] {
  background-color: var(--btn-accent);
  border-color: var(--btn-fill-border);
  color: var(--btn-on-accent);
}

.ds-btn[data-variant='elevated'] {
  box-shadow: var(--shadow-sm);
}

.ds-btn[data-variant='elevated']:hover:not(:disabled) {
  box-shadow: var(--shadow-md);
}

.ds-btn[data-variant='elevated']:active:not(:disabled) {
  box-shadow: var(--shadow-xs);
}

.ds-btn[data-variant='elevated']:hover:not(:disabled),
.ds-btn[data-variant='flat']:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--btn-accent) 90%, var(--btn-on-accent));
}

.ds-btn[data-variant='elevated']:active:not(:disabled),
.ds-btn[data-variant='flat']:active:not(:disabled) {
  background-color: color-mix(in oklab, var(--btn-accent) 82%, var(--btn-on-accent));
}

/* --- tonal ------------------------------------------------------ */

.ds-btn[data-variant='tonal'] {
  background-color: color-mix(in oklab, var(--btn-tint) 14%, transparent);
  color: var(--btn-tint);
}

.ds-btn[data-variant='tonal']:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--btn-tint) 22%, transparent);
}

.ds-btn[data-variant='tonal']:active:not(:disabled) {
  background-color: color-mix(in oklab, var(--btn-tint) 30%, transparent);
}

/* --- outlined + text -------------------------------------------- */

.ds-btn[data-variant='outlined'],
.ds-btn[data-variant='text'] {
  background-color: transparent;
  color: var(--btn-tint);
}

.ds-btn[data-variant='outlined'] {
  border-color: var(--btn-outline);
}

.ds-btn[data-variant='outlined']:hover:not(:disabled),
.ds-btn[data-variant='text']:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--btn-tint) 10%, transparent);
}

.ds-btn[data-variant='outlined']:active:not(:disabled),
.ds-btn[data-variant='text']:active:not(:disabled) {
  background-color: color-mix(in oklab, var(--btn-tint) 16%, transparent);
}

/* --- disabled ---------------------------------------------------- */

.ds-btn:disabled {
  opacity: 0.5;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
