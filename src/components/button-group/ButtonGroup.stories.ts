import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ButtonGroup from './ButtonGroup.vue'
import Button from '../button/Button.vue'
import ButtonIcon from '../button-icon/ButtonIcon.vue'

const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text'] as const

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible name of the group (aria-label)',
    },
  },
  args: {
    label: 'Text alignment',
  },
  render: (args) => ({
    components: { ButtonGroup, Button },
    setup: () => ({ args }),
    template: `
      <ButtonGroup v-bind="args">
        <Button variant="outlined">Left</Button>
        <Button variant="outlined">Center</Button>
        <Button variant="outlined">Right</Button>
      </ButtonGroup>
    `,
  }),
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Size, color and variant stay on each Button — the group only glues them. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonGroup, Button },
    setup: () => ({ variants, capitalize }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <ButtonGroup v-for="variant in variants" :key="variant" :label="capitalize(variant) + ' group'">
          <Button :variant="variant" color="primary">One</Button>
          <Button :variant="variant" color="primary">Two</Button>
          <Button :variant="variant" color="primary">Three</Button>
        </ButtonGroup>
      </div>
    `,
  }),
}

/** ButtonIcon glues exactly like Button — e.g. a split button or a pager. */
export const WithButtonIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonGroup, Button, ButtonIcon },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <ButtonGroup label="Save options">
          <Button color="primary" icon-start="save">Save</Button>
          <ButtonIcon color="primary" icon="expand_more" label="More save options" />
        </ButtonGroup>
        <ButtonGroup label="Pagination">
          <ButtonIcon variant="outlined" icon="chevron_left" label="Previous page" />
          <Button variant="outlined">1</Button>
          <Button variant="outlined">2</Button>
          <Button variant="outlined">3</Button>
          <ButtonIcon variant="outlined" icon="chevron_right" label="Next page" />
        </ButtonGroup>
        <ButtonGroup label="Zoom">
          <ButtonIcon variant="tonal" color="primary" icon="zoom_out" label="Zoom out" />
          <ButtonIcon variant="tonal" color="primary" icon="zoom_in" label="Zoom in" />
        </ButtonGroup>
      </div>
    `,
  }),
}

/** Mixed states inside a group. */
export const MixedStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ButtonGroup, Button },
    template: `
      <ButtonGroup label="Actions">
        <Button variant="outlined" icon-start="edit">Edit</Button>
        <Button variant="outlined" disabled>Duplicate</Button>
        <Button variant="outlined" color="danger" icon-start="delete">Delete</Button>
      </ButtonGroup>
    `,
  }),
}
