import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import ModalAlert from './ModalAlert.vue'
import Button from '../button/Button.vue'

/* opens the alert in the automated (webdriver-driven) vitest run only,
   so the a11y scan covers the open dialog; in the Storybook UI stories
   start closed and the trigger opens them */
const openAlert = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  if (!navigator.webdriver) return
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open alert' }))
}

const meta = {
  title: 'Components/ModalAlert',
  component: ModalAlert,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    width: {
      control: 'text',
      description: 'Any CSS width (default 400px); never grows past the viewport',
    },
  },
  args: {
    title: 'Delete this project?',
    subtitle: 'This action cannot be undone',
  },
  render: (args) => ({
    components: { ModalAlert, Button },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <Button color="danger" variant="tonal" @click="open = true">Open alert</Button>
      <ModalAlert v-bind="args" v-model:open="open">
        <p style="margin: 0;">
          The project, its documents and its share links will be permanently
          removed for every member.
        </p>
        <template #footer>
          <Button variant="text" @click="open = false">Cancel</Button>
          <Button color="danger" @click="open = false">Delete project</Button>
        </template>
      </ModalAlert>
    `,
  }),
  play: openAlert,
} satisfies Meta<typeof ModalAlert>

export default meta
type Story = StoryObj<typeof meta>

/**
 * `role="alertdialog"`, no close X and no backdrop dismiss: the user must
 * pick an action from the footer (Escape stays available, native to the
 * dialog element). The body is announced as the accessible description.
 */
export const Default: Story = {}

/**
 * By default the first focusable element (here, Cancel) receives focus.
 * Put `autofocus` on the safest action to make it explicit.
 */
export const WithAutofocus: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { ModalAlert, Button },
    setup: () => ({ open: ref(false) }),
    template: `
      <Button color="danger" variant="tonal" @click="open = true">Open alert</Button>
      <ModalAlert v-model:open="open" title="Discard draft?" subtitle="Your changes will be lost">
        <p style="margin: 0;">You edited this reply 2 minutes ago.</p>
        <template #footer>
          <Button variant="text" autofocus @click="open = false">Keep editing</Button>
          <Button color="danger" @click="open = false">Discard</Button>
        </template>
      </ModalAlert>
    `,
  }),
}
