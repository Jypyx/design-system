<script setup lang="ts">
import './accordion.tokens.css'
import { inject } from 'vue'
import Icon from '../icon/Icon.vue'
import Typography from '../typography/Typography.vue'
import { accordionGroupKey, type AccordionItemProps } from './Accordion.types'

const props = withDefaults(defineProps<AccordionItemProps>(), {
  open: false,
  disabled: false,
})

/* same-name <details> are natively exclusive; a standalone item
   (no parent Accordion) injects undefined and omits the attribute */
const groupName = inject(accordionGroupKey, undefined)

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })

/* <summary> has no disabled attribute: cancel its activation behavior
   instead (Enter / Space dispatch a synthetic click, so this covers the
   keyboard too). Clicks inside #actions must not toggle the panel either. */
function onSummaryClick(event: MouseEvent) {
  if (props.disabled || (event.target as HTMLElement).closest('.ds-accordion-actions')) {
    event.preventDefault()
  }
}
</script>

<template>
  <details class="ds-accordion-item" :name="groupName" :open="open">
    <summary
      class="ds-accordion-summary"
      :aria-disabled="disabled ? 'true' : undefined"
      :tabindex="disabled ? -1 : undefined"
      @click="onSummaryClick"
    >
      <span class="ds-accordion-header">
        <slot name="header">
          <Icon v-if="icon" v-bind="iconProps(icon)" />
          <span class="ds-accordion-text">
            <Typography as="span" variant="body" class="ds-accordion-label">
              {{ label }}
            </Typography>
            <Typography v-if="sublabel" variant="caption" class="ds-accordion-sublabel">
              {{ sublabel }}
            </Typography>
          </span>
        </slot>
      </span>
      <span v-if="$slots.actions" class="ds-accordion-actions">
        <slot name="actions" />
      </span>
      <Icon name="expand_more" class="ds-accordion-chevron" />
    </summary>
    <div class="ds-accordion-content">
      <slot />
    </div>
  </details>
</template>

<style>
.ds-accordion-item {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font-sans);

  /* inherited: opts ::details-content into keyword interpolation so
     block-size can animate to auto; engines without support just snap */
  interpolate-size: allow-keywords;
}

/* --- header -------------------------------------------------------- */

.ds-accordion-summary {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--accordion-summary-gap);
  min-height: var(--accordion-summary-min-height);
  padding: var(--accordion-summary-padding-block) var(--accordion-summary-padding-inline);
  color: var(--accordion-label-color);
  font-size: var(--accordion-summary-font-size);
  line-height: 1.25;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  list-style: none;
  transition: background-color var(--duration-150) var(--ease-out);
}

/* hide the native disclosure triangle */
.ds-accordion-summary::marker {
  content: none;
}

.ds-accordion-summary::-webkit-details-marker {
  display: none;
}

.ds-accordion-summary:hover:not([aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--text) 6%, transparent);
}

/* inset ring so it follows the card corners without being clipped */
.ds-accordion-summary:focus-visible {
  outline: var(--focus-ring);
  outline-offset: -2px;
}

.ds-accordion-summary[aria-disabled='true'] {
  cursor: not-allowed;
}

.ds-accordion-header {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--accordion-summary-gap);
  min-width: 0;
}

/* --- label + sublabel, stacked ------------------------------------ */

.ds-accordion-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.ds-accordion-label,
.ds-accordion-sublabel {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* text follows the summary color (label color + disabled state) */
.ds-typography.ds-accordion-label {
  --typo-size: var(--accordion-summary-font-size);
  --typo-line-height: 1.25;
  --typo-color: currentcolor;
}

.ds-typography.ds-accordion-sublabel {
  --typo-size: var(--accordion-sublabel-font-size);
  --typo-color: var(--accordion-sublabel-color);
}

/* --- trailing area: #actions then chevron -------------------------- */

.ds-accordion-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
}

.ds-accordion-summary .ds-icon {
  --icon-size: var(--accordion-icon-size);

  color: var(--accordion-icon-color);
}

.ds-accordion-chevron {
  transition: rotate var(--duration-200) var(--ease-out);
}

.ds-accordion-item[open] > .ds-accordion-summary .ds-accordion-chevron {
  rotate: 180deg;
}

/* --- panel --------------------------------------------------------- */

/* padding lives here, never on ::details-content — it would leak
   through at block-size: 0 */
.ds-accordion-content {
  box-sizing: border-box;
  padding: 0 var(--accordion-content-padding-inline) var(--accordion-content-padding-block);
  color: var(--text);
  font-size: var(--accordion-summary-font-size);
}

/* the UA wrapper around the panel: 0 → auto only interpolates thanks to
   interpolate-size above; content-visibility transitions discretely so
   the content stays rendered until the close animation ends */
.ds-accordion-item::details-content {
  block-size: 0;
  overflow: clip;
  transition:
    block-size var(--duration-200) var(--ease-out),
    content-visibility var(--duration-200) allow-discrete;
}

.ds-accordion-item[open]::details-content {
  block-size: auto;
}
</style>
