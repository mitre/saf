import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import n from 'eslint-plugin-n';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'lib/**', 'dist/**', 'test/sample_data/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  unicorn.configs.recommended,
  stylistic.configs.customize({
    braceStyle: '1tbs',
    indent: [2, { SwitchCase: 1 }],
    semi: true,
    quoteProps: 'as-needed',
    quotes: 'single',
  }),
  {
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      unicorn,
      n,
    },
    rules: {
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/no-explicit-any': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
]);

// module.exports = [
//     rules: {
//       '@typescript-eslint/no-explicit-any': 'error', // Disallow 'any'
//       '@typescript-eslint/no-unused-vars': 'warn',
//       '@typescript-eslint/typedef': 'error',
//
//       // eslint rules
//       'camelcase': 'off',
//       'complexity': ['warn', 30],
//       'max-nested-callbacks': 'warn',
//
//       'no-control-regex': 'warn',
//       'no-console': 'off',
//       'no-constant-condition': 'warn',
//       'no-undef': 'off',
//       'no-unused-expressions': 'error',
//       'no-await-in-loop': 'off',
//       'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
//
//       // eslint-plugin-n rules (these were moved from eslint-plugin-node)
//       'n/exports-style': [
//         'error',
//         'exports',
//         {
//           'allowBatchAssign': false,
//         },
//       ],
//       'n/no-missing-import': 'off',
//       'n/no-process-exit': 'off',
//       'n/no-unpublished-import': [
//         'error', {
//           'ignoreTypeImport': true,
//           'ignorePrivate': true,
//         },
//       ],
//     },
//   },
//
//   // Unicorn (eslint-plugin-unicorn) and Stylistic (@stylistic/eslint-plugin)
//   // are ESM-only module, need to import them dynamically inside an async
//   // function. This causes node to display this warning:
//   // (node:11996) ExperimentalWarning: Importing JSON modules is an experimental feature and might change at any time
//   // This is cause by: const unicorn = await import("eslint-plugin-unicorn")
//
//   // Load unicorn and @stylistic plugin dynamically
//   (async () => {
//     const unicorn = await import('eslint-plugin-unicorn')
//     const stylisticPlugin = await import('@stylistic/eslint-plugin')
//
//     return {
//       plugins: {
//         unicorn: unicorn.default, // Use `.default` because it's an ESM module
//         '@stylistic': stylisticPlugin.default,
//       },
//       rules: {
//         // Ensure that recommended rules exist before accessing them
//         ...(unicorn.default.configs?.recommended?.rules || {}),
//         'unicorn/better-regex': 'off',
//         'unicorn/consistent-function-scoping': 'off',
//         'unicorn/explicit-length-check': 'off',
//         'unicorn/filename-case': 'off',
//         'unicorn/import-style': 'off',
//         'unicorn/numeric-separators-style': 'off',
//         'unicorn/prefer-node-protocol': 'off',
//         'unicorn/prefer-module': 'off',
//         'unicorn/prefer-code-point': 'off',
//         'unicorn/prefer-json-parse-buffer': 'off',
//         'unicorn/prefer-top-level-await': 'off',
//         'unicorn/prefer-number-properties': 'off',
//         'unicorn/prevent-abbreviations': 'off',
//         'unicorn/no-null': 'off',
//         'unicorn/no-hex-escape': 'off',
//         'unicorn/no-zero-fractions': 'off',
//         'unicorn/no-array-for-each': 'off',
//         'unicorn/no-process-exit': 'off',
//         'unicorn/no-nested-ternary': 'off',
//         'unicorn/no-named-default': 'off',
//
//         // stylistic rules
//         ...(stylisticPlugin.default.configs?.recommended?.rules || {}),
//         '@stylistic/array-bracket-spacing': ['error', 'never'],
//         '@stylistic/array-bracket-newline': ['warn', {'multiline': true}],
//         '@stylistic/brace-style': ['error', '1tbs', {'allowSingleLine': true}],
//         '@stylistic/indent': ['warn', 2, {'SwitchCase': 1}],
//         '@stylistic/block-spacing': 'off',
//         '@stylistic/quote-props': 'off',
//         '@stylistic/multiline-ternary': 'off',
//         '@stylistic/max-statements-per-line': ['warn', {'max': 1, 'ignoredNodes': ['BreakStatement']}],
//         '@stylistic/no-multi-spaces': 'warn', // Disallow multiple spaces except for alignment
//         '@stylistic/no-trailing-spaces': 'warn',
//         '@stylistic/object-curly-spacing': ['warn', 'never'],
//         '@stylistic/quotes': ['error', 'single', {'avoidEscape': true}], // Allows double quotes (") when escaping single quotes
//         '@stylistic/semi': ['warn', 'never'],
//       },
//     }
//   })(),
// ]
