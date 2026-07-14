<script setup lang="ts" generic="T extends Record<string, unknown>">
import './data-table.tokens.css'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Button from '../button/Button.vue'
import Checkbox from '../checkbox/Checkbox.vue'
import Icon from '../icon/Icon.vue'
import Input from '../input/Input.vue'
import Menu from '../menu/Menu.vue'
import MenuItem from '../menu/MenuItem.vue'
import Pagination from '../pagination/Pagination.vue'
import ProgressLinear from '../progress-linear/ProgressLinear.vue'
import type {
  DataTableColumn,
  DataTableProps,
  DataTableRowKey,
  DataTableSort,
} from './DataTable.types'

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  pageSizeOptions: () => [10, 25, 50, 100],
  pageSizeLabel: 'Rows per page',
  selectable: false,
  searchable: true,
  searchPlaceholder: 'Search…',
  searchLabel: 'Search',
  searchDebounce: 250,
  loading: false,
  density: 'default',
  responsive: false,
  sortLabel: 'Sort by',
  striped: false,
  hover: true,
  stickyHeader: false,
  emptyText: 'No data',
  loadingLabel: 'Loading',
  selectAllLabel: 'Select all rows',
  selectRowLabel: 'Select row',
})

/** current page, 1-based */
const page = defineModel<number>('page', { default: 1 })
/** rows per page — also settable from the footer menu (see pageSizeOptions) */
const pageSize = defineModel<number>('pageSize', { default: 10 })
/** active sort — null means unsorted */
const sort = defineModel<DataTableSort | null>('sort', { default: null })
/** search query (debounced: updates searchDebounce ms after typing stops) */
const search = defineModel<string>('search', { default: '' })
/** keys of the selected rows (see rowKey) */
const selected = defineModel<DataTableRowKey[]>('selected', { default: () => [] })

const emit = defineEmits<{ 'row-click': [row: T, event: MouseEvent] }>()

defineSlots<
  {
    /** Replaces the title area of the toolbar (the search input stays) */
    toolbar?: () => unknown
    /** Empty-state content (defaults to emptyText) */
    empty?: () => unknown
  } & {
    /** Replaces the cell content of the matching column */
    [K in `cell-${string}`]?: (slotProps: {
      row: T
      value: unknown
      column: DataTableColumn<T>
      index: number
    }) => unknown
  } & {
    /** Replaces the header label of the matching column */
    [K in `header-${string}`]?: (slotProps: { column: DataTableColumn<T> }) => unknown
  }
>()

/* not a withDefaults default: Vue treats function defaults as factories
   for non-function prop types, so the fallback is resolved here */
const selectedLabel = (count: number) => props.selectedText?.(count) ?? `${count} selected`

/* server mode: the parent filters / sorts / slices through its API —
   the component renders rows as-is and only exposes its state models */
const serverMode = computed(() => props.total !== undefined)

/* --- debounced search -------------------------------------------------- */

/* the input binds to a local ref; the model (and therefore the client
   filter and the parent's API calls) only sees the settled value */
const searchInput = ref(search.value)
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = value
  }, props.searchDebounce)
})

/* external writes to the model reflect into the input */
watch(search, (value) => {
  if (value !== searchInput.value) searchInput.value = value
  /* a new query restarts from the first page, in both modes */
  if (page.value !== 1) page.value = 1
})

onBeforeUnmount(() => clearTimeout(searchTimer))

/* --- client pipeline: filter → sort → slice ----------------------------- */

/* case- and diacritics-insensitive ("epee" matches "Épée") */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const filtered = computed<T[]>(() => {
  if (serverMode.value || !search.value) return props.rows
  const needle = fold(search.value)
  const keys = props.columns.filter((c) => c.searchable !== false).map((c) => c.key)
  return props.rows.filter((row) =>
    keys.some((key) => row[key] != null && fold(String(row[key])).includes(needle)),
  )
})

/* numbers sort numerically, null / undefined go last, anything else
   compares as text */
const defaultCompare =
  (key: string) =>
  (a: T, b: T): number => {
    const x = a[key]
    const y = b[key]
    if (x == null) return y == null ? 0 : 1
    if (y == null) return -1
    if (typeof x === 'number' && typeof y === 'number') return x - y
    return String(x).localeCompare(String(y))
  }

const sorted = computed<T[]>(() => {
  const active = sort.value
  if (serverMode.value || !active) return filtered.value
  const column = props.columns.find((c) => c.key === active.key)
  const compare = column?.sort ?? defaultCompare(active.key)
  const rows = [...filtered.value].sort(compare)
  if (active.direction === 'desc') rows.reverse()
  return rows
})

const pageCount = computed(() =>
  Math.max(
    1,
    Math.ceil((serverMode.value ? props.total! : sorted.value.length) / pageSize.value),
  ),
)

/* an out-of-range v-model renders as the nearest page but is never
   silently rewritten — same convention as Pagination */
const currentPage = computed(() => Math.min(Math.max(1, page.value), pageCount.value))

const visibleRows = computed<T[]>(() =>
  serverMode.value
    ? props.rows
    : sorted.value.slice(
        (currentPage.value - 1) * pageSize.value,
        currentPage.value * pageSize.value,
      ),
)

/** footer menu selection; a new page size restarts from the first page */
function setPageSize(size: number) {
  if (size === pageSize.value) return
  pageSize.value = size
  if (page.value !== 1) page.value = 1
}

/* --- sorting ------------------------------------------------------------ */

/** header click cycle: unsorted → asc → desc → unsorted */
function cycleSort(column: DataTableColumn<T>) {
  const active = sort.value
  if (active?.key !== column.key) sort.value = { key: column.key, direction: 'asc' }
  else if (active.direction === 'asc') sort.value = { key: column.key, direction: 'desc' }
  else sort.value = null
}

const ariaSort = (column: DataTableColumn<T>): 'ascending' | 'descending' | undefined =>
  sort.value?.key === column.key
    ? sort.value.direction === 'asc'
      ? 'ascending'
      : 'descending'
    : undefined

/* card mode replaces the (hidden) header sort buttons with a toolbar menu */
const sortableColumns = computed(() => props.columns.filter((c) => c.sortable))

/* --- selection ----------------------------------------------------------- */

/** display index → index in the full (sorted) dataset, unique across pages */
const rowIndex = (i: number) =>
  serverMode.value ? i : (currentPage.value - 1) * pageSize.value + i

const keyOf = (row: T, index: number): DataTableRowKey => {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  if (props.rowKey) return row[props.rowKey] as DataTableRowKey
  return (row.id as DataTableRowKey | undefined) ?? index
}

const visibleKeys = computed(() => visibleRows.value.map((row, i) => keyOf(row, rowIndex(i))))
const selectedSet = computed(() => new Set(selected.value))

const isSelected = (row: T, i: number) => selectedSet.value.has(keyOf(row, rowIndex(i)))

/* select-all reflects the visible rows only (the current page), so a
   selection made on another page is neither shown nor lost */
const allSelected = computed(
  () => visibleKeys.value.length > 0 && visibleKeys.value.every((k) => selectedSet.value.has(k)),
)
const someSelected = computed(
  () => !allSelected.value && visibleKeys.value.some((k) => selectedSet.value.has(k)),
)

function toggleAll(checked: boolean) {
  const visible = new Set(visibleKeys.value)
  selected.value = checked
    ? [...selected.value, ...visibleKeys.value.filter((k) => !selectedSet.value.has(k))]
    : selected.value.filter((k) => !visible.has(k))
}

function toggleRow(key: DataTableRowKey, checked: boolean) {
  if (checked) {
    if (!selectedSet.value.has(key)) selected.value = [...selected.value, key]
  } else {
    selected.value = selected.value.filter((k) => k !== key)
  }
}

const colSpan = computed(() => props.columns.length + (props.selectable ? 1 : 0))
</script>

<template>
  <div
    class="ds-table"
    :data-density="density"
    :data-striped="striped ? '' : undefined"
    :data-hover="hover ? '' : undefined"
    :data-sticky-header="stickyHeader ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :data-responsive="responsive ? '' : undefined"
    :aria-busy="loading ? 'true' : undefined"
  >
    <div
      v-if="
        title ||
        searchable ||
        $slots.toolbar ||
        (selectable && selected.length > 0) ||
        (responsive && sortableColumns.length > 0)
      "
      class="ds-table-toolbar"
    >
      <div class="ds-table-toolbar-start">
        <slot name="toolbar">
          <span v-if="title" class="ds-table-title">{{ title }}</span>
        </slot>
        <span
          v-if="selectable && selected.length > 0"
          class="ds-table-selected-count"
          aria-live="polite"
        >
          {{ selectedLabel(selected.length) }}
        </span>
      </div>
      <Input
        v-if="searchable"
        v-model="searchInput"
        class="ds-table-search"
        type="search"
        size="sm"
        icon-start="search"
        clearable
        :placeholder="searchPlaceholder"
        :aria-label="searchLabel"
      />
      <!-- card mode only (CSS decides): sorting for the hidden header -->
      <Menu
        v-if="responsive && sortableColumns.length > 0"
        class="ds-table-sort-menu"
        placement="bottom-end"
        dense
      >
        <Button size="sm" variant="text" icon="swap_vert" :label="sortLabel" />
        <template #items>
          <MenuItem
            v-for="column in sortableColumns"
            :key="column.key"
            :label="column.label"
            :icon-end="
              sort?.key === column.key
                ? sort.direction === 'asc'
                  ? 'arrow_upward'
                  : 'arrow_downward'
                : undefined
            "
            @click="cycleSort(column)"
          />
        </template>
      </Menu>
    </div>

    <div class="ds-table-scroller" :style="height ? { maxBlockSize: height } : undefined">
      <!-- explicit roles: card mode restyles display, which would
           otherwise strip the implicit table semantics -->
      <table class="ds-table-table" role="table">
        <caption v-if="caption" class="ds-table-caption">
          {{ caption }}
        </caption>
        <thead role="rowgroup">
          <tr role="row">
            <th v-if="selectable" class="ds-table-check" scope="col" role="columnheader">
              <Checkbox
                :model-value="allSelected"
                :indeterminate="someSelected"
                :label="selectAllLabel"
                :disabled="visibleRows.length === 0"
                @update:model-value="toggleAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              role="columnheader"
              :aria-sort="ariaSort(column)"
              :data-align="column.align"
              :data-sortable="column.sortable ? '' : undefined"
              :style="column.width ? { inlineSize: column.width } : undefined"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="ds-table-sort"
                :data-direction="sort?.key === column.key ? sort.direction : undefined"
                @click="cycleSort(column)"
              >
                <slot :name="`header-${column.key}`" :column="column">{{ column.label }}</slot>
                <Icon class="ds-table-sort-icon" name="arrow_upward" />
              </button>
              <slot v-else :name="`header-${column.key}`" :column="column">
                {{ column.label }}
              </slot>
            </th>
          </tr>
          <!-- zero-height row: the bar overlays the body without displacing it;
               decorative — the region-level aria-busy already conveys loading -->
          <tr v-if="loading" class="ds-table-progress" aria-hidden="true">
            <th :colspan="colSpan">
              <ProgressLinear indeterminate square :height="3" :label="loadingLabel" />
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <tr
            v-for="(row, i) in visibleRows"
            :key="keyOf(row, rowIndex(i))"
            role="row"
            :data-selected="selectable && isSelected(row, i) ? '' : undefined"
            @click="emit('row-click', row, $event)"
          >
            <td v-if="selectable" class="ds-table-check" role="cell" @click.stop>
              <Checkbox
                :model-value="isSelected(row, i)"
                :label="`${selectRowLabel} ${rowIndex(i) + 1}`"
                @update:model-value="(value: boolean) => toggleRow(keyOf(row, rowIndex(i)), value)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              role="cell"
              :data-align="column.align"
              :data-label="column.label"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
                :column="column"
                :index="rowIndex(i)"
              >
                {{ column.format ? column.format(row[column.key], row) : (row[column.key] ?? '') }}
              </slot>
            </td>
          </tr>
          <tr v-if="!loading && visibleRows.length === 0" class="ds-table-empty" role="row">
            <td :colspan="colSpan" role="cell">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pageCount > 1 || pageSizeOptions.length > 0" class="ds-table-footer">
      <div v-if="pageSizeOptions.length > 0" class="ds-table-page-size">
        <span aria-hidden="true">{{ pageSizeLabel }}</span>
        <Menu placement="top-start" dense>
          <Button
            size="xs"
            variant="text"
            icon-end="arrow_drop_down"
            :disabled="loading"
            :aria-label="`${pageSizeLabel}: ${pageSize}`"
          >
            {{ pageSize }}
          </Button>
          <template #items>
            <MenuItem
              v-for="option in pageSizeOptions"
              :key="option"
              :label="String(option)"
              :icon-end="option === pageSize ? 'check' : undefined"
              @click="setPageSize(option)"
            />
          </template>
        </Menu>
      </div>
      <Pagination
        v-if="pageCount > 1"
        v-model="page"
        :length="pageCount"
        size="xs"
        variant="text"
        :disabled="loading"
      />
    </div>
  </div>
</template>

<style>
.ds-table {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  display: block;
  overflow: hidden;
  /* named container: the responsive card mode reacts to the component's
     own width, and a nested DataTable never matches an outer one */
  container: ds-table / inline-size;
  border: 1px solid var(--dt-border-color);
  border-radius: var(--dt-radius);
  background-color: var(--dt-bg);
  font-family: var(--font-sans);
  font-size: var(--dt-font-size);
  line-height: var(--text-sm--line-height);
  color: var(--dt-color);
}

/* --- toolbar -------------------------------------------------------- */

.ds-table-toolbar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-toolbar-gap);
  padding: var(--dt-toolbar-padding);
  border-block-end: 1px solid var(--dt-border-color);
}

.ds-table-toolbar-start {
  display: flex;
  align-items: baseline;
  gap: var(--dt-toolbar-gap);
  min-inline-size: 0;
}

.ds-table-title {
  font-size: var(--dt-title-font-size);
  font-weight: var(--dt-title-font-weight);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-table-selected-count {
  color: var(--color-primary);
  white-space: nowrap;
}

.ds-table-search {
  flex: 0 1 var(--dt-search-max-width);
  min-inline-size: 140px;
}

/* only exists in card mode, where the header (and its sort buttons) is gone */
.ds-table .ds-table-sort-menu {
  display: none;
}

/* --- table ----------------------------------------------------------- */

.ds-table-scroller {
  overflow: auto;
}

.ds-table-table {
  box-sizing: border-box;
  inline-size: 100%;
  margin: 0;
  /* separate + zero spacing: collapse would detach the borders from a
     sticky header as soon as the body scrolls */
  border-collapse: separate;
  border-spacing: 0;
  font: inherit;
  color: inherit;
}

/* visually-hidden: names the table for screen readers only */
.ds-table-caption {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.ds-table-table th,
.ds-table-table td {
  box-sizing: border-box;
  padding-block: 0;
  padding-inline: var(--dt-cell-padding-inline);
  text-align: start;
  vertical-align: middle;
}

.ds-table-table :is(th, td)[data-align='center'] {
  text-align: center;
}

.ds-table-table :is(th, td)[data-align='end'] {
  text-align: end;
}

.ds-table-table thead th {
  /* height acts as min-height in table layout */
  block-size: var(--dt-header-height);
  background-color: var(--dt-header-bg);
  border-block-end: 1px solid var(--dt-border-color);
  font-size: var(--dt-header-font-size);
  font-weight: var(--dt-header-font-weight);
  color: var(--dt-header-color);
  white-space: nowrap;
}

.ds-table[data-sticky-header] .ds-table-table thead th {
  /* sticks to the scroller; --dt-header-bg must stay opaque */
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
}

.ds-table-table tbody td {
  block-size: var(--dt-row-height);
  border-block-end: 1px solid var(--dt-border-color);
}

/* the container border closes the table — no doubled hairline */
.ds-table-table tbody tr:last-child td {
  border-block-end: none;
}

/* --- row states ------------------------------------------------------- */
/* striped / hover exclude selected rows instead of relying on specificity */

.ds-table[data-striped]
  .ds-table-table
  tbody
  tr:nth-child(even of :not(.ds-table-empty)):not([data-selected])
  td {
  background-color: var(--dt-stripe-bg);
}

.ds-table[data-hover]
  .ds-table-table
  tbody
  tr:not(.ds-table-empty, [data-selected]):hover
  td {
  background-color: var(--dt-row-hover-bg);
}

.ds-table-table tbody tr[data-selected] td {
  background-color: var(--dt-row-selected-bg);
}

.ds-table[data-hover] .ds-table-table tbody tr[data-selected]:hover td {
  background-color: var(--dt-row-selected-hover-bg);
}

/* --- sortable headers -------------------------------------------------- */

.ds-table-sort {
  box-sizing: border-box;
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.ds-table-sort:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.ds-table-sort .ds-icon {
  --icon-size: var(--dt-sort-icon-size);
}

/* the arrow only shows on hover / focus / when the column is sorted */
.ds-table-sort-icon {
  opacity: 0;
  transition:
    opacity var(--duration-150) var(--ease-out),
    transform var(--duration-150) var(--ease-out);
}

.ds-table-table th:hover .ds-table-sort-icon,
.ds-table-sort:focus-visible .ds-table-sort-icon,
.ds-table-sort[data-direction] .ds-table-sort-icon {
  opacity: 1;
}

.ds-table-sort[data-direction='desc'] .ds-table-sort-icon {
  transform: rotate(180deg);
}

/* --- selection column --------------------------------------------------- */

.ds-table-check {
  inline-size: 48px;
  padding-inline-end: 0;
}

/* the checkbox keeps an accessible name; only its visual label is hidden */
.ds-table-check .ds-checkbox-label {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* --- loading / empty ----------------------------------------------------- */

/* zero-height header row: the bar hangs below it in absolute position,
   overlaying the first body row instead of displacing it */
.ds-table-table thead .ds-table-progress th {
  position: relative;
  block-size: 0;
  padding: 0;
  border-block-end: none;
  background: none;
}

.ds-table[data-sticky-header] .ds-table-table thead .ds-table-progress th {
  /* rides along under the sticky header row */
  position: sticky;
  inset-block-start: var(--dt-header-height);
  z-index: 1;
}

.ds-table-progress .ds-progress-linear {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 0;
}

.ds-table[data-loading] .ds-table-table tbody tr {
  opacity: var(--dt-loading-opacity);
  pointer-events: none;
}

.ds-table-empty td {
  block-size: auto;
  padding-block: var(--spacing-6);
  text-align: center;
  color: var(--dt-muted-color);
}

/* --- footer --------------------------------------------------------------- */

.ds-table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--dt-footer-gap);
  padding: var(--dt-footer-padding);
  border-block-start: 1px solid var(--dt-border-color);
}

.ds-table-page-size {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-xs);
  color: var(--dt-muted-color);
}

/* --- responsive card mode ------------------------------------------------- */
/* opt-in ([data-responsive]); below 600px of CONTAINER width, rows restack
   into label / value cards. 600px is hardcoded: custom properties are not
   allowed in a container query condition. Only descendants are styled — a
   container can't match its own query. */

@container ds-table (inline-size < 600px) {
  /* toolbar: search takes a full line, the sort menu appears */
  .ds-table[data-responsive] .ds-table-toolbar {
    flex-wrap: wrap;
  }

  .ds-table[data-responsive] .ds-table-search {
    flex: 1 1 100%;
    order: 1;
  }

  .ds-table[data-responsive] .ds-table-sort-menu {
    display: inline-block;
  }

  /* the table restyles as stacked blocks (explicit role attributes in the
     template preserve the table semantics) */
  .ds-table[data-responsive] .ds-table-table,
  .ds-table[data-responsive] .ds-table-table thead,
  .ds-table[data-responsive] .ds-table-table tbody,
  .ds-table[data-responsive] .ds-table-table tr {
    display: block;
  }

  /* header row: the column labels move into the cards (td::before), the
     sort buttons into the toolbar menu; only select-all remains, as a bar */
  .ds-table[data-responsive] .ds-table-table thead th:not(.ds-table-check) {
    display: none;
  }

  .ds-table[data-responsive] .ds-table-table thead th.ds-table-check {
    display: flex;
    align-items: center;
    inline-size: auto;
    block-size: auto;
    padding: var(--spacing-2) var(--dt-cell-padding-inline);
  }

  /* the select-all label, sr-only in table mode, becomes the bar's text */
  .ds-table[data-responsive] .ds-table-table thead .ds-table-check .ds-checkbox-label {
    position: static;
    inline-size: auto;
    block-size: auto;
    margin: 0;
    overflow: visible;
    clip-path: none;
  }

  /* the loading bar keeps its zero-height overlay behavior
     (after the th:not(.ds-table-check) hide rule: same specificity) */
  .ds-table[data-responsive] .ds-table-table thead .ds-table-progress th {
    display: block;
  }

  /* each body row becomes a card */
  .ds-table[data-responsive] .ds-table-table tbody tr {
    margin: var(--dt-card-gap);
    border: 1px solid var(--dt-border-color);
    border-radius: var(--dt-radius);
    /* td backgrounds (hover / striped / selected) follow the radius */
    overflow: hidden;
  }

  /* cells become "label : value" lines, the label drawn from data-label */
  .ds-table[data-responsive] .ds-table-table tbody td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-4);
    block-size: auto;
    padding: var(--dt-card-padding);
    text-align: start;
  }

  .ds-table[data-responsive] .ds-table-table tbody td:last-child {
    border-block-end: none;
  }

  .ds-table[data-responsive] .ds-table-table tbody td[data-label]::before {
    content: attr(data-label);
    font-weight: var(--dt-header-font-weight);
    color: var(--dt-card-label-color);
  }

  .ds-table[data-responsive] .ds-table-table tbody td.ds-table-check {
    justify-content: flex-start;
    inline-size: auto;
    padding-inline-end: var(--dt-cell-padding-inline);
  }

  .ds-table[data-responsive] .ds-table-table tbody tr.ds-table-empty {
    border: none;
  }

  .ds-table[data-responsive] .ds-table-table tbody .ds-table-empty td {
    justify-content: center;
  }

  /* footer: page-size menu and pagination wrap around a centered axis */
  .ds-table[data-responsive] .ds-table-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
