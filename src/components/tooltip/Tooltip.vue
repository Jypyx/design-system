<script setup lang="ts">
import './tooltip.tokens.css'
import { onBeforeUnmount, onMounted, useId, useTemplateRef, watch } from 'vue'
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

/* one dashed-ident per instance ties the trigger (anchor-name) to its
   popover (position-anchor); all placement logic then lives in CSS */
const uid = useId()
const tooltipId = `ds-tooltip-${uid}`
const anchorName = `--ds-tooltip-${uid}`

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
      class="ds-tooltip"
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

.ds-tooltip {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  /* undo the UA popover styles (inset: 0 + margin: auto) so the
     position-area grid cell does the placement instead */
  position: fixed;
  inset: auto;
  margin: var(--tooltip-gap);
  border: 0;
  width: max-content;
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

  /* hide the bubble when its anchor scrolls out of view */
  position-visibility: anchors-visible;
}

/* --- placement (CSS anchor positioning) ------------------------- */
/* the popover is laid out in the 3×3 position-area grid around its
   anchor; the margin above acts as the anchor↔bubble gap */

.ds-tooltip[data-placement='top'] {
  position-area: top;
}

.ds-tooltip[data-placement='top-start'] {
  position-area: top span-right;
}

.ds-tooltip[data-placement='top-end'] {
  position-area: top span-left;
}

.ds-tooltip[data-placement='bottom'] {
  position-area: bottom;
}

.ds-tooltip[data-placement='bottom-start'] {
  position-area: bottom span-right;
}

.ds-tooltip[data-placement='bottom-end'] {
  position-area: bottom span-left;
}

.ds-tooltip[data-placement='left'] {
  position-area: left;
}

.ds-tooltip[data-placement='right'] {
  position-area: right;
}

/* --- position-try fallbacks -------------------------------------- */
/* when the preferred side would overflow the viewport, flip on the
   main axis first, then the cross axis, then both */

.ds-tooltip[data-placement^='top'],
.ds-tooltip[data-placement^='bottom'] {
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
}

.ds-tooltip[data-placement='left'],
.ds-tooltip[data-placement='right'] {
  position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline;
}

/* --- enter / exit transition -------------------------------------- */

.ds-tooltip {
  opacity: 0;
  transform: scale(0.96);
  transition:
    opacity var(--duration-150) var(--ease-out),
    transform var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-tooltip:popover-open {
  opacity: 1;
  transform: none;
}

@starting-style {
  .ds-tooltip:popover-open {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
