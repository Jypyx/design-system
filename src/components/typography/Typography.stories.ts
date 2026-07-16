import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Typography from './Typography.vue'

const variants = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle',
  'body',
  'label',
  'caption',
  'overline',
] as const
const colors = ['default', 'muted', 'disabled', 'inverse'] as const
const tags = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'span',
  'div',
  'label',
  'legend',
  'figcaption',
] as const

const meta = {
  title: 'Components/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: variants,
      description: 'Text style; also picks the default tag (h1–h6, p or span)',
    },
    as: {
      control: 'select',
      options: tags,
      description: "Overrides the rendered tag while keeping the variant's style",
    },
    color: {
      control: 'select',
      options: colors,
      description:
        "'default' keeps the variant's own color (subtitle / caption / overline are muted)",
    },
    truncate: { control: 'boolean', description: 'Single-line ellipsis' },
  },
  args: {
    variant: 'body',
    color: 'default',
    truncate: false,
  },
  render: (args) => ({
    components: { Typography },
    setup: () => ({ args }),
    template: '<Typography v-bind="args">The quick brown fox jumps over the lazy dog</Typography>',
  }),
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every variant, top-down from h1 — headings stay in sequential order. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Typography },
    setup: () => ({ variants }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <div v-for="variant in variants" :key="variant" style="display: flex; gap: var(--spacing-4); align-items: baseline;">
          <Typography variant="caption" style="width: 64px; flex: none;">{{ variant }}</Typography>
          <Typography :variant="variant">The quick brown fox</Typography>
        </div>
      </div>
    `,
  }),
}

/** The color prop maps to the semantic text color tokens. */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Typography },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-3); align-items: flex-start;">
        <Typography>default — follows the theme</Typography>
        <Typography color="muted">muted — secondary text</Typography>
        <Typography color="disabled">disabled — inactive text</Typography>
        <span style="display: inline-flex; padding: var(--spacing-2) var(--spacing-4); border-radius: var(--radius-md); background: var(--text);">
          <Typography color="inverse">inverse — on an emphasis surface</Typography>
        </span>
      </div>
    `,
  }),
}

/**
 * `as` decouples the tag from the style: keep the document outline
 * (as="h2" with a smaller heading style), or render semantic elements
 * like <label> and <legend> with design-system text styles.
 */
export const AsTag: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Typography },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <Typography variant="h5" as="p">h5 style rendered as a &lt;p&gt;</Typography>
        <div style="display: flex; flex-direction: column; gap: var(--spacing-1); align-items: flex-start;">
          <Typography variant="label" as="label" for="typography-demo-input">Email</Typography>
          <input id="typography-demo-input" type="email" placeholder="ada@example.com" />
        </div>
        <fieldset style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--spacing-4);">
          <Typography variant="overline" as="legend" style="padding: 0 var(--spacing-2);">Shipping</Typography>
          <Typography variant="subtitle">Delivered in 3–5 business days.</Typography>
        </fieldset>
      </div>
    `,
  }),
}

/** truncate renders a single-line ellipsis inside a constrained container. */
export const Truncate: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Typography },
    template: `
      <div style="width: 220px; border: 1px dashed var(--border); border-radius: var(--radius-md); padding: var(--spacing-3);">
        <Typography variant="label" truncate>
          A very long single line of text that will not fit in this narrow container
        </Typography>
        <Typography variant="caption" truncate>
          The caption below it also truncates with an ellipsis instead of wrapping
        </Typography>
      </div>
    `,
  }),
}
