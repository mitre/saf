import type {Severity} from 'inspecjs'
import type {ThresholdStatus} from './threshold.js'

// =============================================================================
// VALIDATION CHECK TYPES
// =============================================================================

/**
 * Type of threshold check being performed.
 */
export type ThresholdCheckType = 'compliance' | 'count' | 'control_id'

/**
 * Status of a validation check.
 */
export type CheckStatus = 'passed' | 'failed'

/**
 * Type of violation when a threshold check fails.
 */
export type ViolationType = 'exceeds' | 'below' | 'mismatch' | 'missing_control' | 'unexpected_control'

/**
 * Expected threshold values for a check.
 */
export interface ExpectedThreshold {
  /** Minimum value required */
  min?: number
  /** Maximum value allowed */
  max?: number
  /** Exact value required (for exact match thresholds) */
  exact?: number
  /** Expected control IDs (for control ID validation) */
  controls?: string[]
}

/**
 * Details about a threshold violation.
 */
export interface ThresholdViolation {
  /** Type of violation that occurred */
  type: ViolationType
  /** Numeric amount of violation (for exceeds/below) */
  amount?: number
  /** Detailed description of the violation */
  details?: string
  /** Expected control IDs (for control mismatch) */
  expected?: string[]
  /** Actual control IDs (for control mismatch) */
  actual?: string[]
}

/**
 * Represents a single threshold validation check result.
 *
 * Each check validates one aspect of the threshold configuration
 * (e.g., compliance percentage, passed count, control IDs).
 */
export interface ThresholdCheck {
  /** Dot-notation path to the threshold being checked (e.g., "passed.critical.min") */
  path: string

  /** Type of check being performed */
  type: ThresholdCheckType

  /** Whether this check passed or failed */
  status: CheckStatus

  /** Actual value from the HDF file */
  actual: number | string[]

  /** Expected threshold value(s) */
  expected: ExpectedThreshold

  /** Severity level (if applicable to this check) */
  severity?: Severity | 'total' | 'none'

  /** Status type (if applicable to this check) */
  statusType?: ThresholdStatus

  /** Details about the violation (only present if check failed) */
  violation?: ThresholdViolation
}

// =============================================================================
// VALIDATION RESULT TYPES
// =============================================================================

/**
 * Summary statistics from threshold validation.
 */
export interface ValidationSummary {
  /** Total number of threshold checks performed */
  totalChecks: number

  /** Number of checks that passed */
  passedChecks: number

  /** Number of checks that failed */
  failedChecks: number

  /** Total number of controls in the HDF file */
  totalControls: number

  /** Actual compliance percentage (if compliance threshold was checked) */
  compliance?: number

  /** Required compliance thresholds (if compliance threshold was specified) */
  complianceRequired?: {
    min?: number
    max?: number
  }
}

/**
 * Complete validation result containing all checks and summary.
 *
 * This is the primary data structure returned by the validation engine.
 * It contains all individual check results and aggregated statistics.
 */
export interface ValidationResult {
  /** Overall pass/fail status (true if all checks passed) */
  passed: boolean

  /** Individual check results (all checks, both passed and failed) */
  checks: ThresholdCheck[]

  /** Aggregated summary statistics */
  summary: ValidationSummary
}

// =============================================================================
// OUTPUT FORMATTING TYPES
// =============================================================================

/**
 * Output format for validation results.
 */
export type OutputFormat = 'default' | 'detailed' | 'quiet' | 'json' | 'yaml' | 'markdown' | 'junit'

/**
 * Configuration options for formatting validation output.
 */
export interface OutputOptions {
  /** Output format mode */
  format: OutputFormat

  /** Show passing checks in output (in addition to failures) */
  showPassed: boolean

  /** Use ANSI colors in output */
  colors: boolean

  /** Include control ID details in output */
  includeControlIds: boolean
}

// =============================================================================
// VALIDATION ERROR TYPES
// =============================================================================

/**
 * Error thrown when threshold validation input is invalid.
 */
export class ThresholdValidationError extends Error {
  public readonly code: string
  public readonly details?: unknown

  constructor(
    message: string,
    code: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ThresholdValidationError'
    this.code = code
    this.details = details
  }
}

/**
 * Error codes for threshold validation errors.
 */
export const VALIDATION_ERROR_CODES = {
  INVALID_THRESHOLD_FORMAT: 'INVALID_THRESHOLD_FORMAT',
  INVALID_THRESHOLD_VALUE: 'INVALID_THRESHOLD_VALUE',
  INVALID_HDF_FILE: 'INVALID_HDF_FILE',
  INVALID_KEY_FORMAT: 'INVALID_KEY_FORMAT',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  NEGATIVE_VALUE: 'NEGATIVE_VALUE',
  NON_FINITE_VALUE: 'NON_FINITE_VALUE',
} as const

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Grouped validation checks by status (for reporting).
 */
export interface GroupedChecks {
  /** All checks that passed */
  passed: ThresholdCheck[]
  /** All checks that failed */
  failed: ThresholdCheck[]
}

/**
 * Validation check grouped by type (for detailed reporting).
 */
export interface ChecksByType {
  /** Compliance checks */
  compliance: ThresholdCheck[]
  /** Count-based checks (total and by severity) */
  count: ThresholdCheck[]
  /** Control ID validation checks */
  control_id: ThresholdCheck[]
}
