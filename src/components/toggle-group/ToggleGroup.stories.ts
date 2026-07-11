import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ToggleGroup from './ToggleGroup.vue'
import Toggle from '../toggle/Toggle.vue'

const meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: false,
      description: 'v-model — the pressed value (or null) in single mode, an array in multiple mode',
    },
    multiple: { control: 'boolean' },
    attached: { control: 'boolean' },
    label: { control: 'text', description: 'Accessible name of the group' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    color: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'danger', 'warning'],
    },
    variant: {
      control: 'select',
      options: ['tonal', 'flat', 'outlined-tonal', 'outlined-flat', 'tonal-flat'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    multiple: false,
    attached: false,
  },
  render: (args) => ({
    components: { ToggleGroup, Toggle },
    setup: () => ({ args, alignment: ref('left') }),
    template: `
      <ToggleGroup v-bind="args" v-model="alignment" label="Text alignment">
        <Toggle value="left" icon="format_align_left" label="Align left" />
        <Toggle value="center" icon="format_align_center" label="Align center" />
        <Toggle value="right" icon="format_align_right" label="Align right" />
      </ToggleGroup>
    `,
  }),
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Single mode (default): one pressed toggle at most. Pressing the active
 * toggle releases it — the v-model goes back to null.
 */
export const Single: Story = {}

/** `multiple` lets several toggles stay pressed; the v-model is an array. */
export const Multiple: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ToggleGroup, Toggle },
    setup: () => ({ styles: ref(['bold']) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <ToggleGroup v-model="styles" multiple label="Text style">
          <Toggle value="bold" icon="format_bold" label="Bold" />
          <Toggle value="italic" icon="format_italic" label="Italic" />
          <Toggle value="underline" icon="format_underlined" label="Underline" />
        </ToggleGroup>
        <p style="margin: 0; font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted);">
          value: {{ styles }}
        </p>
      </div>
    `,
  }),
}

const variants = ['tonal', 'flat', 'outlined-tonal', 'outlined-flat', 'tonal-flat'] as const

/**
 * The `variant` set on the group names the off → on pair of every toggle:
 * `tonal` and `flat` rest transparent, `outlined-*` rest outlined and
 * `tonal-flat` rests tonal.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ToggleGroup, Toggle },
    setup: () => ({
      variants,
      selection: ref(Object.fromEntries(variants.map((v) => [v, 'center']))),
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, max-content); gap: var(--spacing-3); align-items: center;">
        <template v-for="v in variants" :key="v">
          <span style="font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted);">{{ v }}</span>
          <ToggleGroup v-model="selection[v]" :variant="v" label="Text alignment">
            <Toggle value="left" icon="format_align_left" label="Align left" />
            <Toggle value="center" icon="format_align_center" label="Align center" />
            <Toggle value="right" icon="format_align_right" label="Align right" />
          </ToggleGroup>
        </template>
      </div>
    `,
  }),
}

/**
 * `fill-icon` on the toggles: the pressed Material Symbols swap to their
 * filled shape (animated FILL axis), released ones revert to the outline.
 */
export const FilledIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ToggleGroup, Toggle },
    setup: () => ({ reactions: ref(['favorite', 'star']) }),
    template: `
      <ToggleGroup v-model="reactions" multiple color="primary" label="Reactions">
        <Toggle value="favorite" icon="favorite" label="Favorite" fill-icon />
        <Toggle value="bookmark" icon="bookmark" label="Bookmark" fill-icon />
        <Toggle value="star" icon="star" label="Star" fill-icon />
        <Toggle value="notifications" icon="notifications" label="Notifications" fill-icon />
      </ToggleGroup>
    `,
  }),
}

/**
 * `attached` glues the toggles: shared 1px borders, inner corners squared —
 * a segmented control. Works in single and multiple mode alike.
 */
export const Attached: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ToggleGroup, Toggle },
    setup: () => ({ period: ref('month'), variant: ref('flat') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <ToggleGroup v-model="period" attached label="Billing period">
          <Toggle value="day">Day</Toggle>
          <Toggle value="week">Week</Toggle>
          <Toggle value="month">Month</Toggle>
          <Toggle value="year">Year</Toggle>
        </ToggleGroup>
        <ToggleGroup v-model="period" attached variant="flat" color="primary" label="Billing period">
          <Toggle value="day">Day</Toggle>
          <Toggle value="week">Week</Toggle>
          <Toggle value="month">Month</Toggle>
          <Toggle value="year">Year</Toggle>
        </ToggleGroup>
      </div>
    `,
  }),
}

/**
 * `size`, `color` and `variant` set on the group are inherited by every
 * child Toggle; a toggle's own prop still wins (the last one here).
 */
export const InheritedProps: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ToggleGroup, Toggle },
    setup: () => ({ filters: ref(['assigned']) }),
    template: `
      <ToggleGroup v-model="filters" multiple size="xs" color="primary" variant="flat" label="Filters">
        <Toggle value="assigned">Assigned to me</Toggle>
        <Toggle value="mentions">Mentions</Toggle>
        <Toggle value="urgent" color="danger">Urgent</Toggle>
      </ToggleGroup>
    `,
  }),
}

/** `disabled` on the group disables every toggle that does not override it. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ToggleGroup, Toggle },
    setup: () => ({ alignment: ref('left') }),
    template: `
      <ToggleGroup v-model="alignment" disabled label="Text alignment">
        <Toggle value="left" icon="format_align_left" label="Align left" />
        <Toggle value="center" icon="format_align_center" label="Align center" />
        <Toggle value="right" icon="format_align_right" label="Align right" />
      </ToggleGroup>
    `,
  }),
}
