import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Pagination from './Pagination.vue'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text'] as const
const navModes = ['hidden', 'icon', 'icon-text'] as const

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    length: { control: 'number', description: 'Total number of pages' },
    size: {
      control: 'select',
      options: sizes,
      description: 'Same scale as Button: xs = 28px, sm = 36px, md = 44px, lg = 52px',
    },
    color: {
      control: 'select',
      options: colors,
      description: 'Accent of the active page button',
    },
    variant: {
      control: 'select',
      options: variants,
      description: 'Variant of the inactive buttons (the active page always renders flat)',
    },
    navButtons: {
      control: 'select',
      options: navModes,
      description: 'Prev / next buttons: hidden, icon-only, or icon + visible text',
    },
    attached: {
      control: 'boolean',
      description:
        'Glue the buttons into a seamless ButtonGroup; by default they are spaced with a gap',
    },
    prevIcon: {
      control: 'text',
      description: 'Material Symbols Rounded name or image / SVG URL',
    },
    nextIcon: { control: 'text' },
    totalVisible: {
      control: 'number',
      description: 'Hard cap on visible page slots; the available width may reduce it further',
    },
    disabled: { control: 'boolean' },
    label: { control: 'text', description: 'Accessible name of the nav landmark' },
    prevLabel: {
      control: 'text',
      description: 'aria-label in icon mode, visible text in icon-text mode',
    },
    nextLabel: { control: 'text' },
    pageLabel: {
      control: false,
      description: 'Accessible name of a page button: (page: number) => string',
    },
  },
  args: {
    length: 10,
    size: 'sm',
    color: 'primary',
    variant: 'outlined',
    navButtons: 'icon',
    attached: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(1) }),
    template: `<Pagination v-bind="args" v-model="page" />`,
  }),
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `attached` fuses the buttons into a seamless ButtonGroup instead of the default spaced row. */
export const Attached: Story = {
  args: { attached: true },
}

/** Prev / next buttons hidden, icon-only, or icon + text. */
export const NavButtonModes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup: () => ({ navModes, page: ref(3) }),
    template: `
      <div style="display: grid; gap: var(--spacing-4);">
        <Pagination v-for="mode in navModes" :key="mode" :length="5" :nav-buttons="mode" v-model="page" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup: () => ({ sizes, page: ref(2) }),
    template: `
      <div style="display: grid; gap: var(--spacing-4);">
        <Pagination v-for="size in sizes" :key="size" :length="5" :size="size" v-model="page" />
      </div>
    `,
  }),
}

/** The three windows of the sliding truncation: start-anchored, centered on the current page, end-anchored. */
export const Truncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup: () => ({ pageStart: ref(1), pageMiddle: ref(25), pageEnd: ref(50) }),
    template: `
      <div style="display: grid; gap: var(--spacing-4);">
        <Pagination :length="50" :total-visible="7" v-model="pageStart" />
        <Pagination :length="50" :total-visible="7" v-model="pageMiddle" />
        <Pagination :length="50" :total-visible="7" v-model="pageEnd" />
      </div>
    `,
  }),
}

/** Drag the container's bottom-right handle: the page window shrinks and grows to fit the available width. */
export const Responsive: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup: () => ({ page: ref(15) }),
    template: `
      <div style="resize: horizontal; overflow: hidden; max-width: 100%; border: 1px dashed var(--border); border-radius: var(--radius-md); padding: var(--spacing-4);">
        <Pagination :length="30" v-model="page" />
      </div>
    `,
  }),
}

export const CustomIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup: () => ({ page: ref(3) }),
    template: `
      <div style="display: grid; gap: var(--spacing-4);">
        <Pagination :length="5" prev-icon="arrow_back" next-icon="arrow_forward" v-model="page" />
        <Pagination :length="5" nav-buttons="icon-text" prev-icon="west" next-icon="east" v-model="page" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup: () => ({ page: ref(3) }),
    template: `<Pagination :length="5" disabled v-model="page" />`,
  }),
}

/** On the last page the next button is disabled (as prev is on page 1 — see Default). */
export const LastPage: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Pagination },
    setup: () => ({ page: ref(10) }),
    template: `<Pagination :length="10" v-model="page" />`,
  }),
}
