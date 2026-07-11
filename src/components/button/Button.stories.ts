import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from './Button.vue'
import Icon from '../icon/Icon.vue'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text'] as const
const shapes = ['square', 'round'] as const

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
    icon: {
      control: 'text',
      description: 'Icon-only mode: Material Symbols Rounded name, or an image / SVG URL',
    },
    label: {
      control: 'text',
      description: 'Icon-only mode: accessible name (aria-label) — required, no visible text',
    },
    shape: {
      control: 'select',
      options: shapes,
      description: 'Icon-only mode: square = rounded corners, round = full circle',
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

/**
 * iconStart / iconEnd accept a Material Symbols name or an image / SVG URL;
 * inline SVG (or any custom Icon) goes through the icon-start / icon-end slots.
 */
export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Icon },
    setup: () => ({
      sizes,
      smiley:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23f59e0b'/%3E%3Ccircle cx='9' cy='10' r='1.5' fill='%23422006'/%3E%3Ccircle cx='15' cy='10' r='1.5' fill='%23422006'/%3E%3Cpath d='M8 14.5q4 3 8 0' stroke='%23422006' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E",
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button color="primary" icon-start="add">Create</Button>
          <Button color="primary" variant="tonal" icon-end="arrow_forward">Next</Button>
          <Button variant="outlined" icon-start="download" icon-end="expand_more">Export</Button>
          <Button color="danger" variant="text" icon-start="delete">Delete</Button>
        </div>
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button :icon-start="smiley">Image icon</Button>
          <Button color="success" variant="flat">
            <template #icon-start><Icon name="check_circle" filled /></template>
            Slot icon
          </Button>
          <Button color="primary" variant="tonal">
            <template #icon-start>
              <Icon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z" />
                </svg>
              </Icon>
            </template>
            Inline SVG
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

/**
 * Icon-only button: set `label` (the accessible name — required, there is no
 * visible text) and pass the icon via `icon`, or via the default slot for
 * inline SVG / custom Icon markup.
 */
export const IconOnly: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Icon },
    setup: () => ({ colors, variants }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div style="display: grid; grid-template-columns: repeat(5, max-content); gap: var(--spacing-4); align-items: center;">
          <template v-for="variant in variants" :key="variant">
            <Button
              v-for="color in colors"
              :key="color"
              :variant="variant"
              :color="color"
              icon="favorite"
              :label="variant + ' ' + color"
            />
          </template>
        </div>
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button color="success" variant="tonal" label="Confirm">
            <Icon name="check_circle" filled />
          </Button>
          <Button color="primary" variant="outlined" shape="round" label="Star">
            <Icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z" />
              </svg>
            </Icon>
          </Button>
        </div>
      </div>
    `,
  }),
}

/** Icon-only shapes: square keeps the size's rounded corners, round is a full circle. */
export const IconOnlyShapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button },
    setup: () => ({ sizes, shapes }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div v-for="shape in shapes" :key="shape" style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button
            v-for="size in sizes"
            :key="size"
            :size="size"
            :shape="shape"
            color="primary"
            icon="edit"
            :label="'Edit (' + shape + ' ' + size + ')'"
          />
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
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button v-for="variant in variants" :key="variant" :variant="variant" color="primary" is-loading>
            {{ capitalize(variant) }}
          </Button>
        </div>
        <div style="display: flex; gap: var(--spacing-4); align-items: center;">
          <Button
            v-for="variant in variants"
            :key="variant"
            :variant="variant"
            color="primary"
            icon="refresh"
            :label="'Refresh (' + variant + ')'"
            is-loading
          />
        </div>
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
