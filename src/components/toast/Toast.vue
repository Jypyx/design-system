<script setup lang="ts">
import './toast.tokens.css'
import { computed, onBeforeUnmount } from 'vue'
import Icon from '../icon/Icon.vue'
import { dismissAllToasts, dismissToast, pauseToast, resumeToast, toasts } from './toast.ts'
import type { ToastItem, ToastPosition } from './Toast.types.ts'

/* toasts are grouped into one fixed stack per screen corner/edge */
const stacks = computed(() => {
  const groups = new Map<ToastPosition, ToastItem[]>()
  for (const item of toasts.value) {
    const group = groups.get(item.position)
    if (group) group.push(item)
    else groups.set(item.position, [item])
  }
  return groups
})

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })

/* popover="manual" puts each stack in the top layer (above dialogs and
   other popovers) without light dismiss; it must be shown from script,
   which the ref callback does as soon as a stack mounts. showPopover is
   feature-checked so unsupported browsers fall back to plain fixed
   positioning. */
function showStack(el: unknown) {
  if (el instanceof HTMLElement && el.showPopover && !el.matches(':popover-open')) el.showPopover()
}

/* unmounting the outlet tears down the queue, timers included */
onBeforeUnmount(dismissAllToasts)
</script>

<template>
  <div
    v-for="[position, items] in stacks"
    :key="position"
    :ref="showStack"
    class="ds-toast-stack"
    popover="manual"
    role="region"
    aria-label="Notifications"
    :data-position="position"
  >
    <div
      v-for="item in items"
      :key="item.id"
      class="ds-toast"
      :role="item.color === 'danger' ? 'alert' : 'status'"
      :data-color="item.color"
      :data-size="item.size"
      @mouseenter="pauseToast(item.id)"
      @mouseleave="resumeToast(item.id)"
    >
      <Icon v-bind="iconProps(item.icon)" />
      <div class="ds-toast-content">
        <p v-if="item.title" class="ds-toast-title">{{ item.title }}</p>
        <p class="ds-toast-message">{{ item.message }}</p>
      </div>
      <button
        v-if="item.closable"
        class="ds-toast-close"
        type="button"
        aria-label="Dismiss notification"
        @click="dismissToast(item.id)"
      >
        <Icon name="close" />
      </button>
    </div>
  </div>
</template>

<style>
.ds-toast-stack {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  /* undo the UA popover styles (inset: 0 + margin: auto + border); each
     stack pins to its screen corner/edge below */
  position: fixed;
  inset: auto;
  margin: 0;
  padding: var(--toast-screen-gap);
  border: 0;
  width: max-content;
  max-width: 100%;
  background: transparent;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: var(--toast-stack-gap);
  /* the stack rectangle (padding, gaps) must not block the page under it;
     each toast re-enables its own pointer events */
  pointer-events: none;
}

/* the newest toast always lands next to the screen edge: bottom stacks
   append downward, top stacks reverse so the last item renders first */
.ds-toast-stack[data-position^='top'] {
  top: 0;
  flex-direction: column-reverse;
}

.ds-toast-stack[data-position^='bottom'] {
  bottom: 0;
}

.ds-toast-stack[data-position$='left'] {
  left: 0;
  align-items: flex-start;
}

.ds-toast-stack[data-position$='right'] {
  right: 0;
  align-items: flex-end;
}

.ds-toast-stack[data-position$='center'] {
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

/* --- toast ------------------------------------------------------- */

.ds-toast {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--toast-gap);
  width: min(var(--toast-width), calc(100vw - 2 * var(--toast-screen-gap)));
  padding: var(--toast-padding);
  border-radius: var(--toast-radius);
  background-color: var(--toast-bg);
  color: var(--toast-color);
  box-shadow: var(--toast-shadow);
  font-family: var(--font-sans);
  text-align: start;
  pointer-events: auto;
}

/* status icon, top-left; sized to match the first text line box */
.ds-toast > .ds-icon {
  --icon-size: var(--toast-icon-size);
}

/* --- content ------------------------------------------------------ */

.ds-toast-content {
  flex: 1;
  min-width: 0;
}

.ds-toast-title,
.ds-toast-message {
  margin: 0;
  overflow-wrap: break-word;
}

.ds-toast-title {
  font-size: var(--toast-title-font-size);
  line-height: var(--toast-title-line-height);
  font-weight: var(--font-weight-semibold);
}

.ds-toast-message {
  font-size: var(--toast-font-size);
  line-height: var(--toast-line-height);
  font-weight: var(--font-weight-normal);
}

.ds-toast-title + .ds-toast-message {
  margin-top: var(--spacing-0\.5);
}

/* --- close button --------------------------------------------------- */

.ds-toast-close {
  box-sizing: border-box;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  /* negative margin grows the hit area without inflating the layout */
  margin: calc(-1 * var(--spacing-1)) calc(-1 * var(--spacing-1)) 0 0;
  padding: var(--spacing-1);
  border: 0;
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.8;
  transition:
    background-color var(--duration-150) var(--ease-out),
    opacity var(--duration-150) var(--ease-out);
}

.ds-toast-close:hover {
  opacity: 1;
  background-color: color-mix(in oklab, currentColor 15%, transparent);
}

.ds-toast-close:focus-visible {
  /* currentColor instead of the primary focus ring: it stays visible on
     every accent background */
  outline: 2px solid currentColor;
  outline-offset: 1px;
  opacity: 1;
}

.ds-toast-close > .ds-icon {
  --icon-size: var(--toast-close-icon-size);
}

/* --- enter transition ---------------------------------------------- */
/* toasts slide in from the screen edge they stack against */

.ds-toast {
  transition:
    opacity var(--duration-300) var(--ease-out),
    transform var(--duration-300) var(--ease-out);
}

@starting-style {
  .ds-toast {
    opacity: 0;
    transform: translateY(var(--spacing-4));
  }

  .ds-toast-stack[data-position^='top'] .ds-toast {
    transform: translateY(calc(-1 * var(--spacing-4)));
  }
}
</style>
