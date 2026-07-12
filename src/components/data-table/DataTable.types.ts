export type DataTableAlign = 'start' | 'center' | 'end'

/** default = 52px rows (Material), compact = 40px rows */
export type DataTableDensity = 'default' | 'compact'

export type DataTableSortDirection = 'asc' | 'desc'

/** Unique identity of a row, as produced by rowKey */
export type DataTableRowKey = string | number

/** v-model:sort value — null means unsorted */
export interface DataTableSort {
  key: string
  direction: DataTableSortDirection
}

export interface DataTableColumn<T = Record<string, unknown>> {
  /** Field name in the row object; may be virtual when a cell-<key> slot renders it */
  key: string
  /** Header text (the header-<key> slot overrides it) */
  label: string
  /** Shows the sort button in the header (client mode sorts; server mode only updates v-model:sort) */
  sortable?: boolean
  /** Text alignment of the column, header included (default 'start'; use 'end' for numbers) */
  align?: DataTableAlign
  /** CSS width of the column (e.g. '120px', '20%') */
  width?: string
  /** Set false to exclude the column from client-side search (default true) */
  searchable?: boolean
  /** Custom comparator for client-side sorting of this column (ascending order) */
  sort?: (a: T, b: T) => number
  /** Formats the cell text (default String(value)); the cell-<key> slot overrides it */
  format?: (value: unknown, row: T) => string
}

export interface DataTableProps<T = Record<string, unknown>> {
  /** Rows to display. Client mode filters / sorts / paginates them; server mode renders them as-is */
  rows: T[]
  columns: DataTableColumn<T>[]
  /**
   * Unique row identity: a field name or a function. Defaults to the 'id'
   * field when present, otherwise the row index (selection is then unstable
   * across sorting / data changes — provide a key when using selectable).
   */
  rowKey?: (keyof T & string) | ((row: T) => DataTableRowKey)
  /**
   * Total number of rows on the server. Providing it switches to server
   * mode: the component stops filtering / sorting / slicing rows and only
   * exposes its state (v-model:page / sort / search) so the parent queries
   * its API; total drives the page count.
   */
  total?: number
  /**
   * Choices of the rows-per-page menu in the footer (default [10, 25, 50,
   * 100]); pass [] to hide it. The current value is the v-model:pageSize
   * (default 10).
   */
  pageSizeOptions?: number[]
  /** Text next to the rows-per-page menu */
  pageSizeLabel?: string
  /** Checkbox column + select-all header checkbox; selection lives in v-model:selected */
  selectable?: boolean
  /** Search input in the toolbar (default true) */
  searchable?: boolean
  searchPlaceholder?: string
  /** Accessible name of the search input */
  searchLabel?: string
  /** Debounce of v-model:search updates, in ms (default 250) */
  searchDebounce?: number
  /** Indeterminate progress bar under the header + dimmed body */
  loading?: boolean
  density?: DataTableDensity
  /** Zebra striping of body rows */
  striped?: boolean
  /** Row hover highlight (default true) */
  hover?: boolean
  /** Header stays visible while the body scrolls (pair with height, or a constrained parent) */
  stickyHeader?: boolean
  /** Max height of the scroll area (any CSS length), e.g. '400px' */
  height?: string
  /** Toolbar title (the toolbar slot overrides it) */
  title?: string
  /** Visually-hidden <caption> naming the table for screen readers */
  caption?: string
  /** Message of the built-in empty state (the empty slot overrides it) */
  emptyText?: string
  /** Accessible label of the loading bar */
  loadingLabel?: string
  /** Accessible label of the select-all checkbox */
  selectAllLabel?: string
  /** Accessible label of a row checkbox */
  selectRowLabel?: string
  /** Toolbar text shown while rows are selected; receives the count */
  selectedText?: (count: number) => string
}
