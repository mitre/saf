import type {Severity} from 'inspecjs'
import type {ThresholdStatus} from '../../types/threshold.js'
import {STATUSES, SEVERITIES} from './constants.js'

// =============================================================================
// TYPE GUARD FUNCTIONS
// =============================================================================

/**
 * Type guard to check if a string is a valid threshold status.
 *
 * Validates against the known set of threshold status values:
 * 'passed', 'failed', 'skipped', 'error', 'no_impact'
 *
 * @param value - The value to check
 * @returns True if value is a valid ThresholdStatus, with type narrowing
 *
 * @example
 * ```typescript
 * const status = 'passed'
 * if (isValidStatus(status)) {
 *   // TypeScript knows status is ThresholdStatus here
 *   const mapped = STATUS_NAME_MAP[status]
 * }
 * ```
 */
export function isValidStatus(value: string): value is ThresholdStatus {
  return STATUSES.includes(value as ThresholdStatus)
}

/**
 * Type guard to check if a string is a valid severity level.
 *
 * Validates against all severity levels including special values:
 * 'critical', 'high', 'medium', 'low', 'total', 'none'
 *
 * @param value - The value to check
 * @returns True if value is a valid severity level, with type narrowing
 *
 * @example
 * ```typescript
 * const sev = 'critical'
 * if (isValidSeverity(sev)) {
 *   // TypeScript knows sev is Severity | 'total' | 'none' here
 *   processThreshold(sev)
 * }
 * ```
 */
export function isValidSeverity(value: string): value is Severity | 'total' | 'none' {
  return SEVERITIES.includes(value as Severity | 'total' | 'none')
}

/**
 * Type guard to check if a string is a valid threshold type (min or max).
 *
 * @param value - The value to check
 * @returns True if value is 'min' or 'max', with type narrowing
 *
 * @example
 * ```typescript
 * const type = 'min'
 * if (isValidThresholdType(type)) {
 *   // TypeScript knows type is 'min' | 'max' here
 *   threshold[type] = value
 * }
 * ```
 */
export function isValidThresholdType(value: string): value is 'min' | 'max' | 'controls' {
  return value === 'min' || value === 'max' || value === 'controls'
}

/**
 * Validates if a string is a properly formatted threshold key.
 *
 * Valid formats:
 * - Two-part: "compliance.min" or "compliance.max"
 * - Three-part: "status.severity.type" (e.g., "passed.critical.min")
 *
 * @param key - The key to validate
 * @returns True if the key is a valid threshold key format
 *
 * @example
 * ```typescript
 * isThresholdKey('compliance.min')        // true
 * isThresholdKey('passed.critical.min')   // true
 * isThresholdKey('invalid.key')           // false
 * isThresholdKey('too.many.parts.here')   // false
 * ```
 */
export function isThresholdKey(key: string): boolean {
  const parts = key.split('.')

  // Two-part key: compliance.min or compliance.max
  if (parts.length === 2) {
    const [left, right] = parts
    return left === 'compliance' && isValidThresholdType(right)
  }

  // Three-part key: status.severity.type
  if (parts.length === 3) {
    const [status, severity, type] = parts
    return isValidStatus(status) && isValidSeverity(severity) && isValidThresholdType(type)
  }

  return false
}

/**
 * Validates if a string is a properly formatted control ID path key.
 *
 * Valid format: "status.severity.controls" (e.g., "passed.critical.controls")
 *
 * @param key - The key to validate
 * @returns True if the key is a valid control ID path format
 *
 * @example
 * ```typescript
 * isControlIdKey('passed.critical.controls')  // true
 * isControlIdKey('failed.high.controls')      // true
 * isControlIdKey('passed.critical.min')       // false (not a controls key)
 * ```
 */
export function isControlIdKey(key: string): boolean {
  const parts = key.split('.')

  if (parts.length !== 3) {
    return false
  }

  const [status, severity, suffix] = parts
  return isValidStatus(status) && isValidSeverity(severity) && suffix === 'controls'
}

/**
 * Type guard to check if a value is a non-negative finite number.
 *
 * Used for validating threshold count values.
 *
 * @param value - The value to check
 * @returns True if value is a valid threshold count (non-negative finite number)
 *
 * @example
 * ```typescript
 * isValidThresholdCount(10)      // true
 * isValidThresholdCount(-5)      // false
 * isValidThresholdCount(Infinity) // false
 * isValidThresholdCount(NaN)     // false
 * ```
 */
export function isValidThresholdCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

/**
 * Type guard to check if a value is a valid compliance percentage.
 *
 * Valid range: 0-100 (inclusive)
 *
 * @param value - The value to check
 * @returns True if value is a valid compliance percentage
 *
 * @example
 * ```typescript
 * isValidCompliancePercentage(66)   // true
 * isValidCompliancePercentage(100)  // true
 * isValidCompliancePercentage(101)  // false
 * isValidCompliancePercentage(-1)   // false
 * ```
 */
export function isValidCompliancePercentage(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}
