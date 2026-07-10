import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Menu from './Menu.vue'
import MenuItem from './MenuItem.vue'
import MenuLabel from './MenuLabel.vue'
import MenuSeparator from './MenuSeparator.vue'
import Button from '../button/Button.vue'
import ButtonIcon from '../button-icon/ButtonIcon.vue'

const placements = [
  'bottom-start',
  'bottom',
  'bottom-end',
  'top-start',
  'top',
  'top-end',
  'left',
  'right',
] as const

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: placements,
      description: 'Preferred side; flips automatically when it would overflow the viewport',
    },
    disabled: { control: 'boolean' },
    dense: {
      control: 'boolean',
      description: 'Tighter vertical rhythm and smaller icons; submenus inherit it',
    },
  },
  args: {
    placement: 'bottom-start',
    disabled: false,
    dense: false,
  },
  render: (args) => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    setup: () => ({ args }),
    template: `
      <Menu v-bind="args">
        <Button icon-end="expand_more">Options</Button>
        <template #items>
          <MenuItem icon-start="edit" label="Rename" />
          <MenuItem icon-start="content_copy" label="Duplicate" sublabel="Creates a copy next to the original" />
          <MenuItem icon-start="download" label="Download" />
          <MenuSeparator />
          <MenuItem icon-start="delete" label="Delete" color="danger" />
        </template>
      </Menu>
    `,
  }),
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * A `#submenu` slot on a MenuItem turns it into a nested menu: the
 * trailing icon becomes a chevron and the panel opens sideways (hover,
 * click, or ArrowRight). Submenus nest to any depth.
 */
export const Submenus: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    template: `
      <Menu>
        <Button icon-end="expand_more">File</Button>
        <template #items>
          <MenuItem icon-start="note_add" label="New file" />
          <MenuItem icon-start="share" label="Share">
            <template #submenu>
              <MenuItem icon-start="mail" label="Email" sublabel="Send as attachment" />
              <MenuItem icon-start="link" label="Copy link" />
              <MenuItem icon-start="groups" label="Team">
                <template #submenu>
                  <MenuItem label="Everyone" />
                  <MenuItem label="Designers" />
                  <MenuItem label="Engineers" />
                </template>
              </MenuItem>
            </template>
          </MenuItem>
          <MenuItem icon-start="drive_file_move" label="Move to" disabled>
            <template #submenu>
              <MenuItem label="Archive" />
            </template>
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon-start="delete" label="Delete" color="danger" />
        </template>
      </Menu>
    `,
  }),
}

/**
 * `dense` tightens the vertical rhythm and shrinks the icons — for
 * data-heavy surfaces (tables, toolbars) where the menu should stay
 * compact. Submenus inherit the density of their root menu.
 */
export const Dense: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    template: `
      <div style="display: flex; gap: var(--spacing-6); align-items: center;">
        <Menu>
          <Button variant="outlined" icon-end="expand_more">Default</Button>
          <template #items>
            <MenuItem icon-start="edit" label="Rename" />
            <MenuItem icon-start="content_copy" label="Duplicate" />
            <MenuItem icon-start="share" label="Share">
              <template #submenu>
                <MenuItem icon-start="mail" label="Email" />
                <MenuItem icon-start="link" label="Copy link" />
              </template>
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon-start="delete" label="Delete" color="danger" />
          </template>
        </Menu>
        <Menu dense>
          <Button variant="outlined" icon-end="expand_more">Dense</Button>
          <template #items>
            <MenuItem icon-start="edit" label="Rename" />
            <MenuItem icon-start="content_copy" label="Duplicate" />
            <MenuItem icon-start="share" label="Share">
              <template #submenu>
                <MenuItem icon-start="mail" label="Email" />
                <MenuItem icon-start="link" label="Copy link" />
              </template>
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon-start="delete" label="Delete" color="danger" />
          </template>
        </Menu>
      </div>
    `,
  }),
}

/** MenuLabel groups related items under a muted heading; MenuSeparator draws a full-bleed rule. */
export const GroupsAndSeparators: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Menu, MenuItem, MenuLabel, MenuSeparator, ButtonIcon },
    template: `
      <Menu>
        <ButtonIcon icon="more_vert" variant="text" label="More actions" />
        <template #items>
          <MenuLabel label="Workspace" />
          <MenuItem icon-start="settings" label="Settings" />
          <MenuItem icon-start="group_add" label="Invite members" sublabel="3 seats remaining" />
          <MenuSeparator />
          <MenuLabel label="Account" />
          <MenuItem icon-start="person" label="Profile" />
          <MenuItem icon-start="logout" label="Sign out" />
        </template>
      </Menu>
    `,
  }),
}

/**
 * Items come in three colors (`neutral`, `primary`, `danger`) and can be
 * disabled; the hover wash, icons and sublabel follow the color.
 */
export const ColorsAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    template: `
      <Menu>
        <Button icon-end="expand_more">Subscription</Button>
        <template #items>
          <MenuItem icon-start="workspace_premium" label="Upgrade to Pro" sublabel="Unlock every feature" color="primary" />
          <MenuItem icon-start="receipt_long" label="Billing history" />
          <MenuItem icon-start="redeem" label="Redeem code" disabled />
          <MenuSeparator />
          <MenuItem icon-start="cancel" label="Cancel subscription" sublabel="Effective at end of period" color="danger" />
        </template>
      </Menu>
    `,
  }),
}

/**
 * The `#end` slot replaces the trailing icon with custom content —
 * keyboard shortcuts, badges… Non-interactive content only: it renders
 * inside the item's `<button>`.
 */
export const CustomEndContent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Menu, MenuItem, MenuSeparator, Button },
    template: `
      <Menu>
        <Button icon-end="expand_more">Edit</Button>
        <template #items>
          <MenuItem icon-start="undo" label="Undo">
            <template #end>Ctrl+Z</template>
          </MenuItem>
          <MenuItem icon-start="content_cut" label="Cut">
            <template #end>Ctrl+X</template>
          </MenuItem>
          <MenuItem icon-start="content_paste" label="Paste">
            <template #end>Ctrl+V</template>
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon-start="cloud_done" label="Autosave" sublabel="Last saved 2 min ago">
            <template #end>
              <span style="padding: 2px 6px; border-radius: var(--radius-full); background: color-mix(in oklab, var(--color-success) 15%, transparent); color: var(--color-success); font-weight: var(--font-weight-medium);">On</span>
            </template>
          </MenuItem>
        </template>
      </Menu>
    `,
  }),
}

/**
 * The menu attaches to anything slotted as trigger. Keyboard support:
 * ArrowDown/ArrowUp open from the trigger, arrows + Home/End move,
 * ArrowRight/ArrowLeft dive in and out of submenus, Escape closes one
 * level, Tab closes everything and moves on.
 */
export const OnAnything: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Menu, MenuItem, Button, ButtonIcon },
    template: `
      <div style="display: flex; gap: var(--spacing-6); align-items: center;">
        <Menu>
          <ButtonIcon icon="more_horiz" variant="tonal" label="Row actions" />
          <template #items>
            <MenuItem icon-start="visibility" label="Preview" />
            <MenuItem icon-start="edit" label="Edit" />
          </template>
        </Menu>
        <Menu placement="bottom-end">
          <Button variant="outlined" icon-start="account_circle" icon-end="expand_more">xavier</Button>
          <template #items>
            <MenuItem icon-start="person" label="Profile" sublabel="xavier.darmet@gmail.com" />
            <MenuItem icon-start="logout" label="Sign out" color="danger" />
          </template>
        </Menu>
        <Menu placement="right">
          <span tabindex="0" role="button" style="font-family: var(--font-sans); color: var(--color-primary); cursor: pointer;">plain text trigger</span>
          <template #items>
            <MenuItem label="Anchored to a span" />
          </template>
        </Menu>
      </div>
    `,
  }),
}
