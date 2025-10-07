import type {ContextualizedProfile, ContextualizedControl} from 'inspecjs'
import type {ThresholdCheck} from '../../types/threshold-validation.js'

/**
 * Type-safe getter for nested object properties.
 * Replaces lodash.get() with native TypeScript implementation.
 *
 * @param obj - The object to query
 * @param path - The path to get (dot-separated)
 * @returns The value at path, or undefined if not found
 */
export function getNestedValue<T = unknown>(obj: unknown, path: string): T | undefined {
  let current: unknown = obj
  for (const key of path.split('.')) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return current as T | undefined
}

/**
 * Type-safe setter for nested object properties.
 * Replaces lodash.set() with native TypeScript implementation.
 *
 * @param obj - The object to modify
 * @param path - The path to set (dot-separated)
 * @param value - The value to set
 */
export function setNestedValue(obj: Record<string, unknown> | object, path: string, value: unknown): void {
  const mutableObj = obj as Record<string, unknown>
  const keys = path.split('.')
  const lastKey = keys.pop()!

  // Navigate to the target object
  let target: Record<string, unknown> = mutableObj
  for (const key of keys) {
    if (!(key in target) || typeof target[key] !== 'object' || target[key] === null) {
      target[key] = {}
    }

    target = target[key] as Record<string, unknown>
  }

  target[lastKey] = value
}

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
