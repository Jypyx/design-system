import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import Checkbox from './Checkbox.vue'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean', description: 'v-model' },
    label: { control: 'text' },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Side of the box the label is rendered on',
    },
    spread: {
      control: 'boolean',
      description: 'Pushes label and box to opposite edges (space-between)',
    },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    label: 'Enable notifications',
    labelPosition: 'right',
    spread: false,
    disabled: false,
    indeterminate: false,
  },
  render: (args) => ({
    components: { Checkbox },
    setup: () => ({ args }),
    template: '<Checkbox v-bind="args" />',
  }),
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Unchecked / checked / indeterminate, enabled and disabled. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Checkbox },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, max-content); gap: var(--spacing-4);">
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" :model-value="true" />
        <Checkbox label="Indeterminate" indeterminate />
        <Checkbox label="Unchecked" disabled />
        <Checkbox label="Checked" :model-value="true" disabled />
        <Checkbox label="Indeterminate" indeterminate disabled />
      </div>
    `,
  }),
}

export const LabelPosition: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Checkbox },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <Checkbox label="Label on the right (default)" label-position="right" />
        <Checkbox label="Label on the left" label-position="left" />
      </div>
    `,
  }),
}

/** With spread, the component fills its container and pushes label and box apart. */
export const Spread: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Checkbox },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); width: 280px; padding: var(--spacing-4); border: 1px solid var(--border); border-radius: var(--radius-lg);">
        <Checkbox label="Marketing emails" spread label-position="left" />
        <Checkbox label="Product updates" spread label-position="left" :model-value="true" />
        <Checkbox label="Security alerts" spread label-position="left" disabled />
      </div>
    `,
  }),
}

/** The parent derives checked / indeterminate from its children. */
export const IndeterminateSelection: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Checkbox },
    setup: () => {
      const items = [ref(true), ref(false), ref(true)]
      const allChecked = computed({
        get: () => items.every((item) => item.value),
        set: (value: boolean) => items.forEach((item) => (item.value = value)),
      })
      const someChecked = computed(
        () => items.some((item) => item.value) && !allChecked.value,
      )
      return { items, allChecked, someChecked }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <Checkbox v-model="allChecked" :indeterminate="someChecked" label="Select all" />
        <div style="display: flex; flex-direction: column; gap: var(--spacing-2); padding-inline-start: var(--spacing-6);">
          <Checkbox v-model="items[0].value" label="Item one" />
          <Checkbox v-model="items[1].value" label="Item two" />
          <Checkbox v-model="items[2].value" label="Item three" />
        </div>
      </div>
    `,
  }),
}
