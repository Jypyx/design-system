import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import OTPInput from './OTPInput.vue'

const meta = {
  title: 'Components/OTPInput',
  component: OTPInput,
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
    components: { OTPInput },
    setup: () => ({ args }),
    template: '<OTPInput v-bind="args" />',
  }),
} satisfies Meta<typeof OTPInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Formats: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { OTPInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <OTPInput :length="6" format="numeric" model-value="042786" />
        <OTPInput :length="6" format="alpha" model-value="wYzKpQ" />
        <OTPInput :length="6" format="alphanumeric" model-value="a1B2c3" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { OTPInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <OTPInput size="xs" :length="4" model-value="1234" />
        <OTPInput size="sm" :length="4" model-value="1234" />
        <OTPInput size="md" :length="4" model-value="1234" />
        <OTPInput size="lg" :length="4" model-value="1234" />
      </div>
    `,
  }),
}

/** An icon (Material Symbols name) rendered between every field. */
export const WithSeparator: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { OTPInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <OTPInput :length="4" separator="remove" model-value="1234" />
        <OTPInput :length="3" separator="fiber_manual_record" model-value="589" />
      </div>
    `,
  }),
}

/** Attached fields share their borders, like a ButtonGroup. */
export const Attached: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { OTPInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <OTPInput :length="6" attached model-value="042786" />
        <OTPInput :length="6" attached size="md" />
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
    components: { OTPInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <OTPInput pattern="GT - ###" format="numeric" model-value="589" />
        <OTPInput pattern="##.###.###" format="numeric" model-value="55555867" />
        <OTPInput pattern="### - ###" format="alphanumeric" attached />
      </div>
    `,
  }),
}

/** While loading, the fields turn readonly and a spinner is appended. */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { OTPInput },
    template: `<OTPInput :length="6" is-loading model-value="042786" />`,
  }),
}

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { OTPInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <OTPInput :length="4" model-value="12" />
        <OTPInput :length="4" model-value="1234" invalid />
        <OTPInput :length="4" model-value="1234" disabled />
      </div>
    `,
  }),
}

/** v-model holds the typed characters; complete fires when every slot is filled. */
export const VModelAndComplete: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { OTPInput },
    setup: () => {
      const code = ref('')
      const completed = ref('')
      return { code, completed }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <OTPInput v-model="code" :length="4" @complete="completed = $event" />
        <p style="margin: 0; font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted);">
          value: “{{ code }}” — complete: “{{ completed }}”
        </p>
      </div>
    `,
  }),
}
