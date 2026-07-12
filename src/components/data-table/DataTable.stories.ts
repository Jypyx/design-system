import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref, watch, type DefineComponent } from 'vue'
import DataTable from './DataTable.vue'
import Chip from '../chip/Chip.vue'
import type {
  DataTableColumn,
  DataTableProps,
  DataTableRowKey,
  DataTableSort,
} from './DataTable.types'

const densities = ['default', 'compact'] as const

interface Dessert extends Record<string, unknown> {
  id: number
  name: string
  calories: number
  fat: number
  category: string
}

const desserts: Dessert[] = [
  { id: 1, name: 'Frozen yogurt', calories: 159, fat: 6, category: 'Frozen' },
  { id: 2, name: 'Ice cream sandwich', calories: 237, fat: 9, category: 'Frozen' },
  { id: 3, name: 'Eclair', calories: 262, fat: 16, category: 'Pastry' },
  { id: 4, name: 'Cupcake', calories: 305, fat: 3.7, category: 'Cake' },
  { id: 5, name: 'Gingerbread', calories: 356, fat: 16, category: 'Cookie' },
  { id: 6, name: 'Jelly bean', calories: 375, fat: 0, category: 'Candy' },
  { id: 7, name: 'Lollipop', calories: 392, fat: 0.2, category: 'Candy' },
  { id: 8, name: 'Honeycomb', calories: 408, fat: 3.2, category: 'Candy' },
  { id: 9, name: 'Donut', calories: 452, fat: 25, category: 'Pastry' },
  { id: 10, name: 'KitKat', calories: 518, fat: 26, category: 'Candy' },
  { id: 11, name: 'Brownie', calories: 466, fat: 29, category: 'Cake' },
  { id: 12, name: 'Cheesecake', calories: 401, fat: 28, category: 'Cake' },
  { id: 13, name: 'Macaron', calories: 97, fat: 5, category: 'Cookie' },
  { id: 14, name: 'Tiramisu', calories: 283, fat: 19, category: 'Cake' },
  { id: 15, name: 'Pavlova', calories: 288, fat: 11, category: 'Pastry' },
]

const columns: DataTableColumn<Dessert>[] = [
  { key: 'name', label: 'Dessert', sortable: true },
  { key: 'calories', label: 'Calories', sortable: true, align: 'end' },
  { key: 'fat', label: 'Fat (g)', sortable: true, align: 'end' },
  { key: 'category', label: 'Category', sortable: true },
]

/* Meta can't digest a generic component (its call signature doesn't match
   ConcreteComponent), so the stories pin it to the fixture's row type;
   the intersection re-adds the defineModel props absent from the Props type */
const DataTableDessert = DataTable as unknown as DefineComponent<
  DataTableProps<Dessert> & {
    page?: number
    pageSize?: number
    sort?: DataTableSort | null
    search?: string
    selected?: DataTableRowKey[]
  }
>

const meta = {
  title: 'Components/DataTable',
  component: DataTableDessert,
  tags: ['autodocs'],
  argTypes: {
    rows: { control: false, description: 'Rows to display; processed in client mode only' },
    columns: { control: false },
    rowKey: {
      control: false,
      description: "Unique row identity (field name or function); defaults to 'id', then index",
    },
    total: {
      control: 'number',
      description: 'Server-side row count — providing it switches to server mode',
    },
    pageSize: { control: 'number', description: 'v-model:pageSize — rows per page' },
    pageSizeOptions: {
      control: 'object',
      description: 'Choices of the rows-per-page footer menu; [] hides it',
    },
    pageSizeLabel: { control: 'text' },
    selectable: { control: 'boolean' },
    searchable: { control: 'boolean' },
    searchDebounce: { control: 'number', description: 'v-model:search debounce, in ms' },
    loading: { control: 'boolean' },
    density: {
      control: 'select',
      options: densities,
      description: 'default = 52px rows, compact = 40px rows',
    },
    striped: { control: 'boolean' },
    hover: { control: 'boolean' },
    stickyHeader: { control: 'boolean', description: 'Pair with height (or a constrained parent)' },
    height: { control: 'text', description: 'Max height of the scroll area' },
    title: { control: 'text' },
    caption: { control: 'text', description: 'Visually-hidden accessible name of the table' },
    emptyText: { control: 'text' },
  },
  args: {
    rows: desserts,
    columns,
    rowKey: 'id',
    title: 'Desserts',
    caption: 'Nutritional values of desserts, per serving',
    pageSize: 10,
    selectable: false,
    searchable: true,
    loading: false,
    density: 'default',
    striped: false,
    hover: true,
    stickyHeader: false,
  },
} satisfies Meta<typeof DataTableDessert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Clicking a sortable header cycles ascending → descending → unsorted;
 * the active column exposes `aria-sort` and keeps its arrow visible.
 * `v-model:sort` makes the state controllable from outside.
 */
export const Sorting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const header = canvas.getByRole('columnheader', { name: /calories/i })
    const button = within(header).getByRole('button')

    await userEvent.click(button)
    await waitFor(() => expect(header).toHaveAttribute('aria-sort', 'ascending'))
    /* Macaron (97 kcal) comes first once sorted ascending */
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Macaron')

    await userEvent.click(button)
    await waitFor(() => expect(header).toHaveAttribute('aria-sort', 'descending'))
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('KitKat')

    await userEvent.click(button)
    await waitFor(() => expect(header).not.toHaveAttribute('aria-sort'))
  },
}

/**
 * `selectable` adds a checkbox column; `v-model:selected` holds the row keys
 * (see `rowKey`). The header checkbox selects the visible page and turns
 * indeterminate when only part of it is selected.
 */
export const Selection: Story = {
  args: { selectable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const selectAll = canvas.getByRole('checkbox', { name: 'Select all rows' })

    await userEvent.click(selectAll)
    await waitFor(() => expect(canvas.getByText('10 selected')).toBeInTheDocument())

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row 1' }))
    await waitFor(() => {
      expect((selectAll as HTMLInputElement).indeterminate).toBe(true)
      expect(canvas.getByText('9 selected')).toBeInTheDocument()
    })
  },
}

/**
 * Client-side search matches every column (case- and diacritics-insensitive);
 * a column opts out with `searchable: false`. The `v-model:search` updates
 * after the debounce, and a new query goes back to the first page.
 */
export const Search: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search' }), 'yogurt')
    /* header row + the single match, once the 250ms debounce settles */
    await waitFor(() => expect(canvas.getAllByRole('row')).toHaveLength(2), { timeout: 2000 })
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Frozen yogurt')
  },
}

/**
 * The footer menu drives `v-model:pageSize` (choices come from
 * `pageSizeOptions`); picking a new size goes back to the first page.
 */
export const PageSize: Story = {
  args: { pageSize: 5, pageSizeOptions: [5, 10, 15] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('row')).toHaveLength(6)

    await userEvent.click(canvas.getByRole('button', { name: 'Rows per page: 5' }))
    await userEvent.click(await canvas.findByRole('menuitem', { name: '15' }))
    /* header row + the 15 dessert rows, back on page 1 */
    await waitFor(() => expect(canvas.getAllByRole('row')).toHaveLength(16))
  },
}

/**
 * Passing `total` switches to server mode: the table renders `rows` as-is and
 * only drives `v-model:page` / `v-model:sort` / `v-model:search` — the parent
 * watches them, calls its API (simulated here with a 400ms timeout) and feeds
 * back `rows`, `total` and `loading`.
 */
export const ServerMode: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DataTable },
    setup: () => {
      const all: Dessert[] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `${desserts[i % desserts.length].name} #${i + 1}`,
        calories: 90 + ((i * 37) % 420),
        fat: (i * 13) % 30,
        category: desserts[i % desserts.length].category,
      }))

      const rows = ref<Dessert[]>([])
      const total = ref(0)
      const loading = ref(false)
      const page = ref(1)
      const pageSize = ref(10)
      const sort = ref<DataTableSort | null>(null)
      const search = ref('')

      let timer: ReturnType<typeof setTimeout> | undefined
      const load = () => {
        loading.value = true
        clearTimeout(timer)
        timer = setTimeout(() => {
          let data = all
          if (search.value) {
            const query = search.value.toLowerCase()
            data = data.filter((row) => row.name.toLowerCase().includes(query))
          }
          if (sort.value) {
            const { key, direction } = sort.value
            data = [...data].sort((a, b) => {
              const x = a[key] as number | string
              const y = b[key] as number | string
              return typeof x === 'number' && typeof y === 'number'
                ? x - y
                : String(x).localeCompare(String(y))
            })
            if (direction === 'desc') data.reverse()
          }
          total.value = data.length
          rows.value = data.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
          loading.value = false
        }, 400)
      }

      watch([page, pageSize, sort, search], load)
      load()

      return { columns, rows, total, loading, page, pageSize, sort, search }
    },
    template: `
      <DataTable
        v-model:page="page"
        v-model:page-size="pageSize"
        v-model:sort="sort"
        v-model:search="search"
        :columns="columns"
        :rows="rows"
        :total="total"
        :loading="loading"
        row-key="id"
        title="Server data"
        caption="Server-driven dessert list"
      />
    `,
  }),
}

/**
 * `cell-<key>` slots replace a cell's content and receive `{ row, value,
 * column, index }`; `header-<key>` slots replace a header label. For pure
 * text transforms, `column.format` is lighter than a slot.
 */
export const CellSlots: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DataTable, Chip },
    setup: () => {
      const slotColumns: DataTableColumn[] = [
        { key: 'name', label: 'Dessert', sortable: true },
        { key: 'calories', label: 'Calories', sortable: true, align: 'end' },
        {
          key: 'fat',
          label: 'Fat',
          sortable: true,
          align: 'end',
          format: (value) => `${value} g`,
        },
        { key: 'category', label: 'Category' },
      ]
      const chipColor = (category: unknown) =>
        ({ Frozen: 'primary', Candy: 'danger', Cake: 'warning', Pastry: 'success' })[
          String(category)
        ] ?? 'neutral'
      return { desserts, slotColumns, chipColor }
    },
    template: `
      <DataTable
        :columns="slotColumns"
        :rows="desserts"
        row-key="id"
        title="Desserts"
        caption="Nutritional values of desserts, per serving"
      >
        <template #header-calories="{ column }">🔥 {{ column.label }}</template>
        <template #cell-category="{ value }">
          <Chip size="xs" variant="tonal" :color="chipColor(value)" :label="String(value)" />
        </template>
      </DataTable>
    `,
  }),
}

/** default = 52px rows and 56px header (Material); compact = 40px rows and 44px header. */
export const Densities: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DataTable },
    setup: () => ({ desserts, columns, densities }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6);">
        <DataTable
          v-for="density in densities"
          :key="density"
          :columns="columns"
          :rows="desserts"
          :density="density"
          :page-size="5"
          :searchable="false"
          row-key="id"
          :title="density"
          caption="Nutritional values of desserts, per serving"
        />
      </div>
    `,
  }),
}

/** Zebra striping helps scanning wide tables; selected rows keep their own tint. */
export const Striped: Story = {
  args: { striped: true, searchable: false },
}

/**
 * With `stickyHeader`, the header stays visible while the body scrolls
 * inside the area constrained by `height`.
 */
export const StickyHeader: Story = {
  args: {
    rows: Array.from({ length: 30 }, (_, i) => ({
      ...desserts[i % desserts.length],
      id: i + 1,
      name: `${desserts[i % desserts.length].name} #${i + 1}`,
    })),
    stickyHeader: true,
    height: '320px',
    pageSize: 30,
    pageSizeOptions: [],
    searchable: false,
  },
}

/**
 * While `loading`, an indeterminate bar shows under the header, the body dims
 * and stops reacting, and the container exposes `aria-busy`.
 */
export const Loading: Story = {
  args: { loading: true },
}

/** Without rows, the table shows `emptyText` — or the `empty` slot for richer content. */
export const Empty: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DataTable },
    setup: () => ({ columns }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6);">
        <DataTable
          :columns="columns"
          :rows="[]"
          :searchable="false"
          :page-size-options="[]"
          title="Default message"
          caption="Empty dessert list"
          empty-text="No desserts yet"
        />
        <DataTable
          :columns="columns"
          :rows="[]"
          :searchable="false"
          :page-size-options="[]"
          title="Empty slot"
          caption="Empty dessert list, custom slot"
        >
          <template #empty>
            <div style="display: grid; gap: var(--spacing-2); justify-items: center;">
              <strong>Nothing to show</strong>
              <span>Try clearing the filters or come back later.</span>
            </div>
          </template>
        </DataTable>
      </div>
    `,
  }),
}
