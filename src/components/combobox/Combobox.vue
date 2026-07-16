<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import './combobox.tokens.css'
import '../../styles/shared/icon-button.css'
import { fold, iconProps } from '../shared/utils'
import Spinner from '../spinner/Spinner.vue'
import Chip from '../chip/Chip.vue'
import Icon from '../icon/Icon.vue'
import Typography from '../typography/Typography.vue'
import type { ChipSize } from '../chip/Chip.types'
import type {
  ComboboxModelValue,
  ComboboxOption,
  ComboboxProps,
  ComboboxValue,
} from './Combobox.types'

const props = withDefaults(defineProps<ComboboxProps>(), {
  multiple: false,
  size: 'sm',
  clearable: false,
  clearLabel: 'Clear',
  isLoading: false,
  disabled: false,
  required: false,
  invalid: false,
  chips: true,
  checkIcon: 'check',
  emptyText: 'No results',
  selectAll: false,
  selectAllLabel: 'Select all',
})

const emit = defineEmits<{ clear: []; open: []; close: [] }>()

const model = defineModel<ComboboxModelValue>({ default: null })

/* one dashed-ident per instance ties the field (anchor-name) to its
   popover (position-anchor); all placement logic then lives in CSS */
const uid = useId()
const anchorName = `--ds-combobox-${uid}`
const inputId = `ds-combobox-input-${uid}`
const listboxId = `ds-combobox-list-${uid}`
const hintId = `ds-combobox-hint-${uid}`
const selectAllId = `${listboxId}-all`

const input = ref<HTMLInputElement | null>(null)
const popover = ref<HTMLElement | null>(null)

const isOpen = ref(false)
const query = ref('')
/* opening a single-select showing its selected label must not pre-filter
   the list, so filtering only kicks in once the user actually types */
const hasTyped = ref(false)
const activeIndex = ref(-1)

/* --- selection ------------------------------------------------------ */

/* normalized view of the model: always an array of values */
const selected = computed<ComboboxValue[]>(() => {
  if (props.multiple) return Array.isArray(model.value) ? model.value : []
  return model.value == null ? [] : [model.value as ComboboxValue]
})

/* model values missing from options are ignored for display (no crash) */
const selectedOptions = computed<ComboboxOption[]>(() => {
  const byValue = new Map(props.options.map((option) => [option.value, option]))
  return selected.value
    .map((value) => byValue.get(value))
    .filter((option): option is ComboboxOption => option !== undefined)
})

const isSelected = (value: ComboboxValue) => selected.value.includes(value)

const visibleSelected = computed(() =>
  props.maxVisible ? selectedOptions.value.slice(0, props.maxVisible) : selectedOptions.value,
)
const hiddenCount = computed(() => selectedOptions.value.length - visibleSelected.value.length)
const hiddenLabels = computed(() =>
  selectedOptions.value
    .slice(visibleSelected.value.length)
    .map((option) => option.label)
    .join(', '),
)

/* chip heights (20/20/26/32) fit inside the field heights (28/36/44/52) */
const chipSizes: Record<string, ChipSize> = { xs: 'xs', sm: 'xs', md: 'sm', lg: 'md' }
const chipSize = computed(() => chipSizes[props.size])

/* --- filtering ------------------------------------------------------ */

const filtered = computed<ComboboxOption[]>(() => {
  if (!hasTyped.value || !query.value) return props.options
  const needle = fold(query.value)
  return props.options.filter((option) => fold(option.label).includes(needle))
})

/* filtered options bucketed by their group, in first-appearance order;
   ungrouped options render bare (no role="group" wrapper) */
const groupedOptions = computed(() => {
  const groups: { name: string | undefined; entries: { option: ComboboxOption; id: string }[] }[] =
    []
  const byName = new Map<string | undefined, (typeof groups)[number]>()
  filtered.value.forEach((option, index) => {
    let group = byName.get(option.group)
    if (!group) {
      group = { name: option.group, entries: [] }
      byName.set(option.group, group)
      groups.push(group)
    }
    group.entries.push({ option, id: `${listboxId}-opt-${index}` })
  })
  return groups
})

/* --- active option (aria-activedescendant) -------------------------- */

const showSelectAll = computed(() => props.multiple && props.selectAll && filtered.value.length > 0)

/* the keyboard walks this list: select-all row first, then every enabled
   filtered option; disabled options render but are skipped */
const navigable = computed(() => {
  const entries: { id: string; option?: ComboboxOption }[] = []
  if (showSelectAll.value) entries.push({ id: selectAllId })
  filtered.value.forEach((option, index) => {
    if (!option.disabled) entries.push({ id: `${listboxId}-opt-${index}`, option })
  })
  return entries
})

const activeId = computed(() => navigable.value[activeIndex.value]?.id)

function setActive(id: string) {
  const index = navigable.value.findIndex((entry) => entry.id === id)
  if (index !== -1) activeIndex.value = index
}

watch(activeId, (id) => {
  if (id && isOpen.value) document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
})

/* --- open / close ---------------------------------------------------- */
/* popover="manual": the input keeps real focus the whole time, so light
   dismiss is simply the blur handler. Every interactive element inside
   the field or the popover MUST prevent mousedown, otherwise it would
   blur the input and close the list before its own click lands. */

function initialActive(fromEnd: boolean): number {
  const entries = navigable.value
  if (!entries.length) return -1
  if (!props.multiple && selected.value.length) {
    const index = entries.findIndex((entry) => entry.option?.value === selected.value[0])
    if (index !== -1) return index
  }
  return fromEnd ? entries.length - 1 : 0
}

function openList(fromEnd = false) {
  const el = popover.value
  if (isOpen.value || props.disabled || !el) return
  query.value = ''
  hasTyped.value = false
  isOpen.value = true
  if (!el.matches(':popover-open')) el.showPopover()
  activeIndex.value = initialActive(fromEnd)
  emit('open')
}

function closeList() {
  if (!isOpen.value) return
  isOpen.value = false
  activeIndex.value = -1
  query.value = ''
  hasTyped.value = false
  const el = popover.value
  if (el?.matches(':popover-open')) el.hidePopover()
  emit('close')
}

/* resync if something else ever hides the popover */
function onToggle(event: Event) {
  if ((event as ToggleEvent).newState === 'closed' && isOpen.value) closeList()
}

/* prevent focus from leaving the input when pressing the field frame,
   the chips or the clear button (see the popover="manual" note above) */
function onFieldMousedown(event: MouseEvent) {
  if (event.target !== input.value) event.preventDefault()
}

function onFieldClick(event: MouseEvent) {
  if (props.disabled) return
  if (event.target !== input.value) input.value?.focus()
  if (!isOpen.value) {
    openList()
    /* single-select reopened on its own label: select the text so the
       first keystroke replaces it instead of appending */
    if (!props.multiple && selected.value.length) input.value?.select()
  } else if (event.target !== input.value) {
    /* the frame / chevron toggles; clicking the text just moves the caret */
    closeList()
  }
}

/* --- selection actions ----------------------------------------------- */

function select(option: ComboboxOption) {
  if (option.disabled) return
  if (props.multiple) {
    /* the query is kept so several matches can be picked under one filter */
    model.value = isSelected(option.value)
      ? selected.value.filter((value) => value !== option.value)
      : [...selected.value, option.value]
  } else {
    model.value = option.value
    closeList()
    /* drop focus so the next click on the field reopens the list */
    input.value?.blur()
  }
}

function deselect(value: ComboboxValue) {
  model.value = selected.value.filter((v) => v !== value)
}

/* select-all only operates on the currently filtered enabled options */
const allSelected = computed(() => {
  const enabled = filtered.value.filter((option) => !option.disabled)
  return enabled.length > 0 && enabled.every((option) => isSelected(option.value))
})

function toggleAll() {
  const enabled = filtered.value.filter((option) => !option.disabled).map((option) => option.value)
  model.value = allSelected.value
    ? selected.value.filter((value) => !enabled.includes(value))
    : [...selected.value, ...enabled.filter((value) => !isSelected(value))]
}

const showClear = computed(
  () => props.clearable && !props.disabled && (selected.value.length > 0 || query.value.length > 0),
)

function clear() {
  model.value = props.multiple ? [] : null
  query.value = ''
  hasTyped.value = false
  emit('clear')
  input.value?.focus()
}

/* --- input value + events --------------------------------------------- */

/* the input shows the query while the user types, and the selected label
   (single mode) otherwise; the DOM value and the model are decoupled */
const displayValue = computed(() => {
  if (isOpen.value && hasTyped.value) return query.value
  if (!props.multiple) return selectedOptions.value[0]?.label ?? ''
  return ''
})

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (!isOpen.value) openList()
  query.value = value
  hasTyped.value = true
  activeIndex.value = navigable.value.length ? 0 : -1
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      event.preventDefault()
      if (!isOpen.value) {
        openList(event.key === 'ArrowUp')
        return
      }
      const count = navigable.value.length
      if (!count) return
      const delta = event.key === 'ArrowDown' ? 1 : -1
      activeIndex.value =
        activeIndex.value === -1
          ? delta === 1
            ? 0
            : count - 1
          : (activeIndex.value + delta + count) % count
      return
    }
    case 'Home':
    case 'End':
      if (!isOpen.value) return
      event.preventDefault()
      activeIndex.value = event.key === 'Home' ? 0 : navigable.value.length - 1
      return
    case 'Enter': {
      if (!isOpen.value) return
      event.preventDefault()
      const entry = navigable.value[activeIndex.value]
      if (!entry) return
      if (entry.option) select(entry.option)
      else toggleAll()
      return
    }
    case 'Escape':
      if (!isOpen.value) return
      /* stopPropagation so an ancestor Dialog does not close as well */
      event.preventDefault()
      event.stopPropagation()
      closeList()
      return
    case 'Tab':
      /* close, then let the default action move focus on */
      closeList()
      return
    case 'Backspace':
      if (props.multiple && !(event.target as HTMLInputElement).value && selected.value.length)
        model.value = selected.value.slice(0, -1)
      return
  }
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
    class="ds-combobox"
    :data-size="size"
    :data-multiple="multiple ? '' : undefined"
    :data-open="isOpen ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :data-loading="isLoading ? '' : undefined"
  >
    <Typography v-if="label" as="label" variant="label" class="ds-combobox-label" :for="inputId">
      {{ label }}<span v-if="required" class="ds-combobox-required" aria-hidden="true"> *</span>
    </Typography>

    <div
      class="ds-combobox-field"
      :style="`anchor-name: ${anchorName}`"
      @mousedown="onFieldMousedown"
      @click="onFieldClick"
    >
      <!-- chips and input share the same wrapping flex lines: the chips
           wrapper is display: contents and only exists so that removing a
           chip (@click.stop) does not toggle the list -->
      <div class="ds-combobox-content">
        <div v-if="multiple && selectedOptions.length" class="ds-combobox-chips" @click.stop>
          <template v-if="chips">
            <Chip
              v-for="option in visibleSelected"
              :key="option.value"
              :label="option.label"
              :size="chipSize"
              :disabled="disabled"
              closable
              :close-label="`Remove ${option.label}`"
              @close="deselect(option.value)"
            />
          </template>
          <span v-else class="ds-combobox-selection-text">
            {{ visibleSelected.map((option) => option.label).join(', ') }}
          </span>
          <span v-if="hiddenCount" class="ds-combobox-overflow" :title="hiddenLabels">
            +{{ hiddenCount }}
          </span>
        </div>

        <input
          :id="inputId"
          ref="input"
          class="ds-combobox-control"
          type="text"
          role="combobox"
          autocomplete="off"
          :value="displayValue"
          :placeholder="selected.length ? undefined : placeholder"
          :disabled="disabled"
          :aria-label="ariaLabel"
          :aria-expanded="isOpen ? 'true' : 'false'"
          :aria-controls="listboxId"
          aria-autocomplete="list"
          :aria-activedescendant="isOpen ? activeId : undefined"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-required="required ? 'true' : undefined"
          :aria-busy="isLoading ? 'true' : undefined"
          :aria-describedby="hint ? hintId : undefined"
          @input="onInput"
          @keydown="onKeydown"
          @blur="closeList"
        />
      </div>

      <button
        v-if="showClear"
        class="ds-combobox-affix ds-icon-btn"
        type="button"
        :aria-label="clearLabel"
        @click.stop="clear"
      >
        <Icon name="close" />
      </button>

      <Spinner v-if="isLoading" class="ds-combobox-spinner" />
      <Icon v-else name="expand_more" class="ds-combobox-chevron" />
    </div>

    <div
      ref="popover"
      class="ds-combobox-popover"
      popover="manual"
      :style="`position-anchor: ${anchorName}`"
      @toggle="onToggle"
      @mousedown.prevent
    >
      <div
        :id="listboxId"
        class="ds-combobox-listbox"
        role="listbox"
        :aria-label="label || ariaLabel"
        :aria-multiselectable="multiple ? 'true' : undefined"
      >
        <div
          v-if="showSelectAll"
          :id="selectAllId"
          class="ds-combobox-option"
          data-select-all
          role="option"
          :aria-selected="allSelected ? 'true' : 'false'"
          :data-active="selectAllId === activeId ? '' : undefined"
          @click="toggleAll"
          @pointermove="setActive(selectAllId)"
        >
          <span class="ds-combobox-option-label">{{ selectAllLabel }}</span>
          <Icon class="ds-combobox-option-check" v-bind="iconProps(checkIcon)" />
        </div>

        <template v-for="group in groupedOptions" :key="group.name ?? ''">
          <div v-if="group.name" class="ds-combobox-group" role="group" :aria-label="group.name">
            <!-- the group is named via aria-label; the visible heading stays decorative -->
            <div class="ds-combobox-group-label" aria-hidden="true">{{ group.name }}</div>
            <div
              v-for="entry in group.entries"
              :id="entry.id"
              :key="entry.option.value"
              class="ds-combobox-option"
              role="option"
              :aria-selected="isSelected(entry.option.value) ? 'true' : 'false'"
              :aria-disabled="entry.option.disabled ? 'true' : undefined"
              :data-active="entry.id === activeId ? '' : undefined"
              @click="select(entry.option)"
              @pointermove="setActive(entry.id)"
            >
              <span class="ds-combobox-option-label">{{ entry.option.label }}</span>
              <Icon class="ds-combobox-option-check" v-bind="iconProps(checkIcon)" />
            </div>
          </div>
          <template v-else>
            <div
              v-for="entry in group.entries"
              :id="entry.id"
              :key="entry.option.value"
              class="ds-combobox-option"
              role="option"
              :aria-selected="isSelected(entry.option.value) ? 'true' : 'false'"
              :aria-disabled="entry.option.disabled ? 'true' : undefined"
              :data-active="entry.id === activeId ? '' : undefined"
              @click="select(entry.option)"
              @pointermove="setActive(entry.id)"
            >
              <span class="ds-combobox-option-label">{{ entry.option.label }}</span>
              <Icon class="ds-combobox-option-check" v-bind="iconProps(checkIcon)" />
            </div>
          </template>
        </template>
      </div>

      <!-- outside the listbox: a listbox may only contain options and groups -->
      <div v-if="!filtered.length && !isLoading" class="ds-combobox-empty" role="status">
        <slot name="empty">{{ emptyText }}</slot>
      </div>
    </div>

    <div v-if="hint" class="ds-combobox-meta">
      <Typography :id="hintId" variant="caption" class="ds-combobox-hint">{{ hint }}</Typography>
    </div>

    <!-- native form submission: the visible input holds label text, never a name -->
    <template v-if="name">
      <input v-for="value in selected" :key="value" type="hidden" :name="name" :value="value" />
    </template>
  </div>
</template>

<style>
.ds-combobox {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--combobox-stack-gap);
  min-width: 0;
  font-family: var(--font-sans);
}

/* --- label --------------------------------------------------------- */

.ds-typography.ds-combobox-label {
  --typo-size: var(--combobox-label-font-size);
  --typo-line-height: 1.25;
  --typo-color: var(--combobox-label-color);

  user-select: none;
}

.ds-combobox-required {
  color: var(--color-danger);
}

/* --- field --------------------------------------------------------- */

.ds-combobox-field {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--combobox-gap);
  /* min-height, not height: in multiple mode the field grows when the
     chips wrap onto extra lines */
  min-height: var(--combobox-height);
  padding-inline: var(--combobox-padding-inline);
  min-width: 0;
  background-color: var(--combobox-surface);
  border: 1px solid var(--combobox-border-color);
  border-radius: var(--combobox-radius);
  color: var(--combobox-text-color);
  cursor: pointer;
  transition:
    background-color var(--duration-150) var(--ease-out),
    border-color var(--duration-150) var(--ease-out),
    box-shadow var(--duration-150) var(--ease-out);
}

.ds-combobox:not([data-disabled]) .ds-combobox-field:hover {
  border-color: color-mix(in oklab, var(--combobox-border-color) 50%, var(--text));
}

/* the padding centers a single row (chip-height tall, see the control's
   min-height) exactly within --combobox-height, so there is never any
   slack to redistribute: when the chips wrap, the first row stays put
   and the field only grows downward */
.ds-combobox[data-multiple] .ds-combobox-field {
  padding-block: calc((var(--combobox-height) - var(--combobox-chip-height) - 2px) / 2);
}

/* text inputs always match :focus-visible, so keyboard and mouse focus
   both show the focus style. The box-shadow visually thickens the 1px
   border to 2px without any layout shift */
.ds-combobox:not([data-disabled]) .ds-combobox-field:has(.ds-combobox-control:focus-visible) {
  border-color: var(--combobox-accent);
  box-shadow: 0 0 0 1px var(--combobox-accent);
}

.ds-combobox[data-disabled] .ds-combobox-field {
  cursor: not-allowed;
}

/* --- native input --------------------------------------------------- */

/* chips + input flow together and wrap onto new lines when the chips
   reach the edge of the field */
.ds-combobox-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--combobox-chips-gap);
  flex: 1;
  min-width: 0;
}

.ds-combobox-control {
  box-sizing: border-box;
  flex: 1;
  min-width: 60px;
  /* as tall as a chip so the row height is identical with and without chips */
  min-height: var(--combobox-chip-height);
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: var(--combobox-font-size);
  color: inherit;
}

/* with chips in the field, the input only takes space while focused:
   collapsed to zero width it always fits on the chips line instead of
   reserving an empty row below them; clicking the field focuses it
   (see onFieldClick), which expands it for typing */
.ds-combobox-chips + .ds-combobox-control:not(:focus) {
  flex: 0 0 0px;
  min-width: 0;
}

.ds-combobox-control::placeholder {
  color: var(--combobox-placeholder-color);
  opacity: 1;
}

.ds-combobox-control:disabled {
  cursor: not-allowed;
}

/* --- chips / text selection inside the field ------------------------- */

/* the wrapper only exists for event delegation (@click.stop); its children
   participate directly in the .ds-combobox-content wrapping flex lines */
.ds-combobox-chips {
  display: contents;
}

.ds-combobox-selection-text {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--combobox-font-size);
}

.ds-combobox-overflow {
  flex: none;
  display: inline-flex;
  align-items: center;
  padding: 2px var(--spacing-1\.5);
  border-radius: var(--radius-full);
  background-color: color-mix(in oklab, var(--text) 10%, transparent);
  font-size: var(--combobox-meta-font-size);
  color: var(--text-muted);
  white-space: nowrap;
  user-select: none;
}

/* --- chevron, clear button, spinner ---------------------------------- */

.ds-combobox-field > .ds-icon,
.ds-combobox-affix > .ds-icon {
  --icon-size: var(--combobox-icon-size);
}

.ds-combobox-field > .ds-icon {
  color: var(--combobox-icon-color);
}

.ds-combobox-chevron {
  pointer-events: none;
  transition: transform var(--duration-150) var(--ease-out);
}

.ds-combobox[data-open] .ds-combobox-chevron {
  transform: rotate(180deg);
}

/* shared .ds-icon-btn reset — only the colors are component-specific */
.ds-combobox-affix {
  --icon-btn-color: var(--combobox-icon-color);
  --icon-btn-hover-color: var(--combobox-text-color);
}

.ds-combobox .ds-combobox-spinner {
  --spinner-size: var(--combobox-icon-size);
  color: var(--combobox-icon-color);
}

/* --- popover (CSS anchor positioning, mirrors Menu) ------------------- */

.ds-combobox-popover {
  box-sizing: border-box;
  /* undo the UA popover styles (inset: 0 + margin: auto) so the
     position-area grid cell does the placement instead */
  position: fixed;
  inset: auto;
  margin: 0;
  margin-block-start: var(--combobox-popover-gap);
  position-area: bottom span-right;
  /* flip above the field when there is no room below */
  position-try-fallbacks: flip-block;
  /* hide the panel when its anchor scrolls out of view */
  position-visibility: anchors-visible;
  width: max-content; /* fallback if anchor-size() is unsupported */
  width: anchor-size(width); /* match the field width exactly */
  max-height: var(--combobox-popover-max-height);
  overflow-y: auto;
  padding: var(--combobox-popover-padding);
  border: 1px solid var(--combobox-popover-border);
  border-radius: var(--combobox-popover-radius);
  background-color: var(--combobox-popover-bg);
  color: var(--text);
  box-shadow: var(--combobox-popover-shadow);
  font-family: var(--font-sans);
}

/* enter / exit transition */
.ds-combobox-popover {
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity var(--duration-150) var(--ease-out),
    transform var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-combobox-popover:popover-open {
  opacity: 1;
  transform: none;
}

@starting-style {
  .ds-combobox-popover:popover-open {
    opacity: 0;
    transform: scale(0.98);
  }
}

/* --- options (mirror .ds-menu-item) ----------------------------------- */

.ds-combobox-option {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--combobox-option-gap);
  min-height: var(--combobox-option-min-height);
  padding: var(--combobox-option-padding-block) var(--combobox-option-padding-inline);
  border-radius: var(--combobox-option-radius);
  font-size: var(--combobox-option-font-size);
  line-height: 1.25;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration-150) var(--ease-out);
}

.ds-combobox-option:hover:not([aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--text) 8%, transparent);
}

/* the active (aria-activedescendant) option reads as a stronger wash;
   declared after :hover so it wins when both apply */
.ds-combobox-option[data-active]:not([aria-disabled='true']) {
  background-color: color-mix(in oklab, var(--text) 14%, transparent);
}

/* selected options read in the accent color, matching their check icon */
.ds-combobox-option[aria-selected='true'] {
  color: var(--combobox-accent);
}

.ds-combobox-option[aria-disabled='true'] {
  color: var(--text-disabled);
  cursor: not-allowed;
}

.ds-combobox-option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* the check is always rendered so row widths stay stable; selection
   only toggles its visibility. It trails the label, so unselected
   rows show no leading gap */
.ds-combobox-option-check {
  --icon-size: var(--combobox-icon-size);

  visibility: hidden;
  color: var(--combobox-accent);
}

.ds-combobox-option[aria-selected='true'] > .ds-combobox-option-check {
  visibility: visible;
}

/* --- select-all row ---------------------------------------------------- */

.ds-combobox-option[data-select-all] {
  border-block-end: 1px solid var(--combobox-popover-border);
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  margin-block-end: var(--combobox-popover-padding);
  font-weight: var(--font-weight-medium);
}

/* --- groups ------------------------------------------------------------ */

.ds-combobox-group-label {
  padding: var(--spacing-2) var(--combobox-option-padding-inline) var(--spacing-1);
  font-size: var(--combobox-group-label-font-size);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--combobox-group-label-color);
  user-select: none;
}

/* --- empty state -------------------------------------------------------- */

.ds-combobox-empty {
  padding: var(--spacing-3) var(--combobox-option-padding-inline);
  font-size: var(--combobox-option-font-size);
  color: var(--text-muted);
  text-align: center;
}

/* --- hint ---------------------------------------------------------------- */

.ds-combobox-meta {
  display: flex;
}

.ds-typography.ds-combobox-hint {
  --typo-size: var(--combobox-meta-font-size);
  --typo-line-height: 1.25;
  --typo-color: var(--combobox-hint-color);
}
</style>
