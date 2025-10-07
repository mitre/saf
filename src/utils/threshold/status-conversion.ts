import type {ThresholdStatus} from '../../types/threshold.js'
import {STATUS_NAME_MAP, REVERSE_STATUS_NAME_MAP, HDF_STATUS_NAMES} from './constants.js'

// =============================================================================
// STATUS NAME CONVERSION FUNCTIONS
// =============================================================================

/**
 * Converts threshold status names to HDF status names.
 *
 * Maps the simplified status names used in threshold configurations
 * to the formal status names used in HDF data structures.
 *
 * @param statusName - Threshold status name (passed, failed, skipped, no_impact, error)
 * @returns Corresponding HDF status name
 *
 * @example
 * ```typescript
 * const hdfStatus = renameStatusName('passed'); // Returns 'Passed'
 * const hdfStatus2 = renameStatusName('no_impact'); // Returns 'Not Applicable'
 * ```
 */
export function renameStatusName(statusName: string): string {
  // Use the constant mapping for better maintainability
  if (statusName in STATUS_NAME_MAP) {
    return STATUS_NAME_MAP[statusName as ThresholdStatus]
  }

  // Default to Profile Error for unknown statuses
  return HDF_STATUS_NAMES.PROFILE_ERROR
}

/**
 * Converts HDF status names to threshold status names.
 *
 * Maps the formal HDF status names to the simplified status names
 * used in threshold configurations. This is the inverse of renameStatusName.
 *
 * @param statusName - HDF status name
 * @returns Corresponding threshold status name
 *
 * @example
 * ```typescript
 * const thresholdStatus = reverseStatusName('Passed'); // Returns 'passed'
 * const thresholdStatus2 = reverseStatusName('Not Applicable'); // Returns 'no_impact'
 * ```
 */
export function reverseStatusName(statusName: string): ThresholdStatus {
  // Use the constant mapping for better maintainability
  if (statusName in REVERSE_STATUS_NAME_MAP) {
    return REVERSE_STATUS_NAME_MAP[statusName]
  }

  // Default to error for unknown statuses
  return 'error'
}
