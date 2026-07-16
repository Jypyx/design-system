<script setup lang="ts">
import './calendar.tokens.css'
import '../../styles/shared/sr-only.css'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import Button from '../button/Button.vue'
import {
  addDays,
  addMonths,
  clampDate,
  compareDay,
  getWeekStart,
  isSameDay,
  isSameMonth,
  monthGrid,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from './date-utils'
import type {
  CalendarDateRange,
  CalendarDayScope,
  CalendarEvent,
  CalendarEventColor,
  CalendarModelValue,
  CalendarProps,
  CalendarView,
} from './Calendar.types'

const props = withDefaults(defineProps<CalendarProps>(), {
  range: false,
  showAdjacentDays: true,
  selectAdjacentDays: false,
  ariaLabel: 'Choose date',
  prevMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
  prevYearLabel: 'Previous year',
  nextYearLabel: 'Next year',
  monthSelectLabel: 'Choose month',
  yearSelectLabel: 'Choose year',
})

const emit = defineEmits<{
  /** fires on every successful day activation (start AND end in range mode) */
  select: [date: Date]
  /** the visible month changed (steppers, grids, keyboard or adjacent-day pick) */
  'month-change': [month: Date]
}>()

const model = defineModel<CalendarModelValue>({ default: null })

defineSlots<{
  /** replaces a day cell's content (the day number by default) */
  day?: (scope: CalendarDayScope) => unknown
  /** action / preset area below the grid */
  footer?: () => unknown
}>()

const root = useTemplateRef<HTMLElement>('root')
const body = useTemplateRef<HTMLElement>('body')

/* --- selection (normalized to local midnight) ------------------------ */

const selectedDate = computed<Date | null>(() =>
  !props.range && model.value instanceof Date ? startOfDay(model.value) : null,
)

const selectedRange = computed<CalendarDateRange>(() => {
  const value = model.value
  if (!props.range || value == null || value instanceof Date) return { start: null, end: null }
  return {
    start: value.start ? startOfDay(value.start) : null,
    end: value.end ? startOfDay(value.end) : null,
  }
})

/* --- localization ----------------------------------------------------- */

const resolvedLocale = computed(
  () => props.locale ?? new Intl.DateTimeFormat().resolvedOptions().locale,
)
const weekStart = computed(() => props.weekStartsOn ?? getWeekStart(resolvedLocale.value))

const monthFormat = computed(() => new Intl.DateTimeFormat(resolvedLocale.value, { month: 'long' }))
const yearFormat = computed(
  () => new Intl.DateTimeFormat(resolvedLocale.value, { year: 'numeric' }),
)
const dayLabelFormat = computed(
  () => new Intl.DateTimeFormat(resolvedLocale.value, { dateStyle: 'full' }),
)

const formatYear = (year: number) => yearFormat.value.format(new Date(year, 0, 1))

/* the visible letter is narrow, AT reads the full weekday name */
const weekdays = computed(() => {
  const narrow = new Intl.DateTimeFormat(resolvedLocale.value, { weekday: 'narrow' })
  const long = new Intl.DateTimeFormat(resolvedLocale.value, { weekday: 'long' })
  const sunday = new Date(2023, 0, 1) /* a known Sunday */
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(sunday, weekStart.value + i)
    return { narrow: narrow.format(day), long: long.format(day) }
  })
})

const monthNames = computed(() => {
  const format = new Intl.DateTimeFormat(resolvedLocale.value, { month: 'short' })
  return Array.from({ length: 12 }, (_, i) => format.format(new Date(2023, i, 1)))
})

/* --- state ------------------------------------------------------------ */

const view = ref<CalendarView>('days')

const initialDate = clampDate(
  (props.range ? (selectedRange.value.start ?? selectedRange.value.end) : selectedDate.value) ??
    startOfDay(new Date()),
  props.minDate,
  props.maxDate,
)

/* roving-tabindex target; always kept inside visibleMonth */
const focusedDate = ref(initialDate)
const visibleMonth = ref(startOfMonth(initialDate))
/* pointer anchor of the range preview */
const hoverDate = ref<Date | null>(null)
/* roving-tabindex index inside the months / years grids */
const pickerActive = ref(0)

const today = startOfDay(new Date())

/* 4 characters max so the header never resizes with the month; the
   aria-live region below keeps announcing the full month name */
const monthTitle = computed(() => {
  const month = monthFormat.value.format(visibleMonth.value)
  return month.length <= 4 ? month : `${month.slice(0, 3)}.`
})
const yearTitle = computed(() => formatYear(visibleMonth.value.getFullYear()))

/* the years view lists a fixed window (bounded by min / max when set)
   and scrolls to the current year — no paging state */
const years = computed(() => {
  const start = props.minDate?.getFullYear() ?? today.getFullYear() - 100
  const end = props.maxDate?.getFullYear() ?? today.getFullYear() + 100
  return Array.from({ length: Math.max(1, end - start + 1) }, (_, i) => start + i)
})

/* --- month navigation (steppers) --------------------------------------- */

function clampMonth(month: Date): Date {
  if (props.minDate) {
    const min = startOfMonth(props.minDate)
    if (month.getTime() < min.getTime()) return min
  }
  if (props.maxDate) {
    const max = startOfMonth(props.maxDate)
    if (month.getTime() > max.getTime()) return max
  }
  return month
}

function goToMonth(target: Date) {
  const next = clampMonth(startOfMonth(target))
  if (isSameMonth(next, visibleMonth.value)) return
  visibleMonth.value = next
  /* the roving target keeps its day of month, clamped into the new month */
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  focusedDate.value = clampDate(
    new Date(next.getFullYear(), next.getMonth(), Math.min(focusedDate.value.getDate(), lastDay)),
    props.minDate,
    props.maxDate,
  )
  emit('month-change', new Date(next))
}

const stepMonth = (direction: number) => goToMonth(addMonths(visibleMonth.value, direction))
const stepYear = (direction: number) => goToMonth(addMonths(visibleMonth.value, direction * 12))

/* a stepper stays enabled as long as it can move at all (partial steps
   near the min / max bounds land on the bound) */
const canStep = (months: number) =>
  !isSameMonth(clampMonth(addMonths(visibleMonth.value, months)), visibleMonth.value)

const canPrevMonth = computed(() => canStep(-1))
const canNextMonth = computed(() => canStep(1))
const canPrevYear = computed(() => canStep(-12))
const canNextYear = computed(() => canStep(12))

/* --- days / months / years views ---------------------------------------- */

async function focusActive() {
  await nextTick()
  body.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
}

async function toggleView(target: 'months' | 'years') {
  if (view.value === target) {
    view.value = 'days'
    return
  }
  view.value = target
  pickerActive.value =
    target === 'months'
      ? visibleMonth.value.getMonth()
      : Math.max(0, years.value.indexOf(visibleMonth.value.getFullYear()))
  await nextTick()
  const active = body.value?.querySelector<HTMLElement>('[tabindex="0"]')
  /* the years list scrolls: center the current year before focusing */
  if (target === 'years') active?.scrollIntoView({ block: 'center' })
  active?.focus()
}

/* Escape backs out of a picker view; focus returns to the toggle that opened it */
function closePicker() {
  const selector =
    view.value === 'months' ? '.ds-calendar-toggle-month' : '.ds-calendar-toggle-year'
  const toggle = root.value?.querySelector<HTMLElement>(selector)
  view.value = 'days'
  nextTick(() => toggle?.focus())
}

function isMonthDisabled(index: number): boolean {
  const first = new Date(visibleMonth.value.getFullYear(), index, 1)
  const last = new Date(visibleMonth.value.getFullYear(), index + 1, 0)
  if (props.minDate && compareDay(last, props.minDate) < 0) return true
  if (props.maxDate && compareDay(first, props.maxDate) > 0) return true
  return false
}

function isYearDisabled(year: number): boolean {
  if (props.minDate && year < props.minDate.getFullYear()) return true
  if (props.maxDate && year > props.maxDate.getFullYear()) return true
  return false
}

function pickMonth(index: number) {
  if (isMonthDisabled(index)) return
  goToMonth(new Date(visibleMonth.value.getFullYear(), index, 1))
  view.value = 'days'
  focusActive()
}

function pickYear(year: number) {
  if (isYearDisabled(year)) return
  goToMonth(new Date(year, visibleMonth.value.getMonth(), 1))
  view.value = 'days'
  focusActive()
}

/* both picker grids are 3 columns wide; `count` bounds the roving index */
function onPickerKeydown(event: KeyboardEvent, count: number) {
  let [prevKey, nextKey] = ['ArrowLeft', 'ArrowRight']
  if (root.value && getComputedStyle(root.value).direction === 'rtl')
    [prevKey, nextKey] = [nextKey, prevKey]

  let next = pickerActive.value
  switch (event.key) {
    case nextKey:
      next += 1
      break
    case prevKey:
      next -= 1
      break
    case 'ArrowDown':
      next += 3
      break
    case 'ArrowUp':
      next -= 3
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = count - 1
      break
    case 'Escape':
      /* backing out of the picker must not close a surrounding popover
         (DatePicker), so the close request is swallowed here */
      event.preventDefault()
      event.stopPropagation()
      closePicker()
      return
    default:
      return
  }
  event.preventDefault()
  pickerActive.value = Math.min(count - 1, Math.max(0, next))
  focusActive()
}

/* --- day states ---------------------------------------------------------- */

/* an array of blocked days is normalized once into a set of midnight
   timestamps; a predicate is called per rendered cell */
const disabledSet = computed(() =>
  Array.isArray(props.disabledDates)
    ? new Set(props.disabledDates.map((date) => startOfDay(date).getTime()))
    : null,
)

function isDayDisabled(date: Date): boolean {
  if (props.minDate && compareDay(date, props.minDate) < 0) return true
  if (props.maxDate && compareDay(date, props.maxDate) > 0) return true
  if (disabledSet.value) return disabledSet.value.has(date.getTime())
  if (typeof props.disabledDates === 'function') return props.disabledDates(new Date(date))
  return false
}

const eventsByDay = computed(() => {
  const map = new Map<number, CalendarEvent[]>()
  for (const event of props.events ?? []) {
    const key = startOfDay(event.date).getTime()
    const list = map.get(key)
    if (list) list.push(event)
    else map.set(key, [event])
  }
  return map
})

/* committed range band; a single-day range renders as a circle only */
const rangeBand = computed(() => {
  const { start, end } = selectedRange.value
  if (!start || !end || isSameDay(start, end)) return null
  return { from: start.getTime(), to: end.getTime(), preview: false }
})

/* while the end date is pending, the span up to the pointer (or, for
   keyboard users, the focused day) previews the future range */
const previewBand = computed(() => {
  const { start, end } = selectedRange.value
  if (!props.range || !start || end) return null
  const anchor = hoverDate.value ?? focusedDate.value
  if (compareDay(anchor, start) <= 0) return null
  return { from: start.getTime(), to: startOfDay(anchor).getTime(), preview: true }
})

const activeBand = computed(() => rangeBand.value ?? previewBand.value)

interface DayCell {
  key: number
  date: Date
  dayNumber: number
  adjacent: boolean
  hidden: boolean
  selectable: boolean
  disabled: boolean
  selected: boolean
  rangeStart: boolean
  rangeEnd: boolean
  inRange: boolean
  preview: boolean
  previewEnd: boolean
  today: boolean
  tabbable: boolean
  label: string
  events: CalendarEvent[]
  scope: CalendarDayScope
}

function toCell(date: Date): DayCell {
  const time = date.getTime()
  const adjacent = !isSameMonth(date, visibleMonth.value)
  const hidden = adjacent && !props.showAdjacentDays
  const selectable = !hidden && (!adjacent || props.selectAdjacentDays)
  const disabled = isDayDisabled(date)
  const { start, end } = selectedRange.value
  const rangeStart = start !== null && time === start.getTime()
  const rangeEnd = end !== null && time === end.getTime()
  const selected = props.range
    ? rangeStart || rangeEnd
    : selectedDate.value !== null && time === selectedDate.value.getTime()
  const band = activeBand.value
  /* the band spans the range ends too (their circle paints on top of it,
     and CSS rounds the band's outer edges); the pending preview runs from
     the start up to the anchor, which has no circle yet */
  const inRange = band !== null && !band.preview && time >= band.from && time <= band.to
  const preview = band !== null && band.preview && time >= band.from && time <= band.to
  const previewEnd = preview && time === band.to
  const isToday = time === today.getTime()
  const events = eventsByDay.value.get(time) ?? []
  return {
    key: time,
    date,
    dayNumber: date.getDate(),
    adjacent,
    hidden,
    selectable,
    disabled,
    selected,
    rangeStart,
    rangeEnd,
    inRange,
    preview,
    previewEnd,
    today: isToday,
    tabbable: selectable && time === focusedDate.value.getTime(),
    label: dayLabelFormat.value.format(date),
    events,
    scope: {
      date,
      dayNumber: date.getDate(),
      selected,
      disabled,
      today: isToday,
      adjacent,
      rangeStart,
      rangeEnd,
      inRange,
      events,
    },
  }
}

/* always 6 weeks of 7 days so the height never changes across months */
const weeks = computed(() => {
  const cells = monthGrid(visibleMonth.value, weekStart.value).map(toCell)
  return [0, 1, 2, 3, 4, 5].map((week) => cells.slice(week * 7, week * 7 + 7))
})

/* --- day selection --------------------------------------------------------- */

function selectDate(date: Date) {
  if (isDayDisabled(date)) return
  focusedDate.value = date
  const moved = !isSameMonth(date, visibleMonth.value)
  if (moved) {
    /* adjacent-day pick: the view follows the selection */
    visibleMonth.value = startOfMonth(date)
    emit('month-change', new Date(visibleMonth.value))
  }
  if (!props.range) {
    model.value = new Date(date)
  } else {
    /* first pick (or a pick before the start) starts a range, the next
       pick completes it; always a fresh object so v-model watchers fire */
    const { start, end } = selectedRange.value
    model.value =
      !start || end || compareDay(date, start) < 0
        ? { start: new Date(date), end: null }
        : { start: new Date(start), end: new Date(date) }
    hoverDate.value = null
  }
  emit('select', new Date(date))
  if (moved) focusActive()
}

function onDayHover(date: Date) {
  const { start, end } = selectedRange.value
  if (props.range && start && !end) hoverDate.value = date
}

/* an external model change (e.g. a footer preset) pulls the view to it */
watch(model, () => {
  const target = props.range
    ? (selectedRange.value.end ?? selectedRange.value.start)
    : selectedDate.value
  if (!target) return
  const next = clampDate(target, props.minDate, props.maxDate)
  focusedDate.value = next
  if (!isSameMonth(next, visibleMonth.value)) {
    visibleMonth.value = startOfMonth(next)
    emit('month-change', new Date(visibleMonth.value))
  }
})

/* --- keyboard: WAI-ARIA grid pattern ---------------------------------------- */

function moveFocus(date: Date) {
  focusedDate.value = date
  if (!isSameMonth(date, visibleMonth.value)) {
    visibleMonth.value = startOfMonth(date)
    emit('month-change', new Date(visibleMonth.value))
  }
  focusActive()
}

/* Enter / Space are left to the native button activation (click); disabled
   days stay focusable (aria-disabled) so arrows can traverse them */
function onGridKeydown(event: KeyboardEvent) {
  let [prevKey, nextKey] = ['ArrowLeft', 'ArrowRight']
  if (root.value && getComputedStyle(root.value).direction === 'rtl')
    [prevKey, nextKey] = [nextKey, prevKey]

  let target: Date
  switch (event.key) {
    case nextKey:
      target = addDays(focusedDate.value, 1)
      break
    case prevKey:
      target = addDays(focusedDate.value, -1)
      break
    case 'ArrowDown':
      target = addDays(focusedDate.value, 7)
      break
    case 'ArrowUp':
      target = addDays(focusedDate.value, -7)
      break
    case 'Home':
      target = startOfWeek(focusedDate.value, weekStart.value)
      break
    case 'End':
      target = addDays(startOfWeek(focusedDate.value, weekStart.value), 6)
      break
    case 'PageUp':
      target = addMonths(focusedDate.value, event.shiftKey ? -12 : -1)
      break
    case 'PageDown':
      target = addMonths(focusedDate.value, event.shiftKey ? 12 : 1)
      break
    default:
      return
  }
  event.preventDefault()
  moveFocus(clampDate(target, props.minDate, props.maxDate))
}

/* --- event dots ---------------------------------------------------------------- */

const dotTokens: Record<string, string> = {
  primary: 'var(--cal-dot-primary)',
  success: 'var(--cal-dot-success)',
  danger: 'var(--cal-dot-danger)',
  warning: 'var(--cal-dot-warning)',
}

/* semantic names go through the dot tokens, anything else is a CSS color */
const dotStyle = (color?: CalendarEventColor) => ({
  '--_dot': dotTokens[color ?? 'primary'] ?? color,
})

/* --- public handle ---------------------------------------------------------------- */

function setView(next: CalendarView) {
  if (next === 'days') view.value = 'days'
  else if (view.value !== next) toggleView(next)
}

defineExpose({
  /** moves focus to the active cell of the current view */
  focus: () => {
    void focusActive()
  },
  /** switches between the days / months / years views */
  setView,
})
</script>

<template>
  <div ref="root" class="ds-calendar" :data-view="view" :data-range="range ? '' : undefined">
    <div class="ds-calendar-header">
      <!-- stepping is meaningless while a picker grid is open: the
           chevrons stay visible but disable (the toggles remain active) -->
      <div class="ds-calendar-nav ds-calendar-nav-month">
        <Button
          size="xs"
          variant="text"
          color="neutral"
          icon="chevron_left"
          class="ds-calendar-chevron"
          :label="prevMonthLabel"
          :disabled="view !== 'days' || !canPrevMonth"
          @click="stepMonth(-1)"
        />
        <Button
          size="xs"
          variant="text"
          color="neutral"
          icon-end="arrow_drop_down"
          class="ds-calendar-toggle ds-calendar-toggle-month"
          :aria-label="monthSelectLabel"
          :aria-expanded="view === 'months' ? 'true' : 'false'"
          @click="toggleView('months')"
        >
          {{ monthTitle }}
        </Button>
        <Button
          size="xs"
          variant="text"
          color="neutral"
          icon="chevron_right"
          class="ds-calendar-chevron"
          :label="nextMonthLabel"
          :disabled="view !== 'days' || !canNextMonth"
          @click="stepMonth(1)"
        />
      </div>

      <div class="ds-calendar-nav ds-calendar-nav-year">
        <Button
          size="xs"
          variant="text"
          color="neutral"
          icon="chevron_left"
          class="ds-calendar-chevron"
          :label="prevYearLabel"
          :disabled="view === 'years' || !canPrevYear"
          @click="stepYear(-1)"
        />
        <Button
          size="xs"
          variant="text"
          color="neutral"
          icon-end="arrow_drop_down"
          class="ds-calendar-toggle ds-calendar-toggle-year"
          :aria-label="yearSelectLabel"
          :aria-expanded="view === 'years' ? 'true' : 'false'"
          @click="toggleView('years')"
        >
          {{ yearTitle }}
        </Button>
        <Button
          size="xs"
          variant="text"
          color="neutral"
          icon="chevron_right"
          class="ds-calendar-chevron"
          :label="nextYearLabel"
          :disabled="view === 'years' || !canNextYear"
          @click="stepYear(1)"
        />
      </div>
    </div>

    <!-- announces month changes triggered by the steppers / pickers -->
    <span class="ds-calendar-sr ds-sr-only" aria-live="polite">
      {{ monthTitle }} {{ formatYear(visibleMonth.getFullYear()) }}
    </span>

    <div ref="body" class="ds-calendar-body">
      <div
        v-if="view === 'days'"
        class="ds-calendar-grid"
        role="grid"
        :aria-label="ariaLabel"
        @keydown="onGridKeydown"
        @mouseleave="hoverDate = null"
      >
        <div class="ds-calendar-row" role="row">
          <span
            v-for="weekday in weekdays"
            :key="weekday.long"
            class="ds-calendar-weekday"
            role="columnheader"
            :aria-label="weekday.long"
          >
            <span aria-hidden="true">{{ weekday.narrow }}</span>
          </span>
        </div>

        <div v-for="(week, index) in weeks" :key="index" class="ds-calendar-row" role="row">
          <template v-for="cell in week" :key="cell.key">
            <button
              v-if="cell.selectable"
              type="button"
              class="ds-calendar-day"
              role="gridcell"
              :tabindex="cell.tabbable ? 0 : -1"
              :aria-selected="cell.selected ? 'true' : undefined"
              :aria-disabled="cell.disabled ? 'true' : undefined"
              :aria-current="cell.today ? 'date' : undefined"
              :aria-label="cell.label"
              :data-adjacent="cell.adjacent ? '' : undefined"
              :data-today="cell.today ? '' : undefined"
              :data-selected="cell.selected ? '' : undefined"
              :data-range-start="cell.rangeStart ? '' : undefined"
              :data-range-end="cell.rangeEnd ? '' : undefined"
              :data-in-range="cell.inRange ? '' : undefined"
              :data-preview="cell.preview ? '' : undefined"
              :data-preview-end="cell.previewEnd ? '' : undefined"
              @click="selectDate(cell.date)"
              @mouseenter="onDayHover(cell.date)"
            >
              <span class="ds-calendar-day-content">
                <slot name="day" v-bind="cell.scope">{{ cell.dayNumber }}</slot>
              </span>
              <span v-if="cell.events.length" class="ds-calendar-dots" aria-hidden="true">
                <span
                  v-for="(event, dot) in cell.events.slice(0, 3)"
                  :key="dot"
                  class="ds-calendar-dot"
                  :style="dotStyle(event.color)"
                />
              </span>
            </button>

            <!-- visible but inert (adjacent, not selectable) or an empty placeholder;
                 either way the 6-week geometry never changes -->
            <span
              v-else
              class="ds-calendar-day"
              role="gridcell"
              aria-hidden="true"
              :data-adjacent="cell.adjacent && !cell.hidden ? '' : undefined"
              :data-disabled="!cell.hidden && cell.disabled ? '' : undefined"
              :data-today="!cell.hidden && cell.today ? '' : undefined"
              :data-selected="!cell.hidden && cell.selected ? '' : undefined"
              :data-range-start="!cell.hidden && cell.rangeStart ? '' : undefined"
              :data-range-end="!cell.hidden && cell.rangeEnd ? '' : undefined"
              :data-in-range="!cell.hidden && cell.inRange ? '' : undefined"
              :data-preview="!cell.hidden && cell.preview ? '' : undefined"
              :data-preview-end="!cell.hidden && cell.previewEnd ? '' : undefined"
            >
              <template v-if="!cell.hidden">
                <span class="ds-calendar-day-content">
                  <slot name="day" v-bind="cell.scope">{{ cell.dayNumber }}</slot>
                </span>
                <span v-if="cell.events.length" class="ds-calendar-dots" aria-hidden="true">
                  <span
                    v-for="(event, dot) in cell.events.slice(0, 3)"
                    :key="dot"
                    class="ds-calendar-dot"
                    :style="dotStyle(event.color)"
                  />
                </span>
              </template>
            </span>
          </template>
        </div>
      </div>

      <div
        v-else-if="view === 'months'"
        class="ds-calendar-picker"
        role="group"
        :aria-label="monthSelectLabel"
        @keydown="onPickerKeydown($event, 12)"
      >
        <!-- aria-disabled (not disabled) keeps blocked options focusable so
             arrow keys can traverse them; pickMonth guards the activation -->
        <Button
          v-for="(name, index) in monthNames"
          :key="name"
          size="sm"
          :variant="index === visibleMonth.getMonth() ? 'flat' : 'text'"
          :color="index === visibleMonth.getMonth() ? 'primary' : 'neutral'"
          :tabindex="index === pickerActive ? 0 : -1"
          :aria-pressed="index === visibleMonth.getMonth() ? 'true' : 'false'"
          :aria-disabled="isMonthDisabled(index) ? 'true' : undefined"
          @click="pickMonth(index)"
        >
          {{ name }}
        </Button>
      </div>

      <div
        v-else
        class="ds-calendar-picker"
        data-scroll
        role="group"
        :aria-label="yearSelectLabel"
        @keydown="onPickerKeydown($event, years.length)"
      >
        <Button
          v-for="(year, index) in years"
          :key="year"
          size="sm"
          :variant="year === visibleMonth.getFullYear() ? 'flat' : 'text'"
          :color="year === visibleMonth.getFullYear() ? 'primary' : 'neutral'"
          :tabindex="index === pickerActive ? 0 : -1"
          :aria-pressed="year === visibleMonth.getFullYear() ? 'true' : 'false'"
          :aria-disabled="isYearDisabled(year) ? 'true' : undefined"
          @click="pickYear(year)"
        >
          {{ formatYear(year) }}
        </Button>
      </div>
    </div>

    <div v-if="$slots.footer" class="ds-calendar-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
.ds-calendar {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--cal-padding);
  border-radius: var(--cal-radius);
  font-family: var(--font-sans);
  font-size: var(--cal-font-size);
  color: var(--cal-text);
  user-select: none;
}

/* --- header ---------------------------------------------------------- */

.ds-calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}

.ds-calendar-nav {
  display: flex;
  align-items: center;
}

/* previous / next chevrons keep pointing backward / forward in RTL
   (scoped to the chevrons: the toggles' drop-down arrow rotates below) */
.ds-calendar:dir(rtl) .ds-calendar-chevron .ds-icon {
  transform: scaleX(-1);
}

.ds-calendar-toggle {
  min-width: var(--cal-toggle-min-with);
}

.ds-calendar-toggle .ds-icon {
  color: var(--text-muted);
  transition: transform var(--duration-150) var(--ease-out);
}

.ds-calendar-toggle[aria-expanded='true'] .ds-icon {
  transform: rotate(180deg);
}

/* --- body: same box for the three views -------------------------------- */

.ds-calendar-body {
  /* intrinsic size unchanged, but the grid stretches with the calendar
     when a consumer gives it a width */
  width: 100%;
  min-width: calc(7 * var(--cal-cell-size));
  height: calc(var(--cal-weekday-height) + 6 * var(--cal-cell-size) + 6 * var(--cal-gap));
}

/* --- days grid ----------------------------------------------------------- */

.ds-calendar-grid {
  display: flex;
  flex-direction: column;
  gap: var(--cal-gap);
}

/* no column gap: the range band must run continuously across cells */
.ds-calendar-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(var(--cal-cell-size), 1fr));
}

.ds-calendar-weekday {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--cal-weekday-height);
  font-size: var(--cal-weekday-font-size);
  font-weight: var(--font-weight-medium);
  color: var(--cal-weekday-color);
}

/* the cell stretches with its grid column; the fixed-size content circle
   stays centered so it never turns into a pill */
.ds-calendar-day {
  position: relative;
  box-sizing: border-box;
  appearance: none;
  margin: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--cal-cell-size);
  border: none;
  border-radius: var(--cal-cell-radius);
  background: none;
  font-family: inherit;
  font-size: var(--cal-font-size);
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}

button.ds-calendar-day {
  cursor: pointer;
}

/* the ring wraps the fixed content circle, not the stretched cell,
   so it stays round at any calendar width */
.ds-calendar-day:focus-visible {
  outline: none;
}

.ds-calendar-day:focus-visible .ds-calendar-day-content {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

/* the range band paints on ::before, under the .ds-calendar-day-content
   circle that follows it in DOM order — no z-index needed; it runs from
   the range start to the end (or the preview anchor) and rounds off at
   the caps below */
.ds-calendar-day:is([data-in-range], [data-preview])::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--cal-range-bg);
}

.ds-calendar-day[data-preview]::before {
  background-color: var(--cal-preview-bg);
}

/* the caps hug the fixed content circle even when the cell is wider:
   the outer edge pulls in to the circle's edge (0 at minimum width) */
.ds-calendar-day[data-range-start]::before {
  inset-inline-start: calc(50% - var(--cal-cell-size) / 2);
  border-start-start-radius: var(--cal-cell-radius);
  border-end-start-radius: var(--cal-cell-radius);
}

.ds-calendar-day:is([data-range-end], [data-preview-end])::before {
  inset-inline-end: calc(50% - var(--cal-cell-size) / 2);
  border-start-end-radius: var(--cal-cell-radius);
  border-end-end-radius: var(--cal-cell-radius);
}

.ds-calendar-day-content {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--cal-cell-size);
  height: var(--cal-cell-size);
  border-radius: var(--cal-cell-radius);
  transition:
    background-color var(--duration-150) var(--ease-out),
    color var(--duration-150) var(--ease-out);
}

button.ds-calendar-day:hover:not([aria-disabled='true']) .ds-calendar-day-content {
  background-color: var(--cal-hover-bg);
}

.ds-calendar-day[data-today] .ds-calendar-day-content {
  box-shadow: inset 0 0 0 1px var(--cal-accent);
  color: var(--cal-accent);
  font-weight: var(--font-weight-medium);
}

/* declared after today / hover so selection always wins */
.ds-calendar-day[data-selected] .ds-calendar-day-content,
button.ds-calendar-day[data-selected]:hover .ds-calendar-day-content {
  background-color: var(--cal-accent);
  color: var(--cal-on-accent);
  font-weight: var(--font-weight-medium);
}

/* an adjacent day is merely faded — being non-selectable because of
   selectAdjacentDays does not make it disabled */
.ds-calendar-day[data-adjacent] {
  color: var(--cal-adjacent-color);
}

/* declared after the adjacent rule: a day reads as disabled (grey +
   struck through) only when it is actually blocked — aria-disabled on
   selectable buttons, data-disabled on the inert adjacent spans */
.ds-calendar-day:is([aria-disabled='true'], [data-disabled]) {
  color: var(--cal-disabled-color);
  cursor: not-allowed;
}

.ds-calendar-day:is([aria-disabled='true'], [data-disabled]) .ds-calendar-day-content {
  text-decoration: line-through;
}

/* --- event dots ------------------------------------------------------------- */

.ds-calendar-dots {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 3px;
  display: flex;
  justify-content: center;
  gap: var(--cal-dot-gap);
  pointer-events: none;
}

.ds-calendar-dot {
  width: var(--cal-dot-size);
  height: var(--cal-dot-size);
  border-radius: var(--radius-full);
  background-color: var(--_dot, var(--cal-dot-primary));
}

/* dots must stay readable on the selected accent circle */
.ds-calendar-day[data-selected] .ds-calendar-dot {
  background-color: var(--cal-on-accent);
}

/* --- months / years pickers (Button grids) ---------------------------------- */

.ds-calendar-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  align-items: center;
  gap: var(--spacing-1);
  width: 100%;
  height: 100%;
}

.ds-calendar-picker .ds-btn {
  width: 100%;
}

/* the years list keeps the fixed body height and scrolls instead of paging */
.ds-calendar-picker[data-scroll] {
  grid-template-rows: none;
  grid-auto-rows: min-content;
  align-content: start;
  overflow-y: auto;
}

/* --- footer ---------------------------------------------------------------------- */

.ds-calendar-footer {
  padding-block-start: var(--cal-footer-padding);
  border-block-start: 1px solid var(--cal-footer-border);
}
</style>
