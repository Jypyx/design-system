<script setup lang="ts">
import './breadcrumb.tokens.css'
import { computed } from 'vue'
import Button from '../button/Button.vue'
import Icon from '../icon/Icon.vue'
import Menu from '../menu/Menu.vue'
import MenuItem from '../menu/MenuItem.vue'
import type { BreadcrumbItem, BreadcrumbProps } from './Breadcrumb.types'

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  separator: 'chevron_right',
  label: 'Breadcrumb',
  moreLabel: 'Show hidden items',
})

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })

/* collapsed trail: first crumb, "…" menu with the middle crumbs, then the
   last two; a short-enough trail leaves hiddenItems empty and the menu out */
const collapsed = computed(
  () => props.maxItems !== undefined && props.items.length > props.maxItems,
)
const startItems = computed(() => (collapsed.value ? props.items.slice(0, 1) : props.items))
const hiddenItems = computed(() => (collapsed.value ? props.items.slice(1, -2) : []))
const endItems = computed(() => (collapsed.value ? props.items.slice(-2) : []))

const currentPath = computed(
  () => props.currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
)
const isCurrent = (item: BreadcrumbItem) => item.href === currentPath.value
</script>

<template>
  <nav class="ds-breadcrumb" :aria-label="label">
    <ol class="ds-breadcrumb-list">
      <li v-for="(item, i) in startItems" :key="`start-${item.href}`" class="ds-breadcrumb-item">
        <a
          class="ds-breadcrumb-link"
          :href="item.href"
          :aria-current="isCurrent(item) ? 'page' : undefined"
        >
          <Icon v-if="item.iconStart" v-bind="iconProps(item.iconStart)" />
          {{ item.label }}
        </a>
        <Icon
          v-if="collapsed || i < startItems.length - 1"
          class="ds-breadcrumb-separator"
          aria-hidden="true"
          v-bind="iconProps(separator)"
        />
      </li>

      <li v-if="hiddenItems.length" class="ds-breadcrumb-item">
        <Menu dense placement="bottom-start">
          <Button size="xs" variant="text" color="neutral" icon="more_horiz" :label="moreLabel" />
          <template #items>
            <MenuItem
              v-for="item in hiddenItems"
              :key="`hidden-${item.href}`"
              :label="item.label"
              :href="item.href"
              :icon-start="item.iconStart"
              :aria-current="isCurrent(item) ? 'page' : undefined"
            />
          </template>
        </Menu>
        <Icon class="ds-breadcrumb-separator" aria-hidden="true" v-bind="iconProps(separator)" />
      </li>

      <li v-for="(item, i) in endItems" :key="`end-${item.href}`" class="ds-breadcrumb-item">
        <a
          class="ds-breadcrumb-link"
          :href="item.href"
          :aria-current="isCurrent(item) ? 'page' : undefined"
        >
          <Icon v-if="item.iconStart" v-bind="iconProps(item.iconStart)" />
          {{ item.label }}
        </a>
        <Icon
          v-if="i < endItems.length - 1"
          class="ds-breadcrumb-separator"
          aria-hidden="true"
          v-bind="iconProps(separator)"
        />
      </li>
    </ol>
  </nav>
</template>

<style>
.ds-breadcrumb {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--breadcrumb-font-size);
  line-height: var(--breadcrumb-line-height);
}

.ds-breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--breadcrumb-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: var(--breadcrumb-gap);
}

/* --- crumb links --------------------------------------------------- */

.ds-breadcrumb-link {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--breadcrumb-item-padding-block) var(--breadcrumb-item-padding-inline);
  border-radius: var(--breadcrumb-item-radius);
  color: var(--breadcrumb-color);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--duration-150) var(--ease-out),
    background-color var(--duration-150) var(--ease-out);
}

.ds-breadcrumb-link:hover {
  color: var(--breadcrumb-color-hover);
}

.ds-breadcrumb-link:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.ds-breadcrumb-link .ds-icon {
  --icon-size: var(--breadcrumb-icon-size);
}

/* the last crumb (usually the current page) stands out from the trail */
.ds-breadcrumb-item:last-child .ds-breadcrumb-link,
.ds-breadcrumb-link[aria-current='page'] {
  color: var(--breadcrumb-current-color);
  font-weight: var(--breadcrumb-current-weight);
}

/* --- separators ----------------------------------------------------- */

.ds-breadcrumb-separator {
  --icon-size: var(--breadcrumb-icon-size);

  flex: none;
  color: var(--breadcrumb-separator-color);
}

/* directional separators (chevrons, arrows) must point backwards in RTL */
.ds-breadcrumb:dir(rtl) .ds-breadcrumb-separator {
  transform: scaleX(-1);
}
</style>
