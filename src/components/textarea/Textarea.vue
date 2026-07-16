<script setup lang="ts">
import { computed, getCurrentInstance, ref, useId } from 'vue'
import './textarea.tokens.css'
import '../../styles/shared/field.css'
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
    class="ds-textarea ds-field"
    :data-size="size"
    :data-auto-resize="autoResize ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-loading="isLoading ? '' : undefined"
  >
    <Typography
      v-if="label"
      as="label"
      variant="label"
      class="ds-textarea-label ds-field-label"
      :for="id"
    >
      {{ label
      }}<span v-if="required" class="ds-textarea-required ds-field-required" aria-hidden="true">
        *</span
      >
    </Typography>
    <div class="ds-textarea-field ds-field-frame">
      <slot name="icon-start">
        <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>
      <textarea
        :id="id"
        ref="control"
        v-model="model"
        class="ds-textarea-control ds-field-control"
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
    <div v-if="hint || showCount" class="ds-textarea-meta ds-field-meta">
      <Typography v-if="hint" :id="hintId" variant="caption" class="ds-textarea-hint ds-field-hint">
        {{ hint }}
      </Typography>
      <Typography v-if="showCount" variant="caption" class="ds-textarea-count ds-field-count">
        {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </Typography>
    </div>
  </div>
</template>

<style>
/* stack, label, frame, control reset and meta row come from the shared
   .ds-field partial (tokens mapped in textarea.tokens.css) */

/* multi-line field: content hugs the top, height follows the rows */
.ds-textarea-field {
  align-items: flex-start;
  padding: var(--textarea-padding-block) var(--textarea-padding-inline);
}

.ds-textarea-control {
  display: block;
  width: 100%;
  resize: none;
  line-height: var(--textarea-line-height);
}

/* grows and shrinks with the content, rows being the minimum height;
   the bordered field follows. Unsupporting browsers keep the fixed
   rows height */
.ds-textarea[data-auto-resize] .ds-textarea-control {
  field-sizing: content;
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
</style>
