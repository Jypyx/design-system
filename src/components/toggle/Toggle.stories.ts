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
      options: ['tonal', 'flat', 'outlined-tonal', 'outlined-flat', 'tonal-flat'],
      description: 'Off → on pair: single names rest transparent; compound names spell both states',
    },
    fillIcon: {
      control: 'boolean',
      description: 'Fills the Material Symbols icons while pressed',
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
    fillIcon: false,
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
 * The `variant` prop names the off → on pair. `tonal` and `flat` are
 * transparent at rest and only name the pressed look; `outlined-tonal`,
 * `outlined-flat` and `tonal-flat` spell both states.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    setup: () => ({
      variants: ['tonal', 'flat', 'outlined-tonal', 'outlined-flat', 'tonal-flat'],
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, max-content); gap: var(--spacing-3); align-items: center;">
        <template v-for="v in variants" :key="v">
          <span style="font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted);">{{ v }}</span>
          <Toggle :variant="v">Off</Toggle>
          <Toggle :variant="v" :model-value="true">On</Toggle>
        </template>
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
 * `fill-icon` swaps the Material Symbols to their filled shape while
 * pressed (animated FILL variation axis).
 */
export const IconOnly: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toggle },
    setup: () => ({ starred: ref(true), liked: ref(true), muted: ref(false) }),
    template: `
      <div style="display: flex; gap: var(--spacing-2); align-items: center;">
        <Toggle v-model="starred" icon="star" label="Star" fill-icon />
        <Toggle v-model="liked" icon="favorite" label="Like" fill-icon variant="outlined-tonal" color="danger" />
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
