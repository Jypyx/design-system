<script setup lang="ts">
import './accordion.tokens.css'
import { computed, provide, useId, useTemplateRef } from 'vue'
import { accordionGroupKey, type AccordionProps } from './Accordion.types'

const props = withDefaults(defineProps<AccordionProps>(), {
  multiple: false,
  dense: false,
  variant: 'card',
})

/* exclusivity is native: same-name <details> close each other, so the
   group just hands one generated name to its items (none when multiple) */
const uid = useId()
provide(
  accordionGroupKey,
  computed(() => (props.multiple ? undefined : `ds-accordion-${uid}`)),
)

const root = useTemplateRef<HTMLElement>('root')

/* enabled headers of this accordion only — items of a nested accordion
   have a closer .ds-accordion ancestor and are filtered out */
function itemsOf(group: HTMLElement): HTMLElement[] {
  return Array.from(
    group.querySelectorAll<HTMLElement>('.ds-accordion-summary:not([aria-disabled="true"])'),
  ).filter((el) => el.closest('.ds-accordion') === group)
}

/* WAI-ARIA accordion keyboard pattern: Enter / Space toggle is native on
   <summary>; arrows (with wrap), Home and End move focus between headers */
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  /* only when a header has focus — never hijack keys pressed inside
     panel content or #actions controls */
  if (!target.matches?.('.ds-accordion-summary')) return
  const group = root.value
  if (!group || target.closest('.ds-accordion') !== group) return

  const items = itemsOf(group)
  const index = items.indexOf(target)

  switch (event.key) {
    case 'ArrowDown':
      ;(items[index + 1] ?? items[0])?.focus()
      break
    case 'ArrowUp':
      ;(items[index - 1] ?? items[items.length - 1])?.focus()
      break
    case 'Home':
      items[0]?.focus()
      break
    case 'End':
      items[items.length - 1]?.focus()
      break
    default:
      return
  }
  event.preventDefault()
}
</script>

<template>
  <div
    ref="root"
    class="ds-accordion"
    :data-variant="variant"
    :data-dense="dense ? '' : undefined"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<style>
.ds-accordion {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font-sans);
}

/* both variants: hairline between adjacent items */
.ds-accordion > .ds-accordion-item + .ds-accordion-item {
  border-block-start: 1px solid var(--accordion-border);
}

/* --- card: bordered, rounded shell --------------------------------- */
/* no overflow: hidden on the shell — it would clip focus rings; the
   summary corners are rounded instead so the hover wash follows them */

.ds-accordion[data-variant='card'] {
  border: 1px solid var(--accordion-border);
  border-radius: var(--accordion-radius);
}

.ds-accordion[data-variant='card'] > .ds-accordion-item:first-child > .ds-accordion-summary {
  border-start-start-radius: calc(var(--accordion-radius) - 1px);
  border-start-end-radius: calc(var(--accordion-radius) - 1px);
}

.ds-accordion[data-variant='card']
  > .ds-accordion-item:last-child:not([open])
  > .ds-accordion-summary {
  border-end-start-radius: calc(var(--accordion-radius) - 1px);
  border-end-end-radius: calc(var(--accordion-radius) - 1px);
}
</style>
