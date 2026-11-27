import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import n from 'eslint-plugin-n';

export default defineConfig([
  {
    ignores: ['lib/**', 'dist/**', 'test/sample_data/**'],
  },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  unicorn.configs.recommended,
  stylistic.configs.customize({
    braceStyle: '1tbs',
    indent: [2, { SwitchCase: 1 }],
    semi: true,
    quoteProps: 'as-needed',
    quotes: 'single',
  }),
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.js', 'vitest.config.ts'],
        },
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      unicorn,
      n,
    },
    rules: {
      // any is unfortunately used frequently throughout our types as a shortcut around dealing with parsing json for the most part.  it'll take time to rework things to make our types safer
      curly: 'error',
      'prefer-object-has-own': 'error',
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      'unicorn/consistent-boolean-name': ['error', { prefixes: { with: true } }],
      'unicorn/filename-case': ['error', { case: 'snakeCase' }],
      'unicorn/max-nested-calls': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prefer-number-coercion': 'off',
      'unicorn/prefer-smaller-scope': ['error', { checkTypeAliases: false }],
      'unicorn/prefer-split-limit': 'off',
    },
  },
]);
