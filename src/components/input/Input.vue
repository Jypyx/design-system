<script setup lang="ts">
import { computed, getCurrentInstance, ref, useId } from 'vue'
import './input.tokens.css'
import Icon from '../icon/Icon.vue'
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

const emit = defineEmits<{ 'clear': []; 'icon-end-click': [MouseEvent] }>()

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

/* Material Symbols names never contain '.', '/' or ':' — anything that
   does is an image / SVG URL and renders through Icon's src prop */
const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })

function clear() {
  model.value = ''
  emit('clear')
  input.value?.focus()
}
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
    <label v-if="label" class="ds-input-label" :for="id">
      {{ label }}<span v-if="required" class="ds-input-required" aria-hidden="true"> *</span>
    </label>
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
        :name="name"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-busy="isLoading ? 'true' : undefined"
        :aria-describedby="hint ? hintId : undefined"
      />
      <button
        v-if="showClear"
        class="ds-input-affix"
        type="button"
        :aria-label="clearLabel"
        @click="clear"
      >
        <Icon name="close" />
      </button>
      <svg
        v-if="isLoading"
        class="ds-input-spinner"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
      <button
        v-else-if="iconEndClickable && (iconEnd || $slots['icon-end'])"
        class="ds-input-affix"
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
      <span v-if="hint" :id="hintId" class="ds-input-hint">{{ hint }}</span>
      <span v-if="showCount" class="ds-input-count">
        {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </span>
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

.ds-input-label {
  font-size: var(--input-label-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1.25;
  color: var(--input-label-color);
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
    border-color var(--duration-150) var(--ease-out);
}

.ds-input:not([data-disabled], [data-readonly]) .ds-input-field:hover {
  border-color: color-mix(in oklab, var(--input-border-color) 50%, var(--text));
}

/* text inputs always match :focus-visible, so keyboard and mouse focus
   both show the ring; a focused clear / end-icon button does not */
.ds-input:not([data-disabled]) .ds-input-field:has(> .ds-input-control:focus-visible) {
  border-color: var(--input-accent);
  outline: var(--focus-ring);
  outline-color: var(--input-accent);
  outline-offset: var(--focus-ring-offset);
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

/* --- icons + affix buttons (clear, clickable end icon) -------------- */

.ds-input-field > .ds-icon,
.ds-input-affix > .ds-icon {
  --icon-size: var(--input-icon-size);
}

.ds-input-field > .ds-icon {
  color: var(--input-icon-color);
}

.ds-input-affix {
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
  color: var(--input-icon-color);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--duration-150) var(--ease-out);
}

.ds-input-affix:hover:not(:disabled) {
  color: var(--input-text-color);
}

.ds-input-affix:disabled {
  cursor: not-allowed;
}

.ds-input-affix:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 1px;
}

/* --- loading -------------------------------------------------------- */

.ds-input-spinner {
  flex: none;
  width: var(--input-icon-size);
  height: var(--input-icon-size);
  color: var(--input-icon-color);
  animation: ds-input-spin calc(var(--duration-500) * 1.5) var(--ease-linear) infinite;
}

@keyframes ds-input-spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- hint + counter -------------------------------------------------- */

.ds-input-meta {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-3);
  font-size: var(--input-meta-font-size);
  line-height: 1.25;
  color: var(--input-hint-color);
}

.ds-input-count {
  margin-inline-start: auto;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>
