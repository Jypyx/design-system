import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import Textarea from './Textarea.vue'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text', description: 'v-model' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    rows: { control: 'number' },
    autoResize: { control: 'boolean' },
    iconStart: { control: 'text', description: 'Material Symbols name or image / SVG URL' },
    iconEnd: {
      control: 'text',
      description:
        'Material Symbols name or image / SVG URL; becomes a button when @icon-end-click is listened to',
    },
    iconEndLabel: { control: 'text' },
    clearable: { control: 'boolean' },
    clearLabel: { control: 'text' },
    isLoading: { control: 'boolean' },
    showCount: { control: 'boolean' },
    maxlength: { control: 'number' },
    name: { control: 'text' },
    autocomplete: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    size: 'sm',
    label: 'Message',
    placeholder: 'Tell us everything…',
    rows: 3,
    autoResize: false,
    clearable: false,
    isLoading: false,
    showCount: false,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
  },
  render: (args) => ({
    components: { Textarea },
    setup: () => ({ args }),
    template: '<div style="max-width: 360px;"><Textarea v-bind="args" /></div>',
  }),
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Same font sizes, paddings and radii as Input; height comes from rows. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 360px;">
        <Textarea size="xs" label="Extra small" placeholder="Write here…" :rows="2" />
        <Textarea size="sm" label="Small (default)" placeholder="Write here…" :rows="2" />
        <Textarea size="md" label="Medium" placeholder="Write here…" :rows="2" />
        <Textarea size="lg" label="Large" placeholder="Write here…" :rows="2" />
      </div>
    `,
  }),
}

/** rows sets the height; with auto-resize the field grows with the content (rows = minimum). */
export const RowsAndAutoResize: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 360px;">
        <Textarea label="2 rows, fixed" :rows="2" placeholder="Scrolls when the content overflows" />
        <Textarea label="Auto-resize, 2 rows minimum" :rows="2" auto-resize hint="Keep typing: the field grows with the content" placeholder="Type several lines…" />
      </div>
    `,
  }),
}

/** Icons align with the first line of text; @icon-end-click makes the end icon a button. */
export const Icons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    setup: () => ({ message: ref('On my way!') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 360px;">
        <Textarea label="Icon start" placeholder="Add a comment…" icon-start="chat_bubble" />
        <Textarea
          v-model="message"
          label="Clickable icon end"
          icon-end="send"
          icon-end-label="Send message"
          hint="The send icon is a real button"
          @icon-end-click="message = ''"
        />
      </div>
    `,
  }),
}

/** The clear button only appears while the field has a value. */
export const Clearable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    setup: () => ({ draft: ref('Draft to be discarded…') }),
    template: `
      <div style="max-width: 360px;">
        <Textarea v-model="draft" label="Draft" clearable :rows="3" />
      </div>
    `,
  }),
}

/** The spinner takes the place of the end icon while loading. */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    setup: () => ({ notes: ref('Meeting notes, first pass…') }),
    template: `
      <div style="max-width: 360px;">
        <Textarea v-model="notes" label="Notes" is-loading hint="Saving draft…" :rows="3" />
      </div>
    `,
  }),
}

/** The counter tracks the value length; maxlength adds the denominator and caps typing. */
export const CharacterCount: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    setup: () => ({ bio: ref('Analytical engine enthusiast.') }),
    template: `
      <div style="max-width: 360px;">
        <Textarea v-model="bio" label="Bio" :maxlength="160" show-count hint="Shown on your public profile" :rows="4" />
      </div>
    `,
  }),
}

/** Disabled, readonly, required and invalid; invalid recolors border, shadow and hint. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 300px); gap: var(--spacing-5);">
        <Textarea label="Default" placeholder="Type here…" hint="Everything enabled" :rows="2" />
        <Textarea label="Required" placeholder="Cannot be empty" required hint="Marked with an asterisk" :rows="2" />
        <Textarea label="Disabled" model-value="Can't touch this" disabled hint="Greyed out entirely" :rows="2" />
        <Textarea label="Readonly" model-value="Terms of service, v3.2" readonly hint="Focusable but not editable" :rows="2" />
        <Textarea label="Invalid" model-value="Too short" invalid hint="At least 40 characters required" :rows="2" />
        <Textarea label="Invalid + counter" model-value="Way over the limit" invalid :maxlength="10" show-count :rows="2" />
      </div>
    `,
  }),
}

/** Everything at once: icons, clear, loading, counter, auto-resize, states and live validation. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    setup: () => {
      const review = ref('Great product, would recommend!')
      const reviewInvalid = computed(() => review.value.length < 20)
      const bio = ref('Mathematician. Wrote the first algorithm.')
      const notes = ref('Draft synced from another device…')
      return { review, reviewInvalid, bio, notes }
    },
    template: `
      <form style="display: grid; grid-template-columns: repeat(2, 320px); gap: var(--spacing-6);" @submit.prevent>
        <Textarea
          v-model="review"
          label="Review"
          icon-start="rate_review"
          required
          clearable
          :rows="4"
          auto-resize
          :maxlength="200"
          show-count
          :invalid="reviewInvalid"
          :hint="reviewInvalid ? 'At least 20 characters' : 'Posted publicly'"
        />
        <Textarea
          v-model="bio"
          label="Bio"
          :maxlength="160"
          show-count
          :rows="4"
          hint="Shown on your public profile"
        />
        <Textarea
          v-model="notes"
          label="Notes"
          is-loading
          :rows="4"
          hint="Saving draft…"
        />
        <Textarea
          label="Internal comment"
          model-value="Only admins can edit this field."
          icon-start="lock"
          disabled
          :rows="4"
          hint="Not available on your plan"
        />
      </form>
    `,
  }),
}
