import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Radio from './Radio.vue'

const meta = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'v-model — the radio is checked when it equals value',
    },
    value: { control: 'text' },
    name: { control: 'text', description: 'Native name attribute (form grouping)' },
    label: { control: 'text' },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Side of the button the label is rendered on',
    },
    spread: {
      control: 'boolean',
      description: 'Pushes label and button to opposite edges (space-between)',
    },
    disabled: { control: 'boolean' },
  },
  args: {
    value: 'option',
    label: 'Option',
    labelPosition: 'right',
    spread: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Radio },
    setup: () => ({ args }),
    template: '<Radio v-bind="args" />',
  }),
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Radios sharing the same v-model form a group. */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Radio },
    setup: () => ({ plan: ref('pro') }),
    template: `
      <fieldset style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start; margin: 0; padding: 0; border: none;">
        <legend style="font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted); padding: 0; margin-bottom: var(--spacing-3);">
          Billing plan — selected: {{ plan }}
        </legend>
        <Radio v-model="plan" value="free" name="plan" label="Free" />
        <Radio v-model="plan" value="pro" name="plan" label="Pro" />
        <Radio v-model="plan" value="enterprise" name="plan" label="Enterprise" />
      </fieldset>
    `,
  }),
}

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Radio },
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, max-content); gap: var(--spacing-4);">
        <Radio value="a" label="Unchecked" />
        <Radio value="b" model-value="b" label="Checked" />
        <Radio value="c" label="Unchecked" disabled />
        <Radio value="d" model-value="d" label="Checked" disabled />
      </div>
    `,
  }),
}

export const LabelPosition: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Radio },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <Radio value="right" label="Label on the right (default)" label-position="right" />
        <Radio value="left" label="Label on the left" label-position="left" />
      </div>
    `,
  }),
}

/** With spread, the component fills its container and pushes label and button apart. */
export const Spread: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Radio },
    setup: () => ({ shipping: ref('standard') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); width: 280px; padding: var(--spacing-4); border: 1px solid var(--border); border-radius: var(--radius-lg);">
        <Radio v-model="shipping" value="standard" label="Standard delivery" spread label-position="left" />
        <Radio v-model="shipping" value="express" label="Express delivery" spread label-position="left" />
        <Radio v-model="shipping" value="pickup" label="Store pickup" spread label-position="left" disabled />
      </div>
    `,
  }),
}
