import chalk from 'chalk'
import {table} from 'table'
import YAML from 'yaml'
import type {ValidationResult, ThresholdCheck, OutputOptions} from '../../types/threshold-validation.js'
import {getFailedChecks, getPassedChecks} from './helpers.js'

// =============================================================================
// OUTPUT FORMATTING
// =============================================================================

const CHECK_MARK = '✓'
const CROSS_MARK = '✗'

/**
 * Formats a validation result according to the specified output options.
 */
const DEFAULT_OPTIONS: OutputOptions = {
  format: 'default',
  showPassed: false,
  colors: true,
  includeControlIds: true,
}

export function formatValidationResult(
  result: ValidationResult,
  options: OutputOptions = DEFAULT_OPTIONS,
): string {
  switch (options.format) {
    case 'json': {
      return JSON.stringify(result, null, 2)
    }
    case 'yaml': {
      return YAML.stringify(result) // Inline - simple one-liner
    }
    case 'markdown': {
      return formatMarkdown(result, options)
    }
    case 'junit': {
      return formatJUnitXML(result)
    }
    case 'quiet': {
      return ''
    }
    case 'detailed': {
      return formatDetailed(result, options)
    }
    default: {
      return formatDefault(result, options)
    }
  }
}

// Default format
function formatDefault(result: ValidationResult, options: OutputOptions): string {
  const lines: string[] = []

  if (result.passed) {
    lines.push(colorize(`${CHECK_MARK} All threshold validations passed`, 'green', options.colors))
    if (result.summary.compliance !== undefined) {
      const req = result.summary.complianceRequired
      const reqStr = req?.min ? `≥${req.min}%` : req?.max ? `≤${req.max}%` : ''
      lines.push(colorize(`  • Compliance: ${result.summary.compliance}% (${reqStr} required)`, 'gray', options.colors))
    }
    lines.push(colorize(`  • ${result.summary.totalChecks}/${result.summary.totalChecks} threshold checks passed`, 'gray', options.colors))
  } else {
    const failed = getFailedChecks(result.checks)
    lines.push(colorize(`${CROSS_MARK} Threshold validation failed (${failed.length}/${result.summary.totalChecks} checks)`, 'red', options.colors), '', colorize('Failed:', 'red-bold', options.colors))
    for (const check of failed) {
      lines.push(colorize(`  • ${check.path}: ${formatViolationBrief(check)}`, 'red', options.colors))
    }
    if (result.summary.passedChecks > 0) {
      lines.push('', colorize(`Passed: ${result.summary.passedChecks} other checks passed`, 'gray', options.colors))
    }
  }

  return lines.join('\n')
}

// Detailed format with tables
function formatDetailed(result: ValidationResult, options: OutputOptions): string {
  const lines: string[] = []
  const header = result.passed
    ? `${CHECK_MARK} All Threshold Validations Passed`
    : `${CROSS_MARK} Threshold Validation Failed (${result.summary.failedChecks}/${result.summary.totalChecks})`

  lines.push(formatBox(header, result.passed ? 'green' : 'red', options.colors), '')

  if (result.summary.compliance !== undefined) {
    lines.push(colorize('📊 Compliance Summary', 'bold', options.colors))
    const compCheck = result.checks.find(c => c.path.startsWith('compliance'))
    const status = compCheck?.status === 'passed' ? CHECK_MARK : CROSS_MARK
    const req = result.summary.complianceRequired
    const reqStr = req?.min ? `≥ ${req.min}%` : req?.max ? `≤ ${req.max}%` : ''
    lines.push(`  Overall Compliance: ${result.summary.compliance}% (${reqStr} required) ${status}`, '')
  }

  const failedChecks = getFailedChecks(result.checks)
  if (failedChecks.length > 0) {
    lines.push(colorize(`❌ FAILED CHECKS (${failedChecks.length})`, 'red-bold', options.colors), formatChecksTable(failedChecks, 'failed'), '')
  }

  if (options.showPassed) {
    const passedChecks = getPassedChecks(result.checks)
    if (passedChecks.length > 0) {
      lines.push(colorize(`✓ PASSED CHECKS (${passedChecks.length})`, 'green-bold', options.colors), formatChecksTable(passedChecks, 'passed'), '')
    }
  }

  lines.push(colorize('📊 Summary', 'bold', options.colors), `  • Total Controls: ${result.summary.totalControls}`)
  if (result.summary.compliance !== undefined) {
    lines.push(`  • Compliance: ${result.summary.compliance}%`)
  }
  lines.push(`  • Checks: ${result.summary.passedChecks}/${result.summary.totalChecks} passed`)

  if (!result.passed) {
    lines.push('', colorize('💡 Recommendations', 'yellow-bold', options.colors), generateRecommendations(result))
  }

  return lines.join('\n')
}

// Markdown table format
function formatMarkdown(result: ValidationResult, options: OutputOptions): string {
  const lines: string[] = []

  // Header
  lines.push(`# Threshold Validation ${result.passed ? 'Passed ✓' : 'Failed ✗'}`, '', '## Summary', '', `- **Status**: ${result.passed ? '✓ Passed' : '✗ Failed'}`, `- **Checks**: ${result.summary.passedChecks}/${result.summary.totalChecks} passed`)
  if (result.summary.compliance !== undefined) {
    lines.push(`- **Compliance**: ${result.summary.compliance}%`)
  }
  lines.push(`- **Total Controls**: ${result.summary.totalControls}`, '')

  // Failed checks table
  const failedChecks = getFailedChecks(result.checks)
  if (failedChecks.length > 0) {
    lines.push('## Failed Checks', '', '| Check | Actual | Required | Violation |', '|-------|--------|----------|-----------|')
    for (const check of failedChecks) {
      lines.push(`| ${check.path} | ${formatActualValue(check)} | ${formatExpectedValue(check)} | ${formatViolationBrief(check)} |`)
    }
    lines.push('')
  }

  // Passed checks (if requested)
  if (options.showPassed) {
    const passedChecks = getPassedChecks(result.checks)
    if (passedChecks.length > 0) {
      lines.push('## Passed Checks', '', '| Check | Actual | Required |', '|-------|--------|----------|')
      for (const check of passedChecks) {
        lines.push(`| ${check.path} | ${formatActualValue(check)} | ${formatExpectedValue(check)} |`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// JUnit XML format (for CI/CD)
function formatJUnitXML(result: ValidationResult): string {
  const testcases: string[] = []

  for (const check of result.checks) {
    const name = check.path
    const classname = `threshold.${check.type}`

    if (check.status === 'passed') {
      testcases.push(`    <testcase name="${escapeXML(name)}" classname="${escapeXML(classname)}"/>`)
    } else {
      const message = check.violation?.details || formatViolationBrief(check)
      testcases.push(`    <testcase name="${escapeXML(name)}" classname="${escapeXML(classname)}">`, `      <failure message="${escapeXML(message)}">`, `Actual: ${escapeXML(String(check.actual))}`, `Expected: ${escapeXML(formatExpectedValue(check))}`)
      if (check.violation) {
        testcases.push(`Violation: ${escapeXML(check.violation.type)} by ${escapeXML(String(check.violation.amount || ''))}`)
      }
      testcases.push('      </failure>', '    </testcase>')
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<testsuites name="Threshold Validation" tests="${result.summary.totalChecks}" failures="${result.summary.failedChecks}">`,
    `  <testsuite name="Threshold Checks" tests="${result.summary.totalChecks}" failures="${result.summary.failedChecks}" errors="0">`,
    ...testcases,
    '  </testsuite>',
    '</testsuites>',
  ]

  return xml.join('\n')
}

// =============================================================================
// FILTERING UTILITIES
// =============================================================================

/**
 * Result of filtering operation with metadata about what was filtered.
 */
export interface FilteredResult {
  result: ValidationResult
  originalFailureCount: number
  filteredOutFailureCount: number
  filteredOutCheckCount: number
}

/**
 * Filters validation result by severity and/or status.
 *
 * Returns both the filtered result and metadata about what was filtered out,
 * enabling transparency warnings when validation scope is reduced.
 *
 * @param result - The validation result to filter
 * @param severities - Array of severities to include (undefined = all)
 * @param statuses - Array of statuses to include (undefined = all)
 * @returns Filtered result with metadata about filtered items
 */
export function filterValidationResult(
  result: ValidationResult,
  severities?: string[],
  statuses?: string[],
): FilteredResult {
  const originalFailureCount = getFailedChecks(result.checks).length
  const originalCheckCount = result.checks.length

  let filteredChecks = result.checks

  if (severities && severities.length > 0) {
    filteredChecks = filteredChecks.filter(c =>
      c.severity && severities.includes(c.severity),
    )
  }

  if (statuses && statuses.length > 0) {
    filteredChecks = filteredChecks.filter(c =>
      c.statusType && statuses.includes(c.statusType),
    )
  }

  // Recalculate summary for filtered checks
  const passedChecks = getPassedChecks(filteredChecks)
  const failedChecks = getFailedChecks(filteredChecks)

  const filteredResult: ValidationResult = {
    ...result,
    passed: failedChecks.length === 0,
    checks: filteredChecks,
    summary: {
      ...result.summary,
      totalChecks: filteredChecks.length,
      passedChecks: passedChecks.length,
      failedChecks: failedChecks.length,
    },
  }

  return {
    result: filteredResult,
    originalFailureCount,
    filteredOutFailureCount: originalFailureCount - failedChecks.length,
    filteredOutCheckCount: originalCheckCount - filteredChecks.length,
  }
}

// Helper functions
function escapeXML(unsafe: string): string {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

function colorize(text: string, style: string, useColors: boolean): string {
  if (!useColors) return text

  switch (style) {
    case 'green': { return chalk.green(text)
    }
    case 'red': { return chalk.red(text)
    }
    case 'yellow': { return chalk.yellow(text)
    }
    case 'gray': { return chalk.gray(text)
    }
    case 'bold': { return chalk.bold(text)
    }
    case 'green-bold': { return chalk.green.bold(text)
    }
    case 'red-bold': { return chalk.red.bold(text)
    }
    case 'yellow-bold': { return chalk.yellow.bold(text)
    }
    default: { return text
    }
  }
}

function formatBox(text: string, color: 'green' | 'red' | 'yellow', useColors: boolean): string {
  const width = text.length + 4
  const top = '╔' + '═'.repeat(width) + '╗'
  const middle = '║  ' + text + '  ║'
  const bottom = '╚' + '═'.repeat(width) + '╝'
  const boxText = [top, middle, bottom].join('\n')

  return colorize(boxText, color, useColors)
}

function formatChecksTable(checks: ThresholdCheck[], type: 'passed' | 'failed'): string {
  const headers = type === 'failed'
    ? ['Check', 'Actual', 'Required', 'Violation']
    : ['Check', 'Actual', 'Required', 'Status']

  const rows = checks.map(check => [
    check.path,
    formatActualValue(check),
    formatExpectedValue(check),
    type === 'failed' ? formatViolationBrief(check) : `${CHECK_MARK} PASS`,
  ])

  return table([headers, ...rows], {
    border: {
      topBody: '─', topJoin: '┬', topLeft: '┌', topRight: '┐',
      bottomBody: '─', bottomJoin: '┴', bottomLeft: '└', bottomRight: '┘',
      bodyLeft: '│', bodyRight: '│', bodyJoin: '│',
      joinBody: '─', joinLeft: '├', joinRight: '┤', joinJoin: '┼',
    },
  })
}

function formatActualValue(check: ThresholdCheck): string {
  if (Array.isArray(check.actual)) return `${check.actual.length} controls`
  if (check.type === 'compliance') return `${check.actual}%`
  return String(check.actual)
}

function formatExpectedValue(check: ThresholdCheck): string {
  const exp = check.expected
  const isComp = check.type === 'compliance'
  if (exp.min !== undefined && exp.max !== undefined) {
    return isComp ? `${exp.min}-${exp.max}%` : `${exp.min}-${exp.max}`
  }
  if (exp.min !== undefined) return isComp ? `≥ ${exp.min}%` : `≥ ${exp.min}`
  if (exp.max !== undefined) return isComp ? `≤ ${exp.max}%` : `≤ ${exp.max}`
  if (exp.exact !== undefined) return `= ${exp.exact}`
  if (exp.controls) return `${exp.controls.length} specific controls`
  return ''
}

function formatViolationBrief(check: ThresholdCheck): string {
  if (!check.violation) return ''

  const actual = typeof check.actual === 'number' ? check.actual : check.actual.length
  const threshold = check.expected.min || check.expected.max || check.expected.exact
  const unit = check.type === 'compliance' ? '%' : ''

  switch (check.violation.type) {
    case 'exceeds': {
      return `${actual}${unit} > ${threshold}${unit} (exceeds by ${check.violation.amount}${unit})`
    }
    case 'below': {
      return `${actual}${unit} < ${threshold}${unit} (below by ${check.violation.amount}${unit})`
    }
    case 'mismatch': {
      return check.violation.details || 'Control ID mismatch'
    }
    default: {
      return 'Failed'
    }
  }
}

function generateRecommendations(result: ValidationResult): string {
  const failed = result.checks.filter(ch => ch.status === 'failed')
  const recommendations: string[] = []

  const compFailures = failed.filter(ch => ch.type === 'compliance' && ch.violation?.type === 'below')
  if (compFailures.length > 0 && compFailures[0].violation?.amount) {
    recommendations.push(`  Improve compliance by ${compFailures[0].violation.amount}% to meet threshold`)
  }

  const countExceeds = failed.filter(ch => ch.type === 'count' && ch.violation?.type === 'exceeds')
  if (countExceeds.length > 0) {
    const total = countExceeds.reduce((sum, ch) => sum + (Number(ch.violation?.amount) || 0), 0)
    recommendations.push(`  Address ${total} controls that exceed failure thresholds`)
  }

  return recommendations.length > 0
    ? recommendations.join('\n')
    : '  Review threshold configuration or improve security posture'
}
