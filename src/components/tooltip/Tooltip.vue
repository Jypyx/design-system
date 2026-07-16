<script setup lang="ts">
import './tooltip.tokens.css'
import '../../styles/shared/popover.css'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useAnchor } from '../shared/use-anchor'
import type { TooltipProps } from './Tooltip.types'

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top',
  openDelay: 300,
  closeDelay: 100,
  disabled: false,
  open: undefined,
})

/* controlled mode: the open prop drives visibility, built-in triggers are off */
const isControlled = () => props.open !== undefined

const { id: tooltipId, anchorName } = useAnchor('tooltip')

const trigger = useTemplateRef<HTMLElement>('trigger')
const tooltip = useTemplateRef<HTMLElement>('tooltip')

let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

function show() {
  const el = tooltip.value
  if (el?.showPopover && !el.matches(':popover-open')) el.showPopover()
}

function hide() {
  const el = tooltip.value
  if (el?.hidePopover && el.matches(':popover-open')) el.hidePopover()
}

function onHoverIn() {
  if (isControlled()) return
  clearTimeout(closeTimer)
  if (props.disabled) return
  openTimer = setTimeout(show, props.openDelay)
}

function onHoverOut() {
  if (isControlled()) return
  clearTimeout(openTimer)
  closeTimer = setTimeout(hide, props.closeDelay)
}

function onFocusIn() {
  if (isControlled()) return
  clearTimeout(closeTimer)
  if (!props.disabled) show()
}

function onFocusOut() {
  if (isControlled()) return
  clearTimeout(openTimer)
  hide()
}

function onKeydown(event: KeyboardEvent) {
  if (isControlled()) return
  if (event.key === 'Escape') {
    clearTimeout(openTimer)
    hide()
  }
}

watch(
  () => props.open,
  (value) => (value ? show() : hide()),
)

onMounted(() => {
  if (props.open) show()

  /* describe the slotted trigger element (if any) for screen readers;
     the popover itself is excluded since it is also a child */
  const target = Array.from(trigger.value?.children ?? []).find((el) => el !== tooltip.value)
  if (target && !target.hasAttribute('aria-describedby'))
    target.setAttribute('aria-describedby', tooltipId)
})

onBeforeUnmount(() => {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
})
</script>

<template>
  <span
    ref="trigger"
    class="ds-tooltip-trigger"
    :style="`anchor-name: ${anchorName}`"
    @mouseenter="onHoverIn"
    @mouseleave="onHoverOut"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @keydown="onKeydown"
  >
    <slot />
    <div
      :id="tooltipId"
      ref="tooltip"
      class="ds-tooltip ds-popover"
      role="tooltip"
      popover="hint"
      :data-placement="placement"
      :style="`position-anchor: ${anchorName}`"
    >
      <slot name="content">{{ content }}</slot>
    </div>
  </span>
</template>

<style>
.ds-tooltip-trigger {
  /* shrink-wraps the slotted trigger; generates the anchor box */
  display: inline-block;
  max-width: 100%;
}

/* geometry, placement map and transition come from the shared
   .ds-popover partial */
.ds-tooltip {
  --popover-gap: var(--tooltip-gap);
  --popover-scale: 0.96;
  max-width: var(--tooltip-max-width);
  padding: var(--tooltip-padding-block) var(--tooltip-padding-inline);
  border-radius: var(--tooltip-radius);
  background-color: var(--tooltip-bg);
  color: var(--tooltip-color);
  box-shadow: var(--tooltip-shadow);
  font-family: var(--font-sans);
  font-size: var(--tooltip-font-size);
  font-weight: var(--tooltip-font-weight);
  line-height: var(--tooltip-line-height);
  overflow-wrap: break-word;
}
</style>
