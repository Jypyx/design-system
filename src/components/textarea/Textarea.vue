<script setup lang="ts">
import { computed, getCurrentInstance, ref, useId } from 'vue'
import './textarea.tokens.css'
import '../../styles/shared/icon-button.css'
import { iconProps } from '../shared/utils'
import Spinner from '../spinner/Spinner.vue'
import Icon from '../icon/Icon.vue'
import Typography from '../typography/Typography.vue'
import type { TextareaProps } from './Textarea.types'

const props = withDefaults(defineProps<TextareaProps>(), {
  size: 'sm',
  rows: 3,
  autoResize: false,
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

const model = defineModel<string>({ default: '' })

const id = useId()
const hintId = useId()
const control = ref<HTMLTextAreaElement | null>(null)

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
  control.value?.focus()
}
</script>

<template>
  <div
    class="ds-textarea"
    :data-size="size"
    :data-auto-resize="autoResize ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-loading="isLoading ? '' : undefined"
  >
    <Typography v-if="label" as="label" variant="label" class="ds-textarea-label" :for="id">
      {{ label }}<span v-if="required" class="ds-textarea-required" aria-hidden="true"> *</span>
    </Typography>
    <div class="ds-textarea-field">
      <slot name="icon-start">
        <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>
      <textarea
        :id="id"
        ref="control"
        v-model="model"
        class="ds-textarea-control"
        :rows="rows"
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
      ></textarea>
      <button
        v-if="showClear"
        class="ds-textarea-affix ds-icon-btn"
        type="button"
        :aria-label="clearLabel"
        @click="clear"
      >
        <Icon name="close" />
      </button>
      <Spinner v-if="isLoading" class="ds-textarea-spinner" />
      <button
        v-else-if="iconEndClickable && (iconEnd || $slots['icon-end'])"
        class="ds-textarea-affix ds-icon-btn"
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
    <div v-if="hint || showCount" class="ds-textarea-meta">
      <Typography v-if="hint" :id="hintId" variant="caption" class="ds-textarea-hint">
        {{ hint }}
      </Typography>
      <Typography v-if="showCount" variant="caption" class="ds-textarea-count">
        {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </Typography>
    </div>
  </div>
</template>

<style>
.ds-textarea {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--textarea-stack-gap);
  min-width: 0;
  font-family: var(--font-sans);
}

/* --- label --------------------------------------------------------- */

.ds-typography.ds-textarea-label {
  --typo-size: var(--textarea-label-font-size);
  --typo-line-height: 1.25;
  --typo-color: var(--textarea-label-color);

  user-select: none;
}

.ds-textarea-required {
  color: var(--color-danger);
}

/* --- field --------------------------------------------------------- */

.ds-textarea-field {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: var(--textarea-gap);
  padding: var(--textarea-padding-block) var(--textarea-padding-inline);
  min-width: 0;
  background-color: var(--textarea-surface);
  border: 1px solid var(--textarea-border-color);
  border-radius: var(--textarea-radius);
  color: var(--textarea-text-color);
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out),
    box-shadow var(--duration-150) var(--ease-out);
}

.ds-textarea:not([data-disabled], [data-readonly]) .ds-textarea-field:hover {
  border-color: color-mix(in oklab, var(--textarea-border-color) 50%, var(--text));
}

/* textareas always match :focus-visible, so keyboard and mouse focus
   both show the focus style; a focused clear / end-icon button does not.
   The box-shadow visually thickens the 1px border to 2px without any
   layout shift */
.ds-textarea:not([data-disabled]) .ds-textarea-field:has(> .ds-textarea-control:focus-visible) {
  border-color: var(--textarea-accent);
  box-shadow: 0 0 0 1px var(--textarea-accent);
}

.ds-textarea[data-disabled] .ds-textarea-field {
  cursor: not-allowed;
}

/* --- native textarea ------------------------------------------------ */

.ds-textarea-control {
  box-sizing: border-box;
  display: block;
  flex: 1;
  min-width: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: var(--textarea-font-size);
  line-height: var(--textarea-line-height);
  color: inherit;
}

/* grows and shrinks with the content, rows being the minimum height;
   the bordered field follows. Unsupporting browsers keep the fixed
   rows height */
.ds-textarea[data-auto-resize] .ds-textarea-control {
  field-sizing: content;
}

.ds-textarea-control::placeholder {
  color: var(--textarea-placeholder-color);
  opacity: 1;
}

.ds-textarea-control:disabled {
  cursor: not-allowed;
}

/* --- icons + affix buttons (clear, clickable end icon) -------------- */

.ds-textarea-field > .ds-icon,
.ds-textarea-affix > .ds-icon {
  --icon-size: var(--textarea-icon-size);
}

.ds-textarea-field > .ds-icon {
  color: var(--textarea-icon-color);
}

/* shared .ds-icon-btn reset — only the colors are component-specific */
.ds-textarea-affix {
  --icon-btn-color: var(--textarea-icon-color);
  --icon-btn-hover-color: var(--textarea-text-color);
}

/* icons and buttons hug the top of the field: center them on the first
   text line so they read as part of it (stays after the affix reset) */
.ds-textarea-field > .ds-icon,
.ds-textarea-affix,
.ds-textarea-spinner {
  margin-block-start: calc(
    (var(--textarea-font-size) * var(--textarea-line-height) - var(--textarea-icon-size)) / 2
  );
}

/* --- loading -------------------------------------------------------- */

.ds-textarea .ds-textarea-spinner {
  --spinner-size: var(--textarea-icon-size);
  color: var(--textarea-icon-color);
}

/* --- hint + counter -------------------------------------------------- */

.ds-textarea-meta {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.ds-typography.ds-textarea-hint,
.ds-typography.ds-textarea-count {
  --typo-size: var(--textarea-meta-font-size);
  --typo-line-height: 1.25;
  --typo-color: var(--textarea-hint-color);
}

.ds-textarea-count {
  margin-inline-start: auto;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>
