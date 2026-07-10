<script setup lang="ts">
import './menu.tokens.css'
</script>

<template>
  <hr class="ds-menu-separator" />
</template>

<style>
.ds-menu-separator {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  border: 0;
  border-top: 1px solid var(--menu-separator-color);
  /* full-bleed: cancel the panel padding on both sides */
  margin: var(--spacing-1) calc(-1 * var(--menu-padding));
}
</style>
