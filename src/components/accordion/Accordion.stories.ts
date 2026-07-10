import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Accordion from './Accordion.vue'
import AccordionItem from './AccordionItem.vue'
import Avatar from '../avatar/Avatar.vue'
import ButtonIcon from '../button-icon/ButtonIcon.vue'

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
    components: { Accordion, AccordionItem },
    setup: () => ({ args }),
    template: `
      <Accordion v-bind="args" style="width: 360px;">
        <AccordionItem icon="lock" label="Security" sublabel="Password, 2FA, sessions">
          <p style="margin: 0;">Manage how you sign in and keep your account safe.</p>
        </AccordionItem>
        <AccordionItem icon="notifications" label="Notifications">
          <p style="margin: 0;">Choose what you get notified about and where.</p>
        </AccordionItem>
        <AccordionItem icon="credit_card" label="Billing">
          <p style="margin: 0;">Payment methods, invoices and plan details.</p>
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
    components: { Accordion, AccordionItem },
    template: `
      <div style="display: flex; gap: var(--spacing-6); align-items: flex-start;">
        <Accordion style="width: 300px;">
          <AccordionItem icon="lock" label="Default" sublabel="48px headers">
            <p style="margin: 0;">Regular rhythm.</p>
          </AccordionItem>
          <AccordionItem icon="notifications" label="Notifications">
            <p style="margin: 0;">Regular rhythm.</p>
          </AccordionItem>
        </Accordion>
        <Accordion dense style="width: 300px;">
          <AccordionItem icon="lock" label="Dense" sublabel="36px headers">
            <p style="margin: 0;">Compact rhythm.</p>
          </AccordionItem>
          <AccordionItem icon="notifications" label="Notifications">
            <p style="margin: 0;">Compact rhythm.</p>
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
    components: { Accordion, AccordionItem },
    template: `
      <Accordion multiple style="width: 360px;">
        <AccordionItem icon="lock" label="Security" open>
          <p style="margin: 0;">Open by default…</p>
        </AccordionItem>
        <AccordionItem icon="notifications" label="Notifications" open>
          <p style="margin: 0;">…together with this one.</p>
        </AccordionItem>
        <AccordionItem icon="credit_card" label="Billing">
          <p style="margin: 0;">Payment methods, invoices and plan details.</p>
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
    components: { Accordion, AccordionItem },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem icon="lock" label="Security">
          <p style="margin: 0;">Manage how you sign in and keep your account safe.</p>
        </AccordionItem>
        <AccordionItem icon="notifications" label="Notifications" open>
          <p style="margin: 0;">Open on first render.</p>
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
    components: { Accordion, AccordionItem, Avatar },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem label="Ada Lovelace">
          <template #header>
            <Avatar name="Ada Lovelace" size="sm" />
            <span style="display: flex; flex-direction: column; min-width: 0;">
              <span>Ada Lovelace</span>
              <span style="font-size: var(--text-xs); color: var(--text-muted);">Mathematician</span>
            </span>
          </template>
          <p style="margin: 0;">Wrote the first published algorithm.</p>
        </AccordionItem>
        <AccordionItem label="Grace Hopper">
          <template #header>
            <Avatar name="Grace Hopper" size="sm" />
            <span style="display: flex; flex-direction: column; min-width: 0;">
              <span>Grace Hopper</span>
              <span style="font-size: var(--text-xs); color: var(--text-muted);">Rear admiral</span>
            </span>
          </template>
          <p style="margin: 0;">Pioneered machine-independent programming languages.</p>
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
    components: { Accordion, AccordionItem, ButtonIcon },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem icon="folder" label="Documents" sublabel="12 files">
          <template #actions>
            <ButtonIcon icon="edit" variant="text" size="xs" label="Rename" />
            <ButtonIcon icon="delete" variant="text" size="xs" label="Delete" />
          </template>
          <p style="margin: 0;">Reports, contracts and specs.</p>
        </AccordionItem>
        <AccordionItem icon="folder" label="Pictures" sublabel="48 files">
          <template #actions>
            <ButtonIcon icon="edit" variant="text" size="xs" label="Rename" />
            <ButtonIcon icon="delete" variant="text" size="xs" label="Delete" />
          </template>
          <p style="margin: 0;">Screenshots and photos.</p>
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
    components: { Accordion, AccordionItem },
    template: `
      <Accordion style="width: 360px;">
        <AccordionItem icon="lock" label="Security">
          <p style="margin: 0;">Manage how you sign in and keep your account safe.</p>
        </AccordionItem>
        <AccordionItem icon="science" label="Experimental" sublabel="Coming soon" disabled>
          <p style="margin: 0;">Not available yet.</p>
        </AccordionItem>
        <AccordionItem icon="credit_card" label="Billing">
          <p style="margin: 0;">Payment methods, invoices and plan details.</p>
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
    components: { AccordionItem },
    template: `
      <AccordionItem icon="help" label="What is this?" sublabel="A single collapsible" style="width: 360px;">
        <p style="margin: 0;">No parent group needed — exclusivity simply doesn't apply.</p>
      </AccordionItem>
    `,
  }),
}
