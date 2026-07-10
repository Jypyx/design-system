<script setup lang="ts">
import './menu.tokens.css'
import { onMounted, useId, useTemplateRef } from 'vue'
import type { MenuProps } from './Menu.types'

const props = withDefaults(defineProps<MenuProps>(), {
  placement: 'bottom-start',
  disabled: false,
  dense: false,
})

/* one dashed-ident per instance ties the trigger (anchor-name) to its
   popover (position-anchor); all placement logic then lives in CSS */
const uid = useId()
const menuId = `ds-menu-${uid}`
const anchorName = `--ds-menu-${uid}`

const trigger = useTemplateRef<HTMLElement>('trigger')
const popover = useTemplateRef<HTMLElement>('popover')

/* the slotted trigger element, for aria-expanded bookkeeping */
let triggerControl: Element | undefined

/* enabled items of one menu level only — items of nested submenus have a
   closer .ds-menu-popover ancestor and are filtered out */
function itemsOf(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>('.ds-menu-item:enabled')).filter(
    (el) => el.closest('.ds-menu-popover') === menu,
  )
}

function open(focusLast = false) {
  const el = popover.value
  if (!el || el.matches(':popover-open')) return
  el.showPopover()
  const items = itemsOf(el)
  ;(focusLast ? items[items.length - 1] : items[0])?.focus()
}

/* light dismiss already hides the popover on pointerup when clicking the
   trigger; remember the state at pointerdown so the click that follows
   does not immediately reopen it */
let wasOpenOnPointerdown = false

function onTriggerPointerdown(event: PointerEvent) {
  if (popover.value?.contains(event.target as Node)) return
  wasOpenOnPointerdown = popover.value?.matches(':popover-open') ?? false
}

function onTriggerClick(event: MouseEvent) {
  const wasOpen = wasOpenOnPointerdown
  wasOpenOnPointerdown = false
  const el = popover.value
  /* clicks inside the panel (a DOM child) are not trigger clicks */
  if (props.disabled || !el || el.contains(event.target as Node)) return
  if (wasOpen || el.matches(':popover-open')) {
    /* light dismiss usually closed it already on pointerup */
    if (el.matches(':popover-open')) el.hidePopover()
    return
  }
  open()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled || popover.value?.contains(event.target as Node)) return
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  open(event.key === 'ArrowUp')
}

/* keyboard navigation for every level: submenu popovers are DOM children
   of this panel, so their keydowns all bubble through here */
function onMenuKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  const menu = target.closest<HTMLElement>('.ds-menu-popover')
  if (!menu) return
  const item = target.closest<HTMLElement>('.ds-menu-item')
  /* an item's submenu panel is its immediate next sibling (see MenuItem) */
  const submenu =
    item?.nextElementSibling instanceof HTMLElement &&
    item.nextElementSibling.matches('.ds-menu-popover')
      ? item.nextElementSibling
      : null
  const items = itemsOf(menu)
  const index = item ? items.indexOf(item) : -1

  switch (event.key) {
    case 'ArrowDown': {
      const next = items[index + 1] ?? items[0]
      next?.focus()
      break
    }
    case 'ArrowUp': {
      const previous = items[index - 1] ?? items[items.length - 1]
      previous?.focus()
      break
    }
    case 'Home':
      items[0]?.focus()
      break
    case 'End':
      items[items.length - 1]?.focus()
      break
    case 'ArrowRight':
    case 'Enter':
    case ' ':
      /* Enter / Space on a leaf item stays native (button activation) */
      if (!submenu) return
      if (!submenu.matches(':popover-open')) submenu.showPopover()
      itemsOf(submenu)[0]?.focus()
      break
    case 'ArrowLeft':
      /* close this level and hand focus back to its parent item */
      if (menu === popover.value) return
      menu.hidePopover()
      ;(menu.previousElementSibling as HTMLElement | null)?.focus()
      break
    // case 'Escape':
    //   /* close one level ourselves (preventDefault below stops the native
    //      close request from also hiding the next level) */
    //   menu.hidePopover()
    //   if (menu !== popover.value) (menu.previousElementSibling as HTMLElement | null)?.focus()
    //   break
    case 'Tab':
      /* the menu is a single tab stop: closing restores focus to the
         trigger, then the default Tab action moves on from there */
      popover.value?.hidePopover()
      return
    default:
      return
  }
  event.preventDefault()
}

function onToggle(event: Event) {
  const isOpen = (event as ToggleEvent).newState === 'open'
  triggerControl?.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
}

onMounted(() => {
  /* expose the menu-button contract on the slotted trigger (if any);
     the popover itself is excluded since it is also a child */
  triggerControl = Array.from(trigger.value?.children ?? []).find((el) => el !== popover.value)
  triggerControl?.setAttribute('aria-haspopup', 'menu')
  triggerControl?.setAttribute('aria-expanded', 'false')
})
</script>

<template>
  <span
    ref="trigger"
    class="ds-menu-trigger"
    :style="`anchor-name: ${anchorName}`"
    @pointerdown="onTriggerPointerdown"
    @click="onTriggerClick"
    @keydown="onTriggerKeydown"
  >
    <slot />
    <div
      :id="menuId"
      ref="popover"
      class="ds-menu-popover"
      role="menu"
      popover="auto"
      :data-placement="placement"
      :data-dense="dense ? '' : undefined"
      :style="`position-anchor: ${anchorName}`"
      @keydown="onMenuKeydown"
      @toggle="onToggle"
    >
      <slot name="items" />
    </div>
  </span>
</template>

<style>
.ds-menu-trigger {
  /* shrink-wraps the slotted trigger; generates the anchor box */
  display: inline-block;
  max-width: 100%;
}

.ds-menu-popover {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  /* undo the UA popover styles (inset: 0 + margin: auto) so the
     position-area grid cell does the placement instead */
  position: fixed;
  inset: auto;
  margin: var(--menu-gap);
  min-width: var(--menu-min-width);
  max-width: var(--menu-max-width);
  width: max-content;
  /* items are inset from the panel edges */
  padding: var(--menu-padding);
  border: 1px solid var(--menu-border);
  border-radius: var(--menu-radius);
  background-color: var(--menu-bg);
  color: var(--text);
  box-shadow: var(--menu-shadow);
  font-family: var(--font-sans);

  /* hide the panel when its anchor scrolls out of view */
  position-visibility: anchors-visible;
}

/* --- placement (CSS anchor positioning) ------------------------- */
/* the panel is laid out in the 3×3 position-area grid around its
   anchor; the margin above acts as the trigger↔panel gap.
   Submenus override this with their own rules (see MenuItem). */

.ds-menu-popover[data-placement='bottom-start'] {
  position-area: bottom span-right;
}

.ds-menu-popover[data-placement='bottom'] {
  position-area: bottom;
}

.ds-menu-popover[data-placement='bottom-end'] {
  position-area: bottom span-left;
}

.ds-menu-popover[data-placement='top-start'] {
  position-area: top span-right;
}

.ds-menu-popover[data-placement='top'] {
  position-area: top;
}

.ds-menu-popover[data-placement='top-end'] {
  position-area: top span-left;
}

.ds-menu-popover[data-placement='left'] {
  position-area: left;
}

.ds-menu-popover[data-placement='right'] {
  position-area: right;
}

/* --- position-try fallbacks -------------------------------------- */
/* when the preferred side would overflow the viewport, flip on the
   main axis first, then the cross axis, then both */

.ds-menu-popover[data-placement^='top'],
.ds-menu-popover[data-placement^='bottom'] {
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
}

.ds-menu-popover[data-placement='left'],
.ds-menu-popover[data-placement='right'] {
  position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline;
}

/* --- enter / exit transition -------------------------------------- */

.ds-menu-popover {
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity var(--duration-150) var(--ease-out),
    transform var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-menu-popover:popover-open {
  opacity: 1;
  transform: none;
}

@starting-style {
  .ds-menu-popover:popover-open {
    opacity: 0;
    transform: scale(0.98);
  }
}
</style>
