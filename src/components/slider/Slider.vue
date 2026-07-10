<script setup lang="ts">
import { computed } from 'vue'
import './slider.tokens.css'
import type { SliderModelValue, SliderProps, SliderValue } from './Slider.types'

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
  disabled: false,
  showInputs: false,
  ticks: false,
  tickLabels: false,
  tooltip: false,
  labelStart: 'Minimum',
  labelEnd: 'Maximum',
})

const emit = defineEmits<{ change: [value: SliderModelValue] }>()

defineSlots<{
  /** Tooltip content; receives the thumb's current value */
  tooltip?: (slotProps: { value: SliderValue; thumb: 'start' | 'end' }) => unknown
}>()

const model = defineModel<SliderModelValue>({ default: 0 })

const isRange = computed(() => Array.isArray(model.value))

/* with options the slider moves over indexes; min / max / step are derived */
const lo = computed(() => (props.options ? 0 : props.min))
const hi = computed(() => (props.options ? props.options.length - 1 : props.max))
const inc = computed(() => (props.options ? 1 : props.step))

const toPos = (v: SliderValue) => (props.options ? Math.max(0, props.options.indexOf(v)) : Number(v))
const toValue = (p: number): SliderValue => (props.options ? props.options[p] : p)

const startPos = computed(() =>
  isRange.value ? toPos((model.value as [SliderValue, SliderValue])[0]) : lo.value,
)
const endPos = computed(() =>
  isRange.value ? toPos((model.value as [SliderValue, SliderValue])[1]) : toPos(model.value as SliderValue),
)
const startValue = computed(() => toValue(startPos.value))
const endValue = computed(() => toValue(endPos.value))

/* thumb positions as 0..1 fractions, consumed by the CSS (fill, tooltips) */
const frac = (p: number) => (p - lo.value) / (hi.value - lo.value || 1)
const rootStyle = computed(() => ({
  '--_start': String(frac(startPos.value)),
  '--_end': String(frac(endPos.value)),
}))

const clamp = (p: number) => Math.min(hi.value, Math.max(lo.value, p))

/* in range mode a thumb is pinned by the other one — they never cross */
function setPos(thumb: 'start' | 'end', raw: number) {
  const p = clamp(raw)
  if (!isRange.value) {
    model.value = toValue(p)
  } else if (thumb === 'start') {
    model.value = [toValue(Math.min(p, endPos.value)), endValue.value]
  } else {
    model.value = [startValue.value, toValue(Math.max(p, startPos.value))]
  }
}

/* the native input keeps its own value when we clamp — push ours back */
function sync(thumb: 'start' | 'end', el: HTMLInputElement) {
  el.value = String(thumb === 'start' ? startPos.value : endPos.value)
}

function onSlide(thumb: 'start' | 'end', event: Event) {
  const el = event.target as HTMLInputElement
  setPos(thumb, el.valueAsNumber)
  sync(thumb, el)
}

/* arrows / Home / End come natively; PageUp / PageDown jump 10 steps */
function onKeydown(thumb: 'start' | 'end', event: KeyboardEvent) {
  const pos = thumb === 'start' ? startPos.value : endPos.value
  if (event.key === 'Home') setPos(thumb, lo.value)
  else if (event.key === 'End') setPos(thumb, hi.value)
  else if (event.key === 'PageUp') setPos(thumb, pos + inc.value * 10)
  else if (event.key === 'PageDown') setPos(thumb, pos - inc.value * 10)
  else return
  event.preventDefault()
  sync(thumb, event.target as HTMLInputElement)
  emit('change', model.value)
}

function onFieldChange(thumb: 'start' | 'end', event: Event) {
  const el = event.target as HTMLInputElement
  if (!Number.isNaN(el.valueAsNumber)) {
    setPos(thumb, el.valueAsNumber)
    emit('change', model.value)
  }
  sync(thumb, el)
}

const thumbLabel = (thumb: 'start' | 'end') => {
  if (!isRange.value) return props.label
  const suffix = thumb === 'start' ? props.labelStart : props.labelEnd
  return props.label ? `${props.label} — ${suffix}` : suffix
}

/* one tick per step / option; the max always gets one */
const tickList = computed(() => {
  if (!props.ticks && !props.tickLabels) return []
  const decimals = String(inc.value).split('.')[1]?.length ?? 0
  const items: { pos: number; frac: number; label: string; active: boolean }[] = []
  const push = (p: number) =>
    items.push({
      pos: p,
      frac: frac(p),
      label: String(toValue(p)),
      active: p >= startPos.value && p <= endPos.value,
    })
  const count = Math.floor((hi.value - lo.value) / inc.value + 1e-9)
  for (let i = 0; i <= count; i++) push(Number((lo.value + i * inc.value).toFixed(decimals)))
  if (items[items.length - 1]!.pos < hi.value) push(hi.value)
  return items
})
</script>

<template>
  <div
    class="ds-slider"
    :role="isRange ? 'group' : undefined"
    :aria-label="isRange ? label : undefined"
    :data-orientation="orientation"
    :data-range="isRange ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-tick-labels="tickLabels ? '' : undefined"
    :style="rootStyle"
  >
    <input
      v-if="showInputs && !options && isRange"
      class="ds-slider-field"
      type="number"
      :value="startPos"
      :min="lo"
      :max="hi"
      :step="inc"
      :disabled="disabled"
      :aria-label="thumbLabel('start')"
      @change="onFieldChange('start', $event)"
    />
    <div class="ds-slider-control">
      <div class="ds-slider-rail" aria-hidden="true">
        <div class="ds-slider-fill"></div>
      </div>
      <div v-if="ticks || tickLabels" class="ds-slider-ticks" aria-hidden="true">
        <span
          v-for="tick in tickList"
          :key="tick.pos"
          class="ds-slider-tick"
          :data-active="tick.active ? '' : undefined"
          :style="{ '--_pos': String(tick.frac) }"
        ></span>
      </div>
      <input
        v-if="isRange"
        type="range"
        class="ds-slider-input"
        data-thumb="start"
        :value="startPos"
        :min="lo"
        :max="hi"
        :step="inc"
        :disabled="disabled"
        :aria-label="thumbLabel('start')"
        :aria-valuetext="options ? String(startValue) : undefined"
        :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
        @input="onSlide('start', $event)"
        @change="emit('change', model)"
        @keydown="onKeydown('start', $event)"
      />
      <input
        type="range"
        class="ds-slider-input"
        data-thumb="end"
        :value="endPos"
        :min="lo"
        :max="hi"
        :step="inc"
        :disabled="disabled"
        :aria-label="thumbLabel('end')"
        :aria-valuetext="options ? String(endValue) : undefined"
        :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
        @input="onSlide('end', $event)"
        @change="emit('change', model)"
        @keydown="onKeydown('end', $event)"
      />
      <template v-if="tooltip && !disabled">
        <div v-if="isRange" class="ds-slider-tooltip" data-thumb="start" aria-hidden="true">
          <span class="ds-slider-tooltip-bubble">
            <slot name="tooltip" :value="startValue" thumb="start">{{ startValue }}</slot>
          </span>
        </div>
        <div class="ds-slider-tooltip" data-thumb="end" aria-hidden="true">
          <span class="ds-slider-tooltip-bubble">
            <slot name="tooltip" :value="endValue" thumb="end">{{ endValue }}</slot>
          </span>
        </div>
      </template>
      <div v-if="tickLabels" class="ds-slider-labels" aria-hidden="true">
        <span
          v-for="tick in tickList"
          :key="tick.pos"
          class="ds-slider-label"
          :style="{ '--_pos': String(tick.frac) }"
        >
          <span class="ds-slider-label-text">{{ tick.label }}</span>
        </span>
      </div>
    </div>
    <input
      v-if="showInputs && !options"
      class="ds-slider-field"
      type="number"
      :value="endPos"
      :min="lo"
      :max="hi"
      :step="inc"
      :disabled="disabled"
      :aria-label="thumbLabel('end')"
      @change="onFieldChange('end', $event)"
    />
  </div>
</template>

<style>
.ds-slider {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--slider-gap);
  font-family: var(--font-sans);
}

/* tick labels are absolutely positioned and overflow into this padding;
   flex centering uses the content box, so the track stays aligned */
.ds-slider[data-tick-labels] {
  padding-block-end: var(--slider-label-space);
}

.ds-slider[data-orientation='vertical'] {
  display: inline-flex;
  /* keeps the DOM order (start field, track, end field) reading bottom-up */
  flex-direction: column-reverse;
  height: var(--slider-length);
}

.ds-slider[data-orientation='vertical'][data-tick-labels] {
  padding-block-end: 0;
  padding-inline-end: var(--slider-label-space);
}

/* --- track area ------------------------------------------------------
   The control gets a vertical writing mode in vertical orientation:
   the native range inputs render vertically and every logical inset
   below (rail, fill, ticks, tooltips, labels) flips for free.
   direction: rtl makes the value grow bottom-up. */

.ds-slider-control {
  position: relative;
  flex: 1;
  block-size: var(--slider-thumb-size);
  min-inline-size: 0;
}

.ds-slider[data-orientation='vertical'] .ds-slider-control {
  writing-mode: vertical-lr;
  direction: rtl;
}

/* --- rail + fill ------------------------------------------------------ */

.ds-slider-rail {
  position: absolute;
  inset-inline: 0;
  inset-block: calc((var(--slider-thumb-size) - var(--slider-track-size)) / 2);
  border-radius: var(--radius-full);
  background-color: var(--slider-track-color);
  overflow: hidden;
}

/* spans from the leading edge of the start thumb to the trailing edge of
   the end thumb (thumb centers travel over 100% minus one thumb size) */
.ds-slider-fill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: calc(var(--_start) * (100% - var(--slider-thumb-size)));
  inset-inline-end: calc((1 - var(--_end)) * (100% - var(--slider-thumb-size)));
  background-color: var(--slider-accent);
}

/* --- ticks ------------------------------------------------------------ */

.ds-slider-ticks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ds-slider-tick {
  position: absolute;
  inline-size: var(--slider-tick-size);
  block-size: var(--slider-tick-size);
  inset-block-start: calc(50% - var(--slider-tick-size) / 2);
  inset-inline-start: calc(
    var(--slider-thumb-size) / 2 + var(--_pos) * (100% - var(--slider-thumb-size)) -
      var(--slider-tick-size) / 2
  );
  border-radius: var(--radius-full);
  background-color: var(--slider-tick-color);
}

.ds-slider-tick[data-active] {
  background-color: var(--slider-tick-active-color);
}

/* --- native range inputs ---------------------------------------------- */

.ds-slider-input {
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.ds-slider[data-disabled] .ds-slider-input {
  cursor: not-allowed;
}

/* in range mode the two inputs overlap entirely: only the thumbs catch
   the pointer, so each one stays independently draggable */
.ds-slider[data-range] .ds-slider-input {
  pointer-events: none;
}

.ds-slider-input::-webkit-slider-runnable-track {
  background: transparent;
}

.ds-slider-input::-moz-range-track {
  background: transparent;
}

/* thumb — webkit and gecko selectors cannot be comma-joined (an unknown
   pseudo-element drops the whole rule), hence the duplication */

.ds-slider-input::-webkit-slider-thumb {
  appearance: none;
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  border: none;
  border-radius: var(--radius-full);
  background-color: var(--slider-thumb-color);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--duration-150) var(--ease-out);
}

.ds-slider-input::-moz-range-thumb {
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  border: none;
  border-radius: var(--radius-full);
  background-color: var(--slider-thumb-color);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--duration-150) var(--ease-out);
}

.ds-slider[data-range] .ds-slider-input::-webkit-slider-thumb {
  pointer-events: auto;
}

.ds-slider[data-range] .ds-slider-input::-moz-range-thumb {
  pointer-events: auto;
}

.ds-slider-input:hover:not(:disabled)::-webkit-slider-thumb {
  background-color: color-mix(in oklab, var(--slider-thumb-color) 88%, var(--slider-on-accent));
}

.ds-slider-input:hover:not(:disabled)::-moz-range-thumb {
  background-color: color-mix(in oklab, var(--slider-thumb-color) 88%, var(--slider-on-accent));
}

.ds-slider-input:focus-visible {
  outline: none;
}

.ds-slider-input:focus-visible::-webkit-slider-thumb {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.ds-slider-input:focus-visible::-moz-range-thumb {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.ds-slider[data-disabled] .ds-slider-input::-webkit-slider-thumb {
  box-shadow: none;
}

.ds-slider[data-disabled] .ds-slider-input::-moz-range-thumb {
  box-shadow: none;
}

/* --- tooltips ----------------------------------------------------------
   Positioned above the thumb (beside it in vertical orientation); the
   inner bubble resets the writing mode so its content stays horizontal. */

.ds-slider-tooltip {
  position: absolute;
  inset-block-end: calc(100% + var(--spacing-1\.5));
  inset-inline-start: calc(
    var(--slider-thumb-size) / 2 + var(--_pos) * (100% - var(--slider-thumb-size))
  );
  translate: -50% 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-150) var(--ease-out);
}

.ds-slider-tooltip[data-thumb='start'] {
  --_pos: var(--_start);
}

.ds-slider-tooltip[data-thumb='end'] {
  --_pos: var(--_end);
}

.ds-slider[data-orientation='vertical'] .ds-slider-tooltip {
  translate: 0 50%;
}

.ds-slider-control:has(.ds-slider-input[data-thumb='start']:is(:hover, :active, :focus-visible))
  .ds-slider-tooltip[data-thumb='start'],
.ds-slider-control:has(.ds-slider-input[data-thumb='end']:is(:hover, :active, :focus-visible))
  .ds-slider-tooltip[data-thumb='end'] {
  opacity: 1;
}

.ds-slider-tooltip-bubble {
  writing-mode: horizontal-tb;
  direction: ltr;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  inline-size: max-content;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  background-color: var(--slider-tooltip-surface);
  color: var(--slider-tooltip-color);
  font-size: var(--text-xs);
  line-height: 1.25;
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

.ds-slider-tooltip-bubble .ds-icon {
  --icon-size: 14px;
}

/* --- tick labels -------------------------------------------------------- */

.ds-slider-labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ds-slider-label {
  position: absolute;
  inset-block-start: calc(100% + var(--slider-label-gap));
  inset-inline-start: calc(
    var(--slider-thumb-size) / 2 + var(--_pos) * (100% - var(--slider-thumb-size))
  );
  translate: -50% 0;
}

.ds-slider[data-orientation='vertical'] .ds-slider-label {
  translate: 0 50%;
}

.ds-slider-label-text {
  writing-mode: horizontal-tb;
  direction: ltr;
  display: block;
  inline-size: max-content;
  font-size: var(--slider-label-font-size);
  line-height: 1.25;
  color: var(--slider-label-color);
  user-select: none;
}

/* --- number inputs ------------------------------------------------------ */

.ds-slider-field {
  box-sizing: border-box;
  flex: none;
  margin: 0;
  width: var(--slider-field-width);
  height: var(--slider-field-height);
  padding-inline: var(--spacing-2);
  border: 1px solid var(--slider-field-border);
  border-radius: var(--radius-md);
  background-color: var(--slider-field-surface);
  color: var(--slider-field-color);
  font-family: inherit;
  font-size: var(--text-sm);
  text-align: center;
  font-variant-numeric: tabular-nums;
  transition:
    border-color var(--duration-150) var(--ease-out),
    box-shadow var(--duration-150) var(--ease-out);
}

.ds-slider-field:hover:not(:disabled) {
  border-color: color-mix(in oklab, var(--slider-field-border) 50%, var(--text));
}

/* the box-shadow visually thickens the 1px border to 2px (same recipe as
   the Input component) */
.ds-slider-field:focus-visible {
  outline: none;
  border-color: var(--slider-accent);
  box-shadow: 0 0 0 1px var(--slider-accent);
}

.ds-slider-field:disabled {
  cursor: not-allowed;
}
</style>
