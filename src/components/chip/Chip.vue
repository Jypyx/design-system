<script setup lang="ts">
import './chip.tokens.css'
import { computed, useAttrs } from 'vue'
import Icon from '../icon/Icon.vue'
import type { ChipProps } from './Chip.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ChipProps>(), {
  size: 'sm',
  color: 'neutral',
  variant: 'filled',
  shape: 'rounded',
  disabled: false,
  closable: false,
  closeIcon: 'close',
  closeLabel: 'Remove',
})

const emit = defineEmits<{ close: [] }>()

const attrs = useAttrs()

/* attrs is not reactive — a plain function keeps the check per-render.
   A click listener or an href makes the chip body interactive; the close
   button must stay a sibling (a button cannot nest another button). */
const tag = () => (props.href ? 'a' : 'onClick' in attrs ? 'button' : 'span')

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })

const semanticColors = ['neutral', 'primary', 'success', 'danger', 'warning']

const dataColor = computed(() => (semanticColors.includes(props.color) ? props.color : 'custom'))

const style = computed(() => ({
  ...(dataColor.value === 'custom' ? { '--chip-accent': props.color } : undefined),
  ...(props.maxWidth ? { '--chip-max-width': props.maxWidth } : undefined),
}))

const iconOnly = computed(() => !props.label && Boolean(props.iconStart || props.iconEnd))

/* Delete / Backspace anywhere in a closable chip asks the parent to remove it */
const onKeydown = (event: KeyboardEvent) => {
  if (!props.closable || props.disabled) return
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    emit('close')
  }
}
</script>

<template>
  <span
    class="ds-chip"
    :style="style"
    :data-size="size"
    :data-color="dataColor"
    :data-variant="variant"
    :data-shape="shape"
    :data-interactive="tag() !== 'span' ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-selected="selected ? '' : undefined"
    :data-closable="closable ? '' : undefined"
    :data-icon-only="iconOnly ? '' : undefined"
    @keydown="onKeydown"
  >
    <component
      :is="tag()"
      class="ds-chip-body"
      v-bind="$attrs"
      :type="tag() === 'button' ? 'button' : undefined"
      :disabled="tag() === 'button' ? disabled || undefined : undefined"
      :href="disabled ? undefined : href"
      :target="href && !disabled ? target : undefined"
      :rel="href && !disabled ? (rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)) : undefined"
      :aria-disabled="tag() === 'a' && disabled ? 'true' : undefined"
      :aria-pressed="tag() === 'button' && selected !== undefined ? String(selected) : undefined"
    >
      <slot name="icon-start">
        <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>
      <span v-if="label" class="ds-chip-label" :title="maxWidth ? label : undefined">
        {{ label }}
      </span>
      <slot name="icon-end">
        <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </component>
    <button
      v-if="closable"
      class="ds-chip-close"
      type="button"
      :disabled="disabled || undefined"
      :aria-label="closeLabel"
      @click.stop="emit('close')"
    >
      <Icon v-bind="iconProps(closeIcon)" />
    </button>
  </span>
</template>

<style>
.ds-chip {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: var(--chip-size);
  border: 1px solid var(--chip-border);
  border-radius: var(--chip-radius);
  background-color: var(--chip-bg);
  color: var(--chip-fg);
  font-family: var(--font-sans);
  font-size: var(--chip-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  vertical-align: middle;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out);
}

.ds-chip-body {
  box-sizing: border-box;
  appearance: none;
  margin: 0;
  padding: 0 var(--chip-padding-inline);
  background: none;
  border: none;
  border-radius: inherit;
  display: inline-flex;
  align-items: center;
  gap: var(--chip-gap);
  height: 100%;
  min-width: 0;
  font: inherit;
  color: inherit;
  line-height: 1;
  text-decoration: none;
  /* the focus ring is drawn around the whole chip (see :has below) */
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.ds-chip[data-interactive]:not([data-disabled]) .ds-chip-body {
  cursor: pointer;
}

.ds-chip[data-disabled][data-interactive] .ds-chip-body {
  cursor: not-allowed;
}

.ds-chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: var(--chip-max-width, none);
  /* with the inherited line-height of 1 the box is exactly 1em tall and
     overflow: hidden clips descenders (y, p, q, g, j); a normal line box
     includes them — the chip height is fixed so nothing else moves */
  line-height: normal;
}

.ds-chip .ds-icon {
  --icon-size: var(--chip-icon-size);
}

/* icon-only: equal padding keeps the chip square-ish (pill → circle) */
.ds-chip[data-icon-only] .ds-chip-body {
  padding-inline: calc((var(--chip-size) - 2px - var(--chip-icon-size)) / 2);
}

/* --- variants ---------------------------------------------------- */
/* state rules only redefine --chip-bg / --chip-fg / --chip-border so
   selected / disabled overrides below never fight property specificity */

.ds-chip[data-variant='filled'] {
  --chip-bg: var(--chip-accent);
  --chip-fg: var(--chip-on-accent);
  --chip-border: var(--chip-fill-border);
}

.ds-chip[data-variant='tonal'] {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 15%, transparent);
  --chip-fg: var(--chip-tint);
  --chip-border: transparent;
}

.ds-chip[data-variant='outlined'] {
  --chip-bg: transparent;
  --chip-fg: var(--chip-tint);
  --chip-border: var(--chip-outline);
}

/* --- hover / active (interactive chips only) ---------------------- */
/* :active is read on the body so pressing the close button does not
   flash the whole chip */

.ds-chip[data-variant='filled'][data-interactive]:not([data-disabled]):hover {
  --chip-bg: color-mix(in oklab, var(--chip-accent) 90%, var(--chip-on-accent));
}

.ds-chip[data-variant='filled'][data-interactive]:not([data-disabled]):has(.ds-chip-body:active) {
  --chip-bg: color-mix(in oklab, var(--chip-accent) 82%, var(--chip-on-accent));
}

.ds-chip[data-variant='tonal'][data-interactive]:not([data-disabled]):hover {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 22%, transparent);
}

.ds-chip[data-variant='tonal'][data-interactive]:not([data-disabled]):has(.ds-chip-body:active) {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 30%, transparent);
}

.ds-chip[data-variant='outlined'][data-interactive]:not([data-disabled]):hover {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 10%, transparent);
}

.ds-chip[data-variant='outlined'][data-interactive]:not([data-disabled]):has(.ds-chip-body:active) {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 16%, transparent);
}

/* --- selected (filter chip) --------------------------------------- */
/* whatever the variant, selected renders as an emphasized tonal chip
   with a tinted border; must stay after the variant + state rules */

.ds-chip[data-selected]:not([data-disabled]) {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 25%, transparent);
  --chip-fg: var(--chip-tint);
  --chip-border: var(--chip-tint);
}

.ds-chip[data-selected][data-interactive]:not([data-disabled]):hover {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 32%, transparent);
}

.ds-chip[data-selected][data-interactive]:not([data-disabled]):has(.ds-chip-body:active) {
  --chip-bg: color-mix(in oklab, var(--chip-tint) 38%, transparent);
}

/* --- focus --------------------------------------------------------- */

.ds-chip:has(.ds-chip-body:focus-visible) {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

/* --- close button --------------------------------------------------- */

.ds-chip-close {
  box-sizing: border-box;
  appearance: none;
  margin: 0;
  margin-inline-end: calc((var(--chip-size) - var(--chip-close-size)) / 2);
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--chip-close-size);
  height: var(--chip-close-size);
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-150) var(--ease-out);
}

/* the reduced body padding keeps the close button visually balanced */
.ds-chip[data-closable] .ds-chip-body {
  padding-inline-end: calc(var(--chip-padding-inline) / 2);
}

.ds-chip-close .ds-icon {
  --icon-size: calc(var(--chip-icon-size));
}

.ds-chip-close:not(:disabled):hover {
  background-color: color-mix(in oklab, currentColor 12%, transparent);
}

.ds-chip-close:not(:disabled):active {
  background-color: color-mix(in oklab, currentColor 20%, transparent);
}

.ds-chip-close:disabled {
  cursor: not-allowed;
}

.ds-chip-close:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 0;
}
</style>
