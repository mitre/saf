import type {ThresholdStatus} from '../../types/threshold.js'
import type {Severity} from 'inspecjs'

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

  if (parts.length === 2) {
    const [first, second] = parts

    // Check if this is a compliance path (compliance.min/max) or status.total path
    return first === 'compliance'
      ? {
        statusName: 'passed', // Default for compliance paths
        type: second as 'min' | 'max',
      }
      : {
        statusName: first as ThresholdStatus,
        severity: 'total',
        type: undefined,
      }
  }

  // 3-part path: status.severity.type
  const [statusName, severity, type] = parts
  return {
    statusName: statusName as ThresholdStatus,
    severity: severity as Severity | 'total' | 'none',
    type: type as 'min' | 'max' | 'controls',
  }
}
