import { defineConfig } from 'orval'

export default defineConfig({
  pharm: {
    input: {
      target: './openapi.json',
    },
    output: {
      target: './src/generated/pharm.ts',
      client: 'fetch',
      mode: 'single',
      mock: true,
    },
  },
})
