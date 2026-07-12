<script setup lang="ts">
import './date-picker.tokens.css'
import { computed, nextTick, ref, useId, useTemplateRef } from 'vue'
import Calendar from '../calendar/Calendar.vue'
import Icon from '../icon/Icon.vue'
import { toISODate } from '../calendar/date-utils'
import type {
  CalendarDateRange,
  CalendarDayScope,
  CalendarModelValue,
} from '../calendar/Calendar.types'
import type { DatePickerProps } from './DatePicker.types'

const props = withDefaults(defineProps<DatePickerProps>(), {
  size: 'sm',
  placement: 'bottom-start',
  closeOnSelect: true,
  clearable: false,
  clearLabel: 'Clear',
  disabled: false,
  required: false,
  invalid: false,
  ariaLabel: 'Choose date',
  /* boolean Calendar props must repeat their Calendar defaults here —
     Vue would otherwise cast the absent props to false */
  range: false,
  showAdjacentDays: true,
  selectAdjacentDays: false,
})

const emit = defineEmits<{ 'open': []; 'close': []; 'clear': [] }>()

const model = defineModel<CalendarModelValue>({ default: null })

defineSlots<{
  /** forwarded to the Calendar's day slot */
  day?: (scope: CalendarDayScope) => unknown
  /** forwarded to the Calendar's footer slot */
  footer?: () => unknown
}>()

/* one dashed-ident per instance ties the field (anchor-name) to its
   popover (position-anchor); all placement logic then lives in CSS */
const uid = useId()
const anchorName = `--ds-datepicker-${uid}`
const inputId = `ds-datepicker-input-${uid}`
const panelId = `ds-datepicker-panel-${uid}`
const hintId = `ds-datepicker-hint-${uid}`

const input = ref<HTMLInputElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const field = useTemplateRef<HTMLElement>('field')
const calendar = useTemplateRef<InstanceType<typeof Calendar>>('calendar')

const isOpen = ref(false)

/* --- selection / display ---------------------------------------------- */

const selectedRange = computed<CalendarDateRange>(() => {
  const value = model.value
  if (!props.range || value == null || value instanceof Date) return { start: null, end: null }
  return { start: value.start, end: value.end }
})

const displayFormat = computed(
  () => new Intl.DateTimeFormat(props.locale, props.formatOptions ?? { dateStyle: 'medium' }),
)

/* formatRange gives the localized separator; a pending range shows an
   open-ended "start – " so the state stays visible in the field */
const display = computed(() => {
  if (props.range) {
    const { start, end } = selectedRange.value
    if (start && end) return displayFormat.value.formatRange(start, end)
    if (start) return `${displayFormat.value.format(start)} – `
    return ''
  }
  return model.value instanceof Date ? displayFormat.value.format(model.value) : ''
})

/* only the props known to Calendar are forwarded (v-bind of the whole
   props object would leak field props as attributes) */
const calendarProps = computed(() => ({
  range: props.range,
  locale: props.locale,
  weekStartsOn: props.weekStartsOn,
  minDate: props.minDate,
  maxDate: props.maxDate,
  disabledDates: props.disabledDates,
  events: props.events,
  showAdjacentDays: props.showAdjacentDays,
  selectAdjacentDays: props.selectAdjacentDays,
  ariaLabel: props.ariaLabel,
  prevMonthLabel: props.prevMonthLabel,
  nextMonthLabel: props.nextMonthLabel,
  prevYearLabel: props.prevYearLabel,
  nextYearLabel: props.nextYearLabel,
  monthSelectLabel: props.monthSelectLabel,
  yearSelectLabel: props.yearSelectLabel,
}))

/* --- open / close ------------------------------------------------------- */
/* popover="auto": light dismiss and Escape are native. Real focus moves
   into the day grid; hiding the popover then restores it to the input
   (the element focused right before showPopover). */

function open() {
  const el = panel.value
  if (props.disabled || !el || el.matches(':popover-open')) return
  input.value?.focus()
  el.showPopover()
  calendar.value?.setView('days')
  nextTick(() => calendar.value?.focus())
}

function close() {
  const el = panel.value
  if (el?.matches(':popover-open')) el.hidePopover()
}

/* single sync point, whatever hid or showed the popover */
function onToggle(event: Event) {
  const openState = (event as ToggleEvent).newState === 'open'
  if (openState === isOpen.value) return
  isOpen.value = openState
  if (openState) emit('open')
  else emit('close')
}

/* light dismiss already hides the popover when pressing the field;
   remember the state at pointerdown so the click that follows does not
   immediately reopen it (same dance as Menu) */
let wasOpenOnPointerdown = false

function onFieldPointerdown() {
  wasOpenOnPointerdown = panel.value?.matches(':popover-open') ?? false
}

function onFieldClick() {
  const wasOpen = wasOpenOnPointerdown
  wasOpenOnPointerdown = false
  if (props.disabled) return
  if (wasOpen || panel.value?.matches(':popover-open')) {
    close()
    return
  }
  open()
}

function onInputKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    open()
  }
}

/* no focus trap (a popover is not modal): tabbing out of the panel closes
   it. relatedTarget is null while the grid re-renders during keyboard
   navigation (the focused cell is replaced), so null never closes. */
function onPanelFocusout(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next) return
  if (panel.value?.contains(next) || field.value?.contains(next)) return
  close()
}

async function onSelect() {
  if (!props.closeOnSelect) return
  if (!props.range) {
    close()
    return
  }
  /* the parent-bound modelValue prop only reflects the pick after the next
     patch; checking synchronously would read the pre-pick range */
  await nextTick()
  const { start, end } = selectedRange.value
  if (start && end) close()
}

/* --- clear ---------------------------------------------------------------- */

const showClear = computed(() => {
  if (!props.clearable || props.disabled) return false
  if (props.range) return selectedRange.value.start !== null || selectedRange.value.end !== null
  return model.value instanceof Date
})

function clear() {
  model.value = props.range ? { start: null, end: null } : null
  emit('clear')
  input.value?.focus()
}

/* --- native form submission ------------------------------------------------ */

const hiddenValues = computed<string[]>(() => {
  if (!props.name) return []
  if (props.range) {
    const { start, end } = selectedRange.value
    return [start, end].filter((date): date is Date => date !== null).map(toISODate)
  }
  return model.value instanceof Date ? [toISODate(model.value)] : []
})

defineExpose({
  /** the native input element */
  input,
  /** focuses the native input */
  focus: () => input.value?.focus(),
  /** opens the calendar popover */
  open,
  /** closes the calendar popover */
  close,
})
</script>

<template>
  <div
    class="ds-datepicker"
    :data-size="size"
    :data-open="isOpen ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
  >
    <label v-if="label" class="ds-datepicker-label" :for="inputId">
      {{ label }}<span v-if="required" class="ds-datepicker-required" aria-hidden="true"> *</span>
    </label>

    <div
      ref="field"
      class="ds-datepicker-field"
      :style="`anchor-name: ${anchorName}`"
      @pointerdown="onFieldPointerdown"
      @click="onFieldClick"
    >
      <input
        :id="inputId"
        ref="input"
        class="ds-datepicker-control"
        type="text"
        readonly
        :value="display"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="label ? undefined : ariaLabel"
        aria-haspopup="dialog"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="panelId"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-required="required ? 'true' : undefined"
        :aria-describedby="hint ? hintId : undefined"
        @keydown="onInputKeydown"
      />

      <button
        v-if="showClear"
        class="ds-datepicker-affix"
        type="button"
        :aria-label="clearLabel"
        @click.stop="clear"
      >
        <Icon name="close" />
      </button>

      <Icon name="calendar_today" class="ds-datepicker-icon" />
    </div>

    <div
      :id="panelId"
      ref="panel"
      class="ds-datepicker-popover"
      popover="auto"
      role="dialog"
      :aria-label="label || ariaLabel"
      :data-placement="placement"
      :style="`position-anchor: ${anchorName}`"
      @toggle="onToggle"
      @focusout="onPanelFocusout"
    >
      <Calendar ref="calendar" v-model="model" v-bind="calendarProps" @select="onSelect">
        <template v-if="$slots.day" #day="scope">
          <slot name="day" v-bind="scope" />
        </template>
        <template v-if="$slots.footer" #footer>
          <slot name="footer" />
        </template>
      </Calendar>
    </div>

    <div v-if="hint" class="ds-datepicker-meta">
      <span :id="hintId" class="ds-datepicker-hint">{{ hint }}</span>
    </div>

    <!-- native form submission: the visible input holds display text, never a name -->
    <input v-for="value in hiddenValues" :key="value" type="hidden" :name="name" :value="value" />
  </div>
</template>

<style>
.ds-datepicker {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--datepicker-stack-gap);
  min-width: 0;
  font-family: var(--font-sans);
}

/* --- label --------------------------------------------------------- */

.ds-datepicker-label {
  font-size: var(--datepicker-label-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1.25;
  color: var(--datepicker-label-color);
  user-select: none;
}

.ds-datepicker-required {
  color: var(--color-danger);
}

/* --- field --------------------------------------------------------- */

.ds-datepicker-field {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--datepicker-gap);
  height: var(--datepicker-height);
  padding-inline: var(--datepicker-padding-inline);
  min-width: 0;
  background-color: var(--datepicker-surface);
  border: 1px solid var(--datepicker-border-color);
  border-radius: var(--datepicker-radius);
  color: var(--datepicker-text-color);
  cursor: pointer;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out),
    box-shadow var(--duration-150) var(--ease-out);
}

.ds-datepicker:not([data-disabled]) .ds-datepicker-field:hover {
  border-color: color-mix(in oklab, var(--datepicker-border-color) 50%, var(--text));
}

/* text inputs always match :focus-visible, so keyboard and mouse focus
   both show the focus style. The box-shadow visually thickens the 1px
   border to 2px without any layout shift */
.ds-datepicker:not([data-disabled])
  .ds-datepicker-field:has(.ds-datepicker-control:focus-visible) {
  border-color: var(--datepicker-accent);
  box-shadow: 0 0 0 1px var(--datepicker-accent);
}

.ds-datepicker[data-disabled] .ds-datepicker-field {
  cursor: not-allowed;
}

/* --- native input ---------------------------------------------------- */

.ds-datepicker-control {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: var(--datepicker-font-size);
  color: inherit;
  /* readonly: the whole field acts as one button */
  cursor: inherit;
}

.ds-datepicker-control::placeholder {
  color: var(--datepicker-placeholder-color);
  opacity: 1;
}

/* --- calendar icon, clear button -------------------------------------- */

.ds-datepicker-field > .ds-icon,
.ds-datepicker-affix > .ds-icon {
  --icon-size: var(--datepicker-icon-size);
}

.ds-datepicker-icon {
  pointer-events: none;
  color: var(--datepicker-icon-color);
}

.ds-datepicker-affix {
  box-sizing: border-box;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--datepicker-icon-color);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--duration-150) var(--ease-out);
}

.ds-datepicker-affix:hover {
  color: var(--datepicker-text-color);
}

/* --- popover (CSS anchor positioning, mirrors Menu) -------------------- */

.ds-datepicker-popover {
  box-sizing: border-box;
  /* undo the UA popover styles (inset: 0 + margin: auto) so the
     position-area grid cell does the placement instead; the gap is
     re-added per placement below, on the field side only */
  position: fixed;
  inset: auto;
  margin: 0;
  width: max-content;
  padding: var(--datepicker-popover-padding);
  border: 1px solid var(--datepicker-popover-border);
  border-radius: var(--datepicker-popover-radius);
  background-color: var(--datepicker-popover-bg);
  color: var(--text);
  box-shadow: var(--datepicker-popover-shadow);
  font-family: var(--font-sans);

  /* hide the panel when its anchor scrolls out of view */
  position-visibility: anchors-visible;
}

/* --- placement (CSS anchor positioning) ------------------------------- */

.ds-datepicker-popover[data-placement^='bottom'] {
  margin-block-start: var(--datepicker-popover-gap);
}

.ds-datepicker-popover[data-placement^='top'] {
  margin-block-end: var(--datepicker-popover-gap);
}

.ds-datepicker-popover[data-placement='bottom-start'] {
  position-area: bottom span-right;
}

.ds-datepicker-popover[data-placement='bottom'] {
  position-area: bottom;
}

.ds-datepicker-popover[data-placement='bottom-end'] {
  position-area: bottom span-left;
}

.ds-datepicker-popover[data-placement='top-start'] {
  position-area: top span-right;
}

.ds-datepicker-popover[data-placement='top'] {
  position-area: top;
}

.ds-datepicker-popover[data-placement='top-end'] {
  position-area: top span-left;
}

/* when the preferred side would overflow the viewport, flip on the
   main axis first, then the cross axis, then both */
.ds-datepicker-popover {
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
}

/* --- enter / exit transition -------------------------------------------- */

.ds-datepicker-popover {
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity var(--duration-150) var(--ease-out),
    transform var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-datepicker-popover:popover-open {
  opacity: 1;
  transform: none;
}

@starting-style {
  .ds-datepicker-popover:popover-open {
    opacity: 0;
    transform: scale(0.98);
  }
}

/* --- hint ----------------------------------------------------------------- */

.ds-datepicker-meta {
  display: flex;
  font-size: var(--datepicker-meta-font-size);
  line-height: 1.25;
  color: var(--datepicker-hint-color);
}
</style>
