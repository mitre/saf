const eslint = require("@eslint/js")
const tsPlugin = require("@typescript-eslint/eslint-plugin")
const tsParser = require("@typescript-eslint/parser")
// const chaiPlugin = require("eslint-plugin-chai-friendly")

//-----------------------------------------------------------------------------
// NOTE: The following plugins have been removed from the package.json file
// eslint-plugin-oclif linter repo has been archived
// eslint-config-oclif-typescript linter repo has been archived

//-----------------------------------------------------------------------------
// Eslint packages used:
// eslint – The core ESLint package. It is the base linter.
//
// typescript-eslint – Tooling which enables the use of TypeScript with ESLint.
//   This package is the entrypoint for consume additional tooling with ESLint.
//   The package exports the following:
//     config	 -> A utility function for creating type-safe flat configs
//     configs ->	Shared ESLint (flat) configs
//     parser	 -> A re-export of @typescript-eslint/parser
//     plugin	 -> A re-export of @typescript-eslint/eslint-plugin
//
// @typescript-eslint/parser – This parser allows ESLint to understand TypeScript
//   syntax. Without it, ESLint won’t be able to process TypeScript files correctly.
// @typescript-eslint/eslint-plugin – This ESLint plugin provides additional
//   TypeScript-specific rules.
//
// @eslint/js – This package provides core ESLint rules for JavaScript. It’s
//   necessary to allow ESLint to enforce JavaScript best practices.
//
// Optional package, but very useful for best practice:
// eslint-plugin-unicorn – A plugin that provides a collection of additional
//   rules that enforce best practices and modern JavaScript standards. It’s
//   optional but useful for enforcing stricter code quality.
//
// eslint-formatter-stylish – A package that provides a stylish formatter for
//   ESLint. It’s optional but useful for a more readable output.
//
// May need to use the chai plugin in the future
// npm install --save-dev eslint-plugin-chai-friendly
// And configure it into plugins: { "chai-friendly": chaiPLugin }

//-----------------------------------------------------------------------------
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


//-----------------------------------------------------------------------------
// Export the config
module.exports = [
  eslint.configs.recommended, // Recommended JS rules
  
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      // "chai-friendly": chaiPLugin
    },
    ignores: [
      '/node_modules',  // Ignore dependencies
      '/lib',           // Ignore build output
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Disallow 'any'      
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/typedef": "error",
      // "array-bracket-newline": ["warn", "never"],
      // "array-bracket-newline": ["warn", { "minItems": 8 }], // Break into new lines if 8+ items
      // "array-element-newline": ["error", { "minItems": 8 }],  // Enforce each item on a new line
      "camelcase": "off",
      "complexity": "off",
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "max-nested-callbacks": "off",
      "node/no-missing-import": "off",
      "no-control-regex": "off",
      "no-console": "off",
      "no-constant-condition": "off",
      "no-multi-spaces": "warn",   // Disallow multiple spaces except for alignment
      "no-process-exit": "off",
      "no-trailing-spaces": "warn", // Disallow spaces at the end of lines
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-unused-expressions": "error",
      "no-await-in-loop": "off",      
      "object-curly-spacing": ["warn", "never"],
      "quotes": ["error", "single", { "avoidEscape": true }], // Allows double quotes (") when escaping single quotes
      "semi": ["warn", "never"],
      "unicorn/filename-case": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/numeric-separators-style": "off",
      "unicorn/no-hex-escape": "off",
      "unicorn/better-regex": "off",
      "unicorn/no-zero-fractions": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/prefer-json-parse-buffer": "off",
    },
  },
];
