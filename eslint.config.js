module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // Enable ES2020 features
    sourceType: 'module', // Allow ES modules
  },
  extends: [
    'oclif',
    'oclif-typescript',
    'plugin:@typescript-eslint/recommended', // Include recommended settings for TypeScript
  ],
  plugins: ['@typescript-eslint'], // Use the TypeScript plugin
  env: {
    node: true, // Enable Node.js global variables and scope
    es2020: true, // Enable ES2020 globals
  },
  overrides: [
    {
      files: ['src/**/*.ts'], // Target all `.ts` files in the `src` directory
      rules: {
        // You can add or customize rules here
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Example rule customization
      },
    },
  ],
};
