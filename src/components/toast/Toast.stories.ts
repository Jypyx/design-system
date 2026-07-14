import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Toaster from './Toast.vue'
import { toast } from './toast'
import type { ToastOptions } from './Toast.types'
import Button from '../button/Button.vue'

type PlaygroundArgs = Required<
  Pick<ToastOptions, 'color' | 'position' | 'size' | 'closable' | 'duration'>
> & {
  message: string
  title: string
}

const meta = {
  title: 'Components/Toast',
  component: Toaster,
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    title: { control: 'text', description: 'Optional heading above the message' },
    color: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'danger', 'warning'],
    },
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    closable: { control: 'boolean' },
    duration: {
      control: 'number',
      description: 'Auto-dismiss delay in ms; 0 keeps the toast until dismissed',
    },
  },
  args: {
    message: 'Your changes have been saved.',
    title: '',
    color: 'neutral',
    position: 'bottom-right',
    size: 'md',
    closable: true,
    duration: 5000,
  },
  render: (args) => ({
    components: { Toaster, Button },
    setup: () => ({
      fire: () =>
        toast(args.message, {
          title: args.title || undefined,
          color: args.color,
          position: args.position,
          size: args.size,
          closable: args.closable,
          duration: args.duration,
        }),
    }),
    template: `
      <Toaster />
      <Button variant="outlined" @click="fire">Show toast</Button>
    `,
  }),
} satisfies Meta<PlaygroundArgs>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Mount a single `<Toaster />` outlet at the root of the app, then call
 * `toast(message, options)` from anywhere — event handlers, stores, or the
 * `catch` of an API request. Each call returns an id usable with
 * `toast.dismiss(id)`.
 */
export const Default: Story = {}

/** Same accent pairs as the Button component; light/dark follows the theme. */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toaster, Button },
    setup: () => ({ toast }),
    template: `
      <Toaster />
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Button variant="outlined" @click="toast('Rendering finished in 2.4s.', { duration: 0 })">Neutral</Button>
        <Button color="primary" @click="toast.primary('A new version is available.', { title: 'Update', duration: 0 })">Primary</Button>
        <Button color="success" @click="toast.success('Your profile has been updated.', { duration: 0 })">Success</Button>
        <Button color="danger" @click="toast.danger('The server did not respond.', { title: 'Request failed', duration: 0 })">Danger</Button>
        <Button color="warning" @click="toast.warning('Your session expires in 5 minutes.', { duration: 0 })">Warning</Button>
      </div>
    `,
  }),
}

/** Six stacks, one per screen corner/edge; each keeps its own order. */
export const Positions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toaster, Button },
    setup: () => ({
      positions: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      fire: (position: string) => toast(`Stacked at ${position}.`, { position: position as never }),
    }),
    template: `
      <Toaster />
      <div style="display: grid; grid-template-columns: repeat(3, max-content); gap: var(--spacing-4);">
        <Button v-for="position in positions" :key="position" variant="outlined" @click="fire(position)">
          {{ position }}
        </Button>
      </div>
    `,
  }),
}

/** Width presets: sm = 300px, md = 360px, lg = 440px (always viewport-capped). */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toaster, Button },
    setup: () => ({ toast }),
    template: `
      <Toaster />
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Button variant="outlined" @click="toast('A compact 300px toast.', { size: 'sm', duration: 0 })">sm</Button>
        <Button variant="outlined" @click="toast('The default 360px toast, comfortable for one or two lines of text.', { size: 'md', duration: 0 })">md</Button>
        <Button variant="outlined" @click="toast('A roomy 440px toast for longer notifications that would otherwise wrap onto too many lines.', { size: 'lg', duration: 0 })">lg</Button>
      </div>
    `,
  }),
}

/**
 * The message is required; the title is optional. The top-left icon defaults
 * to one matching the color and accepts any Material Symbols name or image
 * URL via the `icon` option.
 */
export const Content: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toaster, Button },
    setup: () => ({ toast }),
    template: `
      <Toaster />
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Button variant="outlined" @click="toast('Message only, default icon.', { duration: 0 })">Message</Button>
        <Button variant="outlined" @click="toast('3 files were uploaded to the workspace.', { title: 'Upload complete', duration: 0 })">Title + message</Button>
        <Button variant="outlined" @click="toast.primary('Deployment v2.13.0 is live.', { title: 'Deployed', icon: 'rocket_launch', duration: 0 })">Custom icon</Button>
      </div>
    `,
  }),
}

/**
 * `duration: 0` keeps a toast until the user dismisses it; `closable: false`
 * removes the dismiss button for transient, purely informative toasts.
 * Hovering any toast pauses its countdown.
 */
export const DurationAndClosable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toaster, Button },
    setup: () => ({ toast }),
    template: `
      <Toaster />
      <div style="display: flex; gap: var(--spacing-4); align-items: center;">
        <Button variant="outlined" @click="toast('Auto-dismisses after 3 seconds.', { duration: 3000 })">3s</Button>
        <Button variant="outlined" @click="toast('Stays until you close it.', { duration: 0 })">Persistent</Button>
        <Button variant="outlined" @click="toast('No close button, gone in 4 seconds.', { closable: false, duration: 4000 })">Not closable</Button>
      </div>
    `,
  }),
}

/** Typical async usage: fire from the resolution of an API request. */
export const AsyncRequest: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toaster, Button },
    setup: () => ({
      save: async () => {
        const id = toast('Saving your changes…', { closable: false, duration: 0 })
        await new Promise((resolve) => setTimeout(resolve, 1500))
        toast.dismiss(id)
        if (Math.random() < 0.5) toast.success('Changes saved.', { title: 'Saved' })
        else toast.danger('Could not reach the server.', { title: 'Save failed' })
      },
    }),
    template: `
      <Toaster />
      <Button color="primary" @click="save">Save (random outcome)</Button>
    `,
  }),
}
