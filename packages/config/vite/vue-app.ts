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
    const appSrc = new URL('./src/', options.appConfigUrl)

    return {
      plugins: [vue()],
      resolve: {
        alias: {
          '@': fileURLToPath(appSrc),
          '@app': fileURLToPath(new URL('./app', appSrc)),
          '@routes': fileURLToPath(new URL('./routes', appSrc)),
          '@domains': fileURLToPath(new URL('./domains', appSrc)),
          '@shared': fileURLToPath(new URL('./shared', appSrc)),
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
