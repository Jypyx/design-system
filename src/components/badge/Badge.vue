<script setup lang="ts">
import './badge.tokens.css'
import { isSemanticColor } from '../shared/colors'
import { computed, useSlots } from 'vue'
import type { BadgeProps } from './Badge.types'

const props = withDefaults(defineProps<BadgeProps>(), {
  size: 'sm',
  color: 'primary',
  variant: 'filled',
})

const slots = useSlots()

/* an element in the default slot switches the badge to overlay mode */
const hasHost = computed(() => Boolean(slots.default))

const dataColor = computed(() => (isSemanticColor(props.color) ? props.color : 'custom'))

const colorStyle = computed(() =>
  dataColor.value === 'custom' ? { '--badge-accent': props.color } : undefined,
)
</script>

<template>
  <span v-if="hasHost" class="ds-badge-host">
    <slot />
    <span
      class="ds-badge"
      :style="colorStyle"
      data-overlay
      :data-size="size"
      :data-color="dataColor"
      :data-variant="variant"
    >
      <template v-if="size !== 'dot'">{{ content }}</template>
    </span>
  </span>
  <span
    v-else
    class="ds-badge"
    :style="colorStyle"
    :data-size="size"
    :data-color="dataColor"
    :data-variant="variant"
  >
    <template v-if="size !== 'dot'">{{ content }}</template>
  </span>
</template>

<style>
.ds-badge-host {
  position: relative;
  display: inline-flex;
}

.ds-badge {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  height: var(--badge-size);
  min-width: var(--badge-size); /* a single digit stays perfectly round */
  padding-inline: var(--badge-padding-inline);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: var(--badge-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  vertical-align: middle;
}

/* --- variants ---------------------------------------------------- */
/* tonal and outlined mix / sit on --surface instead of transparent:
   an overlaid badge must not let the host element show through */

.ds-badge[data-variant='filled'] {
  background-color: var(--badge-accent);
  border-color: var(--badge-fill-border);
  color: var(--badge-on-accent);
}

.ds-badge[data-variant='tonal'] {
  background-color: color-mix(in oklab, var(--badge-tint) 15%, var(--surface));
  color: var(--badge-tint);
}

.ds-badge[data-variant='outlined'] {
  background-color: var(--surface);
  border-color: var(--badge-outline);
  color: var(--badge-tint);
}

/* --- overlay: centered on the top end corner of the host --------- */

.ds-badge[data-overlay] {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  transform: translate(50%, -50%);
  z-index: 1;
}
</style>
