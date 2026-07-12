<script setup lang="ts">
import './pagination.tokens.css'
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef } from 'vue'
import Button from '../button/Button.vue'
import ButtonGroup from '../button-group/ButtonGroup.vue'
import type { PaginationProps } from './Pagination.types'

const props = withDefaults(defineProps<PaginationProps>(), {
  size: 'sm',
  color: 'primary',
  variant: 'outlined',
  navButtons: 'icon',
  attached: false,
  prevIcon: 'chevron_left',
  nextIcon: 'chevron_right',
  disabled: false,
  label: 'Pagination',
  prevLabel: 'Previous',
  nextLabel: 'Next',
})

/** current page, 1-based */
const model = defineModel<number>({ default: 1 })

const clamp = (page: number) => Math.min(Math.max(1, page), Math.max(1, props.length))

/* an out-of-range v-model renders as the nearest page but is never
   silently rewritten — clamping only applies when navigating */
const current = computed(() => clamp(model.value))

function go(page: number) {
  model.value = clamp(page)
}

/* not a withDefaults default: Vue treats function defaults as factories
   for non-function prop types, so the fallback is resolved here */
const pageAria = (page: number) => props.pageLabel?.(page) ?? `Page ${page}`

/* --- responsive truncation ------------------------------------------- */

const root = useTemplateRef<HTMLElement>('root')

/** how many page slots (numbers + ellipses) fit the available width */
const fit = ref(Number.POSITIVE_INFINITY)

function measure() {
  const nav = root.value
  if (!nav) return
  /* every page slot is a square of the same width (Button's label prop
     sets data-shape, which fixes width to --btn-height) */
  const slot = nav.querySelector<HTMLElement>('.ds-pagination-page, .ds-pagination-ellipsis')
  const slotWidth = slot?.offsetWidth ?? 0
  if (slotWidth <= 1) return
  /* prev / next are measured, not assumed: icon-text width is content-dependent */
  const navBtns = Array.from(nav.querySelectorAll<HTMLElement>('.ds-pagination-nav'))
  const reserved = navBtns.reduce((sum, el) => sum + el.offsetWidth, 0)
  /* seam: what each extra item adds beyond its own width — attached
     buttons overlap their neighbor's border by 1px, spaced ones add
     the flex gap (measured, so a --pagination-gap override is honored) */
  const list = nav.firstElementChild
  const gap = list ? parseFloat(getComputedStyle(list).columnGap) || 0 : 0
  const seam = props.attached ? -1 : gap
  /* k slots + navBtns.length nav buttons in one row:
     total = reserved + k * slotWidth + (k + navBtns.length - 1) * seam */
  fit.value = Math.floor(
    (nav.clientWidth - reserved - (navBtns.length - 1) * seam) / (slotWidth + seam),
  )
}

/* the root nav is display: block, so its clientWidth comes from the
   parent, not from its children — re-rendering with a different item
   count never changes the measured width (no feedback loop) */
let observer: ResizeObserver | undefined
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
/* catches size / navButtons / label prop changes resizing the buttons */
onUpdated(measure)

/* --- visible pages ---------------------------------------------------- */

type PageItem = number | 'start-ellipsis' | 'end-ellipsis'

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)

/* sliding window: the current page stays visible, both boundary pages
   stay visible, ellipses mark the hidden stretches */
const items = computed<PageItem[]>(() => {
  const n = props.length
  const c = current.value
  if (n <= 0) return []
  const v = Math.min(n, props.totalVisible ?? Number.POSITIVE_INFINITY, fit.value)
  if (n <= v) return range(1, n)
  /* too narrow for "1 … c … n": degrade to the current page alone
     (prev / next still navigate) */
  if (v < 5) return [c]
  /* exactly v slots; windowSize = slots left once both boundaries show */
  const windowSize = v - 2
  if (c <= windowSize - 1) return [...range(1, v - 2), 'end-ellipsis', n]
  if (c >= n - windowSize + 2) return [1, 'start-ellipsis', ...range(n - (v - 3), n)]
  /* v - 4 consecutive pages around current (even v: extra slot after) */
  const start = c - Math.floor((v - 5) / 2)
  return [1, 'start-ellipsis', ...range(start, start + (v - 5)), 'end-ellipsis', n]
})
</script>

<template>
  <nav ref="root" class="ds-pagination" :data-attached="attached || undefined" :aria-label="label">
    <!-- spaced (default): a plain flex row with a gap; attached: the
         ButtonGroup fuses the buttons and collapses their borders -->
    <component :is="attached ? ButtonGroup : 'div'" class="ds-pagination-list">
      <Button
        v-if="navButtons !== 'hidden'"
        class="ds-pagination-nav"
        :size="size"
        :variant="variant"
        color="neutral"
        :icon="navButtons === 'icon' ? prevIcon : undefined"
        :icon-start="navButtons === 'icon-text' ? prevIcon : undefined"
        :label="navButtons === 'icon' ? prevLabel : undefined"
        :disabled="disabled || current <= 1"
        @click="go(current - 1)"
      >
        <template v-if="navButtons === 'icon-text'">{{ prevLabel }}</template>
      </Button>

      <template v-for="item in items" :key="item">
        <Button
          v-if="typeof item === 'number'"
          class="ds-pagination-page"
          :size="size"
          :variant="item === current ? 'flat' : variant"
          :color="item === current ? color : 'neutral'"
          :label="pageAria(item)"
          :aria-current="item === current ? 'page' : undefined"
          :disabled="disabled"
          @click="go(item)"
        >
          {{ item }}
        </Button>
        <!-- inert cell: .ds-btn + data-* give it Button's sizing (and, when
             attached, the group seam) without being a focusable control;
             spaced mode renders it as plain text between the buttons -->
        <span
          v-else
          class="ds-btn ds-pagination-ellipsis"
          :data-size="size"
          :data-variant="attached ? variant : 'text'"
          data-color="neutral"
          data-shape="square"
          >…</span
        >
      </template>

      <Button
        v-if="navButtons !== 'hidden'"
        class="ds-pagination-nav"
        :size="size"
        :variant="variant"
        color="neutral"
        :icon="navButtons === 'icon' ? nextIcon : undefined"
        :icon-end="navButtons === 'icon-text' ? nextIcon : undefined"
        :label="navButtons === 'icon' ? nextLabel : undefined"
        :disabled="disabled || current >= length"
        @click="go(current + 1)"
      >
        <template v-if="navButtons === 'icon-text'">{{ nextLabel }}</template>
      </Button>
    </component>
  </nav>
</template>

<style>
.ds-pagination {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  /* block root: the available width is the parent's, which is what
     the truncation measurement reads (see measure()) */
  display: block;
  font-family: var(--font-sans);
}

.ds-pagination .ds-pagination-list {
  /* ButtonGroup already lays out inline-flex; this covers the plain
     div of the spaced (default) mode */
  display: inline-flex;
}

/* the gap only exists in spaced mode — inside a ButtonGroup it would
   break the glued seam */
.ds-pagination:not([data-attached]) .ds-pagination-list {
  gap: var(--pagination-gap);
}

.ds-pagination .ds-btn.ds-pagination-ellipsis {
  /* also disarms .ds-btn hover rules */
  pointer-events: none;
  cursor: default;
  user-select: none;
  color: var(--pagination-ellipsis-color);
}

/* directional chevrons keep pointing backward / forward in RTL
   (same unconditional flip as Calendar / Breadcrumb) */
.ds-pagination:dir(rtl) .ds-pagination-nav .ds-icon {
  transform: scaleX(-1);
}
</style>
