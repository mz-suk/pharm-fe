import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'

import '@pharm/tokens/css'
import '../src/styles/main.scss'
import { installProviders } from '../src/app/providers'

setup((app) => {
  installProviders(app)
})

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
