import type {ContextualizedProfile, Severity} from 'inspecjs'
import type {ThresholdValues, ThresholdStatus} from '../../types/threshold.js'
import type {ValidationResult, ThresholdCheck} from '../../types/threshold-validation.js'
import {
  calculateCompliance,
  extractStatusCounts,
  getControlIdMap,
  renameStatusName,
} from './index.js'
import {severityTargetsObject, statusSeverityPaths, totalMin, totalMax} from './constants.js'
import _ from 'lodash'

// =============================================================================
// MAIN VALIDATION ORCHESTRATOR
// =============================================================================

/**
 * Main validation function - collects ALL checks before returning.
 *
 * Unlike the old implementation which exited on first failure, this function
 * validates all thresholds and returns a complete report of all checks.
 * This provides much better UX as users can see all issues at once.
 *
 * @param profile - The contextualized profile to validate
 * @param thresholds - The threshold configuration to validate against
 * @returns Complete validation result with all checks and summary
 *
 * @example
 * ```typescript
 * const result = validateThresholds(profile, thresholds);
 * if (result.passed) {
 *   console.log('All checks passed!');
 * } else {
 *   console.log(`Failed ${result.summary.failedChecks} of ${result.summary.totalChecks} checks`);
 * }
 * ```
 */
export function validateThresholds(
  profile: ContextualizedProfile,
  thresholds: ThresholdValues,
): ValidationResult {
  // Collect ALL validation checks (don't exit early!)
  const checks: ThresholdCheck[] = [
    ...validateCompliance(profile, thresholds),
    ...validateTotalCounts(profile, thresholds),
    ...validateSeverityCounts(profile, thresholds),
    ...validateControlIds(profile, thresholds),
  ]

  // Calculate summary statistics
  const passedChecks = checks.filter(c => c.status === 'passed')
  const failedChecks = checks.filter(c => c.status === 'failed')
  const overallStatusCounts = extractStatusCounts(profile)

  // Calculate total controls (excluding internal metrics)
  const totalControls = overallStatusCounts.Passed
    + overallStatusCounts.Failed
    + overallStatusCounts['Not Reviewed']
    + overallStatusCounts['Profile Error']
    + overallStatusCounts['Not Applicable']

  return {
    passed: failedChecks.length === 0,
    checks,
    summary: {
      totalChecks: checks.length,
      passedChecks: passedChecks.length,
      failedChecks: failedChecks.length,
      totalControls,
      compliance: thresholds.compliance ? calculateCompliance(overallStatusCounts) : undefined,
      complianceRequired: thresholds.compliance,
    },
  }
}

// =============================================================================
// INDIVIDUAL VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates compliance percentage thresholds.
 *
 * Checks both minimum and maximum compliance requirements if specified.
 *
 * @param profile - The contextualized profile to validate
 * @param thresholds - The threshold configuration
 * @returns Array of compliance check results
 */
export function validateCompliance(
  profile: ContextualizedProfile,
  thresholds: ThresholdValues,
): ThresholdCheck[] {
  if (!thresholds.compliance) {
    return []
  }

  const checks: ThresholdCheck[] = []
  const statusCounts = extractStatusCounts(profile)
  const actual = calculateCompliance(statusCounts)

  // Check minimum compliance
  if (thresholds.compliance.min !== undefined) {
    const passed = actual >= thresholds.compliance.min
    checks.push({
      path: 'compliance.min',
      type: 'compliance',
      status: passed ? 'passed' : 'failed',
      actual,
      expected: {min: thresholds.compliance.min},
      violation: passed ? undefined : {
        type: 'below',
        amount: thresholds.compliance.min - actual,
        details: `Compliance is ${actual}%, required ≥${thresholds.compliance.min}%`,
      },
    })
  }

  // Check maximum compliance
  if (thresholds.compliance.max !== undefined) {
    const passed = actual <= thresholds.compliance.max
    checks.push({
      path: 'compliance.max',
      type: 'compliance',
      status: passed ? 'passed' : 'failed',
      actual,
      expected: {max: thresholds.compliance.max},
      violation: passed ? undefined : {
        type: 'exceeds',
        amount: actual - thresholds.compliance.max,
        details: `Compliance is ${actual}%, required ≤${thresholds.compliance.max}%`,
      },
    })
  }

  return checks
}

/**
 * Validates total control counts across all severities.
 *
 * Checks total counts for passed, failed, skipped, error, and no_impact statuses.
 *
 * @param profile - The contextualized profile to validate
 * @param thresholds - The threshold configuration
 * @returns Array of total count check results
 */
export function validateTotalCounts(
  profile: ContextualizedProfile,
  thresholds: ThresholdValues,
): ThresholdCheck[] {
  const checks: ThresholdCheck[] = []
  const statusCounts = extractStatusCounts(profile)

  // Validate exact match totals (legacy format: passed.total as number)
  const exactMatchPaths = ['passed.total', 'failed.total', 'skipped.total', 'no_impact.total', 'error.total']
  for (const path of exactMatchPaths) {
    const threshold = _.get(thresholds, path)
    if (threshold !== undefined && typeof threshold === 'number') {
      const [statusName] = path.split('.')
      const actual = _.get(statusCounts, renameStatusName(statusName)) as number
      const passed = actual === threshold

      checks.push({
        path,
        type: 'count',
        status: passed ? 'passed' : 'failed',
        actual,
        expected: {exact: threshold},
        severity: 'total',
        statusType: statusName as ThresholdStatus,
        violation: passed ? undefined : {
          type: actual > threshold ? 'exceeds' : 'below',
          amount: Math.abs(actual - threshold),
          details: `Expected exactly ${threshold} controls, got ${actual}`,
        },
      })
    }
  }

  // Validate total minimums
  for (const path of totalMin) {
    const threshold = _.get(thresholds, path) as number | undefined
    if (threshold !== undefined) {
      const [statusName] = path.split('.')
      const actual = _.get(statusCounts, renameStatusName(statusName)) as number
      const passed = actual >= threshold

      checks.push({
        path,
        type: 'count',
        status: passed ? 'passed' : 'failed',
        actual,
        expected: {min: threshold},
        severity: 'total',
        statusType: statusName as ThresholdStatus,
        violation: passed ? undefined : {
          type: 'below',
          amount: threshold - actual,
          details: `Total ${statusName} controls (${actual}) is less than minimum (${threshold})`,
        },
      })
    }
  }

  // Validate total maximums
  for (const path of totalMax) {
    const threshold = _.get(thresholds, path) as number | undefined
    if (threshold !== undefined) {
      const [statusName] = path.split('.')
      const actual = _.get(statusCounts, renameStatusName(statusName)) as number
      const passed = actual <= threshold

      checks.push({
        path,
        type: 'count',
        status: passed ? 'passed' : 'failed',
        actual,
        expected: {max: threshold},
        severity: 'total',
        statusType: statusName as ThresholdStatus,
        violation: passed ? undefined : {
          type: 'exceeds',
          amount: actual - threshold,
          details: `Total ${statusName} controls (${actual}) exceeds maximum (${threshold})`,
        },
      })
    }
  }

  return checks
}

/**
 * Validates control counts by severity level.
 *
 * Checks counts for each status/severity combination (e.g., passed.critical, failed.high).
 *
 * @param profile - The contextualized profile to validate
 * @param thresholds - The threshold configuration
 * @returns Array of severity-specific count check results
 */
export function validateSeverityCounts(
  profile: ContextualizedProfile,
  thresholds: ThresholdValues,
): ThresholdCheck[] {
  const checks: ThresholdCheck[] = []

  for (const [severity, targetPaths] of Object.entries(severityTargetsObject)) {
    const statusCounts = extractStatusCounts(profile, severity)

    for (const path of targetPaths) {
      const threshold = _.get(thresholds, path) as number | undefined
      if (threshold === undefined) continue

      const [statusName, , thresholdType] = path.split('.')
      const actual = _.get(statusCounts, renameStatusName(statusName)) as number

      let passed = false
      if (thresholdType === 'min') {
        passed = actual >= threshold
      } else if (thresholdType === 'max') {
        passed = actual <= threshold
      }

      checks.push({
        path,
        type: 'count',
        status: passed ? 'passed' : 'failed',
        actual,
        expected: thresholdType === 'min' ? {min: threshold} : {max: threshold},
        severity: severity as Severity | 'none',
        statusType: statusName as ThresholdStatus,
        violation: passed ? undefined : {
          type: thresholdType === 'min' ? 'below' : 'exceeds',
          amount: Math.abs(actual - threshold),
          details: `${severity} severity ${statusName} controls (${actual}) ${thresholdType === 'min' ? '<' : '>'} ${thresholdType} (${threshold})`,
        },
      })
    }
  }

  return checks
}

/**
 * Validates that specific control IDs have expected status/severity combinations.
 *
 * Checks if the specified control IDs in the threshold match the actual
 * control IDs found in the profile for each status/severity combination.
 *
 * @param profile - The contextualized profile to validate
 * @param thresholds - The threshold configuration
 * @returns Array of control ID validation check results
 */
export function validateControlIds(
  profile: ContextualizedProfile,
  thresholds: ThresholdValues,
): ThresholdCheck[] {
  const checks: ThresholdCheck[] = []
  const actualControlMap = getControlIdMap(profile)

  for (const [severity, paths] of Object.entries(statusSeverityPaths)) {
    for (const path of paths) {
      const expectedControls = _.get(thresholds, path) as string[] | undefined
      if (!expectedControls || !Array.isArray(expectedControls) || expectedControls.length === 0) {
        continue
      }

      const actualControls = _.get(actualControlMap, path) as string[] | undefined || []

      const expectedSet = new Set(expectedControls)
      const actualSet = new Set(actualControls)

      const missing = expectedControls.filter(id => !actualSet.has(id))
      const unexpected = actualControls.filter(id => !expectedSet.has(id))

      const passed = missing.length === 0 && unexpected.length === 0

      checks.push({
        path,
        type: 'control_id',
        status: passed ? 'passed' : 'failed',
        actual: actualControls,
        expected: {controls: expectedControls},
        severity: severity as Severity | 'none',
        violation: passed ? undefined : {
          type: 'mismatch',
          details: `Missing: ${missing.length}, Unexpected: ${unexpected.length}`,
          expected: missing,
          actual: unexpected,
        },
      })
    }
  }

  return checks
}
