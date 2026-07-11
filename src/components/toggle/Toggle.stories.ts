import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Toggle from './Toggle.vue'

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean', description: 'v-model — the pressed state' },
    variant: {
      control: 'select',
      options: ['tonal', 'flat'],
      description: 'Pressed look: tinted (tonal) or solid fill (flat); rest is transparent',
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    color: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'danger', 'warning'],
    },
    disabled: { control: 'boolean' },
    icon: {
      control: 'text',
      description: 'Icon-only toggle (square); pass label for the accessible name',
    },
    label: { control: 'text', description: 'Accessible name — required for icon-only usage' },
    iconStart: { control: 'text' },
    iconEnd: { control: 'text' },
    value: { control: false, description: 'Identity within a ToggleGroup' },
  },
  args: {
    variant: 'tonal',
    size: 'sm',
    color: 'neutral',
    disabled: false,
  },
  render: (args) => ({
    components: { Toggle },
    setup: () => ({ args, pressed: ref(false) }),
    template: '<Toggle v-bind="args" v-model="pressed" icon-start="bookmark">Bookmark</Toggle>',
  }),
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Both variants are transparent at rest; the `variant` prop only picks the
 * pressed look — `tonal` fills with a tint, `flat` with the solid accent.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Toggle variant="tonal" :model-value="true">Tonal</Toggle>
        <Toggle variant="flat" :model-value="true">Flat</Toggle>
      </div>
    `,
  }),
}

export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <div style="display: flex; gap: var(--spacing-2);">
          <Toggle v-for="c in ['neutral', 'primary', 'success', 'danger', 'warning']" :key="c"
            :color="c" variant="tonal" :model-value="true">{{ c }}</Toggle>
        </div>
        <div style="display: flex; gap: var(--spacing-2);">
          <Toggle v-for="c in ['neutral', 'primary', 'success', 'danger', 'warning']" :key="c"
            :color="c" variant="flat" :model-value="true">{{ c }}</Toggle>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Toggle size="xs" :model-value="true">Extra small</Toggle>
        <Toggle size="sm" :model-value="true">Small</Toggle>
        <Toggle size="md" :model-value="true">Medium</Toggle>
        <Toggle size="lg" :model-value="true">Large</Toggle>
      </div>
    `,
  }),
}

/**
 * With the `icon` prop (and no text) the toggle becomes square, like an
 * icon-only Button. `label` is required: it is the accessible name.
 */
export const IconOnly: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    setup: () => ({ starred: ref(true), muted: ref(false) }),
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Toggle v-model="starred" icon="star" label="Star" />
        <Toggle v-model="muted" icon="notifications_off" label="Mute" variant="flat" color="danger" />
      </div>
    `,
  }),
}

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    setup: () => ({ pressed: ref(true) }),
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Toggle v-model="pressed" icon-start="visibility">Preview</Toggle>
        <Toggle v-model="pressed" icon-end="expand_more">Details</Toggle>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Toggle disabled>Off</Toggle>
        <Toggle disabled variant="tonal" :model-value="true">On, tonal</Toggle>
        <Toggle disabled variant="flat" :model-value="true">On, flat</Toggle>
      </div>
    `,
  }),
}

/** v-model holds the pressed boolean. */
export const VModel: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    setup: () => ({ pressed: ref(false) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <Toggle v-model="pressed" icon-start="bookmark">Bookmark</Toggle>
        <p style="margin: 0; font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted);">
          pressed: {{ pressed }}
        </p>
      </div>
    `,
  }),
}
