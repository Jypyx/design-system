<script setup lang="ts">
import './button.tokens.css'
import { iconProps } from '../shared/utils'
import Icon from '../icon/Icon.vue'
import Spinner from '../spinner/Spinner.vue'
import type { ButtonProps } from './Button.types'

withDefaults(defineProps<ButtonProps>(), {
  size: 'sm',
  color: 'neutral',
  variant: 'flat',
  shape: 'square',
  disabled: false,
  isLoading: false,
  type: 'button',
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="ds-btn"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled || undefined"
    :href="disabled ? undefined : href"
    :target="href && !disabled ? target : undefined"
    :rel="
      href && !disabled
        ? (rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined))
        : undefined
    "
    :aria-disabled="href && disabled ? 'true' : undefined"
    :aria-busy="isLoading ? 'true' : undefined"
    :aria-label="label"
    :data-loading="isLoading ? '' : undefined"
    :data-size="size"
    :data-color="color"
    :data-variant="variant"
    :data-shape="icon || label ? shape : undefined"
  >
    <Spinner v-if="isLoading" class="ds-btn-spinner" />
    <slot v-else name="icon-start">
      <Icon v-if="iconStart || icon" v-bind="iconProps((iconStart || icon)!)" />
    </slot>
    <slot />
    <slot name="icon-end">
      <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
    </slot>
  </component>
</template>

<style>
.ds-btn {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--btn-gap);
  height: var(--btn-height);
  padding: 0 var(--btn-padding-inline);
  border: 1px solid transparent;
  border-radius: var(--btn-radius);
  font-family: var(--font-sans);
  font-size: var(--btn-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
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

.ds-btn[data-variant='elevated']:hover:not(:disabled, [aria-disabled='true']) {
  box-shadow: var(--shadow-md);
}

.ds-btn[data-variant='elevated']:active:not(:disabled, [aria-disabled='true']) {
  box-shadow: var(--shadow-xs);
}

.ds-btn[data-variant='elevated']:hover:not(:disabled, [aria-disabled='true']),
.ds-btn[data-variant='flat']:hover:not(:disabled, [aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--btn-accent) 90%, var(--btn-on-accent));
}

.ds-btn[data-variant='elevated']:active:not(:disabled, [aria-disabled='true']),
.ds-btn[data-variant='flat']:active:not(:disabled, [aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--btn-accent) 82%, var(--btn-on-accent));
}

/* --- tonal ------------------------------------------------------ */

.ds-btn[data-variant='tonal'] {
  background-color: color-mix(in oklab, var(--btn-tint) 14%, transparent);
  color: var(--btn-tint);
}

.ds-btn[data-variant='tonal']:hover:not(:disabled, [aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--btn-tint) 22%, transparent);
}

.ds-btn[data-variant='tonal']:active:not(:disabled, [aria-disabled='true']) {
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

.ds-btn[data-variant='outlined']:hover:not(:disabled, [aria-disabled='true']),
.ds-btn[data-variant='text']:hover:not(:disabled, [aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--btn-tint) 10%, transparent);
}

.ds-btn[data-variant='outlined']:active:not(:disabled, [aria-disabled='true']),
.ds-btn[data-variant='text']:active:not(:disabled, [aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--btn-tint) 16%, transparent);
}

/* --- disabled ---------------------------------------------------- */
/* colors are greyed out via the token overrides in button.tokens.css */

.ds-btn:is(:disabled, [aria-disabled='true']) {
  box-shadow: none;
  cursor: not-allowed;
}

/* --- icons -------------------------------------------------------- */

.ds-btn > .ds-icon {
  --icon-size: var(--btn-icon-size);
}

/* --- icon-only ------------------------------------------------------ */

.ds-btn[data-shape] {
  /* icon-only: the button is exactly as wide as it is tall */
  width: var(--btn-height);
  flex: none;
}

/* the spinner takes the icon's place — also hide an icon slotted
   through the default slot so the two never stack */
.ds-btn[data-shape][data-loading] > :not(.ds-btn-spinner) {
  display: none;
}

/* --- loading ------------------------------------------------------ */

.ds-btn[data-loading] {
  opacity: 0.5;
  pointer-events: none;
}

.ds-btn .ds-btn-spinner {
  /* matches the icon size so the loading swap doesn't shift layout */
  --spinner-size: var(--btn-icon-size);
}
</style>
