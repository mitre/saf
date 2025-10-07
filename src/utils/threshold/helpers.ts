import type {ContextualizedProfile, ContextualizedControl} from 'inspecjs'
import type {ThresholdCheck} from '../../types/threshold-validation.js'

/**
 * Filters profile to only include root controls (not extended controls).
 *
 * Extended controls are duplicates that inherit from other controls and should
 * be excluded from validation to avoid double-counting.
 *
 * @param profile - The contextualized profile
 * @returns Array of root controls only
 */
export function getRootControls(profile: ContextualizedProfile): ContextualizedControl[] {
  return profile.contains.filter(control => control.extendedBy.length === 0)
}

/**
 * Groups validation checks by their status.
 *
 * @param checks - Array of threshold checks
 * @returns Object with passed and failed check arrays
 */
export function groupChecksByStatus(checks: ThresholdCheck[]): {passed: ThresholdCheck[], failed: ThresholdCheck[]} {
  return {
    passed: checks.filter(c => c.status === 'passed'),
    failed: checks.filter(c => c.status === 'failed'),
  }
}

/**
 * Gets all failed checks from a check array.
 *
 * @param checks - Array of threshold checks
 * @returns Array of failed checks only
 */
export function getFailedChecks(checks: ThresholdCheck[]): ThresholdCheck[] {
  return checks.filter(c => c.status === 'failed')
}

/**
 * Gets all passed checks from a check array.
 *
 * @param checks - Array of threshold checks
 * @returns Array of passed checks only
 */
export function getPassedChecks(checks: ThresholdCheck[]): ThresholdCheck[] {
  return checks.filter(c => c.status === 'passed')
}
