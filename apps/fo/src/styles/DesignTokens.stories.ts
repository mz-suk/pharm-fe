import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'

import './design-tokens.story.scss'

const semanticColors = [
  ['Text primary', 'var(--pharm-color-text-primary)'],
  ['Text secondary', 'var(--pharm-color-text-secondary)'],
  ['Canvas', 'var(--pharm-color-bg-canvas)'],
  ['Surface', 'var(--pharm-color-bg-surface)'],
  ['Border', 'var(--pharm-color-border-default)'],
  ['Success', 'var(--pharm-color-feedback-success)'],
  ['Error', 'var(--pharm-color-feedback-error)'],
] as const

const spacingTokens = [
  ['0', 'var(--pharm-spacing-0)'],
  ['4', 'var(--pharm-spacing-4)'],
  ['8', 'var(--pharm-spacing-8)'],
] as const

const DesignTokens = defineComponent({
  name: 'DesignTokens',
  setup() {
    return {
      semanticColors,
      spacingTokens,
    }
  },
  template: `
    <section class="tokens-story">
      <h1>Semantic tokens</h1>

      <div class="tokens-story__grid">
        <article
          v-for="[label, value] in semanticColors"
          :key="label"
          class="tokens-story__swatch"
        >
          <span class="tokens-story__color" :style="{ background: value }" />
          <strong>{{ label }}</strong>
          <code>{{ value }}</code>
        </article>
      </div>

      <h2>Spacing</h2>
      <div class="tokens-story__spacing-list">
        <article
          v-for="[label, value] in spacingTokens"
          :key="label"
          class="tokens-story__spacing"
        >
          <span>{{ label }}</span>
          <i :style="{ width: value }" />
          <code>{{ value }}</code>
        </article>
      </div>
    </section>
  `,
})

const meta = {
  title: 'Foundation/Design Tokens',
  component: DesignTokens,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DesignTokens>

export default meta

type Story = StoryObj<typeof meta>

export const SemanticTokens: Story = {}
