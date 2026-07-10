<script setup lang="ts">
import './icon.tokens.css'
import type { IconProps } from './Icon.types'

withDefaults(defineProps<IconProps>(), {
  filled: false,
})
</script>

<template>
  <span
    class="ds-icon"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    :data-filled="filled ? '' : undefined"
  >
    <slot>
      <span v-if="name" class="ds-icon-symbol">{{ name }}</span>
      <img v-else-if="src" class="ds-icon-img" :src="src" alt="" />
    </slot>
  </span>
</template>

<style>
.ds-icon {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  flex: none;
  overflow: hidden;
  /* optical alignment next to inline text */
  vertical-align: -0.125em;
  user-select: none;
}

/* slotted SVGs and images fill the box; SVGs should use
   currentColor themselves to inherit the surrounding text color */
.ds-icon > :where(svg, img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ds-icon-symbol {
  font-family: 'Material Symbols Rounded';
  /* 1em here resolves against the inherited (parent) font-size */
  font-size: var(--icon-size);
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  font-variation-settings:
    'FILL' var(--icon-fill),
    'wght' var(--icon-weight),
    'GRAD' var(--icon-grade),
    'opsz' var(--icon-optical-size);
  transition: font-variation-settings var(--duration-150) var(--ease-out);
}
</style>
