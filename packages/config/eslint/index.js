import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const generatedApiRestriction = {
  group: ['@pharm/api-client/src/generated/**'],
  message: 'Generated API clients must be wrapped by package/domain API facades before app code uses them.',
}

const domainInternalRestriction = {
  group: ['@domains/*/*', '@domains/*/*/**', '@/domains/*/*', '@/domains/*/*/**'],
  message: 'Import a domain through its public @domains/{name} barrel instead of internal files.',
}

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/node_modules/**',
      '**/.turbo/**',
      'packages/api-client/src/generated/**',
      'packages/tokens/src/css/**',
      'packages/tokens/src/scss/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['apps/*/src/**/*.{js,ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [generatedApiRestriction],
        },
      ],
    },
  },
  {
    files: ['apps/*/src/app/**/*.{js,ts,vue}', 'apps/*/src/routes/**/*.{js,ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [generatedApiRestriction, domainInternalRestriction],
        },
      ],
    },
  },
  {
    files: ['apps/*/src/routes/**/*.{js,ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            generatedApiRestriction,
            domainInternalRestriction,
            {
              group: ['@app/**', '@/app/**'],
              message: 'Routes must stay as route records and must not import the app layer.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/*/src/domains/**/*.{js,ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            generatedApiRestriction,
            {
              group: ['@app/**', '@/app/**', '@routes/**', '@/routes/**', '@domains/**', '@/domains/**'],
              message:
                'Domains may import shared code only; compose app, route, or other domain code outside the slice.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/*/src/shared/**/*.{js,ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            generatedApiRestriction,
            {
              group: ['@app/**', '@/app/**', '@routes/**', '@/routes/**', '@domains/**', '@/domains/**'],
              message: 'Shared code must not depend on app, routes, or domains.',
            },
          ],
        },
      ],
    },
  },
  prettier,
)
