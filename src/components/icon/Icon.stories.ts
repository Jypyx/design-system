import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Icon from './Icon.vue'
import Typography from '../typography/Typography.vue'

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Material Symbols Rounded ligature name (font loaded by the consumer)',
    },
    src: { control: 'text', description: 'Image URL, used when name is not set' },
    filled: { control: 'boolean', description: 'Material Symbols only' },
    label: {
      control: 'text',
      description: 'Accessible label; omitted = decorative (aria-hidden)',
    },
  },
  args: {
    name: 'favorite',
    filled: false,
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The icon is sized in em, so it follows the parent's font-size. */
export const ScalesWithParent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Icon, Typography },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3);">
        <Typography v-for="size in ['0.75rem', '1rem', '1.5rem', '2.25rem']" :key="size"
           :style="{ fontSize: size, display: 'flex', alignItems: 'center', gap: '0.5em' }">
          <Icon name="rocket_launch" /> Text at {{ size }}
        </Typography>
      </div>
    `,
  }),
}

/** Icons inherit currentColor from their parent. */
export const InheritsColor: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Icon, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-4); font-size: 2rem;">
        <span style="color: var(--color-primary)"><Icon name="info" /></span>
        <span style="color: var(--color-success)"><Icon name="check_circle" filled /></span>
        <span style="color: var(--color-danger)"><Icon name="error" filled /></span>
        <span style="color: var(--text)"><Icon name="settings" /></span>
      </div>
    `,
  }),
}

/** Outline vs filled style of the same Material Symbol. */
export const Filled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Icon, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-4); font-size: 2rem;">
        <Icon name="favorite" />
        <Icon name="favorite" filled />
        <Icon name="star" />
        <Icon name="star" filled />
      </div>
    `,
  }),
}

/** An image icon via the src prop (scales like any other icon). */
export const AsImage: Story = {
  args: {
    name: undefined,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23f59e0b'/%3E%3Ccircle cx='9' cy='10' r='1.5' fill='%23422006'/%3E%3Ccircle cx='15' cy='10' r='1.5' fill='%23422006'/%3E%3Cpath d='M8 14.5q4 3 8 0' stroke='%23422006' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E",
    label: 'Smiley',
  },
  render: (args) => ({
    components: { Icon, Typography },
    setup: () => ({ args }),
    template: '<div style="font-size: 3rem;"><Icon v-bind="args" /></div>',
  }),
}

/** A custom inline SVG via the default slot; use currentColor to inherit. */
export const CustomSvg: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Icon, Typography },
    template: `
      <div style="font-size: 3rem; color: var(--color-primary);">
        <Icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z" />
          </svg>
        </Icon>
      </div>
    `,
  }),
}
