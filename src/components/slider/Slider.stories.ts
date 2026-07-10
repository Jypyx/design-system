import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Slider from './Slider.vue'
import Icon from '../icon/Icon.vue'

const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Accessible name — always provide one' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    showInputs: { control: 'boolean', description: 'Number inputs at the ends of the track' },
    ticks: { control: 'boolean', description: 'Tick mark at every step' },
    tickLabels: { control: 'boolean', description: 'Value label under every tick' },
    tooltip: { control: 'boolean', description: 'Tooltip on hover / focus / drag' },
    options: { control: 'object', description: 'Discrete values; replaces min / max / step' },
  },
  args: {
    label: 'Volume',
    min: 0,
    max: 100,
    step: 1,
    orientation: 'horizontal',
    disabled: false,
    showInputs: false,
    ticks: false,
    tickLabels: false,
    tooltip: false,
  },
  render: (args) => ({
    components: { Slider },
    setup() {
      const value = ref(args.modelValue ?? 40)
      return { args, value }
    },
    template: '<Slider v-bind="args" v-model="value" style="min-width: 320px" />',
  }),
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** An array modelValue enables the double-thumb range mode; thumbs never cross. */
export const Range: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ value: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-8); min-width: 360px;">
        <Slider v-model="value" label="Price range" tooltip />
        <Slider v-model="value" label="Price range (inputs)" show-inputs />
      </div>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({
      single: ref(40),
      range: ref<[number, number]>([20, 60]),
      inputs: ref<[number, number]>([10, 80]),
      level: ref('Medium'),
    }),
    template: `
      <div style="display: flex; gap: var(--spacing-16); align-items: flex-start;">
        <Slider v-model="single" label="Volume" orientation="vertical" tooltip />
        <Slider v-model="range" label="Range" orientation="vertical" ticks :step="10" />
        <Slider v-model="inputs" label="With inputs" orientation="vertical" show-inputs />
        <Slider
          v-model="level"
          label="Level"
          orientation="vertical"
          :options="['Low', 'Medium', 'High']"
          ticks
          tick-labels
        />
      </div>
    `,
  }),
}

/** Number inputs at the end of the track — start and end in range mode. */
export const WithInputs: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ single: ref(35), range: ref<[number, number]>([200, 750]) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-8); min-width: 400px;">
        <Slider v-model="single" label="Opacity" show-inputs />
        <Slider v-model="range" label="Budget" :min="0" :max="1000" :step="50" show-inputs />
      </div>
    `,
  }),
}

/** step drives the keyboard / drag increment and the tick positions. */
export const StepsAndTicks: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ a: ref(40), b: ref(0.4), c: ref<[number, number]>([25, 75]) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-10); min-width: 400px;">
        <Slider v-model="a" label="Step 10" :step="10" ticks />
        <Slider v-model="b" label="Step 0.1" :min="0" :max="1" :step="0.1" ticks tick-labels />
        <Slider v-model="c" label="Quarters" :step="25" ticks tick-labels />
      </div>
    `,
  }),
}

/** With options, the slider snaps between discrete string (or number) values. */
export const StringOptions: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({
      size: ref('M'),
      sizes: ref<[string, string]>(['S', 'XL']),
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-12); min-width: 400px;">
        <Slider v-model="size" label="Size" :options="options" ticks tick-labels tooltip />
        <Slider v-model="sizes" label="Size range" :options="options" ticks tick-labels />
      </div>
    `,
  }),
}

/**
 * The tooltip shows the value by default; the `tooltip` slot receives
 * `{ value, thumb }` for rich content such as icons.
 */
export const WithTooltip: Story = {
  render: () => ({
    components: { Slider, Icon },
    setup: () => ({ volume: ref(40), brightness: ref(70) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-10); min-width: 360px; padding-top: var(--spacing-8);">
        <Slider v-model="volume" label="Volume" tooltip />
        <Slider v-model="brightness" label="Brightness" tooltip>
          <template #tooltip="{ value }">
            <Icon name="light_mode" />
            {{ value }}%
          </template>
        </Slider>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ single: ref(40), range: ref<[number, number]>([20, 60]) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-8); min-width: 360px;">
        <Slider v-model="single" label="Volume" disabled />
        <Slider v-model="range" label="Range" disabled show-inputs ticks :step="10" />
      </div>
    `,
  }),
}
