<script setup lang="ts">
import './button-group.tokens.css'
import type { ButtonGroupProps } from './ButtonGroup.types'

defineProps<ButtonGroupProps>()
</script>

<template>
  <div class="ds-btn-group" role="group" :aria-label="label">
    <slot />
  </div>
</template>

<style>
.ds-btn-group {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  isolation: isolate;
}

.ds-btn-group > .ds-btn {
  position: relative;
}

/* glue: inner corners lose their radius, only the extremities of the
   group stay rounded (logical properties, so RTL comes for free) */
.ds-btn-group > .ds-btn:not(:first-child) {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
  /* collapse the double border where two buttons meet */
  margin-inline-start: -1px;
}

.ds-btn-group > .ds-btn:not(:last-child) {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

/* the hovered / focused button paints above its neighbors so its
   merged border and focus ring are never clipped by the next button */
.ds-btn-group > .ds-btn:is(:hover, :focus-visible) {
  z-index: 1;
}
</style>
