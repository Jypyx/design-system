<script setup lang="ts">
import { computed, getCurrentInstance, ref, useId } from 'vue'
import './input.tokens.css'
import '../../styles/shared/field.css'
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
    class="ds-input ds-field"
    :data-size="size"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-loading="isLoading ? '' : undefined"
  >
    <Typography
      v-if="label"
      as="label"
      variant="label"
      class="ds-input-label ds-field-label"
      :for="id"
    >
      {{ label
      }}<span v-if="required" class="ds-input-required ds-field-required" aria-hidden="true">
        *</span
      >
    </Typography>
    <div class="ds-input-field ds-field-frame">
      <slot name="icon-start">
        <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>
      <input
        :id="id"
        ref="input"
        v-model="model"
        class="ds-input-control ds-field-control"
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
    <div v-if="hint || showCount" class="ds-input-meta ds-field-meta">
      <Typography v-if="hint" :id="hintId" variant="caption" class="ds-input-hint ds-field-hint">
        {{ hint }}
      </Typography>
      <Typography v-if="showCount" variant="caption" class="ds-input-count ds-field-count">
        {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </Typography>
    </div>
  </div>
</template>

<style>
/* stack, label, frame, control reset and meta row come from the shared
   .ds-field partial (tokens mapped in input.tokens.css) */

/* a single-line field: fixed height, not min-height */
.ds-input-field {
  height: var(--input-height);
}

.ds-input-control {
  width: 100%;
  height: 100%;
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
</style>
