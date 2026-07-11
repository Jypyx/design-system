import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import InputOTP from './InputOTP.vue'

const meta = {
  title: 'Components/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text', description: 'v-model — the code as a string' },
    length: { control: { type: 'number', min: 1, max: 12 }, description: 'Number of characters (ignored with pattern)' },
    format: {
      control: 'select',
      options: ['numeric', 'alpha', 'alphanumeric'],
      description: 'Characters the code accepts',
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    separator: {
      control: 'text',
      description: "Material icon name rendered between fields (e.g. 'remove')",
    },
    pattern: {
      control: 'text',
      description: "Layout template: '#' = slot, anything else = literal text",
    },
    attached: { control: 'boolean', description: 'Glues adjacent fields together' },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text', description: 'Accessible name of the group' },
    fieldLabel: { control: 'text', description: 'Accessible name of one field' },
  },
  args: {
    length: 6,
    format: 'numeric',
    size: 'sm',
    attached: false,
    isLoading: false,
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    components: { InputOTP },
    setup: () => ({ args }),
    template: '<InputOTP v-bind="args" />',
  }),
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Formats: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <InputOTP :length="6" format="numeric" model-value="042786" />
        <InputOTP :length="6" format="alpha" model-value="wYzKpQ" />
        <InputOTP :length="6" format="alphanumeric" model-value="a1B2c3" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <InputOTP size="xs" :length="4" model-value="1234" />
        <InputOTP size="sm" :length="4" model-value="1234" />
        <InputOTP size="md" :length="4" model-value="1234" />
        <InputOTP size="lg" :length="4" model-value="1234" />
      </div>
    `,
  }),
}

/** An icon (Material Symbols name) rendered between every field. */
export const WithSeparator: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <InputOTP :length="4" separator="remove" model-value="1234" />
        <InputOTP :length="3" separator="fiber_manual_record" model-value="589" />
      </div>
    `,
  }),
}

/** Attached fields share their borders, like a ButtonGroup. */
export const Attached: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <InputOTP :length="6" attached model-value="042786" />
        <InputOTP :length="6" attached size="md" />
      </div>
    `,
  }),
}

/**
 * A pattern describes the layout: '#' is an input slot, any other run of
 * characters is rendered as literal text. Combine with attached to glue
 * each group of slots.
 */
export const Pattern: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <InputOTP pattern="GT - ###" format="numeric" model-value="589" />
        <InputOTP pattern="##.###.###" format="numeric" model-value="55555867" />
        <InputOTP pattern="### - ###" format="alphanumeric" attached />
      </div>
    `,
  }),
}

/** While loading, the fields turn readonly and a spinner is appended. */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    template: `<InputOTP :length="6" is-loading model-value="042786" />`,
  }),
}

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <InputOTP :length="4" model-value="12" />
        <InputOTP :length="4" model-value="1234" invalid />
        <InputOTP :length="4" model-value="1234" disabled />
      </div>
    `,
  }),
}

/** v-model holds the typed characters; complete fires when every slot is filled. */
export const VModelAndComplete: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { InputOTP },
    setup: () => {
      const code = ref('')
      const completed = ref('')
      return { code, completed }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <InputOTP v-model="code" :length="4" @complete="completed = $event" />
        <p style="margin: 0; font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted);">
          value: “{{ code }}” — complete: “{{ completed }}”
        </p>
      </div>
    `,
  }),
}
