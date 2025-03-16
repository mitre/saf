/* eslint-disable no-undef */
const stylish = require("eslint-formatter-stylish"); // Use the official package

/**
 * Custom ESLint formatter used to output results to the console.
 * 
 * @param {Array} results ESLint results
 * @returns {String} Formatted results
 * @see https://eslint.org/docs/developer-guide/working-with-custom-formatters
 * @see https://eslint.org/docs/developer-guide/working-with-formatters
 * 
 */
// module.exports = function customFormatter(results) {
  module.exports = (results) => {
  const totalFiles = results.length;
  let totalFixes = 0;
  let errorCount = 0
  let hasIssues = false;
  let wasFixed = false;

  results.forEach((result) => {
    totalFixes += result.fixableErrorCount + result.fixableWarningCount;
    errorCount += result.errorCount;
    if (result.output) {
      wasFixed = true; // If output exists, ESLint applied fixes
    }

    if (result.errorCount > 0 || result.warningCount > 0) {
      hasIssues = true;
    }
  });

  console.log(`\x1B[94m✔  ESLint total scanned files: ${totalFiles}\x1B[0m`);
  
  //if (hasIssues) {
  if (totalFixes > 0) {
    console.log(`\x1B[93m🔧 Fixable issues: ${totalFixes}\x1B[0m`);
  }
  
  if (errorCount > 0) {
    console.log(`\x1B[91m❌ Linting issues found: ${errorCount}\x1B[0m`);
  }

  if (wasFixed) {
    console.log(`\x1B[92m✅ Some issues were automatically fixed (via --fix).\x1B[0m`);
  } else if (!hasIssues) {
    console.log('\x1B[92m✅ No linting issues found.\x1B[0m');
  }

  return stylish(results); // Use the standard stylish formatter for output
};
