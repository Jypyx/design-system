import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import Calendar from './Calendar.vue'
import Button from '../button/Button.vue'
import type { CalendarEvent } from './Calendar.types'

/* fixed dates keep the stories deterministic (Chromatic, vitest) */
const june = (day: number) => new Date(2026, 5, day)

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: false,
      description: 'v-model — a Date (single) or a { start, end } pair (range)',
    },
    range: { control: 'boolean', description: 'Range mode: pick a start then an end date' },
    locale: {
      control: 'text',
      description: "BCP-47 tag (e.g. 'fr'); defaults to the browser locale",
    },
    weekStartsOn: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6],
      description: '0 = Sunday … 6 = Saturday; defaults to the locale convention',
    },
    minDate: { control: false, description: 'Days before are neither navigable nor selectable' },
    maxDate: { control: false, description: 'Days after are neither navigable nor selectable' },
    disabledDates: { control: false, description: 'Date[] or (date: Date) => boolean' },
    events: { control: 'object', description: 'Colored dots rendered under the day numbers' },
    showAdjacentDays: { control: 'boolean' },
    selectAdjacentDays: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    prevMonthLabel: { control: 'text' },
    nextMonthLabel: { control: 'text' },
    prevYearLabel: { control: 'text' },
    nextYearLabel: { control: 'text' },
    monthSelectLabel: { control: 'text' },
    yearSelectLabel: { control: 'text' },
  },
  args: {
    modelValue: june(15),
    range: false,
    locale: 'en-US',
    showAdjacentDays: true,
    selectAdjacentDays: false,
  },
  render: (args) => ({
    components: { Calendar },
    setup: () => ({ args, value: ref(args.modelValue ?? null) }),
    template: '<Calendar v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const day = canvas.getByRole('gridcell', { name: 'Saturday, June 20, 2026' })
    await userEvent.click(day)
    await waitFor(() => expect(day).toHaveAttribute('aria-selected', 'true'))
    await expect(
      canvas.getByRole('gridcell', { name: 'Monday, June 15, 2026' }),
    ).not.toHaveAttribute('aria-selected')
  },
}

/**
 * `range` turns the v-model into a `{ start, end }` pair: the first pick
 * starts the range, the next one completes it, and picking a date before
 * the start restarts it. While the end is pending, hovering (or moving the
 * keyboard focus) previews the span.
 */
export const Range: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar },
    setup: () => ({ value: ref({ start: june(10), end: june(15) }) }),
    template: '<Calendar v-model="value" range locale="en-US" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inRange = () => canvasElement.querySelectorAll('[data-in-range]')
    await waitFor(() => expect(inRange().length).toBe(4))
    /* picking again restarts the range */
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Saturday, June 20, 2026' }))
    await waitFor(() => expect(inRange().length).toBe(0))
    /* the next pick completes it */
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Thursday, June 25, 2026' }))
    await waitFor(() => expect(inRange().length).toBe(4))
    await expect(
      canvas.getByRole('gridcell', { name: 'Saturday, June 20, 2026' }),
    ).toHaveAttribute('data-range-start')
    await expect(
      canvas.getByRole('gridcell', { name: 'Thursday, June 25, 2026' }),
    ).toHaveAttribute('data-range-end')
  },
}

/**
 * WAI-ARIA grid pattern: arrows move by day / week, Home / End jump to the
 * week bounds, PageUp / PageDown change the month (with Shift: the year),
 * Enter or Space select. Crossing a month boundary scrolls the view.
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('gridcell', { name: 'Monday, June 15, 2026' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(canvas.getByRole('gridcell', { name: 'Tuesday, June 16, 2026' })).toHaveFocus(),
    )
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(canvas.getByRole('gridcell', { name: 'Tuesday, June 23, 2026' })).toHaveFocus(),
    )
    await userEvent.keyboard('{PageDown}')
    await waitFor(() =>
      expect(canvas.getByRole('gridcell', { name: 'Thursday, July 23, 2026' })).toHaveFocus(),
    )
    await expect(canvas.getByRole('button', { name: 'Choose month' })).toHaveTextContent('July')
    await userEvent.keyboard('{Enter}')
    await waitFor(() =>
      expect(
        canvas.getByRole('gridcell', { name: 'Thursday, July 23, 2026' }),
      ).toHaveAttribute('aria-selected', 'true'),
    )
  },
}

/**
 * Clicking the month (or year) label opens a quick-pick grid; Escape backs
 * out of it without closing a surrounding popover.
 */
export const MonthAndYearViews: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Choose month' }))
    /* the steppers stay visible but disable while a picker grid is open */
    await expect(canvas.getByRole('button', { name: 'Previous month' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Next month' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Mar' }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Choose month' })).toHaveTextContent('March'),
    )
    await expect(canvas.getByRole('grid')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Choose year' }))
    await userEvent.click(canvas.getByRole('button', { name: '2020' }))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Choose year' })).toHaveTextContent('2020'),
    )
    /* Escape closes the picker view, not the page / popover */
    await userEvent.click(canvas.getByRole('button', { name: 'Choose month' }))
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Mar' })).toHaveFocus())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.getByRole('grid')).toBeInTheDocument())
  },
}

/**
 * `minDate` / `maxDate` bound both navigation and selection: the steppers
 * disable at the bounds and out-of-range days grey out.
 */
export const MinMax: Story = {
  args: { minDate: june(5), maxDate: new Date(2026, 6, 20) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Previous month' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Previous year' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Next month' })).toBeEnabled()
    await expect(
      canvas.getByRole('gridcell', { name: 'Thursday, June 4, 2026' }),
    ).toHaveAttribute('aria-disabled', 'true')
  },
}

/**
 * `disabledDates` blocks days from selection while keeping them focusable
 * (so keyboard users can still traverse them): an array of dates, or a
 * predicate — here, weekends.
 */
export const DisabledDates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar },
    setup: () => ({
      blockedValue: ref(june(15)),
      weekendValue: ref(june(15)),
      blocked: [june(12), june(13)],
      isWeekend: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
    }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-6);">
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">Array of dates</p>
          <Calendar v-model="blockedValue" locale="en-US" :disabled-dates="blocked" />
        </div>
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">Predicate (weekends)</p>
          <Calendar v-model="weekendValue" locale="en-US" :disabled-dates="isWeekend" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cell = canvas.getAllByRole('gridcell', { name: 'Friday, June 12, 2026' })[0]
    await expect(cell).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(cell)
    await expect(cell).not.toHaveAttribute('aria-selected')
  },
}

/**
 * `events` renders up to three colored dots under a day: semantic names
 * (`primary`, `success`, `danger`, `warning`) map to the theme, any other
 * string passes through as a CSS color.
 */
export const Events: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar },
    setup: () => ({
      value: ref(june(15)),
      events: [
        { date: june(3) },
        { date: june(8), color: 'success' },
        { date: june(8), color: 'danger' },
        { date: june(12), color: 'warning' },
        { date: june(15), color: 'primary' },
        { date: june(17), color: 'oklch(0.65 0.25 300)' },
        { date: june(26), color: 'primary' },
        { date: june(26), color: 'success' },
        { date: june(26), color: 'danger' },
        { date: june(26), color: 'warning' },
      ] satisfies CalendarEvent[],
    }),
    template: '<Calendar v-model="value" locale="en-US" :events="events" />',
  }),
}

/**
 * Adjacent-month days can be hidden, shown greyed out (default), or made
 * selectable — picking one navigates to its month.
 */
export const AdjacentDays: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar },
    setup: () => ({
      hidden: ref(june(15)),
      shown: ref(june(15)),
      selectable: ref(june(15)),
    }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-6);">
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">Hidden</p>
          <Calendar v-model="hidden" locale="en-US" :show-adjacent-days="false" />
        </div>
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">Shown (default)</p>
          <Calendar v-model="shown" locale="en-US" />
        </div>
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">Selectable</p>
          <Calendar v-model="selectable" locale="en-US" select-adjacent-days />
        </div>
      </div>
    `,
  }),
}

/**
 * The `day` scoped slot replaces a cell's content (the day number by
 * default) — here, flight prices. Density is themeable through
 * `--cal-cell-size` without any prop.
 */
export const CustomDayContent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar },
    setup: () => ({
      value: ref(june(15)),
      price: (day: number) => 39 + ((day * 7) % 60),
    }),
    template: `
      <Calendar v-model="value" locale="en-US" style="--cal-cell-size: 52px;">
        <template #day="{ dayNumber, adjacent, disabled, selected }">
          <span style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span>{{ dayNumber }}</span>
            <span
              v-if="!adjacent && !disabled"
              :style="{ fontSize: 'var(--text-2xs)', color: selected ? 'inherit' : 'var(--text-muted)' }"
            >
              {{ price(dayNumber) }}€
            </span>
          </span>
        </template>
      </Calendar>
    `,
  }),
}

/**
 * The `footer` slot hosts actions or presets under the grid — setting the
 * v-model from outside pulls the visible month along.
 */
export const FooterActions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar, Button },
    setup: () => ({ value: ref<Date | null>(june(15)), june }),
    template: `
      <Calendar v-model="value" locale="en-US">
        <template #footer>
          <div style="display: flex; gap: var(--spacing-2); justify-content: flex-end;">
            <Button size="xs" variant="text" @click="value = null">Clear</Button>
            <Button size="xs" variant="text" @click="value = june(1)">June 1</Button>
            <Button size="xs" variant="tonal" color="primary" @click="value = new Date()">Today</Button>
          </div>
        </template>
      </Calendar>
    `,
  }),
}

/**
 * Month and weekday names come from `Intl` — a `locale` string is all it
 * takes. The first day of the week follows the locale convention
 * (`Intl.Locale` week info) and `weekStartsOn` overrides it.
 */
export const Localized: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar },
    setup: () => ({
      fr: ref(june(15)),
      us: ref(june(15)),
      usMonday: ref(june(15)),
      ar: ref(june(15)),
    }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-6);">
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">fr</p>
          <Calendar v-model="fr" locale="fr" />
        </div>
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">en-US</p>
          <Calendar v-model="us" locale="en-US" />
        </div>
        <div>
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">en-US, weekStartsOn 1</p>
          <Calendar v-model="usMonday" locale="en-US" :week-starts-on="1" />
        </div>
        <div dir="rtl">
          <p style="margin: 0 0 var(--spacing-2); font: 500 var(--text-sm) var(--font-sans); color: var(--text);">ar (RTL)</p>
          <Calendar v-model="ar" locale="ar" />
        </div>
      </div>
    `,
  }),
}
