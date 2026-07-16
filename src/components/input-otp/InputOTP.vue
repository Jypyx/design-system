<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import './input-otp.tokens.css'
import Spinner from '../spinner/Spinner.vue'
import Icon from '../icon/Icon.vue'
import Input from '../input/Input.vue'
import type { InputOTPFormat, InputOTPProps } from './InputOTP.types'

const props = withDefaults(defineProps<InputOTPProps>(), {
  length: 6,
  format: 'numeric',
  size: 'sm',
  attached: false,
  isLoading: false,
  disabled: false,
  invalid: false,
  label: 'One-time code',
  fieldLabel: 'Character',
})

const emit = defineEmits<{ complete: [code: string] }>()

/** The code as a compact string of the filled characters, in slot order */
const model = defineModel<string>({ default: '' })

const FORMAT_RE: Record<InputOTPFormat, RegExp> = {
  numeric: /[0-9]/,
  alpha: /[a-zA-Z]/,
  alphanumeric: /[0-9a-zA-Z]/,
}

const slotCount = computed(() =>
  props.pattern ? (props.pattern.match(/#/g)?.length ?? 0) : props.length,
)

/* --- layout: groups of slots interleaved with separators ------------ */

type LayoutItem =
  { kind: 'group'; indices: number[] } | { kind: 'icon' } | { kind: 'text'; text: string }

const layout = computed<LayoutItem[]>(() => {
  if (props.pattern) {
    const items: LayoutItem[] = []
    let index = 0
    for (const run of props.pattern.match(/#+|[^#]+/g) ?? []) {
      if (run.startsWith('#')) {
        items.push({
          kind: 'group',
          indices: Array.from({ length: run.length }, (_, k) => index + k),
        })
        index += run.length
      } else if (run.trim()) {
        items.push({ kind: 'text', text: run.trim() })
      }
    }
    return items
  }
  const indices = Array.from({ length: props.length }, (_, k) => k)
  if (props.separator) {
    return indices.flatMap<LayoutItem>((index) =>
      index === 0
        ? [{ kind: 'group', indices: [index] }]
        : [{ kind: 'icon' }, { kind: 'group', indices: [index] }],
    )
  }
  return [{ kind: 'group', indices }]
})

/* --- state: one entry per slot --------------------------------------- */

const chars = ref<string[]>([])

function sanitize(value: string) {
  return [...value].filter((char) => FORMAT_RE[props.format].test(char))
}

function syncFromModel() {
  const valid = sanitize(model.value ?? '').slice(0, slotCount.value)
  chars.value = Array.from({ length: slotCount.value }, (_, i) => valid[i] ?? '')
}

syncFromModel()
watch([slotCount, () => props.format], syncFromModel)
watch(model, (value) => {
  if (value !== chars.value.join('')) syncFromModel()
})

let lastComplete = ''
function commit() {
  const code = chars.value.join('')
  model.value = code
  if (code.length === slotCount.value && code !== lastComplete) {
    lastComplete = code
    emit('complete', code)
  } else if (code.length < slotCount.value) {
    lastComplete = ''
  }
}

/* --- focus ------------------------------------------------------------ */

const fields: Record<number, InstanceType<typeof Input> | null> = {}

function fieldRef(index: number) {
  return (el: unknown) => {
    fields[index] = el as InstanceType<typeof Input> | null
  }
}

function focusField(index: number) {
  fields[Math.max(0, Math.min(index, slotCount.value - 1))]?.focus()
}

/* typing always overwrites the focused cell */
function onFocusIn(event: FocusEvent) {
  const target = event.target as HTMLInputElement
  target.select?.()
}

/* --- editing ----------------------------------------------------------- */

const locked = computed(() => props.disabled || props.isLoading)

/** Writes the valid characters of `data` from `start` on, then moves focus */
function insertAt(start: number, data: string) {
  const valid = sanitize(data)
  if (!valid.length) return
  let index = start
  for (const char of valid) {
    if (index >= slotCount.value) break
    chars.value[index] = char
    index += 1
  }
  commit()
  focusField(index)
}

/* every mutation is intercepted here and applied to `chars` instead of
   the DOM, so the fields always hold exactly one valid character */
function onBeforeInput(index: number, event: Event) {
  const e = event as InputEvent
  if (e.inputType.startsWith('insert')) {
    e.preventDefault()
    if (locked.value) return
    insertAt(index, e.data ?? e.dataTransfer?.getData('text') ?? '')
  } else if (e.inputType.startsWith('delete')) {
    e.preventDefault()
    if (locked.value || !chars.value[index]) return
    chars.value[index] = ''
    commit()
  }
}

/* browser autofill (autocomplete="one-time-code") bypasses beforeinput
   and lands here through the Input's v-model instead */
function onModelUpdate(index: number, value: string | number) {
  const text = String(value ?? '')
  if (locked.value || text === chars.value[index]) return
  insertAt(index, text)
}

function onKeydown(index: number, event: KeyboardEvent) {
  switch (event.key) {
    case 'Backspace':
      /* in an empty cell, Backspace clears the previous cell and moves
         into it — except from the very first cell */
      if (!locked.value && !chars.value[index] && index > 0) {
        event.preventDefault()
        chars.value[index - 1] = ''
        commit()
        focusField(index - 1)
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      focusField(index - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      focusField(index + 1)
      break
    case 'Home':
      event.preventDefault()
      focusField(0)
      break
    case 'End':
      event.preventDefault()
      focusField(slotCount.value - 1)
      break
  }
}
</script>

<template>
  <div
    class="ds-otp"
    role="group"
    :aria-label="label"
    :aria-busy="isLoading ? 'true' : undefined"
    :data-size="size"
    :data-attached="attached ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-loading="isLoading ? '' : undefined"
  >
    <template v-for="(item, k) in layout" :key="k">
      <span v-if="item.kind === 'text'" class="ds-otp-separator" aria-hidden="true">
        {{ item.text }}
      </span>
      <Icon v-else-if="item.kind === 'icon'" :name="separator" />
      <div v-else class="ds-otp-group">
        <Input
          v-for="index in item.indices"
          :key="index"
          :ref="fieldRef(index)"
          :model-value="chars[index]"
          :size="size"
          :type="format === 'numeric' ? 'tel' : 'text'"
          :aria-label="`${fieldLabel} ${index + 1} / ${slotCount}`"
          :autocomplete="index === 0 ? 'one-time-code' : 'off'"
          :disabled="disabled"
          :readonly="isLoading"
          :invalid="invalid"
          @update:model-value="onModelUpdate(index, $event)"
          @beforeinput="onBeforeInput(index, $event)"
          @keydown="onKeydown(index, $event)"
          @focusin="onFocusIn"
        />
      </div>
    </template>
    <Spinner v-if="isLoading" class="ds-otp-spinner" />
  </div>
</template>

<style>
.ds-otp {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--otp-gap);
  font-family: var(--font-sans);
}

.ds-otp-group {
  display: inline-flex;
  align-items: center;
  gap: var(--otp-gap);
  isolation: isolate;
}

/* fixed-width, centered, single-character cells */
.ds-otp .ds-input {
  --input-padding-inline: 0;
  position: relative;
  width: var(--otp-field-width);
  flex: none;
}

.ds-otp .ds-input-control {
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

/* --- separators (pattern literals + icon) ---------------------------- */

.ds-otp-separator {
  font-size: var(--otp-separator-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  color: var(--otp-separator-color);
  user-select: none;
  white-space: pre;
}

.ds-otp > .ds-icon {
  --icon-size: var(--otp-separator-icon-size);
  color: var(--otp-separator-color);
}

/* --- attached: glue the cells of a group ------------------------------ */

.ds-otp[data-attached] .ds-otp-group {
  gap: 0;
}

/* inner corners lose their radius, only the extremities of the group
   stay rounded (logical properties, so RTL comes for free) */
.ds-otp[data-attached] .ds-otp-group > .ds-input:not(:first-child) {
  /* collapse the double border where two cells meet */
  margin-inline-start: -1px;
}

.ds-otp[data-attached] .ds-otp-group > .ds-input:not(:first-child) .ds-input-field {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}

.ds-otp[data-attached] .ds-otp-group > .ds-input:not(:last-child) .ds-input-field {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

/* the hovered / focused cell paints above its neighbors so its merged
   border and focus shadow are never clipped */
.ds-otp[data-attached] .ds-otp-group > .ds-input:hover,
.ds-otp[data-attached] .ds-otp-group > .ds-input:has(.ds-input-control:focus-visible) {
  z-index: 1;
}

/* --- loading ----------------------------------------------------------- */

.ds-otp .ds-otp-spinner {
  --spinner-size: var(--otp-separator-icon-size);
  color: var(--otp-separator-color);
}
</style>
