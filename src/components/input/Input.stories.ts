import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import Input from './Input.vue'

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text', description: 'v-model' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
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
    type: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    clearable: false,
    isLoading: false,
    showCount: false,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
  },
  render: (args) => ({
    components: { Input },
    setup: () => ({ args }),
    template: '<div style="max-width: 320px;"><Input v-bind="args" /></div>',
  }),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Same heights and font sizes as Button: xs = 28px, sm = 36px, md = 44px, lg = 52px. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <Input size="xs" label="Extra small (28px)" placeholder="Search…" icon-start="search" />
        <Input size="sm" label="Small (36px, default)" placeholder="Search…" icon-start="search" />
        <Input size="md" label="Medium (44px)" placeholder="Search…" icon-start="search" />
        <Input size="lg" label="Large (52px)" placeholder="Search…" icon-start="search" />
      </div>
    `,
  }),
}

/** Decorative icons on either side; they inherit the muted icon color. */
export const Icons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <Input label="Icon start" placeholder="you@example.com" type="email" icon-start="mail" />
        <Input label="Icon end" placeholder="Pick a date" icon-end="calendar_month" />
        <Input label="Both" placeholder="0.00" type="number" icon-start="payments" icon-end="euro" />
      </div>
    `,
  }),
}

/** Listening to @icon-end-click turns the end icon into a real button. */
export const ClickableEndIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    setup: () => {
      const password = ref('correct horse battery staple')
      const visible = ref(false)
      return { password, visible }
    },
    template: `
      <div style="max-width: 320px;">
        <Input
          v-model="password"
          label="Password"
          :type="visible ? 'text' : 'password'"
          :icon-end="visible ? 'visibility_off' : 'visibility'"
          icon-end-label="Toggle password visibility"
          hint="Click the eye to reveal the password"
          @icon-end-click="visible = !visible"
        />
      </div>
    `,
  }),
}

/** The clear button only appears while the field has a value. */
export const Clearable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    setup: () => ({ query: ref('design tokens') }),
    template: `
      <div style="max-width: 320px;">
        <Input v-model="query" label="Search" type="search" icon-start="search" clearable />
      </div>
    `,
  }),
}

/** The spinner takes the place of the end icon while loading. */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    setup: () => ({ username: ref('ada') }),
    template: `
      <div style="max-width: 320px;">
        <Input
          v-model="username"
          label="Username"
          icon-start="alternate_email"
          is-loading
          hint="Checking availability…"
        />
      </div>
    `,
  }),
}

/** The counter tracks the value length; maxlength adds the denominator and caps typing. */
export const CharacterCount: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    setup: () => ({ title: ref('Design system kickoff'), note: ref('') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-5); max-width: 320px;">
        <Input v-model="title" label="Title" :maxlength="30" show-count />
        <Input v-model="note" label="Note" show-count hint="No maxlength: bare counter" />
      </div>
    `,
  }),
}

/** Disabled, readonly, required and invalid; invalid recolors border, ring and hint. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 280px); gap: var(--spacing-5);">
        <Input label="Default" placeholder="Type here…" hint="Everything enabled" />
        <Input label="Required" placeholder="Cannot be empty" required hint="Marked with an asterisk" />
        <Input label="Disabled" model-value="Can't touch this" disabled hint="Greyed out entirely" icon-start="lock" />
        <Input label="Readonly" model-value="ACC-2094-XK" readonly hint="Focusable but not editable" />
        <Input label="Invalid" model-value="not-an-email" type="email" invalid hint="Enter a valid email address" />
        <Input label="Invalid + clearable" model-value="too long" invalid clearable :maxlength="8" show-count />
      </div>
    `,
  }),
}

/** Everything at once: icons, clear, loading, counter, hints, states and live validation. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Input },
    setup: () => {
      const name = ref('Ada Lovelace')
      const displayName = ref('ada')
      const email = ref('ada@example')
      const emailInvalid = computed(() => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value))
      const password = ref('correct horse battery staple')
      const passwordVisible = ref(false)
      const username = ref('ada-lovelace')
      const website = ref('https://adalovelace.dev')
      return { name, displayName, email, emailInvalid, password, passwordVisible, username, website }
    },
    template: `
      <form style="display: grid; grid-template-columns: repeat(2, 300px); gap: var(--spacing-6);" @submit.prevent>
        <Input
          v-model="name"
          label="Full name"
          icon-start="person"
          required
          clearable
          hint="As printed on your passport"
        />
        <Input
          v-model="displayName"
          label="Display name"
          :maxlength="20"
          show-count
          hint="Visible to everyone"
        />
        <Input
          v-model="email"
          label="Email"
          type="email"
          icon-start="mail"
          required
          clearable
          :invalid="emailInvalid"
          :hint="emailInvalid ? 'Enter a valid email address' : 'We never share it'"
        />
        <Input
          v-model="password"
          label="Password"
          :type="passwordVisible ? 'text' : 'password'"
          icon-start="lock"
          :icon-end="passwordVisible ? 'visibility_off' : 'visibility'"
          icon-end-label="Toggle password visibility"
          required
          hint="At least 12 characters"
          @icon-end-click="passwordVisible = !passwordVisible"
        />
        <Input
          v-model="username"
          label="Username"
          icon-start="alternate_email"
          is-loading
          hint="Checking availability…"
        />
        <Input
          v-model="website"
          label="Website"
          type="url"
          icon-start="language"
          clearable
          show-count
          :maxlength="40"
        />
        <Input
          label="Phone"
          type="tel"
          model-value="+33 6 12 34 56 78"
          icon-start="call"
          readonly
          hint="Verified — contact support to change it"
        />
        <Input
          label="Referral code"
          placeholder="CODE-1234"
          icon-start="redeem"
          disabled
          hint="Not available on your plan"
        />
      </form>
    `,
  }),
}
