import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Chip from './Chip.vue'
import Typography from '../typography/Typography.vue'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const semanticColors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
const variants = ['filled', 'tonal', 'outlined'] as const

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Chip text; omit for an icon-only chip' },
    iconStart: {
      control: 'text',
      description: 'Material Symbols Rounded name (or image / SVG URL) before the label',
    },
    iconEnd: { control: 'text', description: 'Icon after the label; same values as iconStart' },
    size: {
      control: 'select',
      options: sizes,
      description: 'xs = 20px, sm = 26px, md = 32px, lg = 38px, xl = 42px',
    },
    color: {
      control: 'text',
      description: `One of ${semanticColors.join(' / ')}, or any CSS color`,
    },
    variant: { control: 'select', options: variants },
    shape: {
      control: 'select',
      options: ['rounded', 'pill'],
      description: 'rounded (default) or fully rounded pill',
    },
    disabled: { control: 'boolean' },
    closable: {
      control: 'boolean',
      description: "Shows a close button emitting 'close'; Delete / Backspace also closes",
    },
    closeIcon: { control: 'text', description: 'Icon of the close button' },
    closeLabel: { control: 'text', description: 'Accessible name of the close button' },
    selected: {
      control: 'boolean',
      description: 'Filter-chip toggle state; aria-pressed when clickable',
    },
    href: { control: 'text', description: 'Renders the chip body as an <a>' },
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Only used with href',
    },
    rel: {
      control: 'text',
      description: 'Only used with href; defaults to "noopener noreferrer" when target is _blank',
    },
    maxWidth: { control: 'text', description: 'CSS max-width of the label (ellipsis beyond)' },
  },
  args: {
    label: 'Chip',
    size: 'sm',
    color: 'neutral',
    variant: 'filled',
    shape: 'rounded',
  },
  render: (args) => ({
    components: { Chip, Typography },
    setup: () => ({ args }),
    template: '<Chip v-bind="args" />',
  }),
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Same scale as Badge (without 'dot'): 20 / 26 / 32 / 38 / 42px. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    setup: () => ({ sizes }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Chip v-for="size in sizes" :key="size" :size="size" :label="size" icon-start="sell" closable />
      </div>
    `,
  }),
}

/** Every variant across the five semantic colors. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    setup: () => ({ variants, semanticColors }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Chip v-for="color in semanticColors" :key="color" :variant="variant" :color="color" :label="variant" />
        </div>
      </div>
    `,
  }),
}

/** Any CSS color works: background and text are derived from it with color-mix. */
export const CustomColor: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    setup: () => ({ variants, colors: ['hotpink', '#7c3aed', 'oklch(0.55 0.15 200)'] }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Chip v-for="color in colors" :key="color" :variant="variant" :color="color" :label="color" />
        </div>
      </div>
    `,
  }),
}

/** 'rounded' (default) vs 'pill'. */
export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Chip label="Rounded" color="primary" />
        <Chip label="Pill" color="primary" shape="pill" />
      </div>
    `,
  }),
}

/** Leading / trailing icons, and an icon-only chip (give it an aria-label). */
export const Icons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Chip label="Assignee" icon-start="person" />
        <Chip label="Open" icon-end="expand_more" color="primary" variant="tonal" />
        <Chip label="Verified" icon-start="check" icon-end="close" color="success" variant="outlined" />
        <Chip icon-start="star" aria-label="Favorite" color="warning" />
        <Chip icon-start="star" aria-label="Favorite" color="warning" shape="pill" />
      </div>
    `,
  }),
}

/**
 * The close button (and Delete / Backspace on a focused chip) emits 'close';
 * the parent owns the list and removes the chip.
 */
export const Closable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    setup() {
      const tags = ref(['Design', 'Vue', 'TypeScript', 'CSS'])
      const remove = (tag: string) => (tags.value = tags.value.filter((t) => t !== tag))
      return { tags, remove }
    },
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center; min-height: 26px;">
        <Chip v-for="tag in tags" :key="tag" :label="tag" color="primary" variant="tonal" closable
              :close-label="'Remove ' + tag" @close="remove(tag)" />
        <Typography v-if="tags.length === 0" as="span" variant="subtitle">
          All chips removed — reload the story
        </Typography>
      </div>
    `,
  }),
}

/** A custom close icon via the closeIcon prop. */
export const CustomCloseIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Chip label="Archive me" closable close-icon="archive" close-label="Archive" />
        <Chip label="Trash me" color="danger" variant="outlined" closable close-icon="delete" close-label="Delete" />
      </div>
    `,
  }),
}

/**
 * A chip with a click listener renders a real button: hover, active,
 * keyboard focus and disabled state come with it. Chips without a
 * listener are inert (no hover, no cursor).
 */
export const Clickable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    setup() {
      const clicks = ref(0)
      return { clicks }
    },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Chip :label="'Clicked ' + clicks + '×'" color="primary" @click="clicks++" />
        <Chip label="Tonal" color="success" variant="tonal" @click="clicks++" />
        <Chip label="Disabled" color="primary" disabled @click="clicks++" />
        <Chip label="Not clickable" color="primary" />
      </div>
    `,
  }),
}

/** Clickable + selected = a filter chip; the state is exposed as aria-pressed. */
export const FilterChips: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    setup() {
      const filters = ref([
        { name: 'Vue', on: true },
        { name: 'React', on: false },
        { name: 'Svelte', on: false },
        { name: 'Angular', on: false },
      ])
      return { filters }
    },
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Chip v-for="f in filters" :key="f.name" :label="f.name" variant="outlined" color="primary"
              :icon-start="f.on ? 'check' : undefined" :selected="f.on" @click="f.on = !f.on" />
      </div>
    `,
  }),
}

/** The chip body renders as a link with href (dropped when disabled). */
export const AsLink: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Chip label="Documentation" icon-start="link" color="primary" variant="tonal" href="https://example.com" target="_blank" />
        <Chip label="Disabled link" icon-start="link" color="primary" variant="tonal" href="https://example.com" disabled />
      </div>
    `,
  }),
}

/** maxWidth truncates the label with an ellipsis; the native title reveals it. */
export const Truncation: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Chip, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Chip label="A very long tag name that would stretch the layout" max-width="120px" closable />
        <Chip label="Short" max-width="120px" />
      </div>
    `,
  }),
}
