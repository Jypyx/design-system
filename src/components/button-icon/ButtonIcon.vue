<script setup lang="ts">
import './button-icon.tokens.css'
import Button from '../button/Button.vue'
import Icon from '../icon/Icon.vue'
import type { ButtonIconProps } from './ButtonIcon.types'

withDefaults(defineProps<ButtonIconProps>(), {
  shape: 'square',
  size: 'sm',
  color: 'neutral',
  variant: 'flat',
  disabled: false,
  isLoading: false,
  type: 'button',
})

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })
</script>

<template>
  <Button
    class="ds-icon-btn"
    :aria-label="label"
    :data-shape="shape"
    :size="size"
    :color="color"
    :variant="variant"
    :disabled="disabled"
    :href="href"
    :target="target"
    :rel="rel"
    :is-loading="isLoading"
    :type="type"
  >
    <template #icon-start>
      <slot>
        <Icon v-if="icon" v-bind="iconProps(icon)" />
      </slot>
    </template>
  </Button>
</template>

<style>
.ds-icon-btn {
  /* icon-only: the button is exactly as wide as it is tall */
  width: var(--btn-height);
  flex: none;
}
</style>
