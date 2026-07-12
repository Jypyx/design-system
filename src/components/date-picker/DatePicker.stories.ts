import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'
import Button from '../button/Button.vue'

/* fixed dates keep the stories deterministic (Chromatic, vitest) */
const june = (day: number) => new Date(2026, 5, day)

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: false,
      description: 'v-model — a Date (single) or a { start, end } pair (range)',
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    ariaLabel: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    clearable: { control: 'boolean' },
    clearLabel: { control: 'text' },
    name: { control: 'text', description: "Hidden input(s) with 'yyyy-mm-dd' for native forms" },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end'],
    },
    closeOnSelect: { control: 'boolean' },
    formatOptions: {
      control: 'object',
      description: 'Intl.DateTimeFormatOptions; defaults to { dateStyle: "medium" }',
    },
    range: { control: 'boolean' },
    locale: { control: 'text' },
    weekStartsOn: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6] },
    minDate: { control: false },
    maxDate: { control: false },
    disabledDates: { control: false, description: 'Date[] or (date: Date) => boolean' },
    events: { control: 'object' },
    showAdjacentDays: { control: 'boolean' },
    selectAdjacentDays: { control: 'boolean' },
  },
  args: {
    modelValue: june(15),
    label: 'Date',
    placeholder: 'Pick a date',
    locale: 'en-US',
    size: 'sm',
    clearable: false,
    disabled: false,
    required: false,
    invalid: false,
    closeOnSelect: true,
    placement: 'bottom-start',
  },
  render: (args) => ({
    components: { DatePicker },
    setup: () => ({ args, value: ref(args.modelValue ?? null) }),
    template: '<div style="max-width: 320px;"><DatePicker v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.click(input)
    const day = await canvas.findByRole('gridcell', { name: 'Saturday, June 20, 2026' })
    await userEvent.click(day)
    await waitFor(() => expect(input).toHaveValue('Jun 20, 2026'))
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
  },
}

/** Same heights and font sizes as Input / Button: xs = 28px, sm = 36px, md = 44px, lg = 52px. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      xs: ref(june(15)),
      sm: ref(june(15)),
      md: ref(june(15)),
      lg: ref(june(15)),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <DatePicker v-model="xs" size="xs" label="Extra small (28px)" locale="en-US" />
        <DatePicker v-model="sm" size="sm" label="Small (36px, default)" locale="en-US" />
        <DatePicker v-model="md" size="md" label="Medium (44px)" locale="en-US" />
        <DatePicker v-model="lg" size="lg" label="Large (52px)" locale="en-US" />
      </div>
    `,
  }),
}

/**
 * In range mode the field shows the localized span (`Intl.formatRange`);
 * the popover stays open until the end date is picked.
 */
export const Range: Story = {
  args: { range: true, modelValue: { start: june(10), end: june(15) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox') as HTMLInputElement
    expect(input.value).toMatch(/Jun 10.+15, 2026/)
    await userEvent.click(input)
    /* picking a date restarts the range: still open, waiting for the end */
    await userEvent.click(await canvas.findByRole('gridcell', { name: 'Saturday, June 20, 2026' }))
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Thursday, June 25, 2026' }))
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
    expect(input.value).toMatch(/Jun 20.+25, 2026/)
  },
}

/** The field value follows `locale` (and `formatOptions`) through `Intl`. */
export const Localized: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      fr: ref(june(15)),
      us: ref(june(15)),
      ja: ref(june(15)),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <DatePicker v-model="fr" label="fr" locale="fr" />
        <DatePicker v-model="us" label="en-US" locale="en-US" />
        <DatePicker v-model="ja" label="ja" locale="ja" />
      </div>
    `,
  }),
}

/** Every Calendar prop is forwarded: bounds, blocked days, event dots… */
export const WithEventsAndLimits: Story = {
  args: {
    minDate: june(5),
    maxDate: new Date(2026, 6, 20),
    events: [
      { date: june(8), color: 'success' },
      { date: june(12), color: 'danger' },
      { date: june(18) },
    ],
    hint: 'Between June 5 and July 20',
  },
}

export const Clearable: Story = {
  args: { clearable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await expect(input).toHaveValue('Jun 15, 2026')
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }))
    await waitFor(() => expect(input).toHaveValue(''))
  },
}

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      disabled: ref(june(15)),
      invalid: ref<Date | null>(null),
      required: ref<Date | null>(null),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <DatePicker v-model="disabled" label="Disabled" locale="en-US" disabled />
        <DatePicker v-model="invalid" label="Invalid" locale="en-US" invalid hint="A date is required" />
        <DatePicker v-model="required" label="Required" locale="en-US" required placeholder="Pick a date" />
      </div>
    `,
  }),
}

/**
 * `closeOnSelect: false` keeps the popover open for footer-driven flows;
 * the exposed `close()` lets an Apply button end them. Escape first backs
 * out of the month / year views, then closes the popover.
 */
export const FooterApply: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DatePicker, Button },
    setup: () => ({ value: ref(june(15)), picker: ref() }),
    template: `
      <div style="max-width: 320px;">
        <DatePicker ref="picker" v-model="value" label="Date" locale="en-US" :close-on-select="false">
          <template #footer>
            <div style="display: flex; gap: var(--spacing-2); justify-content: flex-end;">
              <Button size="xs" variant="text" @click="picker?.close()">Cancel</Button>
              <Button size="xs" variant="flat" color="primary" @click="picker?.close()">Apply</Button>
            </div>
          </template>
        </DatePicker>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.click(input)
    const day = await canvas.findByRole('gridcell', { name: 'Wednesday, June 10, 2026' })
    await userEvent.click(day)
    /* closeOnSelect=false keeps the popover open */
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    /* Escape in the months view backs out without closing the popover */
    await userEvent.click(canvas.getByRole('button', { name: 'Choose month' }))
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Jun' })).toHaveFocus())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.getByRole('grid')).toBeInTheDocument())
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
  },
}

/** The popover follows `placement` and flips near the viewport edges. */
export const Placement: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      end: ref(june(15)),
      top: ref(june(15)),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px; padding-block-start: 40vh;">
        <DatePicker v-model="end" label="bottom-end" locale="en-US" placement="bottom-end" />
        <DatePicker v-model="top" label="top-start" locale="en-US" placement="top-start" />
      </div>
    `,
  }),
}
