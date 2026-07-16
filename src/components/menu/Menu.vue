<script setup lang="ts">
import './menu.tokens.css'
import '../../styles/shared/popover.css'
import { onMounted, useTemplateRef } from 'vue'
import { useAnchor } from '../shared/use-anchor'
import { usePopoverToggle } from '../shared/use-popover-toggle'
import type { MenuProps } from './Menu.types'

const props = withDefaults(defineProps<MenuProps>(), {
  placement: 'bottom-start',
  disabled: false,
  dense: false,
})

const { id: menuId, anchorName } = useAnchor('menu')

const trigger = useTemplateRef<HTMLElement>('trigger')
const popover = useTemplateRef<HTMLElement>('popover')

/* the slotted trigger element, for aria-expanded bookkeeping */
let triggerControl: Element | undefined

/* enabled items of one menu level only — items of nested submenus have a
   closer .ds-menu-popover ancestor and are filtered out */
function itemsOf(menu: HTMLElement): HTMLElement[] {
  /* :enabled would skip link items — anchors never match it */
  return Array.from(
    menu.querySelectorAll<HTMLElement>('.ds-menu-item:not(:disabled):not([aria-disabled="true"])'),
  ).filter((el) => el.closest('.ds-menu-popover') === menu)
}

function open(focusLast = false) {
  const el = popover.value
  if (!el || el.matches(':popover-open')) return
  el.showPopover()
  const items = itemsOf(el)
  ;(focusLast ? items[items.length - 1] : items[0])?.focus()
}

function close() {
  const el = popover.value
  if (el?.matches(':popover-open')) el.hidePopover()
}

const { onTriggerPointerdown, onTriggerClick } = usePopoverToggle({
  popover: () => popover.value,
  disabled: () => props.disabled,
  open: () => open(),
  close,
})

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
      /* Enter / Space on a leaf item stays native (button activation),
         except Space on a link item — anchors only activate on Enter */
      if (!submenu) {
        if (event.key === ' ' && item instanceof HTMLAnchorElement) {
          item.click()
          break
        }
        return
      }
      if (!submenu.matches(':popover-open')) submenu.showPopover()
      itemsOf(submenu)[0]?.focus()
      break
    case 'ArrowLeft':
      /* close this level and hand focus back to its parent item */
      if (menu === popover.value) return
      menu.hidePopover()
      ;(menu.previousElementSibling as HTMLElement | null)?.focus()
      break
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
      class="ds-menu-popover ds-popover"
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

/* geometry, placement map and transition come from the shared
   .ds-popover partial; submenus override the placement (see MenuItem) */
.ds-menu-popover {
  --popover-gap: var(--menu-gap);
  min-width: var(--menu-min-width);
  max-width: var(--menu-max-width);
  /* items are inset from the panel edges */
  padding: var(--menu-padding);
  border: 1px solid var(--menu-border);
  border-radius: var(--menu-radius);
  background-color: var(--menu-bg);
  color: var(--text);
  box-shadow: var(--menu-shadow);
  font-family: var(--font-sans);
}
</style>
