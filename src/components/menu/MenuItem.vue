<script setup lang="ts">
import './menu.tokens.css'
import { computed, onBeforeUnmount, useId, useSlots, useTemplateRef } from 'vue'
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

/* one dashed-ident per instance ties the item (anchor-name) to its
   submenu panel (position-anchor) */
const uid = useId()
const submenuId = `ds-menu-sub-${uid}`
const anchorName = `--ds-menu-sub-${uid}`

const submenu = useTemplateRef<HTMLElement>('submenu')

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })

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
    class="ds-menu-item"
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
    class="ds-menu-popover ds-menu-submenu"
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
.ds-menu-item {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  appearance: none;
  display: flex;
  align-items: center;
  gap: var(--menu-item-gap);
  width: 100%;
  min-height: var(--menu-item-min-height);
  margin: 0;
  border: 0;
  padding: var(--menu-item-padding-block) var(--menu-item-padding-inline);
  border-radius: var(--menu-item-radius);
  background-color: transparent;
  color: var(--menu-item-color);
  font-family: var(--font-sans);
  font-size: var(--menu-item-font-size);
  font-weight: var(--font-weight-normal);
  line-height: var(--menu-item-line-height);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-150) var(--ease-out);
}

/* hover wash; an item whose submenu is open stays highlighted */
.ds-menu-item:hover:not(:disabled, [aria-disabled='true']),
.ds-menu-item:has(+ .ds-menu-popover:popover-open) {
  background-color: color-mix(in oklab, var(--menu-item-tint) 8%, transparent);
}

/* keyboard focus reads as a stronger wash, menu-style (no ring) */
.ds-menu-item:focus-visible {
  outline: none;
  background-color: color-mix(in oklab, var(--menu-item-tint) 14%, transparent);
}

.ds-menu-item:active:not(:disabled, [aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--menu-item-tint) 14%, transparent);
}

.ds-menu-item:is(:disabled, [aria-disabled='true']) {
  cursor: not-allowed;
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
