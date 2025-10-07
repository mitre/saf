import type {ContextualizedProfile, ControlStatus, Severity} from 'inspecjs'
import type {StatusHash} from '../../types/threshold.js'

// =============================================================================
// THRESHOLD CALCULATION FUNCTIONS
// =============================================================================

/**
 * Extracts status counts from a profile, optionally filtered by severity.
 *
 * This function analyzes all controls in a profile and counts them by status.
 * It also provides detailed test-level metrics for passed and failed controls.
 *
 * @param profile - The contextualized profile to analyze
 * @param severity - Optional severity filter (critical, high, medium, low)
 * @returns StatusHash containing counts for each status type and test metrics
 *
 * @example
 * ```typescript
 * const allCounts = extractStatusCounts(profile);
 * const criticalCounts = extractStatusCounts(profile, 'critical');
 * console.log(`Total passed: ${allCounts.Passed}`);
 * console.log(`Critical failed: ${criticalCounts.Failed}`);
 * ```
 */
export function extractStatusCounts(profile: ContextualizedProfile, severity?: string): StatusHash {
  const hash: StatusHash = {
    Failed: 0,
    'From Profile': 0,
    'Not Applicable': 0,
    'Not Reviewed': 0,
    Passed: 0,
    'Profile Error': 0,
    PassedTests: 0,
    FailedTests: 0,
    PassingTestsFailedControl: 0,
    Waived: 0,
  }

  // Filter to only include root controls (not extended controls)
  const rootControls = profile.contains.filter(control => control.extendedBy.length === 0)

  for (const c of rootControls) {
    const control = c.root
    const status: ControlStatus = control.hdf.status
    const controlSeverity: Severity = control.hdf.severity

    // Apply severity filter if specified
    if (!severity || (controlSeverity === severity)) {
      ++hash[status]

      // Calculate test-level metrics
      const segments = control.hdf.segments || []

      if (status === 'Passed') {
        hash.PassedTests += segments.length
      } else if (status === 'Failed') {
        hash.PassingTestsFailedControl += segments.filter(s => s.status === 'passed').length
        hash.FailedTests += segments.filter(s => s.status === 'failed').length
      } else if (status === 'Not Applicable' && control.hdf.waived) {
        hash.Waived += segments.length
      }
    }
  }

  return hash
}

/**
 * Calculates compliance percentage from status counts.
 *
 * Compliance is calculated as the percentage of passed controls out of all
 * controls that have a definitive status (passed, failed, not reviewed, or error).
 * Not applicable controls are excluded from the calculation.
 *
 * @param statusHash - Status counts from extractStatusCounts
 * @returns Compliance percentage (0-100), rounded to nearest integer
 *
 * @example
 * ```typescript
 * const counts = extractStatusCounts(profile);
 * const compliance = calculateCompliance(counts);
 * console.log(`Compliance: ${compliance}%`);
 * ```
 */
export function calculateCompliance(statusHash: StatusHash): number {
  const total = statusHash.Passed + statusHash.Failed + statusHash['Not Reviewed'] + statusHash['Profile Error']

  if (total === 0) {
    return 0
  }

  return Math.round((100 * statusHash.Passed) / total)
}

/**
 * Validates a condition and throws an error if the condition is true.
 *
 * This function is used throughout the threshold validation process to check
 * compliance requirements. It logs an error message and throws an exception
 * when validation fails, allowing the caller to handle the error appropriately.
 *
 * @param condition - The condition to evaluate. If true, an error will be thrown.
 * @param reason - Optional error message. If not provided, a default message is used.
 * @throws Error with the provided reason or default message if condition is true
 *
 * @example
 * ```typescript
 * try {
 *   exitNonZeroIfTrue(actualCount < minCount, 'Minimum threshold not met');
 * } catch (error) {
 *   process.exitCode = 1;
 *   return;
 * }
 * ```
 */
export function exitNonZeroIfTrue(condition: boolean, reason?: string): void {
  if (condition) {
    const errorMessage = reason || 'Compliance levels were not met'
    console.error(`Error: ${errorMessage}`)
    throw new Error(errorMessage)
  }
}
