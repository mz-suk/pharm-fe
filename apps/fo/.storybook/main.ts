import { fileURLToPath, URL } from 'node:url'

import type { StorybookConfig } from '@storybook/vue3-vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta',
    },
  },
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url)),
          '@app': fileURLToPath(new URL('../src/app', import.meta.url)),
          '@routes': fileURLToPath(new URL('../src/routes', import.meta.url)),
          '@domains': fileURLToPath(new URL('../src/domains', import.meta.url)),
          '@shared': fileURLToPath(new URL('../src/shared', import.meta.url)),
        },
      },
    }),
}

export default config
