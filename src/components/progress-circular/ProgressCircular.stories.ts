import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onUnmounted, ref } from 'vue'
import ProgressCircular from './ProgressCircular.vue'
import Icon from '../icon/Icon.vue'

const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const

const meta = {
  title: 'Components/ProgressCircular',
  component: ProgressCircular,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Current progress, from 0 to max',
    },
    max: { control: 'number', description: 'Upper bound of value' },
    color: {
      control: 'select',
      options: colors,
      description: 'One of the 5 semantic colors, or any CSS color string (hex, oklch()…)',
    },
    size: { control: 'number', description: 'Outer diameter in px' },
    thickness: { control: 'number', description: 'Ring thickness in px' },
    square: { control: 'boolean', description: 'Squared arc ends instead of rounded caps' },
    showLabel: {
      control: 'boolean',
      description:
        'Shows the progress in the donut hole; the default slot replaces it and renders even without showLabel',
    },
    indeterminate: { control: 'boolean' },
    label: { control: 'text', description: 'Accessible name (aria-label)' },
    valueText: {
      control: 'text',
      description: 'Human-readable value for screen readers (aria-valuetext)',
    },
  },
  args: {
    value: 42,
    max: 100,
    color: 'primary',
    size: 48,
    thickness: 4,
    square: false,
    showLabel: false,
    indeterminate: false,
    label: 'Progress',
  },
  render: (args) => ({
    components: { ProgressCircular },
    setup: () => ({ args }),
    template: '<ProgressCircular v-bind="args" />',
  }),
} satisfies Meta<typeof ProgressCircular>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The 5 semantic colors adapt to light / dark via the semantic token layer. */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressCircular },
    setup: () => ({ colors }),
    template: `
      <div style="display: flex; align-items: center; gap: var(--spacing-4)">
        <ProgressCircular
          v-for="color in colors"
          :key="color"
          :value="60"
          :color="color"
          :label="color"
        />
      </div>
    `,
  }),
}

/**
 * Any CSS color works as the ring; the track tint is derived from it
 * with color-mix().
 */
export const CustomColors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressCircular },
    template: `
      <div style="display: flex; align-items: center; gap: var(--spacing-4)">
        <ProgressCircular :value="60" color="#8b5cf6" label="Violet" />
        <ProgressCircular :value="60" color="oklch(0.7 0.15 180)" label="Teal" />
        <ProgressCircular :value="60" color="hotpink" label="Hot pink" />
      </div>
    `,
  }),
}

/** size sets the outer diameter, thickness the ring width — both in px. */
export const SizesAndThickness: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressCircular },
    template: `
      <div style="display: flex; align-items: center; gap: var(--spacing-4)">
        <ProgressCircular :value="60" :size="24" :thickness="2" label="24px" />
        <ProgressCircular :value="60" label="48px (default)" />
        <ProgressCircular :value="60" :size="72" :thickness="8" label="72px" />
        <ProgressCircular :value="60" :size="96" :thickness="12" label="96px" />
      </div>
    `,
  }),
}

/**
 * The label sits in the donut hole and scales with the diameter. The
 * default slot replaces the "42%" text — and renders even without
 * show-label, so anything can live in the hole (an icon, a step count…);
 * pair custom content with value-text so screen readers hear the same thing.
 */
export const WithLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressCircular, Icon },
    template: `
      <div style="display: flex; align-items: center; gap: var(--spacing-4)">
        <ProgressCircular :value="42" :size="64" show-label label="Progress" />
        <ProgressCircular :value="100" :size="64" show-label color="success" label="Done" />
        <ProgressCircular :value="3" :max="10" :size="64" value-text="3 étapes sur 10" label="Étapes">
          3/10
        </ProgressCircular>
        <ProgressCircular :value="80" :size="64" color="success" value-text="Téléversement presque terminé" label="Téléversement">
          <Icon name="upload" />
        </ProgressCircular>
      </div>
    `,
  }),
}

export const Square: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressCircular },
    template: `
      <div style="display: flex; align-items: center; gap: var(--spacing-4)">
        <ProgressCircular :value="60" :size="64" :thickness="8" label="Rounded caps (default)" />
        <ProgressCircular :value="60" :size="64" :thickness="8" square label="Square caps" />
      </div>
    `,
  }),
}

/**
 * For unknown durations: a spinning 25% arc, no aria-valuenow.
 * With prefers-reduced-motion the spin is replaced by a full ring
 * pulsing its opacity.
 */
export const Indeterminate: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressCircular },
    template: `
      <div style="display: flex; align-items: center; gap: var(--spacing-4)">
        <ProgressCircular indeterminate label="Loading" />
        <ProgressCircular indeterminate color="success" label="Loading" />
        <ProgressCircular indeterminate color="#8b5cf6" :size="64" :thickness="6" label="Loading" />
      </div>
    `,
  }),
}

/** The arc transitions whenever the value changes. */
export const Animated: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressCircular },
    setup() {
      const value = ref(20)
      const timer = setInterval(() => {
        value.value = value.value >= 100 ? 0 : Math.min(100, value.value + 10 + Math.random() * 25)
      }, 1500)
      onUnmounted(() => clearInterval(timer))
      return { value }
    },
    template: '<ProgressCircular :value="value" :size="64" show-label label="Uploading" />',
  }),
}
