/* eslint-disable @stylistic/no-tabs */
/* eslint-disable unicorn/no-useless-fallback-in-spread */
/* eslint-disable no-undef */
// ----------------------------------------------------------------------------
// NOTE: The following plugins have been removed from the package.json file
// eslint-plugin-oclif linter repo has been archived
// eslint-config-oclif-typescript linter repo has been archived

// ----------------------------------------------------------------------------
// Eslint packages used:
// "eslint" –> The core ESLint package. It is the base linter.
// NOTE: Styles have moved from eslint to @stylistic/eslint-plugin (js and ts)
//       Built-in stylistic rules for JavaScript and Typescript
//       We are now using the @stylistic/eslint-plugin v4.x, it requires
//       dynamic loading (see notes bellow)
// "@stylistic/eslint-plugin" -> Used for general stylistic rules, which can be
//    applied to both JavaScript and TypeScript.
// See here for additional information on ESLint Stylistic Stylistic Formatting
// for ESLint https://eslint.style/
//
// "eslint-plugin-n" -> This package provides additional ESLint rules for Node.js
//    Originally the these were provided by the eslint-plugin-node that it is
//    no longer maintained
//
// "@eslint/js" –> This package provides core ESLint rules for JavaScript. It’s
//    necessary to allow ESLint to enforce JavaScript best practices.
//
// "typescript-eslint" –> Tooling which enables the use of TypeScript with ESLint.
//   This package is the entrypoint to consume additional tooling with ESLint.
//   The package exports the following:
//     config	 -> A utility function for creating type-safe flat configs
//     configs ->	Shared ESLint (flat) configs
//     parser	 -> A re-export of @typescript-eslint/parser
//     plugin	 -> A re-export of @typescript-eslint/eslint-plugin
// Notes: We still need to install the parser and plugin separately
// "@typescript-eslint/parser" –> This parser allows ESLint to understand TypeScript
//    syntax. Without it, ESLint won’t be able to process TypeScript files correctly.
// "@typescript-eslint/eslint-plugin" –> This ESLint plugin provides additional
//    TypeScript-specific rules.
//
// Optional package used that are very useful for best practice:
// "eslint-plugin-unicorn" –> A plugin that provides a collection of additional
//   rules that enforce best practices and modern JavaScript standards. It’s
//   optional but useful for enforcing stricter code quality.
//
// "eslint-formatter-stylish" –> A package that provides a stylish formatter for
//    ESLint. It’s optional but useful for a more readable output.
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// TODO: May need to use the chai plugin in the future // skipcq: JS-0099
// npm install --save-dev eslint-plugin-chai-friendly
// And configure it into plugins: { "chai-friendly": chaiPLugin }
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Eslint rules Settings
// Severity Levels ("off", "warn", "error")
//   "off"   -> Disables the rule.
//   "warn"  -> Show a warning, does not fail ESLint (does not affect exit code).
//   "error" -> Shows an error and makes ESLint fail (exit code is 1 when triggered).
// Examples:
//   "no-console": "warn" -> Shows a warning when `console.log` is used
//   "eqeqeq": "error"    -> Throws an error if `==` instead of `===` is used
//   "semi": "off"        -> Turns off semicolon checking
//
// Rule-Specific Settings ("always", "never", and More) take additional configuration
//   "always"     -> Enforces something (e.g., always require semicolons, newlines, etc.).
//   "never"      -> Prevents something (e.g., never allow semicolons, newlines, etc.).
//   "consistent" -> Enforces consistency (e.g., either all single-line or all multi-line).
//   { "minItems": X } ->	Requires a new line if an array/object has X or more items.
// Examples:
//   "semi": ["error", "always"], // Requires semicolons
//   "quotes": ["error", "never"], // Disallows quotes (uses backticks when possible)
//   "array-bracket-newline": ["error", { "minItems": 3 }] Forces newline for arrays with 3+ items
// ----------------------------------------------------------------------------
const eslint = require('@eslint/js')
const nodePlugin = require('eslint-plugin-n')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')

// ----------------------------------------------------------------------------
// ESLint configuration
module.exports = [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  eslint.configs.recommended, // Recommended JS rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'n': nodePlugin,
      // "chai-friendly": chaiPLugin
    },
    ignores: [
      '/node_modules', // Ignore dependencies
      '/lib', // Ignore build output
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // Disallow 'any'
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/typedef': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        'prefer': 'type-imports',
        'fixStyle': 'separate-type-imports',
      }],

      // eslint rules
      'camelcase': 'off',
      'complexity': ['warn', 30],
      'max-nested-callbacks': 'warn',

      'no-control-regex': 'warn',
      'no-console': 'off',
      'no-constant-condition': 'warn',
      'no-undef': 'off',
      'no-unused-expressions': 'error',
      'no-await-in-loop': 'off',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],

      // eslint-plugin-n rules (these were moved from eslint-plugin-node)
      'n/exports-style': [
        'error',
        'exports',
        {
          'allowBatchAssign': false,
        },
      ],
      'n/no-missing-import': 'off',
      'n/no-process-exit': 'off',
      'n/no-unpublished-import': [
        'error', {
          'ignoreTypeImport': true,
          'ignorePrivate': true,
        },
      ],
    },
  },

  // Unicorn (eslint-plugin-unicorn) and Stylistic (@stylistic/eslint-plugin)
  // are ESM-only module, need to import them dynamically inside an async
  // function. This causes node to display this warning:
  // (node:11996) ExperimentalWarning: Importing JSON modules is an experimental feature and might change at any time
  // This is cause by: const unicorn = await import("eslint-plugin-unicorn")

  // Load unicorn and @stylistic plugin dynamically
  (async () => {
    const unicorn = await import('eslint-plugin-unicorn')
    const stylisticPlugin = await import('@stylistic/eslint-plugin')

    return {
      plugins: {
        unicorn: unicorn.default, // Use `.default` because it's an ESM module
        '@stylistic': stylisticPlugin.default,
      },
      rules: {
        // Ensure that recommended rules exist before accessing them
        ...(unicorn.default.configs?.recommended?.rules || {}),
        'unicorn/better-regex': 'off',
        'unicorn/consistent-function-scoping': 'off',
        'unicorn/explicit-length-check': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/import-style': 'off',
        'unicorn/numeric-separators-style': 'off',
        'unicorn/prefer-node-protocol': 'off',
        'unicorn/prefer-module': 'off',
        'unicorn/prefer-code-point': 'off',
        'unicorn/prefer-json-parse-buffer': 'off',
        'unicorn/prefer-top-level-await': 'off',
        'unicorn/prefer-number-properties': 'off',
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/no-null': 'off',
        'unicorn/no-hex-escape': 'off',
        'unicorn/no-zero-fractions': 'off',
        'unicorn/no-array-for-each': 'off',
        'unicorn/no-process-exit': 'off',
        'unicorn/no-nested-ternary': 'off',
        'unicorn/no-named-default': 'off',

        // stylistic rules
        ...(stylisticPlugin.default.configs?.recommended?.rules || {}),
        '@stylistic/array-bracket-spacing': ['error', 'never'],
        '@stylistic/array-bracket-newline': ['warn', {'multiline': true}],
        '@stylistic/brace-style': ['error', '1tbs', {'allowSingleLine': true}],
        '@stylistic/indent': ['warn', 2, {'SwitchCase': 1}],
        '@stylistic/block-spacing': 'off',
        '@stylistic/quote-props': 'off',
        '@stylistic/multiline-ternary': 'off',
        '@stylistic/max-statements-per-line': ['warn', {'max': 1, 'ignoredNodes': ['BreakStatement']}],
        '@stylistic/no-multi-spaces': 'warn', // Disallow multiple spaces except for alignment
        '@stylistic/no-trailing-spaces': 'warn',
        '@stylistic/object-curly-spacing': ['warn', 'never'],
        '@stylistic/quotes': ['error', 'single', {'avoidEscape': true}], // Allows double quotes (") when escaping single quotes
        '@stylistic/semi': ['warn', 'never'],
      },
    }
  })(),
]
