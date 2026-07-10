import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onUnmounted, ref } from 'vue'
import ProgressLinear from './ProgressLinear.vue'

const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const

const meta = {
  title: 'Components/ProgressLinear',
  component: ProgressLinear,
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
    height: {
      control: 'number',
      description: 'Bar thickness in px (default 8px, 18px with showLabel)',
    },
    square: { control: 'boolean' },
    showLabel: {
      control: 'boolean',
      description: 'Shows the progress inside the fill; override the text via the default slot',
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
    square: false,
    showLabel: false,
    indeterminate: false,
    label: 'Progress',
  },
  render: (args) => ({
    components: { ProgressLinear },
    setup: () => ({ args }),
    template: '<div style="width: 320px"><ProgressLinear v-bind="args" /></div>',
  }),
} satisfies Meta<typeof ProgressLinear>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The 5 semantic colors adapt to light / dark via the semantic token layer. */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressLinear },
    setup: () => ({ colors }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); width: 320px">
        <ProgressLinear
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
 * Any CSS color works as the fill; the track tint is derived from it with
 * color-mix(). The label color adapts via contrast-color() — browsers
 * without support fall back to `--progress-on-accent`, which you can
 * override alongside a custom color.
 */
export const CustomColors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); width: 320px">
        <ProgressLinear :value="60" color="#8b5cf6" show-label label="Violet" />
        <ProgressLinear :value="60" color="oklch(0.7 0.15 180)" show-label label="Teal" />
        <ProgressLinear :value="60" color="hotpink" show-label label="Hot pink" />
      </div>
    `,
  }),
}

/** The height prop takes any px value; it also overrides the 18px label bump. */
export const Heights: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); width: 320px">
        <ProgressLinear :value="60" :height="4" label="4px" />
        <ProgressLinear :value="60" label="8px (default)" />
        <ProgressLinear :value="60" :height="16" label="16px" />
        <ProgressLinear :value="60" :height="24" label="24px" />
      </div>
    `,
  }),
}

/**
 * The label is centered in the bar and flips color where the fill passes
 * under it. The default slot replaces the "42%" text; pair it with
 * value-text so screen readers hear the same thing.
 */
export const WithLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); width: 320px">
        <ProgressLinear :value="5" show-label label="Low value" />
        <ProgressLinear :value="42" show-label label="Progress" />
        <ProgressLinear :value="100" show-label color="success" label="Done" />
        <ProgressLinear :value="3" :max="10" show-label value-text="3 étapes sur 10" label="Étapes">
          3/10 étapes
        </ProgressLinear>
      </div>
    `,
  }),
}

export const Square: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); width: 320px">
        <ProgressLinear :value="60" show-label label="Pill (default)" />
        <ProgressLinear :value="60" show-label square label="Square" />
      </div>
    `,
  }),
}

/**
 * For unknown durations: a continuous sliding bar, no aria-valuenow.
 * With prefers-reduced-motion the slide is replaced by an opacity pulse.
 */
export const Indeterminate: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressLinear },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); width: 320px">
        <ProgressLinear indeterminate label="Loading" />
        <ProgressLinear indeterminate color="success" label="Loading" />
        <ProgressLinear indeterminate color="#8b5cf6" :height="12" label="Loading" />
      </div>
    `,
  }),
}

/** The fill width transitions whenever the value changes. */
export const Animated: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ProgressLinear },
    setup() {
      const value = ref(20)
      const timer = setInterval(() => {
        value.value = value.value >= 100 ? 0 : Math.min(100, value.value + 10 + Math.random() * 25)
      }, 1500)
      onUnmounted(() => clearInterval(timer))
      return { value }
    },
    template: `
      <div style="width: 320px">
        <ProgressLinear :value="value" show-label label="Uploading" />
      </div>
    `,
  }),
}
