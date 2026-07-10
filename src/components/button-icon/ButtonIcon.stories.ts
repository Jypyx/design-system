import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ButtonIcon from './ButtonIcon.vue'
import Icon from '../icon/Icon.vue'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text'] as const
const shapes = ['square', 'round'] as const

const meta = {
  title: 'Components/ButtonIcon',
  component: ButtonIcon,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible name (aria-label) — required, the button has no visible text',
    },
    icon: {
      control: 'text',
      description: 'Material Symbols Rounded name, or an image / SVG URL',
    },
    shape: {
      control: 'select',
      options: shapes,
      description: 'square = rounded corners, round = full circle',
    },
    size: {
      control: 'select',
      options: sizes,
      description: 'xs = 28px, sm = 36px, md = 44px, lg = 52px',
    },
    color: { control: 'select', options: colors },
    variant: { control: 'select', options: variants },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
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
    label: 'Add',
    icon: 'add',
    shape: 'square',
    size: 'sm',
    color: 'neutral',
    variant: 'elevated',
    disabled: false,
    isLoading: false,
  },
  render: (args) => ({
    components: { ButtonIcon },
    setup: () => ({ args }),
    template: '<ButtonIcon v-bind="args" />',
  }),
} satisfies Meta<typeof ButtonIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every variant crossed with every color. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonIcon },
    setup: () => ({ colors, variants }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(5, max-content); gap: var(--spacing-4); align-items: center;">
        <template v-for="variant in variants" :key="variant">
          <ButtonIcon
            v-for="color in colors"
            :key="color"
            :variant="variant"
            :color="color"
            icon="favorite"
            :label="variant + ' ' + color"
          />
        </template>
      </div>
    `,
  }),
}

/** Square (rounded corners) vs round (full circle), across every size. */
export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonIcon },
    setup: () => ({ sizes, shapes }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div v-for="shape in shapes" :key="shape" style="display: flex; gap: var(--spacing-4); align-items: center;">
          <ButtonIcon
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

/**
 * icon accepts a Material Symbols name or an image / SVG URL;
 * inline SVG (or any custom Icon) goes through the default slot.
 */
export const CustomIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonIcon, Icon },
    setup: () => ({
      smiley:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23f59e0b'/%3E%3Ccircle cx='9' cy='10' r='1.5' fill='%23422006'/%3E%3Ccircle cx='15' cy='10' r='1.5' fill='%23422006'/%3E%3Cpath d='M8 14.5q4 3 8 0' stroke='%23422006' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E",
    }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <ButtonIcon color="primary" icon="add" label="Create" />
        <ButtonIcon :icon="smiley" label="Image icon" />
        <ButtonIcon color="success" variant="tonal" label="Confirm">
          <Icon name="check_circle" filled />
        </ButtonIcon>
        <ButtonIcon color="primary" variant="outlined" shape="round" label="Star">
          <Icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z" />
            </svg>
          </Icon>
        </ButtonIcon>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonIcon },
    setup: () => ({ variants }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <ButtonIcon
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          color="primary"
          icon="delete"
          :label="'Delete (' + variant + ')'"
          disabled
        />
      </div>
    `,
  }),
}

export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonIcon },
    setup: () => ({ variants }),
    template: `
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <ButtonIcon
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          color="primary"
          icon="refresh"
          :label="'Refresh (' + variant + ')'"
          is-loading
        />
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
    icon: 'open_in_new',
    label: 'Open example.com',
  },
}
