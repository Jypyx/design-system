<script setup lang="ts">
import './menu.tokens.css'
import Typography from '../typography/Typography.vue'
import type { MenuLabelProps } from './Menu.types'

defineProps<MenuLabelProps>()
</script>

<template>
  <Typography as="div" variant="overline" class="ds-menu-label" role="presentation">
    <slot>{{ label }}</slot>
  </Typography>
</template>

<style>
.ds-typography.ds-menu-label {
  --typo-size: var(--menu-label-font-size);
  --typo-color: var(--menu-label-color);

  padding: var(--spacing-2) var(--menu-item-padding-inline) var(--spacing-1);
  user-select: none;
}
</style>
