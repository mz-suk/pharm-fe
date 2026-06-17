import type { App } from 'vue'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 30 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
    },
    mutations: {
      retry: false,
    },
  },
})

export function installProviders(app: App) {
  app.use(createPinia())
  app.use(VueQueryPlugin, { queryClient })
  app.use(ElementPlus)
}
