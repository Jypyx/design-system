<script setup lang="ts">
import './tabs.tokens.css'
import { iconProps } from '../shared/utils'
import { computed, inject, onUnmounted } from 'vue'
import Icon from '../icon/Icon.vue'
import { tabsKey } from './Tabs.types'
import type { TabProps } from './Tabs.types'

const props = withDefaults(defineProps<TabProps>(), { disabled: false })

/* a Tab only makes sense against the selection its Tabs group owns */
const injected = inject(tabsKey)
if (!injected) throw new Error('[design-system] <Tab> must be a descendant of <Tabs>')
const tabs = injected

const selected = computed(() => tabs.isSelected(props.value))

onUnmounted(
  tabs.register({
    value: computed(() => props.value),
    disabled: computed(() => props.disabled),
  }),
)
</script>

<template>
  <button
    :id="tabs.tabId(value)"
    type="button"
    class="ds-tab"
    role="tab"
    :aria-selected="selected ? 'true' : 'false'"
    :aria-controls="tabs.panelId(value)"
    :aria-label="label"
    :tabindex="tabs.isTabbable(value) ? 0 : -1"
    :disabled="disabled || undefined"
    :data-variant="tabs.variant.value"
    :data-orientation="tabs.orientation.value"
    :data-icon-only="icon || label ? '' : undefined"
    @click="tabs.select(value)"
  >
    <slot name="icon">
      <Icon v-if="iconStart || icon" v-bind="iconProps((iconStart || icon)!)" />
    </slot>
    <slot />
  </button>
</template>

<style>
.ds-tab {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--tabs-gap);
  height: var(--tabs-height);
  padding: 0 var(--tabs-padding-inline);
  border: none;
  border-radius: var(--tabs-radius);
  background-color: transparent;
  color: var(--tabs-text);
  font-family: var(--font-sans);
  font-size: var(--tabs-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  /* never squeezed by the scroll container */
  flex: none;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out),
    color var(--duration-150) var(--ease-out),
    box-shadow var(--duration-150) var(--ease-out);
}

.ds-tab:focus-visible {
  /* inset ring: an outside ring would be clipped by the scrolling bar */
  outline: var(--focus-ring);
  outline-offset: -2px;
}

.ds-tab:hover:not(:disabled) {
  color: var(--text);
  background-color: color-mix(in oklab, var(--tabs-tint) 8%, transparent);
}

.ds-tab:active:not(:disabled) {
  background-color: color-mix(in oklab, var(--tabs-tint) 14%, transparent);
}

/* --- line: underline indicator ------------------------------------- */
/* the indicator rides the border-box so a selected tab keeps exactly
   the same height as the others */

.ds-tab[data-variant='line'] {
  border-block-end: var(--tabs-indicator-size) solid transparent;
  border-start-start-radius: var(--tabs-radius);
  border-start-end-radius: var(--tabs-radius);
  border-end-start-radius: 0;
  border-end-end-radius: 0;
}

/* only the extremities keep a rounded top corner: the inner edges of
   middle tabs stay square so the hover washes read as one strip */
.ds-tab[data-variant='line'][data-orientation='horizontal']:not(:first-child) {
  border-start-start-radius: 0;
}

.ds-tab[data-variant='line'][data-orientation='horizontal']:not(:last-child) {
  border-start-end-radius: 0;
}

.ds-tab[data-variant='line'][aria-selected='true'] {
  color: var(--tabs-tint);
  border-color: var(--tabs-tint);
}

/* vertical: the indicator moves to the inline-start edge */
.ds-tab[data-variant='line'][data-orientation='vertical'] {
  border-block-end: none;
  border-inline-start: var(--tabs-indicator-size) solid transparent;
  border-start-start-radius: 0;
  border-start-end-radius: var(--tabs-radius);
  border-end-start-radius: 0;
  border-end-end-radius: var(--tabs-radius);
}

.ds-tab[data-variant='line'][data-orientation='vertical']:not(:first-child) {
  border-start-end-radius: 0;
}

.ds-tab[data-variant='line'][data-orientation='vertical']:not(:last-child) {
  border-end-end-radius: 0;
}

.ds-tab[data-variant='line'][data-orientation='vertical'][aria-selected='true'] {
  border-color: var(--tabs-tint);
}

/* --- inset: the selected tab is an elevated pill --------------------- */

.ds-tab[data-variant='inset'][aria-selected='true'] {
  background-color: var(--tabs-accent);
  color: var(--tabs-on-accent);
  box-shadow: var(--shadow-sm);
}

.ds-tab[data-variant='inset'][aria-selected='true']:hover:not(:disabled) {
  background-color: color-mix(in oklab, var(--tabs-accent) 92%, var(--tabs-on-accent));
}

/* --- icon-only: exactly as wide as it is tall ------------------------ */

.ds-tab[data-icon-only] {
  min-width: var(--tabs-height);
  padding: 0;
}

/* --- disabled --------------------------------------------------------- */
/* colors are greyed out via the token overrides in tabs.tokens.css */

.ds-tab:disabled {
  cursor: not-allowed;
  box-shadow: none;
}

/* --- icons ------------------------------------------------------------ */

.ds-tab > .ds-icon {
  --icon-size: var(--tabs-icon-size);
}
</style>
