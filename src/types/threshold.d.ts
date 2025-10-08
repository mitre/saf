import type {ControlStatus, Severity} from 'inspecjs'

/**
 * Hash containing counts for each control status type.
 * This is the primary data structure used for threshold calculations.
 */
export type ControlStatusHash = Record<ControlStatus | 'Waived', number>

/**
 * Extended status hash that includes additional test-level metrics.
 * Used for detailed analysis of control execution results.
 */
export type StatusHash = ControlStatusHash & {
  /** Number of tests that passed from controls with 'Passed' status */
  PassedTests: number
  /** Number of tests that failed from controls with 'Failed' status */
  FailedTests: number
  /** Number of passing tests from controls that overall failed */
  PassingTestsFailedControl: number
  /** Number of waived tests */
  Waived: number
}

/**
 * Mapping of control IDs organized by status and severity.
 * Used for validating specific controls meet expected status/severity combinations.
 */
export type ControlIDThresholdValues = Record<string, Record<string, string[]>>

/**
 * Severity levels supported by the threshold system.
 */
export type ThresholdSeverity = Severity | 'none'

/**
 * Status names used in threshold configurations.
 */
export type ThresholdStatus = 'passed' | 'failed' | 'skipped' | 'no_impact' | 'error'

/**
 * Threshold configuration for a specific status and severity combination.
 */
export interface StatusSeverityThreshold {
  /** List of control IDs expected to have this status/severity */
  controls?: string[]
  /** Minimum count required */
  min?: number
  /** Maximum count allowed */
  max?: number
}

/**
 * Threshold configuration for a specific status across all severities.
 */
export interface StatusThresholds {
  /** Total thresholds across all severities */
  total?: StatusSeverityThreshold
  /** Critical severity thresholds */
  critical?: StatusSeverityThreshold
  /** High severity thresholds */
  high?: StatusSeverityThreshold
  /** Medium severity thresholds */
  medium?: StatusSeverityThreshold
  /** Low severity thresholds */
  low?: StatusSeverityThreshold
  /** None severity thresholds (only applicable for no_impact) */
  none?: StatusSeverityThreshold
}

/**
 * Compliance threshold configuration.
 */
export interface ComplianceThreshold {
  /** Minimum compliance percentage required */
  min?: number
  /** Maximum compliance percentage allowed */
  max?: number
}

/**
 * Complete threshold configuration structure.
 * Defines validation criteria for HDF compliance reports.
 */
export interface ThresholdValues {
  /** Overall compliance percentage thresholds */
  compliance?: ComplianceThreshold
  /** Thresholds for passed controls */
  passed?: StatusThresholds
  /** Thresholds for failed controls */
  failed?: StatusThresholds
  /** Thresholds for skipped controls */
  skipped?: StatusThresholds
  /** Thresholds for not applicable controls */
  no_impact?: StatusThresholds & {
    /** None severity is only applicable for no_impact status */
    none?: StatusSeverityThreshold
  }
  /** Thresholds for error controls */
  error?: StatusThresholds
}

/**
 * Flattened threshold structure used for inline threshold specifications.
 * Keys follow the pattern: status.severity.type (e.g., "passed.critical.min")
 */
export type FlattenedThreshold = Record<string, number>

/**
 * Profile summary structure organized by status and severity.
 */
export type ProfileSummary = Record<string, Record<string, number>>

/**
 * Control summary information extracted from HDF data.
 */
export interface ControlSummary {
  vuln_num?: string
  rule_title?: string
  vuln_discuss?: string
  severity?: string
  gid?: string | string[]
  group_title?: string | string[]
  rule_id?: string | string[]
  rule_ver?: string | string[]
  cci_ref?: string | string[]
  nist?: string
  check_content?: string | string[]
  fix_text?: string | string[]
  impact?: string
  profile_name?: string
  profile_shasum?: string
  status?: string[]
  message: string[]
  control_status?: string
  finding_details?: string
}

/**
 * Control summaries organized by status and control ID.
 */
export type ControlSummariesByStatus = Record<ThresholdStatus, Record<string, ControlSummary>>
