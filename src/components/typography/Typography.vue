<script setup lang="ts">
import { computed } from 'vue'
import './typography.tokens.css'
import type { TypographyProps, TypographyTag, TypographyVariant } from './Typography.types'

const props = withDefaults(defineProps<TypographyProps>(), {
  variant: 'body',
  color: 'default',
  truncate: false,
})

/* variant → default tag; `as` always wins */
const defaultTag: Record<TypographyVariant, TypographyTag> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle: 'p',
  body: 'p',
  label: 'span',
  caption: 'span',
  overline: 'span',
}

const tag = computed(() => props.as ?? defaultTag[props.variant])
</script>

<template>
  <component
    :is="tag"
    class="ds-typography"
    :data-variant="variant"
    :data-color="color !== 'default' ? color : undefined"
    :data-truncate="truncate ? '' : undefined"
  >
    <slot />
  </component>
</template>

<style>
.ds-typography {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--typo-size);
  line-height: var(--typo-line-height);
  font-weight: var(--typo-weight);
  letter-spacing: var(--typo-tracking);
  text-transform: var(--typo-transform, none);
  color: var(--typo-color);
}

.ds-typography[data-truncate] {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
