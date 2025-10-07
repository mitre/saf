import type {ThresholdStatus} from '../../types/threshold.js'
import type {Severity} from 'inspecjs'
import {isValidStatus, isValidSeverity, isValidThresholdType} from './type-guards.js'
import {ThresholdValidationError, VALIDATION_ERROR_CODES} from '../../types/threshold-validation.js'

/**
 * Parsed components of a threshold path.
 */
export interface ParsedThresholdPath {
  /** Status component (passed, failed, skipped, error, no_impact) */
  statusName: ThresholdStatus
  /** Severity component (critical, high, medium, low, total, none) or undefined for compliance */
  severity?: Severity | 'total' | 'none'
  /** Type component (min, max, controls) or undefined for 2-part paths */
  type?: 'min' | 'max' | 'controls'
}

/**
 * Parses a threshold path string into its components.
 *
 * Handles both 2-part paths (compliance.min) and 3-part paths (status.severity.type).
 *
 * @param path - The threshold path to parse (e.g., "passed.critical.min")
 * @returns Parsed path components
 *
 * @example
 * ```typescript
 * const {statusName, severity, type} = parseThresholdPath('passed.critical.min')
 * // statusName: 'passed', severity: 'critical', type: 'min'
 *
 * const {statusName, type} = parseThresholdPath('compliance.min')
 * // statusName: 'passed' (default), severity: undefined, type: 'min'
 * ```
 */
export function parseThresholdPath(path: string): ParsedThresholdPath {
  const parts = path.split('.')

  // Validate path length
  if (parts.length < 2 || parts.length > 3) {
    throw new ThresholdValidationError(
      `Invalid threshold path: "${path}". Expected 2-3 parts separated by dots.`,
      VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT,
      {path, parts: parts.length},
    )
  }

  if (parts.length === 2) {
    const [first, second] = parts

    // Check if this is a compliance path (compliance.min/max) or status.total path
    if (first === 'compliance') {
      // Validate type is min or max
      if (!isValidThresholdType(second)) {
        throw new ThresholdValidationError(
          `Invalid compliance threshold type: "${second}". Expected "min" or "max".`,
          VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT,
          {path, type: second},
        )
      }

      return {
        statusName: 'passed', // Default for compliance paths
        type: second as 'min' | 'max',
      }
    } else {
      // status.total path - validate status name
      if (!isValidStatus(first)) {
        throw new ThresholdValidationError(
          `Invalid status name: "${first}". Expected one of: passed, failed, skipped, error, no_impact.`,
          VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT,
          {path, status: first},
        )
      }

      return {
        statusName: first as ThresholdStatus,
        severity: 'total',
        type: undefined,
      }
    }
  }

  // 3-part path: status.severity.type
  const [statusName, severity, type] = parts

  // Validate each component
  if (!isValidStatus(statusName)) {
    throw new ThresholdValidationError(
      `Invalid status name: "${statusName}". Expected one of: passed, failed, skipped, error, no_impact.`,
      VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT,
      {path, status: statusName},
    )
  }

  if (!isValidSeverity(severity)) {
    throw new ThresholdValidationError(
      `Invalid severity: "${severity}". Expected one of: critical, high, medium, low, none, total.`,
      VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT,
      {path, severity},
    )
  }

  if (!isValidThresholdType(type)) {
    throw new ThresholdValidationError(
      `Invalid threshold type: "${type}". Expected "min", "max", or "controls".`,
      VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT,
      {path, type},
    )
  }

  return {
    statusName: statusName as ThresholdStatus,
    severity: severity as Severity | 'total' | 'none',
    type: type as 'min' | 'max' | 'controls',
  }
}
