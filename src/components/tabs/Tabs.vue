<script setup lang="ts">
import './tabs.tokens.css'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  shallowReactive,
  useId,
  useTemplateRef,
  watch,
} from 'vue'
import Button from '../button/Button.vue'
import { tabsKey } from './Tabs.types'
import type { TabRegistration, TabsModelValue, TabsProps, TabsValue } from './Tabs.types'

const props = withDefaults(defineProps<TabsProps>(), {
  size: 'sm',
  color: 'neutral',
  variant: 'line',
  orientation: 'horizontal',
  placement: 'start',
  stretch: false,
  scrollButtons: false,
  scrollPrevLabel: 'Scroll tabs backward',
  scrollNextLabel: 'Scroll tabs forward',
})

/** value of the selected tab */
const model = defineModel<TabsModelValue>({ default: null })

/* --- selection ------------------------------------------------------ */

const isSelected = (value: TabsValue) => model.value === value

function select(value: TabsValue) {
  model.value = value
}

/* roving tabindex: the selected tab is the only tab stop; when the
   v-model matches no enabled tab (e.g. nothing selected yet) the first
   enabled tab takes over so the tablist stays keyboard-reachable */
const registry = shallowReactive<TabRegistration[]>([])

function register(tab: TabRegistration) {
  registry.push(tab)
  return () => registry.splice(registry.indexOf(tab), 1)
}

const fallbackTab = computed(() => {
  const hasSelection = registry.some((t) => !t.disabled.value && t.value.value === model.value)
  return hasSelection ? undefined : registry.find((t) => !t.disabled.value)?.value.value
})

const isTabbable = (value: TabsValue) =>
  fallbackTab.value !== undefined ? value === fallbackTab.value : isSelected(value)

/* --- aria wiring ----------------------------------------------------- */

const uid = useId()
const domId = (kind: 'tab' | 'panel', value: TabsValue) =>
  `ds-tabs-${uid}-${kind}-${String(value).replace(/\s+/g, '_')}`

provide(tabsKey, {
  isSelected,
  select,
  isTabbable,
  register,
  tabId: (value) => domId('tab', value),
  panelId: (value) => domId('panel', value),
  variant: computed(() => props.variant),
  orientation: computed(() => props.orientation),
})

/* --- keyboard: WAI-ARIA tabs pattern, automatic activation ----------- */

const list = useTemplateRef<HTMLElement>('list')

function tabsOf(): HTMLElement[] {
  return Array.from(list.value?.querySelectorAll<HTMLElement>('.ds-tab:not(:disabled)') ?? [])
}

/* arrows follow the orientation (with wrap), Home / End jump to the
   extremities; moving focus also selects (automatic activation) */
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (!target.matches?.('.ds-tab')) return

  let [prevKey, nextKey] =
    props.orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
  if (props.orientation === 'horizontal' && list.value) {
    if (getComputedStyle(list.value).direction === 'rtl') [prevKey, nextKey] = [nextKey, prevKey]
  }

  const items = tabsOf()
  const index = items.indexOf(target)
  let next: HTMLElement | undefined
  switch (event.key) {
    case nextKey:
      next = items[index + 1] ?? items[0]
      break
    case prevKey:
      next = items[index - 1] ?? items[items.length - 1]
      break
    case 'Home':
      next = items[0]
      break
    case 'End':
      next = items[items.length - 1]
      break
    default:
      return
  }
  event.preventDefault()
  next?.focus()
  next?.click()
}

/* --- overflow / scroll buttons --------------------------------------- */

const overflowing = ref(false)
const canPrev = ref(false)
const canNext = ref(false)

function updateScroll() {
  const el = list.value
  if (!el) return
  const vertical = props.orientation === 'vertical'
  const size = vertical ? el.clientHeight : el.clientWidth
  const total = vertical ? el.scrollHeight : el.scrollWidth
  const offset = Math.abs(vertical ? el.scrollTop : el.scrollLeft)
  overflowing.value = total - size > 1
  canPrev.value = offset > 1
  canNext.value = offset + size < total - 1
}

let observer: ResizeObserver | undefined
onMounted(() => {
  updateScroll()
  observer = new ResizeObserver(updateScroll)
  if (list.value) observer.observe(list.value)
})
onBeforeUnmount(() => observer?.disconnect())
/* catches tabs being added / removed / resized by a re-render */
onUpdated(updateScroll)

/* keep the selected tab visible when the selection changes from outside */
watch(model, async () => {
  await nextTick()
  list.value
    ?.querySelector('.ds-tab[aria-selected="true"]')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
})

function scrollByPage(direction: 1 | -1) {
  const el = list.value
  if (!el) return
  if (props.orientation === 'vertical') {
    el.scrollBy({ top: direction * el.clientHeight * 0.8, behavior: 'smooth' })
  } else {
    const rtl = getComputedStyle(el).direction === 'rtl'
    el.scrollBy({ left: direction * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: 'smooth' })
  }
}

const prevIcon = computed(
  () =>
    props.scrollPrevIcon ??
    (props.orientation === 'vertical' ? 'keyboard_arrow_up' : 'chevron_left'),
)
const nextIcon = computed(
  () =>
    props.scrollNextIcon ??
    (props.orientation === 'vertical' ? 'keyboard_arrow_down' : 'chevron_right'),
)
</script>

<template>
  <div
    class="ds-tabs"
    :data-size="size"
    :data-color="color"
    :data-variant="variant"
    :data-orientation="orientation"
    :data-placement="placement"
    :data-stretch="stretch ? '' : undefined"
  >
    <div class="ds-tabs-bar">
      <Button
        v-if="scrollButtons && overflowing"
        class="ds-tabs-scroll"
        variant="text"
        color="neutral"
        :size="size"
        :icon="prevIcon"
        :label="scrollPrevLabel"
        :disabled="!canPrev"
        @click="scrollByPage(-1)"
      />
      <div
        ref="list"
        class="ds-tabs-list"
        role="tablist"
        :aria-label="label"
        :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
        @keydown="onKeydown"
        @scroll.passive="updateScroll"
      >
        <slot name="tabs" />
      </div>
      <Button
        v-if="scrollButtons && overflowing"
        class="ds-tabs-scroll"
        variant="text"
        color="neutral"
        :size="size"
        :icon="nextIcon"
        :label="scrollNextLabel"
        :disabled="!canNext"
        @click="scrollByPage(1)"
      />
    </div>
    <div class="ds-tabs-panels">
      <slot />
    </div>
  </div>
</template>

<style>
/* structural child selectors stay full chains (.ds-tabs > .ds-tabs-bar >
   …) so a nested Tabs inside a panel never inherits them */

.ds-tabs {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-family: var(--font-sans);
}

.ds-tabs-bar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: 0;
}

.ds-tabs-list {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: 0;
  /* the bar always scrolls (wheel / drag / keyboard focus); the optional
     buttons are a convenience on top, so the scrollbar stays hidden */
  overflow-x: auto;
  scrollbar-width: none;
}

.ds-tabs-list::-webkit-scrollbar {
  display: none;
}

.ds-tabs-panels {
  min-width: 0;
}

/* --- placement ------------------------------------------------------ */
/* the list hugs its tabs; the bar positions it (start is the default) */

.ds-tabs[data-placement='center'] > .ds-tabs-bar {
  justify-content: center;
}

.ds-tabs[data-placement='end'] > .ds-tabs-bar {
  justify-content: flex-end;
}

/* --- stretch: tabs share all the available space -------------------- */

.ds-tabs[data-stretch] > .ds-tabs-bar > .ds-tabs-list {
  flex: 1;
}

.ds-tabs[data-stretch] > .ds-tabs-bar > .ds-tabs-list > .ds-tab {
  flex: 1;
}

/* --- vertical ------------------------------------------------------- */

.ds-tabs[data-orientation='vertical'] {
  flex-direction: row;
}

.ds-tabs[data-orientation='vertical'] > .ds-tabs-bar {
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
}

.ds-tabs[data-orientation='vertical'] > .ds-tabs-bar > .ds-tabs-scroll {
  align-self: center;
}

.ds-tabs[data-orientation='vertical'] > .ds-tabs-bar > .ds-tabs-list {
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

/* vertical tabs read as a nav rail: labels align to the start */
.ds-tabs[data-orientation='vertical'] > .ds-tabs-bar > .ds-tabs-list > .ds-tab {
  justify-content: flex-start;
}

.ds-tabs[data-orientation='vertical'] > .ds-tabs-panels {
  flex: 1;
}

/* --- line variant: hairline under the whole bar ---------------------- */
/* the list overlaps the hairline by 1px so the selected tab's indicator
   paints on top of it */

.ds-tabs[data-variant='line'] > .ds-tabs-bar {
  border-block-end: 1px solid var(--tabs-border);
}

.ds-tabs[data-variant='line'] > .ds-tabs-bar > .ds-tabs-list {
  margin-block-end: -1px;
}

/* vertical: the hairline (and the tabs' indicator) moves to the
   inline-start edge */
.ds-tabs[data-variant='line'][data-orientation='vertical'] > .ds-tabs-bar {
  border-block-end: none;
  border-inline-start: 1px solid var(--tabs-border);
}

.ds-tabs[data-variant='line'][data-orientation='vertical'] > .ds-tabs-bar > .ds-tabs-list {
  margin-block-end: 0;
  margin-inline-start: -1px;
}

/* --- inset variant: grey track around the tabs ----------------------- */

.ds-tabs[data-variant='inset'] > .ds-tabs-bar > .ds-tabs-list {
  gap: var(--tabs-track-gap);
  padding: var(--tabs-track-padding);
  background-color: var(--tabs-track-bg);
  border-radius: var(--tabs-track-radius);
}
</style>
