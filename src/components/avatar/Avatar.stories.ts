import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Avatar from './Avatar.vue'
import Button from '../button/Button.vue'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const semanticColors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const

/* self-contained portrait so stories never depend on the network */
const portrait =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23b4c6dc'/%3E%3Ccircle cx='32' cy='24' r='11' fill='%23425466'/%3E%3Cpath d='M10 64a22 22 0 0 1 44 0z' fill='%23425466'/%3E%3C/svg%3E"

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Source of the initials, auto-color seed, tooltip text and accessible label',
    },
    src: { control: 'text', description: 'Image URL; falls back to initials on error' },
    alt: { control: 'text', description: 'Image alt text; defaults to name' },
    icon: {
      control: 'text',
      description:
        'Material Symbols Rounded name (or image / SVG URL) shown when there is no image',
    },
    text: { control: 'text', description: 'Explicit short text; overrides the initials' },
    size: {
      control: 'select',
      options: sizes,
      description: 'xs = 28px, sm = 36px, md = 44px, lg = 52px, xl = 64px',
    },
    color: {
      control: 'text',
      description: `'auto', one of ${semanticColors.join(' / ')}, or any CSS color`,
    },
    tooltip: {
      control: 'text',
      description: 'true shows the name in a Tooltip; a string overrides the text',
    },
    href: { control: 'text', description: 'Renders an <a> instead of a <span>' },
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Only used with href',
    },
    rel: {
      control: 'text',
      description: 'Only used with href; defaults to "noopener noreferrer" when target is _blank',
    },
  },
  args: {
    name: 'Ada Lovelace',
    size: 'sm',
    color: 'auto',
  },
  render: (args) => ({
    components: { Avatar },
    setup: () => ({ args }),
    template: '<Avatar v-bind="args" />',
  }),
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The size scale mirrors Button heights, so both line up in a toolbar. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Avatar, Button },
    setup: () => ({ sizes, portrait }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Avatar v-for="size in sizes" :key="size" :size="size" name="Ada Lovelace" :src="portrait" />
        </div>
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Avatar size="md" name="Ada Lovelace" />
          <Button size="md" color="primary">Same height</Button>
        </div>
      </div>
    `,
  }),
}

/** Image, icon, explicit text, initials from name — and an empty disc. */
export const Content: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Avatar },
    setup: () => ({ portrait }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Avatar name="Ada Lovelace" :src="portrait" />
        <Avatar name="Support" icon="support_agent" />
        <Avatar name="Team" text="42" />
        <Avatar name="Ada Lovelace" />
        <Avatar name="Plato" />
        <Avatar />
      </div>
    `,
  }),
}

/** The default color hashes the name into a stable hue — same name, same color, every render. */
export const AutoColors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Avatar },
    setup: () => ({
      names: [
        'Ada Lovelace',
        'Grace Hopper',
        'Alan Turing',
        'Katherine Johnson',
        'Edsger Dijkstra',
        'Barbara Liskov',
        'Donald Knuth',
        'Margaret Hamilton',
        'Linus Torvalds',
        'Radia Perlman',
      ],
    }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center; flex-wrap: wrap;">
        <Avatar v-for="name in names" :key="name" :name="name" />
      </div>
    `,
  }),
}

/**
 * Semantic theme colors, plus arbitrary CSS colors: the foreground flips to
 * black or white based on the background lightness.
 */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Avatar },
    setup: () => ({ semanticColors }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Avatar v-for="color in semanticColors" :key="color" :color="color" name="Ada Lovelace" />
        </div>
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Avatar color="rebeccapurple" name="Ada Lovelace" />
          <Avatar color="#0e7490" name="Ada Lovelace" />
          <Avatar color="oklch(0.92 0.08 100)" name="Ada Lovelace" />
          <Avatar color="lavender" name="Ada Lovelace" />
        </div>
      </div>
    `,
  }),
}

/** When the image fails to load, the avatar falls back to the initials. */
export const ImageFallback: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Avatar },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Avatar src="/broken-image.png" name="Ada Lovelace" />
        <Avatar src="/broken-image.png" name="Grace Hopper" icon="person" />
        <Avatar src="/broken-image.png" />
      </div>
    `,
  }),
}

/** tooltip (boolean) shows the name; a string overrides the text. */
export const WithTooltip: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Avatar },
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Avatar name="Ada Lovelace" tooltip />
        <Avatar name="Grace Hopper" tooltip="Grace Hopper (admin)" />
      </div>
    `,
  }),
}

/**
 * An href renders an <a>, a click listener renders a <button>; both get the
 * pointer cursor, hover / active feedback and the focus ring.
 */
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Avatar },
    setup: () => ({ portrait, onClick: () => {} }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Avatar name="Ada Lovelace" href="https://example.com" target="_blank" tooltip="Opens profile" />
        <Avatar name="Grace Hopper" :src="portrait" @click="onClick" />
        <Avatar name="Alan Turing" />
      </div>
    `,
  }),
}
