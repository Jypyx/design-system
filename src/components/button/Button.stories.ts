import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from './Button.vue'
import Icon from '../icon/Icon.vue'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text'] as const

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: sizes,
      description: 'xs = 28px, sm = 36px, md = 44px, lg = 52px',
    },
    color: { control: 'select', options: colors },
    variant: { control: 'select', options: variants },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    iconStart: {
      control: 'text',
      description: 'Material Symbols Rounded name shown before the label',
    },
    iconEnd: {
      control: 'text',
      description: 'Material Symbols Rounded name shown after the label',
    },
    href: {
      control: 'text',
      description: 'Renders an <a> instead of a <button>',
    },
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
    size: 'sm',
    color: 'neutral',
    variant: 'elevated',
    disabled: false,
    isLoading: false,
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Button</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every variant crossed with every color. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button },
    setup: () => ({ colors, variants, capitalize }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(5, max-content); gap: var(--spacing-4); align-items: center;">
        <template v-for="variant in variants" :key="variant">
          <Button v-for="color in colors" :key="color" :variant="variant" :color="color">
            {{ capitalize(variant) }}
          </Button>
        </template>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button },
    setup: () => ({ sizes }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Button v-for="size in sizes" :key="size" :size="size" color="primary">
          Size {{ size }}
        </Button>
      </div>
    `,
  }),
}

/** Icons via the iconStart / iconEnd props, or any custom Icon via the icon-start / icon-end slots. */
export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Icon },
    setup: () => ({ sizes }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button color="primary" icon-start="add">Create</Button>
          <Button color="primary" variant="tonal" icon-end="arrow_forward">Next</Button>
          <Button variant="outlined" icon-start="download" icon-end="expand_more">Export</Button>
          <Button color="danger" variant="text" icon-start="delete">Delete</Button>
          <Button color="success" variant="flat">
            <template #icon-start><Icon name="check_circle" filled /></template>
            Custom slot icon
          </Button>
        </div>
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button v-for="size in sizes" :key="size" :size="size" color="primary" icon-start="rocket_launch">
            Size {{ size }}
          </Button>
        </div>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button },
    setup: () => ({ variants, capitalize }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Button v-for="variant in variants" :key="variant" :variant="variant" color="primary" disabled>
          {{ capitalize(variant) }}
        </Button>
      </div>
    `,
  }),
}

export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button },
    setup: () => ({ variants, capitalize }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Button v-for="variant in variants" :key="variant" :variant="variant" color="primary" is-loading>
          {{ capitalize(variant) }}
        </Button>
      </div>
    `,
  }),
}

/** With an href, the button renders as an <a> tag. */
export const AsLink: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    color: 'primary',
  },
}
