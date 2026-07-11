import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import Combobox from './Combobox.vue'
import type { ComboboxOption } from './Combobox.types'

const countries: ComboboxOption[] = [
  { label: 'Australia', value: 'au' },
  { label: 'Brazil', value: 'br' },
  { label: 'Canada', value: 'ca' },
  { label: 'France', value: 'fr' },
  { label: 'Germany', value: 'de' },
  { label: 'Italy', value: 'it' },
  { label: 'Japan', value: 'jp' },
  { label: 'Norway', value: 'no' },
  { label: 'Réunion', value: 're' },
  { label: 'Spain', value: 'es' },
  { label: 'Uruguay', value: 'uy', disabled: true },
]

const people: ComboboxOption[] = [
  { label: 'Ada Lovelace', value: 'ada', group: 'Engineering' },
  { label: 'Grace Hopper', value: 'grace', group: 'Engineering' },
  { label: 'Alan Turing', value: 'alan', group: 'Engineering' },
  { label: 'Dieter Rams', value: 'dieter', group: 'Design' },
  { label: 'Susan Kare', value: 'susan', group: 'Design' },
  { label: 'Paul Rand', value: 'paul', group: 'Design' },
  { label: 'David Ogilvy', value: 'david', group: 'Marketing' },
]

/* opens the list in the automated (webdriver-driven) vitest run only, so
   the a11y scan covers the expanded listbox; in the Storybook UI stories
   start closed */
const openList = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  if (!navigator.webdriver) return
  await userEvent.click(within(canvasElement).getAllByRole('combobox')[0])
}

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: false, description: 'v-model — a value (single) or an array (multiple)' },
    options: { control: 'object' },
    multiple: { control: 'boolean' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    ariaLabel: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    clearable: { control: 'boolean' },
    clearLabel: { control: 'text' },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    name: { control: 'text' },
    chips: { control: 'boolean', description: 'Multiple only — Chips (true) or joined text (false)' },
    maxVisible: { control: 'number', description: 'Multiple only — collapse the rest into "+N"' },
    checkIcon: { control: 'text', description: 'Material Symbols name or image / SVG URL' },
    emptyText: { control: 'text' },
    selectAll: { control: 'boolean' },
    selectAllLabel: { control: 'text' },
  },
  args: {
    options: countries,
    multiple: false,
    size: 'sm',
    label: 'Country',
    placeholder: 'Search a country…',
    clearable: true,
    isLoading: false,
    disabled: false,
    required: false,
    invalid: false,
    chips: true,
    checkIcon: 'check',
    emptyText: 'No results',
    selectAll: false,
  },
  render: (args) => ({
    components: { Combobox },
    setup: () => ({ args }),
    template: '<div style="max-width: 320px;"><Combobox v-bind="args" /></div>',
  }),
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { play: openList }

/** Same heights and font sizes as Input / Button: xs = 28px, sm = 36px, md = 44px, lg = 52px. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <Combobox size="xs" label="Extra small (28px)" :options="countries" placeholder="Search…" />
        <Combobox size="sm" label="Small (36px, default)" :options="countries" placeholder="Search…" />
        <Combobox size="md" label="Medium (44px)" :options="countries" placeholder="Search…" />
        <Combobox size="lg" label="Large (52px)" :options="countries" placeholder="Search…" />
      </div>
    `,
  }),
}

/**
 * `multiple` turns the v-model into an array and renders the selection as
 * closable Chips. The list stays open between picks, the query is kept so
 * several matches can be selected under one filter, and Backspace on an
 * empty input removes the last selected item.
 */
export const Multiple: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries, selection: ref<Array<string | number>>(['fr']) }),
    template: `
      <div style="max-width: 360px;">
        <Combobox
          v-model="selection"
          multiple
          clearable
          label="Countries"
          :options="countries"
          placeholder="Search countries…"
          hint="Backspace on an empty input removes the last selection"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.click(canvas.getByRole('option', { name: 'Japan' }))
    /* multiple keeps the list open between picks */
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('button', { name: 'Remove Japan' })).toBeVisible()
    await expect(canvas.getByRole('option', { name: 'Japan' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await userEvent.keyboard('{Escape}')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

/** `maxVisible` collapses the extra selected items into a "+N" badge (hover it for the full list). */
export const Overflow: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries, selection: ref(['fr', 'de', 'es', 'it', 'jp']) }),
    template: `
      <div style="max-width: 360px;">
        <Combobox
          v-model="selection"
          multiple
          clearable
          :max-visible="2"
          label="Countries"
          :options="countries"
        />
      </div>
    `,
  }),
}

/** `:chips="false"` renders the selection as plain joined text instead of Chips. */
export const TextDisplay: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries, selection: ref(['fr', 'de', 'es', 'it']) }),
    template: `
      <div style="max-width: 360px;">
        <Combobox
          v-model="selection"
          multiple
          :chips="false"
          :max-visible="3"
          label="Countries"
          :options="countries"
        />
      </div>
    `,
  }),
}

/** Options sharing a `group` string render under a header, like optgroup. */
export const Groups: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ people }),
    template: `
      <div style="max-width: 320px;">
        <Combobox :options="people" label="Assignee" placeholder="Search people…" />
      </div>
    `,
  }),
  play: openList,
}

/** The select-all row toggles every (filtered, enabled) option at once. */
export const SelectAll: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ people, selection: ref([]) }),
    template: `
      <div style="max-width: 360px;">
        <Combobox
          v-model="selection"
          multiple
          select-all
          clearable
          label="Reviewers"
          :options="people"
          placeholder="Search people…"
          hint="Select all only applies to the filtered options"
        />
      </div>
    `,
  }),
  play: openList,
}

/** Disabled, invalid, required and loading; invalid recolors border, ring and hint. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 280px); gap: var(--spacing-5);">
        <Combobox label="Default" :options="countries" placeholder="Pick a country…" hint="Everything enabled" />
        <Combobox label="Required" :options="countries" required placeholder="Cannot be empty" hint="Marked with an asterisk" />
        <Combobox label="Disabled" :options="countries" model-value="fr" disabled hint="Greyed out entirely" />
        <Combobox label="Invalid" :options="countries" invalid placeholder="Pick a country…" hint="A selection is required" />
        <Combobox label="Loading" :options="countries" is-loading placeholder="Loading countries…" hint="The spinner replaces the chevron" />
        <Combobox label="Clearable" :options="countries" model-value="jp" clearable hint="The clear button erases the selection" />
      </div>
    `,
  }),
}

/** The empty state is plain text (`emptyText`) or fully custom via the #empty slot. */
export const EmptyState: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <Combobox :options="countries" label="Custom text" empty-text="No country matches your search" />
        <Combobox :options="countries" label="Custom slot" placeholder="Type gibberish…">
          <template #empty>
            <span style="display: inline-flex; align-items: center; gap: var(--spacing-2);">
              🤷 Nothing found — try another spelling
            </span>
          </template>
        </Combobox>
      </div>
    `,
  }),
}

/** Any Material Symbols name (or image / SVG URL) can replace the default check. */
export const CustomCheckIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries, selection: ref(['fr', 'jp']) }),
    template: `
      <div style="max-width: 320px;">
        <Combobox v-model="selection" multiple check-icon="favorite" label="Favorites" :options="countries" />
      </div>
    `,
  }),
  play: openList,
}

/**
 * Full keyboard walkthrough: typing filters (case- and diacritics-insensitive),
 * ArrowDown/ArrowUp move the active option, Enter selects. On a single select
 * the input is blurred after selection so a click reopens the list.
 */
export const KeyboardFiltering: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({ countries, value: ref(null) }),
    template: `
      <div style="max-width: 320px;">
        <Combobox
          v-model="value"
          :options="countries"
          clearable
          label="Country"
          placeholder="Try typing 'reu'…"
          hint="'reu' matches Réunion — diacritics are ignored"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await userEvent.type(input, 'jap')
    const options = canvas.getAllByRole('option')
    await expect(options).toHaveLength(1)
    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveValue('Japan')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    /* single select drops focus after selection so a click can reopen */
    await expect(input).not.toHaveFocus()
  },
}

/** Everything at once. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup: () => ({
      countries,
      people,
      country: ref('fr'),
      reviewers: ref(['ada', 'grace', 'susan', 'dieter']),
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 320px); gap: var(--spacing-6);">
        <Combobox
          v-model="country"
          :options="countries"
          clearable
          required
          label="Country"
          placeholder="Search a country…"
          hint="Single select — picking an option closes the list"
        />
        <Combobox
          v-model="reviewers"
          :options="people"
          multiple
          select-all
          clearable
          :max-visible="2"
          label="Reviewers"
          placeholder="Search people…"
          hint="Grouped, select all, chips and +N overflow"
        />
      </div>
    `,
  }),
}
