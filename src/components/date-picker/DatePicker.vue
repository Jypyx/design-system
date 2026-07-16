<script setup lang="ts">
import './date-picker.tokens.css'
import '../../styles/shared/icon-button.css'
import '../../styles/shared/popover.css'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useAnchor } from '../shared/use-anchor'
import { usePopoverToggle } from '../shared/use-popover-toggle'
import Calendar from '../calendar/Calendar.vue'
import Icon from '../icon/Icon.vue'
import Input from '../input/Input.vue'
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

const emit = defineEmits<{ open: []; close: []; clear: [] }>()

const model = defineModel<CalendarModelValue>({ default: null })

defineSlots<{
  /** forwarded to the Calendar's day slot */
  day?: (scope: CalendarDayScope) => unknown
  /** forwarded to the Calendar's footer slot */
  footer?: () => unknown
}>()

/* one dashed-ident per instance ties the Input's field (anchor-name, set
   in CSS through the inherited --_dp-anchor custom property) to the
   popover (position-anchor); all placement logic then lives in CSS */
const { id: panelId, anchorName } = useAnchor('datepicker')

const root = useTemplateRef<HTMLElement>('root')
const inputComponent = useTemplateRef<InstanceType<typeof Input>>('inputComponent')
const nativeInput = computed(() => inputComponent.value?.input ?? null)
const panel = ref<HTMLElement | null>(null)
const calendar = useTemplateRef<InstanceType<typeof Calendar>>('calendar')

const isOpen = ref(false)

/* Input renders the label / hint itself; the popup contract must land on
   its native input, out of reach of fallthrough attrs (they stop at the
   Input root) — same wiring-by-hand as Menu's slotted trigger */
onMounted(() => {
  const el = nativeInput.value
  el?.setAttribute('aria-haspopup', 'dialog')
  el?.setAttribute('aria-controls', panelId)
  el?.setAttribute('aria-expanded', 'false')
})

watch(isOpen, (open) => {
  nativeInput.value?.setAttribute('aria-expanded', open ? 'true' : 'false')
})

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
  inputComponent.value?.focus()
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

/* the shared toggle dance; the listener sits on the Input root, so hint
   clicks are filtered out — they are not field clicks */
const { onTriggerPointerdown: onFieldPointerdown, onTriggerClick: onFieldClick } = usePopoverToggle(
  {
    popover: () => panel.value,
    disabled: () => props.disabled,
    isTriggerClick: (event) =>
      !!(event.target as Element).closest('.ds-input-field, .ds-input-label'),
    open,
    close,
  },
)

function onInputKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (
    event.key === 'Enter' ||
    event.key === ' ' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowUp'
  ) {
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
  if (root.value?.contains(next)) return
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
  inputComponent.value?.focus()
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
  input: nativeInput,
  /** focuses the native input */
  focus: () => inputComponent.value?.focus(),
  /** opens the calendar popover */
  open,
  /** closes the calendar popover */
  close,
})
</script>

<template>
  <div
    ref="root"
    class="ds-datepicker"
    :style="`--_dp-anchor: ${anchorName}`"
    :data-open="isOpen ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <Input
      ref="inputComponent"
      :model-value="display"
      readonly
      :size="size"
      :label="label"
      :aria-label="label ? undefined : ariaLabel"
      :placeholder="placeholder"
      :hint="hint"
      :disabled="disabled"
      :required="required"
      :invalid="invalid"
      @pointerdown="onFieldPointerdown"
      @click="onFieldClick"
      @keydown="onInputKeydown"
    >
      <!-- Input's own clearable is blocked on readonly fields, so the
           clear button rides in the icon-end slot next to the calendar icon -->
      <template #icon-end>
        <button
          v-if="showClear"
          class="ds-datepicker-clear ds-icon-btn"
          type="button"
          :aria-label="clearLabel"
          @click.stop="clear"
        >
          <Icon name="close" />
        </button>
        <Icon name="calendar_today" class="ds-datepicker-icon" />
      </template>
    </Input>

    <div
      :id="panelId"
      ref="panel"
      class="ds-datepicker-popover ds-popover"
      popover="auto"
      role="dialog"
      :aria-label="label || ariaLabel"
      :data-placement="placement"
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

    <!-- native form submission: the visible input holds display text, never a name -->
    <input v-for="value in hiddenValues" :key="value" type="hidden" :name="name" :value="value" />
  </div>
</template>

<style>
.ds-datepicker {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
}

/* --- field: an Input dressed as a picker trigger ---------------------- */

/* the popover anchors to the Input's field box, not the whole component
   (label and hint included); the dashed-ident travels through the
   inherited --_dp-anchor custom property because Input owns that element */
.ds-datepicker .ds-input-field {
  anchor-name: var(--_dp-anchor, none);
}

/* the readonly field acts as one big button */
.ds-datepicker:not([data-disabled]) .ds-input-field,
.ds-datepicker:not([data-disabled]) .ds-input-control {
  cursor: pointer;
}

/* Input mutes its hover affordance on readonly fields; a picker field
   stays interactive, so bring it back */
.ds-datepicker:not([data-disabled]) .ds-input[data-readonly] .ds-input-field:hover {
  border-color: color-mix(in oklab, var(--input-border-color) 50%, var(--text));
}

/* --- clear button (shared .ds-icon-btn reset, same colors as the
   Input affixes) -------------------------------------------------------- */

.ds-datepicker-clear {
  --icon-btn-color: var(--input-icon-color);
  --icon-btn-hover-color: var(--input-text-color);
}

.ds-datepicker-clear > .ds-icon {
  --icon-size: var(--input-icon-size);
}

/* --- popover (CSS anchor positioning, mirrors Menu) -------------------- */

/* geometry, placement map and transition come from the shared
   .ds-popover partial */
.ds-datepicker-popover {
  --popover-gap: var(--datepicker-popover-gap);
  position-anchor: var(--_dp-anchor, auto);
  padding: var(--datepicker-popover-padding);
  border: 1px solid var(--datepicker-popover-border);
  border-radius: var(--datepicker-popover-radius);
  background-color: var(--datepicker-popover-bg);
  color: var(--text);
  box-shadow: var(--datepicker-popover-shadow);
  font-family: var(--font-sans);
}
</style>
