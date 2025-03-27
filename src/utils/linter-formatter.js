/* eslint-disable no-undef */
const stylish = require('eslint-formatter-stylish') // Use the official package

/**
 * Formats the results of an ESLint run and logs summary information to the console.
 *
 * @param {Array<Object>} results - An array of result objects from ESLint.
 * @param {number} results[].errorCount - The number of errors found in the file.
 * @param {number} results[].warningCount - The number of warnings found in the file.
 * @param {number} results[].fixableErrorCount - The number of fixable errors found in the file.
 * @param {number} results[].fixableWarningCount - The number of fixable warnings found in the file.
 * @param {string} [results[].output] - The fixed source code, if any fixes were applied.
 * @returns {string} The formatted results using the standard stylish formatter.
 *
 * @see https://eslint.org/docs/developer-guide/working-with-formatters
 * @see https://eslint.org/docs/developer-guide/working-with-custom-formatters
 */
const linterFormatter = (results) => {
  const totalFiles = results.length
  let totalFixes = 0
  let errorCount = 0
  let hasIssues = false
  let wasFixed = false

  results.forEach((result) => {
    totalFixes += result.fixableErrorCount + result.fixableWarningCount
    errorCount += result.errorCount

    if (result.output) {
      wasFixed = true // If output exists, ESLint applied fixes
    }

    if (result.errorCount > 0 || result.warningCount > 0) {
      hasIssues = true
    }
  })

  console.log(`\x1B[94m✔  ESLint total file(s) scanned: ${totalFiles}\x1B[0m`)

  if (totalFixes > 0) {
    console.log(`\x1B[93m🔧 Fixable issues: ${totalFixes}\x1B[0m`)
  }

  if (errorCount > 0) {
    console.log(`\x1B[91m❌ Linting issues found: ${errorCount}\x1B[0m`)
  }

  if (wasFixed) {
    console.log('\x1B[92m✅ Some issues were automatically fixed (via --fix).\x1B[0m')
  } else if (!hasIssues) {
    console.log('\x1B[92m✅ No linting issues found.\x1B[0m')
  }

  return stylish(results) // Use the standard stylish formatter for output
}

module.exports = linterFormatter
