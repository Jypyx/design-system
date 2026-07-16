import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Spinner from './Spinner.vue'
import Typography from '../typography/Typography.vue'

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label; omitted = decorative (aria-hidden)',
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The spinner is sized in em (via --spinner-size), so it follows the parent's font-size. */
export const ScalesWithParent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Spinner, Typography },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3);">
        <Typography v-for="size in ['0.75rem', '1rem', '1.5rem', '2.25rem']" :key="size"
           :style="{ fontSize: size, display: 'flex', alignItems: 'center', gap: '0.5em' }">
          <Spinner /> Loading at {{ size }}
        </Typography>
      </div>
    `,
  }),
}

/** The ring inherits currentColor from its parent, like Icon. */
export const InheritsColor: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Spinner },
    template: `
      <div style="display: flex; gap: var(--spacing-4); font-size: 2rem;">
        <span style="color: var(--color-primary)"><Spinner /></span>
        <span style="color: var(--color-success)"><Spinner /></span>
        <span style="color: var(--color-danger)"><Spinner /></span>
        <span style="color: var(--text)"><Spinner /></span>
      </div>
    `,
  }),
}

/** A standalone spinner announcing itself to screen readers. */
export const WithLabel: Story = {
  args: { label: 'Loading results' },
}
