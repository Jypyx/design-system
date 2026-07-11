<script setup lang="ts">
import './tabs.tokens.css'
import { computed, inject } from 'vue'
import { tabsKey } from './Tabs.types'
import type { TabPanelProps } from './Tabs.types'

const props = defineProps<TabPanelProps>()

/* a TabPanel only makes sense against the selection its Tabs group owns */
const injected = inject(tabsKey)
if (!injected) throw new Error('[design-system] <TabPanel> must be a descendant of <Tabs>')
const tabs = injected

/* hidden (not unmounted) when another tab is selected: the panel keeps
   its state and its id stays resolvable for the tab's aria-controls */
const selected = computed(() => tabs.isSelected(props.value))
</script>

<template>
  <div
    :id="tabs.panelId(value)"
    class="ds-tabs-panel"
    role="tabpanel"
    :aria-labelledby="tabs.tabId(value)"
    :hidden="!selected"
    tabindex="0"
  >
    <slot />
  </div>
</template>

<style>
.ds-tabs-panel {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--tabs-font-size);
  color: var(--text);
}

/* focusable (tabindex="0") so keyboard users can reach panel content
   that has no focusable element of its own — WAI-ARIA tabs pattern */
.ds-tabs-panel:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
</style>
