import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Tabs from './Tabs.vue'
import Tab from './Tab.vue'
import TabPanel from './TabPanel.vue'

const sizes = ['xs', 'sm', 'md', 'lg'] as const
const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
const variants = ['line', 'inset'] as const
const placements = ['start', 'center', 'end'] as const

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: sizes,
      description: 'Same scale as Button: xs = 28px, sm = 36px, md = 44px, lg = 52px',
    },
    color: { control: 'select', options: colors },
    variant: {
      control: 'select',
      options: variants,
      description: 'line = underlined text tabs, inset = elevated pill inside a grey track',
    },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    placement: {
      control: 'select',
      options: placements,
      description: 'Alignment of the tabs inside the bar (along the orientation axis)',
    },
    stretch: {
      control: 'boolean',
      description: 'The tabs share all the available space equally',
    },
    scrollButtons: {
      control: 'boolean',
      description: 'Scroll buttons at both ends of the bar, shown only when the tabs overflow',
    },
    scrollPrevIcon: {
      control: 'text',
      description: 'Material Symbols Rounded name; defaults to a chevron matching the orientation',
    },
    scrollNextIcon: { control: 'text' },
    label: { control: 'text', description: 'Accessible name of the tablist' },
  },
  args: {
    size: 'sm',
    color: 'neutral',
    variant: 'line',
    orientation: 'horizontal',
    placement: 'start',
    stretch: false,
    scrollButtons: false,
    label: 'Example tabs',
  },
  render: (args) => ({
    components: { Tabs, Tab, TabPanel },
    setup: () => ({ args, selected: ref('overview') }),
    template: `
      <Tabs v-bind="args" v-model="selected">
        <template #tabs>
          <Tab value="overview">Overview</Tab>
          <Tab value="activity">Activity</Tab>
          <Tab value="settings">Settings</Tab>
        </template>
        <TabPanel value="overview" style="padding: var(--spacing-4) 0;">Overview panel.</TabPanel>
        <TabPanel value="activity" style="padding: var(--spacing-4) 0;">Activity panel.</TabPanel>
        <TabPanel value="settings" style="padding: var(--spacing-4) 0;">Settings panel.</TabPanel>
      </Tabs>
    `,
  }),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Both variants crossed with every color (the accent shows on the selected tab). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab },
    setup: () => ({ colors, variants, selected: ref('a') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6); align-items: flex-start;">
        <template v-for="variant in variants" :key="variant">
          <Tabs
            v-for="color in colors"
            :key="color"
            :variant="variant"
            :color="color"
            v-model="selected"
            :label="variant + ' ' + color"
          >
            <template #tabs>
              <Tab value="a">{{ color }}</Tab>
              <Tab value="b">Second</Tab>
              <Tab value="c">Third</Tab>
            </template>
          </Tabs>
        </template>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab },
    setup: () => ({ sizes, variants, selected: ref('a') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6); align-items: flex-start;">
        <template v-for="variant in variants" :key="variant">
          <Tabs
            v-for="size in sizes"
            :key="size"
            :size="size"
            :variant="variant"
            color="primary"
            v-model="selected"
            :label="variant + ' ' + size"
          >
            <template #tabs>
              <Tab value="a">Size {{ size }}</Tab>
              <Tab value="b">Second</Tab>
              <Tab value="c">Third</Tab>
            </template>
          </Tabs>
        </template>
      </div>
    `,
  }),
}

/** Vertical: the line indicator moves to the inline-start edge of the tabs. */
export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab, TabPanel },
    setup: () => ({ variants, selected: ref('inbox') }),
    template: `
      <div style="display: flex; gap: var(--spacing-10); align-items: flex-start;">
        <Tabs
          v-for="variant in variants"
          :key="variant"
          orientation="vertical"
          :variant="variant"
          color="primary"
          v-model="selected"
          :label="'Vertical ' + variant"
          style="width: 320px;"
        >
          <template #tabs>
            <Tab value="inbox" icon-start="inbox">Inbox</Tab>
            <Tab value="sent" icon-start="send">Sent</Tab>
            <Tab value="archive" icon-start="archive">Archive</Tab>
          </template>
          <TabPanel value="inbox" style="padding: 0 var(--spacing-4);">Inbox panel.</TabPanel>
          <TabPanel value="sent" style="padding: 0 var(--spacing-4);">Sent panel.</TabPanel>
          <TabPanel value="archive" style="padding: 0 var(--spacing-4);">Archive panel.</TabPanel>
        </Tabs>
      </div>
    `,
  }),
}

/** start / center / end — left / center / right when horizontal, top / middle / bottom when vertical. */
export const Placement: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab },
    setup: () => ({ placements, selected: ref('a') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6);">
        <Tabs
          v-for="placement in placements"
          :key="placement"
          :placement="placement"
          color="primary"
          v-model="selected"
          :label="'Placement ' + placement"
        >
          <template #tabs>
            <Tab value="a">{{ placement }}</Tab>
            <Tab value="b">Second</Tab>
          </template>
        </Tabs>
        <div style="display: flex; gap: var(--spacing-10); height: 260px; align-items: stretch;">
          <Tabs
            v-for="placement in placements"
            :key="placement"
            orientation="vertical"
            variant="inset"
            :placement="placement"
            color="primary"
            v-model="selected"
            :label="'Vertical placement ' + placement"
          >
            <template #tabs>
              <Tab value="a">{{ placement }}</Tab>
              <Tab value="b">Second</Tab>
            </template>
          </Tabs>
        </div>
      </div>
    `,
  }),
}

/** stretch: the tabs share 100% of the available width (or height when vertical). */
export const Stretch: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab },
    setup: () => ({ variants, selected: ref('a') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6);">
        <Tabs
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          color="primary"
          stretch
          v-model="selected"
          :label="'Stretch ' + variant"
        >
          <template #tabs>
            <Tab value="a">Music</Tab>
            <Tab value="b">Podcasts</Tab>
            <Tab value="c">Audiobooks</Tab>
          </template>
        </Tabs>
      </div>
    `,
  }),
}

/** Tab content: text, icon + text, or icon only (label carries the accessible name). */
export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab },
    setup: () => ({ variants, selected: ref('home'), selectedIcons: ref('list') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6); align-items: flex-start;">
        <Tabs
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          color="primary"
          v-model="selected"
          :label="'Icons ' + variant"
        >
          <template #tabs>
            <Tab value="home" icon-start="home">Home</Tab>
            <Tab value="favorites" icon-start="favorite">Favorites</Tab>
            <Tab value="profile" icon-start="person">Profile</Tab>
          </template>
        </Tabs>
        <Tabs
          v-for="variant in variants"
          :key="'icon-only-' + variant"
          :variant="variant"
          color="primary"
          v-model="selectedIcons"
          :label="'Icon-only ' + variant"
        >
          <template #tabs>
            <Tab value="list" icon="list" label="List view" />
            <Tab value="grid" icon="grid_view" label="Grid view" />
            <Tab value="map" icon="map" label="Map view" />
          </template>
        </Tabs>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab },
    setup: () => ({ variants, selected: ref('a') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6); align-items: flex-start;">
        <Tabs
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          color="primary"
          v-model="selected"
          :label="'Disabled ' + variant"
        >
          <template #tabs>
            <Tab value="a">Active</Tab>
            <Tab value="b" disabled>Disabled</Tab>
            <Tab value="c">Enabled</Tab>
          </template>
        </Tabs>
      </div>
    `,
  }),
}

/**
 * When the tabs overflow, the bar scrolls (wheel / trackpad / keyboard);
 * `scrollButtons` adds a button at each end — only while there is an
 * overflow — whose icons can be swapped via `scrollPrevIcon` / `scrollNextIcon`.
 */
export const Scrollable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs, Tab, TabPanel },
    setup: () => ({
      variants,
      tabs: [
        'Overview',
        'Activity',
        'Analytics',
        'Reports',
        'Members',
        'Integrations',
        'Notifications',
        'Billing',
        'Security',
        'Settings',
      ],
      selected: ref('Overview'),
      selectedVertical: ref('Overview'),
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-6); align-items: flex-start;">
        <Tabs
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          color="primary"
          scroll-buttons
          v-model="selected"
          :label="'Scrollable ' + variant"
          style="width: 420px;"
        >
          <template #tabs>
            <Tab v-for="tab in tabs" :key="tab" :value="tab">{{ tab }}</Tab>
          </template>
        </Tabs>
        <Tabs
          variant="line"
          color="primary"
          scroll-buttons
          scroll-prev-icon="arrow_back"
          scroll-next-icon="arrow_forward"
          v-model="selected"
          label="Scrollable with custom icons"
          style="width: 420px;"
        >
          <template #tabs>
            <Tab v-for="tab in tabs" :key="tab" :value="tab">{{ tab }}</Tab>
          </template>
        </Tabs>
        <Tabs
          orientation="vertical"
          variant="inset"
          color="primary"
          scroll-buttons
          v-model="selectedVertical"
          label="Scrollable vertical"
          style="height: 260px;"
        >
          <template #tabs>
            <Tab v-for="tab in tabs" :key="tab" :value="tab">{{ tab }}</Tab>
          </template>
        </Tabs>
      </div>
    `,
  }),
}
