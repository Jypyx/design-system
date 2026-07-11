import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Tooltip from './Tooltip.vue'
import Button from '../button/Button.vue'
import Input from '../input/Input.vue'

const placements = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'right',
] as const

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    placement: {
      control: 'select',
      options: placements,
      description: 'Preferred side; flips automatically when it would overflow the viewport',
    },
    openDelay: { control: 'number', description: 'Hover delay in ms (focus shows immediately)' },
    closeDelay: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: {
    content: 'Tooltips label icon-only actions and add context.',
    placement: 'top',
    openDelay: 300,
    closeDelay: 100,
    disabled: false,
  },
  render: (args) => ({
    components: { Tooltip, Button },
    setup: () => ({ args }),
    template: `
      <Tooltip v-bind="args">
        <Button>Hover me</Button>
      </Tooltip>
    `,
  }),
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Placements: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tooltip, Button },
    setup: () => ({ placements }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, max-content); gap: var(--spacing-6); padding: var(--spacing-10);">
        <Tooltip v-for="placement in placements" :key="placement" :placement="placement" :open-delay="0" content="Anchored with position-area">
          <Button variant="outlined">{{ placement }}</Button>
        </Tooltip>
      </div>
    `,
  }),
}

/** The tooltip wraps any trigger: buttons, icons, form fields, plain text… */
export const OnAnything: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tooltip, Button, Input },
    template: `
      <div style="display: flex; gap: var(--spacing-6); align-items: center;">
        <Tooltip content="Delete forever" placement="bottom">
          <Button icon="delete" color="danger" variant="tonal" label="Delete" />
        </Tooltip>
        <Tooltip content="Saved 2 minutes ago">
          <Button variant="text" icon-start="cloud_done">Saved</Button>
        </Tooltip>
        <Tooltip content="8 characters minimum" placement="right">
          <Input label="Password" type="password" style="width: 220px" />
        </Tooltip>
        <Tooltip content="Coordinated Universal Time">
          <abbr tabindex="0" style="font-family: var(--font-sans); color: var(--text);">UTC</abbr>
        </Tooltip>
      </div>
    `,
  }),
}

/** Rich markup goes through the #content slot instead of the content prop. */
export const RichContent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tooltip, Button },
    template: `
      <Tooltip placement="bottom" :open-delay="0">
        <Button color="primary" icon-start="keyboard_command_key">Shortcuts</Button>
        <template #content>
          <strong>Search everywhere</strong><br />
          Press <kbd>Ctrl</kbd> + <kbd>K</kbd> from any page
        </template>
      </Tooltip>
    `,
  }),
}

/**
 * Triggers pinned against the viewport edges: the preferred placement
 * would overflow, so the position-try fallbacks flip the tooltip to the
 * opposite side. Hover each corner to see it.
 */
export const EdgeFlipping: Story = {
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
  render: () => ({
    components: { Tooltip, Button },
    template: `
      <div style="position: relative; height: 70vh; margin: var(--spacing-2);">
        <div style="position: absolute; top: 0; left: 0;">
          <Tooltip content="placement is 'top' but I flipped below" placement="top" :open-delay="0">
            <Button variant="outlined">top-left corner</Button>
          </Tooltip>
        </div>
        <div style="position: absolute; top: 0; right: 0;">
          <Tooltip content="placement is 'right' but I flipped to the left" placement="right" :open-delay="0">
            <Button variant="outlined">top-right corner</Button>
          </Tooltip>
        </div>
        <div style="position: absolute; bottom: 0; left: 0;">
          <Tooltip content="placement is 'left' but I flipped to the right" placement="left" :open-delay="0">
            <Button variant="outlined">bottom-left corner</Button>
          </Tooltip>
        </div>
        <div style="position: absolute; bottom: 0; right: 0;">
          <Tooltip content="placement is 'bottom' but I flipped above" placement="bottom" :open-delay="0">
            <Button variant="outlined">bottom-right corner</Button>
          </Tooltip>
        </div>
      </div>
    `,
  }),
}
