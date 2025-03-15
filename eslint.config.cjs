const js = require("@eslint/js");
const ts = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

//-----------------------------------------------------------------------------
// NOTE: The following plugins have been removed from the package.json file
// eslint-plugin-oclif linter repo has been archived
// eslint-config-oclif-typescript linter repo has been archived

// Export the final config
module.exports = [
  js.configs.recommended, // Recommended JS rules
  
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
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
      "no-process-exit": "off",
      "no-await-in-loop": "off",
      "no-control-regex": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-unused-expressions": "off",     
      "no-constant-condition": "off",       
      "max-nested-callbacks": "off",
      "camelcase": "off",
      "node/no-missing-import": "off",
      "complexity": "off",
      "indent": ["error", 2, { "SwitchCase": 1 }],
    },
  },
];
