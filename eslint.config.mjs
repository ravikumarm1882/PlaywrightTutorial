// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'blob-report/', 'test_data/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // This suite is Page-Object based: assertions are encapsulated in page
      // methods (e.g. homePage.expectTitle), which this rule can't see. Disable
      // it rather than emit false "no assertions" warnings.
      'playwright/expect-expect': 'off',
    },
  },
  {
    rules: {
      // The framework intentionally exports helper utilities not yet imported.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-empty-pattern': 'off', // `async ({}, use) => ...` is the Playwright fixture idiom.
    },
  },
  prettier,
);
