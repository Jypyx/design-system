import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Accordion from './Accordion.vue'
import AccordionItem from './AccordionItem.vue'
import Avatar from '../avatar/Avatar.vue'
import Button from '../button/Button.vue'
import Typography from '../typography/Typography.vue'

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow several items open at once instead of the exclusive default',
    },
    dense: {
      control: 'boolean',
      description: 'Tighter vertical rhythm and smaller icons',
    },
    variant: {
      control: 'select',
      options: ['card', 'flat'],
      description: 'card — bordered, rounded group; flat — separators between items only',
    },
  },
  args: {
    multiple: false,
    dense: false,
    variant: 'card',
  },
  render: (args) => ({
    components: { Accordion, AccordionItem, Typography },
    setup: () => ({ args }),
    template: `
      <Accordion v-bind="args" style="width: 360px;">
        <AccordionItem icon="lock" label="Security" sublabel="Password, 2FA, sessions">
          <Typography>Manage how you sign in and keep your account safe.</Typography>
        </AccordionItem>
        <AccordionItem icon="notifications" label="Notifications">
          <Typography>Choose what you get notified about and where.</Typography>
        </AccordionItem>
        <AccordionItem icon="credit_card" label="Billing">
          <Typography>Payment methods, invoices and plan details.</Typography>
        </AccordionItem>
      </Accordion>
    `,
  }),
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * `flat` drops the outer shell and keeps only the hairlines between
 * items — for accordions embedded in a surface that already has its
 * own border (cards, panels, sidebars).
 */
export const Flat: Story = {
  args: { variant: 'flat' },
}

/**
 * `dense` tightens the vertical rhythm and shrinks the icons — for
 * data-heavy surfaces where the accordion should stay compact.
 */
export const Dense: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Accordion, AccordionItem, Typography },
    template: `
      <div style="display: flex; gap: var(--spacing-6); align-items: flex-start;">
        <Accordion style="width: 300px;">
          <AccordionItem icon="lock" label="Default" sublabel="48px headers">
            <Typography>Regular rhythm.</Typography>
          </AccordionItem>
          <AccordionItem icon="notifications" label="Notifications">
            <Typography>Regular rhythm.</Typography>
          </AccordionItem>
        </Accordion>
        <Accordion dense style="width: 300px;">
          <AccordionItem icon="lock" label="Dense" sublabel="36px headers">
            <Typography>Compact rhythm.</Typography>
          </AccordionItem>
          <AccordionItem icon="notifications" label="Notifications">
            <Typography>Compact rhythm.</Typography>
          </AccordionItem>
        </Accordion>
      </div>
    `,
  }),
}

/**
 * By default the group is exclusive — opening an item closes the one
 * already open (native `name` grouping, zero JS). `multiple` lifts the
 * restriction: every item keeps its own state. Note: while exclusive,
 * if several items declare `open`, the browser keeps only the last one.
 */
export const Multiple: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Accordion, AccordionItem, Typography },
    template: `
      <Accordion multiple style="width: 360px;">
        <AccordionItem icon="lock" label="Security" open>
          <Typography>Open by default…</Typography>
        </AccordionItem>
        <AccordionItem icon="notifications" label="Notifications" open>
          <Typography>…together with this one.</Typography>
        </AccordionItem>
        <AccordionItem icon="credit_card" label="Billing">
          <Typography>Payment methods, invoices and plan details.</Typography>
        </AccordionItem>
      </Accordion>
    `,
  }),
}

/**
 * `open` on an item makes it expanded on first render; the browser owns
 * the state afterwards. Listen to the native `toggle` event on the item
 * (`@toggle`, `ToggleEvent.newState` is `'open' | 'closed'`) to react.
 */
export const DefaultOpen: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Accordion, AccordionItem, Typography },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem icon="lock" label="Security">
          <Typography>Manage how you sign in and keep your account safe.</Typography>
        </AccordionItem>
        <AccordionItem icon="notifications" label="Notifications" open>
          <Typography>Open on first render.</Typography>
        </AccordionItem>
      </Accordion>
    `,
  }),
}

/**
 * The `#header` slot replaces the icon + label + sublabel block for a
 * fully custom header; the `#actions` area and the chevron remain.
 */
export const CustomHeader: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Accordion, AccordionItem, Avatar, Typography },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem label="Ada Lovelace">
          <template #header>
            <Avatar name="Ada Lovelace" size="sm" />
            <span style="display: flex; flex-direction: column; min-width: 0;">
              <Typography as="span" variant="label">Ada Lovelace</Typography>
              <Typography variant="caption">Mathematician</Typography>
            </span>
          </template>
          <Typography>Wrote the first published algorithm.</Typography>
        </AccordionItem>
        <AccordionItem label="Grace Hopper">
          <template #header>
            <Avatar name="Grace Hopper" size="sm" />
            <span style="display: flex; flex-direction: column; min-width: 0;">
              <Typography as="span" variant="label">Grace Hopper</Typography>
              <Typography variant="caption">Rear admiral</Typography>
            </span>
          </template>
          <Typography>Pioneered machine-independent programming languages.</Typography>
        </AccordionItem>
      </Accordion>
    `,
  }),
}

/**
 * The `#actions` slot sits just before the chevron — clicks inside it
 * never toggle the panel, so it can hold buttons, badges or menus.
 */
export const Actions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Accordion, AccordionItem, Button, Typography },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem icon="folder" label="Documents" sublabel="12 files">
          <template #actions>
            <Button icon="edit" variant="text" size="xs" label="Rename" />
            <Button icon="delete" variant="text" size="xs" label="Delete" />
          </template>
          <Typography>Reports, contracts and specs.</Typography>
        </AccordionItem>
        <AccordionItem icon="folder" label="Pictures" sublabel="48 files">
          <template #actions>
            <Button icon="edit" variant="text" size="xs" label="Rename" />
            <Button icon="delete" variant="text" size="xs" label="Delete" />
          </template>
          <Typography>Screenshots and photos.</Typography>
        </AccordionItem>
      </Accordion>
    `,
  }),
}

/**
 * A disabled item cannot be toggled or focused and is skipped by the
 * arrow-key navigation (ArrowUp / ArrowDown / Home / End move between
 * enabled headers; Enter / Space toggle natively).
 */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Accordion, AccordionItem, Typography },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem icon="lock" label="Security">
          <Typography>Manage how you sign in and keep your account safe.</Typography>
        </AccordionItem>
        <AccordionItem icon="science" label="Experimental" sublabel="Coming soon" disabled>
          <Typography>Not available yet.</Typography>
        </AccordionItem>
        <AccordionItem icon="credit_card" label="Billing">
          <Typography>Payment methods, invoices and plan details.</Typography>
        </AccordionItem>
      </Accordion>
    `,
  }),
}

/**
 * An AccordionItem also works on its own, outside any Accordion — a
 * plain animated `<details>` with the design-system header.
 */
export const Standalone: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { AccordionItem, Typography },
    template: `
      <AccordionItem icon="help" label="What is this?" sublabel="A single collapsible" style="width: 360px;">
        <Typography>No parent group needed — exclusivity simply doesn't apply.</Typography>
      </AccordionItem>
    `,
  }),
}
