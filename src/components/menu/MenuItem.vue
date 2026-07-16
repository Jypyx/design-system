<script setup lang="ts">
import './menu.tokens.css'
import '../../styles/shared/option.css'
import { iconProps } from '../shared/utils'
import { computed, onBeforeUnmount, useSlots, useTemplateRef } from 'vue'
import { useAnchor } from '../shared/use-anchor'
import Icon from '../icon/Icon.vue'
import Typography from '../typography/Typography.vue'
import type { MenuItemProps } from './Menu.types'

/* the item renders as a fragment (button + optional submenu panel), so
   attrs / listeners are forwarded to the button explicitly */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MenuItemProps>(), {
  color: 'neutral',
  disabled: false,
})

const slots = useSlots()
const hasSubmenu = computed(() => !!slots.submenu)

const { id: submenuId, anchorName } = useAnchor('menu-sub')

const submenu = useTemplateRef<HTMLElement>('submenu')

/* --- submenu on hover --------------------------------------------- */
/* the close delay keeps the panel open while the pointer crosses the
   gap between the item and its submenu; entering either one cancels it.
   Opening a sibling submenu closes this one natively (popover stack). */

let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

function onHoverIn() {
  clearTimeout(closeTimer)
  if (props.disabled) return
  openTimer = setTimeout(() => {
    const el = submenu.value
    if (el && !el.matches(':popover-open')) el.showPopover()
  }, 100)
}

function onHoverOut() {
  clearTimeout(openTimer)
  closeTimer = setTimeout(() => {
    const el = submenu.value
    if (el?.matches(':popover-open')) el.hidePopover()
  }, 300)
}

function onClick(event: MouseEvent) {
  if (hasSubmenu.value) return /* popovertarget toggles the submenu */
  /* activating a leaf closes the whole chain: hiding the root panel
     also hides every open submenu stacked above it */
  let menu = (event.currentTarget as HTMLElement).closest<HTMLElement>('.ds-menu-popover')
  while (menu) {
    const parent = menu.parentElement?.closest<HTMLElement>('.ds-menu-popover')
    if (!parent) break
    menu = parent
  }
  if (menu?.matches(':popover-open')) menu.hidePopover()
}

onBeforeUnmount(() => {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    v-bind="$attrs"
    class="ds-menu-item ds-option"
    :type="href ? undefined : 'button'"
    role="menuitem"
    :disabled="!href && disabled ? true : undefined"
    :href="disabled ? undefined : href"
    :target="href && !disabled ? target : undefined"
    :rel="
      href && !disabled
        ? (rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined))
        : undefined
    "
    :aria-disabled="href && disabled ? 'true' : undefined"
    :data-color="color"
    :aria-haspopup="hasSubmenu ? 'menu' : undefined"
    :popovertarget="hasSubmenu ? submenuId : undefined"
    :style="hasSubmenu ? `anchor-name: ${anchorName}` : undefined"
    @click="onClick"
    @mouseenter="onHoverIn"
    @mouseleave="onHoverOut"
  >
    <slot name="icon">
      <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
    </slot>
    <span class="ds-menu-item-text">
      <Typography as="span" variant="body" class="ds-menu-item-label">{{ label }}</Typography>
      <Typography v-if="sublabel" variant="caption" class="ds-menu-item-sublabel">
        {{ sublabel }}
      </Typography>
    </span>
    <!-- non-interactive content only: this still lives inside a <button> -->
    <span v-if="hasSubmenu || iconEnd || $slots.end" class="ds-menu-item-end">
      <slot name="end">
        <Icon v-if="iconEnd && !hasSubmenu" v-bind="iconProps(iconEnd)" />
      </slot>
      <Icon v-if="hasSubmenu" name="chevron_right" class="ds-menu-item-chevron" />
    </span>
  </component>
  <div
    v-if="hasSubmenu"
    :id="submenuId"
    ref="submenu"
    class="ds-menu-popover ds-menu-submenu ds-popover"
    role="menu"
    popover="auto"
    :style="`position-anchor: ${anchorName}`"
    @mouseenter="onHoverIn"
    @mouseleave="onHoverOut"
  >
    <slot name="submenu" />
  </div>
</template>

<style>
/* row layout + washes come from the shared .ds-option partial (tokens
   mapped in menu.tokens.css); the rest is the button / anchor reset */
.ds-menu-item {
  /* self-contained: never rely on a host-app reset (the background
     reset lives in the shared partial so the washes stay on top) */
  appearance: none;
  width: 100%;
  margin: 0;
  border: 0;
  color: var(--menu-item-color);
  font-family: var(--font-sans);
  font-weight: var(--font-weight-normal);
  text-align: left;
  text-decoration: none;
}

/* an item whose submenu is open stays highlighted, like a hover */
.ds-menu-item:has(+ .ds-menu-popover:popover-open) {
  background-color: color-mix(in oklab, var(--menu-item-tint) 8%, transparent);
}

/* --- label + sublabel, stacked ----------------------------------- */

.ds-menu-item-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.ds-menu-item-label,
.ds-menu-item-sublabel {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* text follows the item color (danger / disabled / hover states) */
.ds-typography.ds-menu-item-label {
  --typo-size: var(--menu-item-font-size);
  --typo-line-height: var(--menu-item-line-height);
  --typo-color: currentcolor;
}

.ds-typography.ds-menu-item-sublabel {
  --typo-size: var(--menu-item-sublabel-font-size);
  --typo-color: var(--menu-item-sublabel-color);
}

/* --- trailing area: icon, chevron or custom #end content ---------- */

.ds-menu-item-end {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--menu-item-sublabel-font-size);
  color: var(--menu-item-sublabel-color);
}

.ds-menu-item .ds-icon {
  --icon-size: var(--menu-item-icon-size);

  color: var(--menu-item-icon-color);
}

/* --- submenu panel placement --------------------------------------- */
/* opens sideways, first sub-item aligned with its parent item; the
   negative margins are symmetric so the flip fallbacks stay correct */

.ds-menu-submenu {
  position-area: right span-bottom;
  position-try-fallbacks:
    flip-inline,
    flip-block,
    flip-inline flip-block;
  margin: calc(-1 * var(--menu-padding) - 1px) calc(-1 * var(--spacing-1));
}
</style>
