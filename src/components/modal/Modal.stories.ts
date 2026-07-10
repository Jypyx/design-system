import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import Modal from './Modal.vue'
import Button from '../button/Button.vue'
import ButtonIcon from '../button-icon/ButtonIcon.vue'

/* opens the modal so the story (and its a11y scan) shows the dialog;
   autodocs previews skip play functions and stay closed */
const openModal = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open modal' }))
}

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    width: {
      control: 'text',
      description: 'Any CSS width (default 560px); never grows past the viewport',
    },
    closable: { control: 'boolean' },
    dismissible: {
      control: 'boolean',
      description: 'Closes on backdrop click; Escape always closes',
    },
    role: { control: 'select', options: ['dialog', 'alertdialog'] },
    closeLabel: { control: 'text' },
  },
  args: {
    title: 'Edit profile',
    subtitle: 'Changes are visible to every member of the workspace',
    closable: true,
    dismissible: true,
    role: 'dialog',
    closeLabel: 'Close',
  },
  render: (args) => ({
    components: { Modal, Button },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <Button @click="open = true">Open modal</Button>
      <Modal v-bind="args" v-model:open="open">
        <p style="margin: 0;">
          Your profile is shown on shared documents and in the members list.
          Update your display name and role, then save your changes.
        </p>
        <template #footer>
          <Button variant="text" @click="open = false">Cancel</Button>
          <Button color="primary" @click="open = false">Save changes</Button>
        </template>
      </Modal>
    `,
  }),
  play: openModal,
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * When the content is taller than the modal, the body scrolls and 1px
 * borders mark the scrollport edges — pure CSS (scroll- vs local-attached
 * background layers). Each border only shows while there is more content
 * on its side: none at the top before scrolling, none at the bottom once
 * you reach the end, and none at all when nothing overflows.
 */
export const ScrollableContent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Modal, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Open modal</Button>
      <Modal v-model:open="open" title="Terms of service" subtitle="Last updated July 2026">
        <p v-for="i in 14" :key="i" style="margin: 0 0 var(--spacing-4);">
          {{ i }}. These terms govern the use of the service. By accessing or
          using the service you agree to be bound by them, including any
          policies referenced here, and to use the service responsibly.
        </p>
        <template #footer>
          <Button variant="text" @click="open = false">Decline</Button>
          <Button color="primary" @click="open = false">Accept</Button>
        </template>
      </Modal>
    `,
  }),
}

/** The `width` prop takes any CSS width; the modal still shrinks to fit small viewports. */
export const CustomWidth: Story = {
  parameters: { controls: { disable: true } },
  args: {
    width: '800px',
    title: 'Compare plans',
    subtitle: 'A wider layout for side-by-side content',
  },
}

/** The `header-actions` slot renders arbitrary content just left of the close X. */
export const HeaderActions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Modal, Button, ButtonIcon },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Open modal</Button>
      <Modal v-model:open="open" title="Report — Q3" subtitle="Generated a few seconds ago">
        <p style="margin: 0;">Revenue is up 12% quarter over quarter.</p>
        <template #header-actions>
          <ButtonIcon icon="download" variant="text" label="Download" />
          <ButtonIcon icon="open_in_full" variant="text" label="Expand" />
        </template>
        <template #footer>
          <Button color="primary" @click="open = false">Done</Button>
        </template>
      </Modal>
    `,
  }),
}

/**
 * The `header` slot replaces the title/subtitle block only — the
 * header-actions slot and the close X stay. Without a `title` prop the
 * dialog has no automatic accessible name: pass an `aria-label`.
 */
export const CustomHeader: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Modal, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button @click="open = true">Open modal</Button>
      <Modal v-model:open="open" aria-label="Search files">
        <template #header>
          <input
            type="search"
            placeholder="Search files…"
            aria-label="Search files"
            style="box-sizing: border-box; width: 100%; padding: var(--spacing-2) var(--spacing-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); color: var(--text); font: inherit;"
          />
        </template>
        <p style="margin: 0; color: var(--text-muted);">Start typing to see results.</p>
      </Modal>
    `,
  }),
}

/**
 * `dismissible: false` disables the backdrop light dismiss; the close X
 * and Escape still work.
 */
export const NotDismissible: Story = {
  parameters: { controls: { disable: true } },
  args: {
    dismissible: false,
    title: 'Import in progress',
    subtitle: 'Clicking outside will not close this modal',
  },
}
