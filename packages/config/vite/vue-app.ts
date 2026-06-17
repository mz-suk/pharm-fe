import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export interface PharmVueAppConfigOptions {
  appConfigUrl: string
  port: number
}

const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url))

export function definePharmVueAppConfig(options: PharmVueAppConfigOptions) {
  return defineConfig(({ mode }) => {
    const env = loadEnv(mode, workspaceRoot, '')

    return {
      plugins: [vue()],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', options.appConfigUrl)),
        },
      },
      server: {
        port: options.port,
        proxy: {
          '/api': {
            target: env.VITE_API_BASE_URL ?? 'http://localhost:8080',
            changeOrigin: true,
          },
        },
      },
    }
  })
}
