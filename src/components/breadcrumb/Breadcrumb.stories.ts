import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Breadcrumb from './Breadcrumb.vue'
import type { BreadcrumbItem } from './Breadcrumb.types'

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Laptops', href: '/products/laptops' },
  { label: 'MacBook Pro', href: '/products/laptops/macbook-pro' },
]

const deepItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Documents', href: '/documents' },
  { label: '2026', href: '/documents/2026' },
  { label: 'Q3', href: '/documents/2026/q3' },
  { label: 'Reports', href: '/documents/2026/q3/reports' },
  { label: 'Revenue.pdf', href: '/documents/2026/q3/reports/revenue' },
]

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    separator: {
      control: 'text',
      description: 'Material Symbols name (or image / SVG URL)',
    },
    maxItems: {
      control: { type: 'number', min: 2 },
      description: 'Above this count only the first, second-to-last and last crumbs stay visible',
    },
    currentPath: {
      control: 'text',
      description: 'Marks the matching crumb with aria-current="page"',
    },
    label: { control: 'text' },
    moreLabel: { control: 'text' },
  },
  args: {
    items,
    separator: 'chevron_right',
    currentPath: '/products/laptops/macbook-pro',
  },
  render: (args) => ({
    components: { Breadcrumb },
    setup: () => ({ args }),
    template: '<Breadcrumb v-bind="args" />',
  }),
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The separator is any Material Symbols name — or an image / SVG URL,
 * like every icon prop in the system.
 */
export const Separators: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Breadcrumb },
    setup: () => ({
      items,
      separators: ['chevron_right', 'arrow_right', 'arrow_forward_ios', 'remove'] as const,
    }),
    template: `
      <div style="display: grid; gap: var(--spacing-4);">
        <div v-for="separator in separators" :key="separator" style="display: grid; gap: var(--spacing-1);">
          <code style="font-size: var(--text-xs); color: var(--text-muted);">{{ separator }}</code>
          <Breadcrumb :items="items" :separator="separator" current-path="/products/laptops/macbook-pro" />
        </div>
      </div>
    `,
  }),
}

/** Each item takes an optional `iconStart` (Material Symbols name or URL). */
export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', iconStart: 'home' },
      { label: 'Settings', href: '/settings', iconStart: 'settings' },
      { label: 'Appearance', href: '/settings/appearance', iconStart: 'palette' },
    ],
    currentPath: '/settings/appearance',
  },
}

/**
 * The active crumb is the one whose `href` matches `currentPath`
 * (defaults to `window.location.pathname`) and carries
 * `aria-current="page"`. This story fakes a router: clicks are
 * intercepted and only move the simulated URL — including from
 * inside the "…" menu.
 */
export const ActiveFromUrl: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Breadcrumb },
    setup: () => {
      const path = ref('/documents/2026/q3/reports/revenue')
      const onClick = (event: MouseEvent) => {
        const link = (event.target as HTMLElement).closest('a')
        if (!link) return
        event.preventDefault()
        path.value = link.getAttribute('href') ?? path.value
      }
      return { deepItems, path, onClick }
    },
    template: `
      <div style="display: grid; gap: var(--spacing-4); justify-items: start;" @click="onClick">
        <code
          style="
            padding: var(--spacing-1) var(--spacing-3);
            border: 1px solid var(--border);
            border-radius: var(--radius-full);
            background-color: var(--surface-muted);
            font-size: var(--text-xs);
            color: var(--text-muted);
          "
        >{{ path }}</code>
        <Breadcrumb :items="deepItems" :current-path="path" :max-items="4" />
      </div>
    `,
  }),
}

/**
 * With `maxItems`, a long trail collapses to first / … / second-to-last /
 * last; the "…" button opens a dense menu holding the hidden crumbs as
 * real links. Tab reaches every visible crumb and the button; the open
 * menu is navigated with the arrow keys, Home / End and Escape.
 */
export const Collapsed: Story = {
  args: {
    items: deepItems,
    maxItems: 4,
    currentPath: '/documents/2026/q3/reports/revenue',
  },
}
