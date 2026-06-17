import { definePharmVueAppConfig } from '@pharm/config/vite/vue-app'

export default definePharmVueAppConfig({
  appConfigUrl: import.meta.url,
  port: 5174,
})
