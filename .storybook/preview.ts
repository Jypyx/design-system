import type { Preview } from '@storybook/vue3-vite'
import '../src/styles/tokens/index.css'
import './preview.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },

  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'system',
    direction: 'ltr',
  },

  decorators: [
    (story, context) => {
      const theme = context.globals.theme as string
      if (theme === 'light' || theme === 'dark') {
        document.documentElement.dataset.theme = theme
      } else {
        delete document.documentElement.dataset.theme
      }
      const direction = context.globals.direction as string
      document.documentElement.dir = direction === 'rtl' ? 'rtl' : 'ltr'
      return story()
    },
  ],
}

export default preview
