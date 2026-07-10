import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AvatarGroup from './AvatarGroup.vue'
import Avatar from './Avatar.vue'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/* self-contained portrait so stories never depend on the network */
const portrait =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23b4c6dc'/%3E%3Ccircle cx='32' cy='24' r='11' fill='%23425466'/%3E%3Cpath d='M10 64a22 22 0 0 1 44 0z' fill='%23425466'/%3E%3C/svg%3E"

const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    maxItems: {
      control: { type: 'number', min: 1 },
      description: 'Max circles rendered; overflow collapses into a "+X" chip',
    },
    size: {
      control: 'select',
      options: sizes,
      description: 'Uniform size imposed on every child avatar',
    },
    label: { control: 'text', description: 'Accessible label of the group' },
  },
  args: {
    size: 'sm',
    label: 'Contributors',
  },
  render: (args) => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ args, portrait }),
    template: `
      <AvatarGroup v-bind="args">
        <Avatar name="Ada Lovelace" :src="portrait" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" icon="person" />
        <Avatar name="Edsger Dijkstra" />
      </AvatarGroup>
    `,
  }),
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * With more children than maxItems, the first maxItems - 1 avatars are shown
 * followed by a "+X" chip — never more than maxItems circles in total.
 */
export const MaxItems: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({
      names: [
        'Ada Lovelace',
        'Grace Hopper',
        'Alan Turing',
        'Katherine Johnson',
        'Edsger Dijkstra',
        'Barbara Liskov',
      ],
      limits: [3, 4, 6, undefined],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <div v-for="(limit, i) in limits" :key="i" style="display: flex; gap: var(--spacing-4); align-items: center;">
          <AvatarGroup :max-items="limit">
            <Avatar v-for="name in names" :key="name" :name="name" />
          </AvatarGroup>
          <span style="font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-muted);">
            maxItems: {{ limit ?? 'unset' }}
          </span>
        </div>
      </div>
    `,
  }),
}

/**
 * The group size wins over a child's own size prop (last group: the middle
 * avatar asks for xl but renders at the group's sm).
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ sizes, portrait }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-4); align-items: flex-start;">
        <AvatarGroup v-for="size in sizes" :key="size" :size="size" :label="'Group ' + size">
          <Avatar name="Ada Lovelace" :src="portrait" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" />
        </AvatarGroup>
        <AvatarGroup size="sm" label="Conflicting child size">
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" size="xl" />
          <Avatar name="Alan Turing" />
        </AvatarGroup>
      </div>
    `,
  }),
}

/** Children keep their own tooltip; the hovered avatar raises above its neighbors. */
export const WithTooltips: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({ portrait }),
    template: `
      <AvatarGroup label="Reviewers">
        <Avatar name="Ada Lovelace" :src="portrait" tooltip />
        <Avatar name="Grace Hopper" tooltip />
        <Avatar name="Alan Turing" tooltip="Alan Turing (owner)" />
        <Avatar name="Katherine Johnson" tooltip />
      </AvatarGroup>
    `,
  }),
}

/** v-for children arrive as a Fragment; the group flattens it before applying maxItems. */
export const FromArray: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { AvatarGroup, Avatar },
    setup: () => ({
      users: [
        { name: 'Ada Lovelace' },
        { name: 'Grace Hopper' },
        { name: 'Alan Turing' },
        { name: 'Katherine Johnson' },
        { name: 'Edsger Dijkstra' },
        { name: 'Barbara Liskov' },
        { name: 'Donald Knuth' },
      ],
    }),
    template: `
      <AvatarGroup :max-items="5" label="Team">
        <Avatar v-for="user in users" :key="user.name" :name="user.name" tooltip />
      </AvatarGroup>
    `,
  }),
}
