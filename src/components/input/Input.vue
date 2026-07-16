<script setup lang="ts">
import { computed, getCurrentInstance, ref, useId } from 'vue'
import './input.tokens.css'
import '../../styles/shared/icon-button.css'
import { iconProps } from '../shared/utils'
import Spinner from '../spinner/Spinner.vue'
import Icon from '../icon/Icon.vue'
import Typography from '../typography/Typography.vue'
import type { InputProps } from './Input.types'

const props = withDefaults(defineProps<InputProps>(), {
  size: 'sm',
  type: 'text',
  clearable: false,
  clearLabel: 'Clear',
  isLoading: false,
  showCount: false,
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
})

const emit = defineEmits<{ clear: []; 'icon-end-click': [MouseEvent] }>()

const model = defineModel<string | number>({ default: '' })

const id = useId()
const hintId = useId()
const input = ref<HTMLInputElement | null>(null)

const count = computed(() => String(model.value ?? '').length)
const showClear = computed(
  () => props.clearable && count.value > 0 && !props.disabled && !props.readonly,
)

/* the end icon only becomes a button when someone listens to icon-end-click */
const instance = getCurrentInstance()
const iconEndClickable = computed(() => !!instance?.vnode.props?.onIconEndClick)

function clear() {
  model.value = ''
  emit('clear')
  input.value?.focus()
}

defineExpose({
  /** the native input element */
  input,
  /** focuses the native input */
  focus: () => input.value?.focus(),
})
</script>

<template>
  <div
    class="ds-input"
    :data-size="size"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-loading="isLoading ? '' : undefined"
  >
    <Typography v-if="label" as="label" variant="label" class="ds-input-label" :for="id">
      {{ label }}<span v-if="required" class="ds-input-required" aria-hidden="true"> *</span>
    </Typography>
    <div class="ds-input-field">
      <slot name="icon-start">
        <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>
      <input
        :id="id"
        ref="input"
        v-model="model"
        class="ds-input-control"
        :type="type"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :name="name"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-label="ariaLabel"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-busy="isLoading ? 'true' : undefined"
        :aria-describedby="hint ? hintId : undefined"
      />
      <button
        v-if="showClear"
        class="ds-input-affix ds-icon-btn"
        type="button"
        :aria-label="clearLabel"
        @click="clear"
      >
        <Icon name="close" />
      </button>
      <Spinner v-if="isLoading" class="ds-input-spinner" />
      <button
        v-else-if="iconEndClickable && (iconEnd || $slots['icon-end'])"
        class="ds-input-affix ds-icon-btn"
        type="button"
        :aria-label="iconEndLabel"
        :disabled="disabled"
        @click="emit('icon-end-click', $event)"
      >
        <slot name="icon-end">
          <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
        </slot>
      </button>
      <slot v-else name="icon-end">
        <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </div>
    <div v-if="hint || showCount" class="ds-input-meta">
      <Typography v-if="hint" :id="hintId" variant="caption" class="ds-input-hint">
        {{ hint }}
      </Typography>
      <Typography v-if="showCount" variant="caption" class="ds-input-count">
        {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </Typography>
    </div>
  </div>
</template>

<style>
.ds-input {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--input-stack-gap);
  min-width: 0;
  font-family: var(--font-sans);
}

/* --- label --------------------------------------------------------- */

.ds-typography.ds-input-label {
  --typo-size: var(--input-label-font-size);
  --typo-line-height: 1.25;
  --typo-color: var(--input-label-color);

  user-select: none;
}

.ds-input-required {
  color: var(--color-danger);
}

/* --- field --------------------------------------------------------- */

.ds-input-field {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--input-gap);
  height: var(--input-height);
  padding-inline: var(--input-padding-inline);
  min-width: 0;
  background-color: var(--input-surface);
  border: 1px solid var(--input-border-color);
  border-radius: var(--input-radius);
  color: var(--input-text-color);
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out),
    box-shadow var(--duration-150) var(--ease-out);
}

.ds-input:not([data-disabled], [data-readonly]) .ds-input-field:hover {
  border-color: color-mix(in oklab, var(--input-border-color) 50%, var(--text));
}

/* text inputs always match :focus-visible, so keyboard and mouse focus
   both show the focus style; a focused clear / end-icon button does not.
   The box-shadow visually thickens the 1px border to 2px without any
   layout shift */
.ds-input:not([data-disabled]) .ds-input-field:has(> .ds-input-control:focus-visible) {
  border-color: var(--input-accent);
  box-shadow: 0 0 0 1px var(--input-accent);
}

.ds-input[data-disabled] .ds-input-field {
  cursor: not-allowed;
}

/* --- native input -------------------------------------------------- */

.ds-input-control {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: var(--input-font-size);
  color: inherit;
}

.ds-input-control::placeholder {
  color: var(--input-placeholder-color);
  opacity: 1;
}

.ds-input-control:disabled {
  cursor: not-allowed;
}

/* the clearable prop replaces the native search cancel button */
.ds-input-control::-webkit-search-cancel-button {
  display: none;
}

/* no native spin buttons on type="number" */
.ds-input-control::-webkit-outer-spin-button,
.ds-input-control::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.ds-input-control[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* --- icons + affix buttons (clear, clickable end icon) -------------- */

.ds-input-field > .ds-icon,
.ds-input-affix > .ds-icon {
  --icon-size: var(--input-icon-size);
}

.ds-input-field > .ds-icon {
  color: var(--input-icon-color);
}

/* shared .ds-icon-btn reset — only the colors are component-specific */
.ds-input-affix {
  --icon-btn-color: var(--input-icon-color);
  --icon-btn-hover-color: var(--input-text-color);
}

/* --- loading -------------------------------------------------------- */

.ds-input .ds-input-spinner {
  --spinner-size: var(--input-icon-size);
  color: var(--input-icon-color);
}

/* --- hint + counter -------------------------------------------------- */

.ds-input-meta {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.ds-typography.ds-input-hint,
.ds-typography.ds-input-count {
  --typo-size: var(--input-meta-font-size);
  --typo-line-height: 1.25;
  --typo-color: var(--input-hint-color);
}

.ds-input-count {
  margin-inline-start: auto;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>
