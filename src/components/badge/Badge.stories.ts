import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Badge from './Badge.vue'
import Avatar from '../avatar/Avatar.vue'
import Button from '../button/Button.vue'
import Typography from '../typography/Typography.vue'

const sizes = ['dot', 'xs', 'sm', 'md', 'lg', 'xl'] as const
const semanticColors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
const variants = ['filled', 'tonal', 'outlined'] as const

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: "Badge text (count, short label); ignored in 'dot' size",
    },
    size: {
      control: 'select',
      options: sizes,
      description: 'dot = 10px, xs = 20px, sm = 26px, md = 32px, lg = 38px, xl = 42px',
    },
    color: {
      control: 'text',
      description: `One of ${semanticColors.join(' / ')}, or any CSS color`,
    },
    variant: {
      control: 'select',
      options: variants,
    },
  },
  args: {
    content: '3',
    size: 'sm',
    color: 'primary',
    variant: 'filled',
  },
  render: (args) => ({
    components: { Badge },
    setup: () => ({ args }),
    template: '<Badge v-bind="args" />',
  }),
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 'dot' is an empty 10px disc; the other sizes grow to fit their content. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Badge },
    setup: () => ({ sizes }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Badge v-for="size in sizes" :key="size" :size="size" content="99+" color="danger" />
      </div>
    `,
  }),
}

/** Every variant across the five semantic colors. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Badge },
    setup: () => ({ variants, semanticColors }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Badge v-for="color in semanticColors" :key="color" :variant="variant" :color="color" :content="variant" />
        </div>
      </div>
    `,
  }),
}

/** Any CSS color works: background and text are derived from it with color-mix. */
export const CustomColor: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Badge },
    setup: () => ({ variants, colors: ['hotpink', '#7c3aed', 'oklch(0.55 0.15 200)'] }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Badge v-for="color in colors" :key="color" :variant="variant" :color="color" :content="color" />
        </div>
      </div>
    `,
  }),
}

/** With an element in the default slot, the badge overlays its top end corner. */
export const Overlay: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Badge, Avatar, Button },
    template: `
      <div style="display: flex; gap: var(--spacing-8); align-items: center;">
        <Badge content="3" size="xs" color="danger">
          <Button>Inbox</Button>
        </Badge>
        <Badge size="dot" color="danger">
          <Avatar name="Ada Lovelace" />
        </Badge>
        <Badge content="9" size="xs" color="primary" variant="tonal">
          <Avatar name="Grace Hopper" />
        </Badge>
      </div>
    `,
  }),
}

/** The dot also works standalone, as a status mark inline with text. */
export const DotStandalone: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Badge, Typography },
    template: `
      <Typography style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Badge size="dot" color="success" /> Operational
      </Typography>
    `,
  }),
}
