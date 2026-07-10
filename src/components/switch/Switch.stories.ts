import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Switch from './Switch.vue'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean', description: 'v-model' },
    label: { control: 'text' },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Side of the track the label is rendered on',
    },
    spread: {
      control: 'boolean',
      description: 'Pushes label and track to opposite edges (space-between)',
    },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Enable notifications',
    labelPosition: 'right',
    spread: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Switch },
    setup: () => ({ args }),
    template: '<Switch v-bind="args" />',
  }),
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Off / on, enabled and disabled. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Switch },
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, max-content); gap: var(--spacing-4);">
        <Switch label="Off" />
        <Switch label="On" :model-value="true" />
        <Switch label="Off" disabled />
        <Switch label="On" :model-value="true" disabled />
      </div>
    `,
  }),
}

export const LabelPosition: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Switch },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <Switch label="Label on the right (default)" label-position="right" />
        <Switch label="Label on the left" label-position="left" />
      </div>
    `,
  }),
}

/** With spread, the component fills its container and pushes label and track apart. */
export const Spread: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Switch },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); width: 280px; padding: var(--spacing-4); border: 1px solid var(--border); border-radius: var(--radius-lg);">
        <Switch label="Marketing emails" spread label-position="left" />
        <Switch label="Product updates" spread label-position="left" :model-value="true" />
        <Switch label="Security alerts" spread label-position="left" disabled />
      </div>
    `,
  }),
}
