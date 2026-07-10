<script setup lang="ts">
import './menu.tokens.css'
import type { MenuLabelProps } from './Menu.types'

defineProps<MenuLabelProps>()
</script>

<template>
  <div class="ds-menu-label" role="presentation">
    <slot>{{ label }}</slot>
  </div>
</template>

<style>
.ds-menu-label {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  padding: var(--spacing-2) var(--menu-item-padding-inline) var(--spacing-1);
  font-family: var(--font-sans);
  font-size: var(--menu-label-font-size);
  line-height: var(--text-xs--line-height);
  font-weight: var(--font-weight-medium);
  color: var(--menu-label-color);
  user-select: none;
  text-transform: uppercase;
}
</style>
