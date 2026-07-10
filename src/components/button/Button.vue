<script setup lang="ts">
import './button.tokens.css'
import Icon from '../icon/Icon.vue'
import type { ButtonProps } from './Button.types'

withDefaults(defineProps<ButtonProps>(), {
  size: 'sm',
  color: 'neutral',
  variant: 'flat',
  disabled: false,
  isLoading: false,
  type: 'button',
})

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="ds-btn"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled || undefined"
    :href="disabled ? undefined : href"
    :target="href && !disabled ? target : undefined"
    :rel="href && !disabled ? (rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)) : undefined"
    :aria-disabled="href && disabled ? 'true' : undefined"
    :aria-busy="isLoading ? 'true' : undefined"
    :data-loading="isLoading ? '' : undefined"
    :data-size="size"
    :data-color="color"
    :data-variant="variant"
  >
    <svg
      v-if="isLoading"
      class="ds-btn-spinner"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
    <slot v-else name="icon-start">
      <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
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

/* --- loading ------------------------------------------------------ */

.ds-btn[data-loading] {
  opacity: 0.5;
  pointer-events: none;
}

.ds-btn-spinner {
  /* matches the icon size so the loading swap doesn't shift layout */
  width: var(--btn-icon-size);
  height: var(--btn-icon-size);
  animation: ds-btn-spin calc(var(--duration-500) * 1.5) var(--ease-linear) infinite;
}

@keyframes ds-btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
