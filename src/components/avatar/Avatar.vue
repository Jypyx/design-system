<script setup lang="ts">
import './avatar.tokens.css'
import { iconProps } from '../shared/utils'
import { isSemanticColor } from '../shared/colors'
import { computed, ref, useAttrs, watch } from 'vue'
import type { FunctionalComponent } from 'vue'
import Icon from '../icon/Icon.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import type { AvatarProps } from './Avatar.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'sm',
  color: 'auto',
  tooltip: false,
})

/* renders the avatar bare when no tooltip is requested */
const Passthrough: FunctionalComponent = (_, { slots }) => slots.default?.()

const attrs = useAttrs()

/* attrs is not reactive — a plain function keeps the check per-render */
const tag = () => (props.href ? 'a' : 'onClick' in attrs ? 'button' : 'span')

const imgFailed = ref(false)
watch(
  () => props.src,
  () => (imgFailed.value = false),
)
const showImg = computed(() => Boolean(props.src) && !imgFailed.value)

const initials = computed(() => {
  const words = (props.name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = [...words[0]][0]
  return words.length === 1
    ? first.toUpperCase()
    : (first + [...words[words.length - 1]][0]).toUpperCase()
})

/* 'auto' hashes the content into a hue (djb2) — only this number is
   computed in TS, the color itself is built in CSS from --avatar-hue */
const hue = computed(() => {
  const seed = props.name ?? props.text ?? props.icon ?? ''
  let hash = 0
  for (const char of seed) hash = (hash << 5) - hash + (char.codePointAt(0) ?? 0)
  return ((hash % 360) + 360) % 360
})

const dataColor = computed(() =>
  props.color === 'auto' || isSemanticColor(props.color) ? props.color : 'custom',
)

const colorStyle = computed(() =>
  props.color === 'auto'
    ? { '--avatar-hue': String(hue.value) }
    : dataColor.value === 'custom'
      ? { '--avatar-accent': props.color }
      : undefined,
)

const tooltipText = computed(() =>
  typeof props.tooltip === 'string' ? props.tooltip : props.tooltip ? props.name : undefined,
)

/* the image variant carries its name through the img alt instead */
const ariaLabel = computed(() => (showImg.value ? undefined : props.name || undefined))
</script>

<template>
  <component :is="tooltip ? Tooltip : Passthrough" :content="tooltipText">
    <component
      :is="tag()"
      v-bind="$attrs"
      class="ds-avatar"
      :style="colorStyle"
      :type="tag() === 'button' ? 'button' : undefined"
      :href="href"
      :target="href ? target : undefined"
      :rel="href ? (rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)) : undefined"
      :role="tag() === 'span' && ariaLabel ? 'img' : undefined"
      :aria-label="ariaLabel"
      :data-size="size"
      :data-color="dataColor"
    >
      <img
        v-if="showImg"
        class="ds-avatar-img"
        :src="src"
        :alt="alt ?? name ?? ''"
        @error="imgFailed = true"
      />
      <Icon v-else-if="icon" v-bind="iconProps(icon)" />
      <span
        v-else-if="text || initials"
        class="ds-avatar-text"
        :aria-hidden="ariaLabel ? 'true' : undefined"
      >
        {{ text || initials }}
      </span>
    </component>
  </component>
</template>

<style>
.ds-avatar {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--avatar-size);
  height: var(--avatar-size);
  border: 1px solid var(--avatar-border);
  border-radius: var(--radius-full);
  overflow: hidden; /* crops the image to the circle */
  background-color: var(--avatar-accent);
  color: var(--avatar-on-accent);
  font-family: var(--font-sans);
  font-size: var(--avatar-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  user-select: none;
  vertical-align: middle;
  -webkit-tap-highlight-color: transparent;
}

.ds-avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ds-avatar > .ds-icon {
  --icon-size: var(--avatar-icon-size);
}

/* --- interactive (a / button) ----------------------------------- */
/* filter instead of a background shift so the hover affordance stays
   visible under a photo */

.ds-avatar:is(a, button) {
  cursor: pointer;
  transition: filter var(--duration-150) var(--ease-out);
}

.ds-avatar:is(a, button):hover {
  filter: brightness(1.08);
}

.ds-avatar:is(a, button):active {
  filter: brightness(0.94);
}

.ds-avatar:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
</style>
