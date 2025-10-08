import type {Severity} from 'inspecjs'
import type {ThresholdStatus} from '../../types/threshold.js'

// =============================================================================
// CORE TYPE DEFINITIONS
// =============================================================================

/**
 * All possible threshold status values.
 * Maps to the simplified status names used in threshold configurations.
 */
export const STATUSES: readonly ThresholdStatus[] = [
  'passed',
  'failed',
  'skipped',
  'error',
  'no_impact',
] as const

/**
 * All possible severity levels including special values.
 * Includes standard InSpec severities plus 'total' and 'none'.
 */
export const SEVERITIES: readonly (Severity | 'total' | 'none')[] = [
  'critical',
  'high',
  'medium',
  'low',
  'total',
  'none',
] as const

/**
 * Standard InSpec severity levels (excludes 'total' and 'none').
 */
export const STANDARD_SEVERITIES: readonly Severity[] = [
  'critical',
  'high',
  'medium',
  'low',
] as const

/**
 * Threshold value types (min/max).
 */
export const THRESHOLD_TYPES = ['min', 'max'] as const

/**
 * Key name for control ID arrays in thresholds.
 */
export const CONTROL_KEY = 'controls' as const

// =============================================================================
// STATUS NAME MAPPINGS
// =============================================================================

/**
 * HDF status names (formal names used in HDF data structures).
 */
export const HDF_STATUS_NAMES = {
  PASSED: 'Passed',
  FAILED: 'Failed',
  NOT_REVIEWED: 'Not Reviewed',
  NOT_APPLICABLE: 'Not Applicable',
  PROFILE_ERROR: 'Profile Error',
} as const

/**
 * Threshold status names (simplified names used in threshold configurations).
 */
export const THRESHOLD_STATUS_NAMES = {
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  NO_IMPACT: 'no_impact',
  ERROR: 'error',
} as const

/**
 * Bidirectional mapping between threshold status names and HDF status names.
 */
export const STATUS_NAME_MAP: Record<ThresholdStatus, string> = {
  [THRESHOLD_STATUS_NAMES.PASSED]: HDF_STATUS_NAMES.PASSED,
  [THRESHOLD_STATUS_NAMES.FAILED]: HDF_STATUS_NAMES.FAILED,
  [THRESHOLD_STATUS_NAMES.SKIPPED]: HDF_STATUS_NAMES.NOT_REVIEWED,
  [THRESHOLD_STATUS_NAMES.NO_IMPACT]: HDF_STATUS_NAMES.NOT_APPLICABLE,
  [THRESHOLD_STATUS_NAMES.ERROR]: HDF_STATUS_NAMES.PROFILE_ERROR,
} as const

/**
 * Reverse mapping from HDF status names to threshold status names.
 */
export const REVERSE_STATUS_NAME_MAP: Record<string, ThresholdStatus> = {
  [HDF_STATUS_NAMES.PASSED]: THRESHOLD_STATUS_NAMES.PASSED,
  [HDF_STATUS_NAMES.FAILED]: THRESHOLD_STATUS_NAMES.FAILED,
  [HDF_STATUS_NAMES.NOT_REVIEWED]: THRESHOLD_STATUS_NAMES.SKIPPED,
  [HDF_STATUS_NAMES.NOT_APPLICABLE]: THRESHOLD_STATUS_NAMES.NO_IMPACT,
  [HDF_STATUS_NAMES.PROFILE_ERROR]: THRESHOLD_STATUS_NAMES.ERROR,
} as const

// =============================================================================
// PROGRAMMATIC CONSTANT GENERATION
// =============================================================================

/**
 * Generates threshold path patterns for all status/severity combinations.
 *
 * Creates paths like: "passed.critical.min", "failed.high.max", etc.
 *
 * @returns Record mapping severity levels to their threshold path patterns
 *
 * @example
 * ```typescript
 * const targets = generateSeverityTargets()
 * // targets.critical => ['passed.critical.min', 'passed.critical.max', ...]
 * ```
 */
function generateSeverityTargets(): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  // Generate for standard severities (critical, high, medium, low)
  for (const severity of STANDARD_SEVERITIES) {
    result[severity] = STATUSES.flatMap(status =>
      THRESHOLD_TYPES.map(type => `${status}.${severity}.${type}`),
    )
  }

  // Special case: 'none' severity only applies to no_impact status
  result.none = THRESHOLD_TYPES.map(type => `no_impact.none.${type}`)

  return result
}

/**
 * Generates control ID validation paths for all status/severity combinations.
 *
 * Creates paths like: "passed.critical.controls", "failed.high.controls", etc.
 *
 * @returns Record mapping severity levels to their control ID path patterns
 *
 * @example
 * ```typescript
 * const paths = generateStatusSeverityPaths()
 * // paths.critical => ['passed.critical.controls', 'failed.critical.controls', ...]
 * ```
 */
function generateStatusSeverityPaths(): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  // Generate for standard severities (critical, high, medium, low)
  for (const severity of STANDARD_SEVERITIES) {
    result[severity] = STATUSES.map(status =>
      `${status}.${severity}.${CONTROL_KEY}`,
    )
  }

  // Special case: 'none' severity only applies to no_impact status
  result.none = [`no_impact.none.${CONTROL_KEY}`]

  return result
}

/**
 * Generates total threshold paths for a specific type (min or max).
 *
 * Creates paths like: "passed.total.min", "failed.total.max", etc.
 * Note: no_impact.total is excluded as it's not used in current implementation.
 *
 * @param type - The threshold type ('min' or 'max')
 * @returns Array of total threshold paths
 *
 * @example
 * ```typescript
 * const minPaths = generateTotalPaths('min')
 * // ['passed.total.min', 'failed.total.min', 'skipped.total.min', 'error.total.min']
 * ```
 */
function generateTotalPaths(type: 'min' | 'max'): string[] {
  // Exclude 'no_impact' as it doesn't use total.min/max in current implementation
  const statusesWithTotal: ThresholdStatus[] = ['passed', 'failed', 'skipped', 'error']
  return statusesWithTotal.map(status => `${status}.total.${type}`)
}

// =============================================================================
// EXPORTED CONSTANTS (Generated)
// =============================================================================

/**
 * Mapping of severity levels to their corresponding threshold path patterns.
 * Used for generating and validating severity-specific thresholds.
 *
 * Generated programmatically to eliminate duplication and ensure consistency.
 */
export const severityTargetsObject = generateSeverityTargets()

/**
 * Mapping of severity levels to control ID validation paths.
 * Used for validating that specific controls have expected status/severity combinations.
 *
 * Generated programmatically to eliminate duplication and ensure consistency.
 */
export const statusSeverityPaths = generateStatusSeverityPaths()

/**
 * Threshold paths for total minimum counts across all severities.
 *
 * Generated programmatically to eliminate duplication and ensure consistency.
 */
export const totalMin = generateTotalPaths('min')

/**
 * Threshold paths for total maximum counts across all severities.
 *
 * Generated programmatically to eliminate duplication and ensure consistency.
 */
export const totalMax = generateTotalPaths('max')

// =============================================================================
// EMPTY TEMPLATES
// =============================================================================

/**
 * Empty template for status and severity count structure.
 * Used as a baseline for initializing count objects.
 */
export const emptyStatusAndSeverityCounts = {
  passed: {
    critical: [],
    high: [],
    medium: [],
    low: [],
  },
  failed: {
    critical: [],
    high: [],
    medium: [],
    low: [],
  },
  skipped: {
    critical: [],
    high: [],
    medium: [],
    low: [],
  },
  no_impact: {
    critical: [],
    high: [],
    medium: [],
    low: [],
    none: [],
  },
  error: {
    critical: [],
    high: [],
    medium: [],
    low: [],
  },
} as const
