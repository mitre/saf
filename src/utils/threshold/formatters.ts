import type {FlattenedThreshold, ProfileSummary, ThresholdValues} from '../../types/threshold.js'
import {ThresholdValidationError, VALIDATION_ERROR_CODES} from '../../types/threshold-validation.js'
import {isValidStatus, isValidSeverity, isThresholdKey, isValidThresholdCount, isValidCompliancePercentage} from './type-guards.js'

// =============================================================================
// THRESHOLD FORMAT CONVERSIONS
// =============================================================================

/**
 * Flattens a profile summary into dot-notation keys.
 *
 * Converts a nested profile summary structure into a flat object with
 * dot-notation keys. This is useful for creating inline threshold
 * specifications and for compatibility with legacy formats.
 *
 * @param threshold - Nested profile summary object
 * @returns Flattened object with dot-notation keys
 *
 * @example
 * ```typescript
 * const nested = {
 *   passed: { critical: 0, high: 11, total: 227 },
 *   failed: { critical: 0, high: 6, total: 112 }
 * };
 * const flattened = flattenProfileSummary(nested);
 * // Result: { 'passed.critical': 0, 'passed.high': 11, 'passed.total': 227, ... }
 * ```
 */
export function flattenProfileSummary(threshold: ProfileSummary): FlattenedThreshold {
  const result: FlattenedThreshold = {}

  for (const status of Object.keys(threshold)) {
    const statusData = threshold[status]
    if (statusData && typeof statusData === 'object') {
      for (const severity of Object.keys(statusData)) {
        result[`${status}.${severity}`] = statusData[severity]
      }
    }
  }

  return result
}

/**
 * Converts a flattened threshold object into a structured ThresholdValues object.
 *
 * This function transforms inline threshold specifications (with dot-notation keys)
 * into the structured format used by the threshold validation system.
 *
 * Performs comprehensive input validation:
 * - Validates threshold must be an object
 * - Validates all keys are properly formatted
 * - Validates all values are finite, non-negative numbers
 * - Validates compliance percentages are in 0-100 range
 *
 * @param threshold - Flattened threshold object with dot-notation keys
 * @returns Structured ThresholdValues object
 * @throws {ThresholdValidationError} If input is invalid
 *
 * @example
 * ```typescript
 * const flattened = {
 *   'compliance.min': 66,
 *   'passed.critical.min': 0,
 *   'failed.medium.max': 10
 * };
 * const structured = unflattenThreshold(flattened);
 * // Result: { compliance: { min: 66 }, passed: { critical: { min: 0 } }, ... }
 * ```
 */
export function unflattenThreshold(threshold: FlattenedThreshold): ThresholdValues {
  // Validate input type
  if (typeof threshold !== 'object' || threshold === null || Array.isArray(threshold)) {
    throw new ThresholdValidationError(
      'Threshold must be a non-null object',
      VALIDATION_ERROR_CODES.INVALID_THRESHOLD_FORMAT,
      {received: typeof threshold},
    )
  }

  // Validate all keys and values
  for (const [key, value] of Object.entries(threshold)) {
    // Validate key format
    if (!isThresholdKey(key)) {
      throw new ThresholdValidationError(
        `Invalid threshold key format: "${key}". Expected format: "compliance.type" or "status.severity.type"`,
        VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT,
        {key, validExamples: ['compliance.min', 'passed.critical.min', 'failed.high.max']},
      )
    }

    // Validate value is a number
    if (typeof value !== 'number') {
      throw new ThresholdValidationError(
        `Invalid value for "${key}": must be a number, got ${typeof value}`,
        VALIDATION_ERROR_CODES.INVALID_THRESHOLD_VALUE,
        {key, value, type: typeof value},
      )
    }

    // Validate value is finite
    if (!Number.isFinite(value)) {
      throw new ThresholdValidationError(
        `Invalid value for "${key}": must be a finite number, got ${value}`,
        VALIDATION_ERROR_CODES.NON_FINITE_VALUE,
        {key, value},
      )
    }

    // Validate value is non-negative
    if (value < 0) {
      throw new ThresholdValidationError(
        `Invalid value for "${key}": must be non-negative, got ${value}`,
        VALIDATION_ERROR_CODES.NEGATIVE_VALUE,
        {key, value},
      )
    }

    // Validate compliance percentage range (0-100)
    if (key.startsWith('compliance.') && !isValidCompliancePercentage(value)) {
      throw new ThresholdValidationError(
        `Invalid compliance value for "${key}": must be between 0-100, got ${value}`,
        VALIDATION_ERROR_CODES.INVALID_PERCENTAGE,
        {key, value, validRange: '0-100'},
      )
    }

    // Additional validation: count values should be valid
    if (!key.startsWith('compliance.') && !isValidThresholdCount(value)) {
      throw new ThresholdValidationError(
        `Invalid count value for "${key}": must be a non-negative finite number, got ${value}`,
        VALIDATION_ERROR_CODES.INVALID_THRESHOLD_VALUE,
        {key, value},
      )
    }
  }

  // Build the structured result
  const result: ThresholdValues = {}

  for (const key of Object.keys(threshold)) {
    const parts = key.split('.')
    const [left, middle, right] = parts

    if (left === 'compliance') {
      // Handle compliance threshold
      if (!result.compliance) {
        result.compliance = {}
      }
      if (middle === 'min' || middle === 'max') {
        result.compliance[middle] = threshold[key]
      }
    } else if (isValidStatus(left)) {
      // Handle status thresholds (type guard provides type safety)
      if (!result[left]) {
        result[left] = {}
      }

      if (right) {
        // Three-part key: status.severity.type (e.g., passed.critical.min)
        const statusThresholds = result[left]
        if (!statusThresholds) {
          continue
        }

        if (isValidSeverity(middle)) {
          // Type guard ensures middle is valid severity
          if (!statusThresholds[middle]) {
            statusThresholds[middle] = {}
          }
          const severityThreshold = statusThresholds[middle]
          if (severityThreshold && (right === 'min' || right === 'max')) {
            severityThreshold[right] = threshold[key]
          }
        }
      }
      // Note: Two-part keys (status.type) are not supported in the modern format
      // All threshold values should be three-part (status.severity.type)
    }
  }

  return result
}
