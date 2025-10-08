// =============================================================================
// THRESHOLD UTILITIES - MAIN EXPORT
// =============================================================================
//
// This module re-exports all threshold utility functions from their
// respective submodules. This provides a clean API while maintaining
// backward compatibility with existing code.
//
// Module Organization:
// - constants.ts       - Programmatically generated constants
// - type-guards.ts     - Runtime type validation functions
// - formatters.ts      - Threshold format conversions (flatten/unflatten)
// - status-conversion.ts - HDF ↔ threshold status name conversions
// - calculations.ts    - Core counting and compliance calculations
// - control-mapping.ts - Control ID mapping and summary extraction
// - ckl-conversion.ts  - DISA checklist (CKL) format conversions
//
// =============================================================================

// Constants
export {
  STATUSES,
  SEVERITIES,
  STANDARD_SEVERITIES,
  THRESHOLD_TYPES,
  CONTROL_KEY,
  HDF_STATUS_NAMES,
  THRESHOLD_STATUS_NAMES,
  STATUS_NAME_MAP,
  REVERSE_STATUS_NAME_MAP,
  severityTargetsObject,
  statusSeverityPaths,
  totalMin,
  totalMax,
  emptyStatusAndSeverityCounts,
} from './constants.js'

// Type Guards
export {
  isValidStatus,
  isValidSeverity,
  isValidThresholdType,
  isThresholdKey,
  isControlIdKey,
  isValidThresholdCount,
  isValidCompliancePercentage,
} from './type-guards.js'

// Formatters
export {
  flattenProfileSummary,
  unflattenThreshold,
} from './formatters.js'

// Status Conversion
export {
  renameStatusName,
  reverseStatusName,
} from './status-conversion.js'

// Calculations
export {
  extractStatusCounts,
  calculateCompliance,
  exitNonZeroIfTrue,
} from './calculations.js'

// Control Mapping
export {
  getControlIdMap,
  getDescriptionContentsOrUndefined,
  extractControlSummariesBySeverity,
} from './control-mapping.js'

// CKL Conversion
export {
  cklControlStatus,
  controlFindingDetails,
} from './ckl-conversion.js'

export type {CKLStatus} from './ckl-conversion.js'

// Validators (Phase 3)
export {
  validateThresholds,
  validateCompliance,
  validateTotalCounts,
  validateSeverityCounts,
  validateControlIds,
} from './validators.js'

// Output Formatter (Phase 4)
export {
  formatValidationResult,
  filterValidationResult,
} from './output-formatter.js'

export type {FilteredResult} from './output-formatter.js'

// Helper Functions
export {
  getRootControls,
  groupChecksByStatus,
  getFailedChecks,
  getPassedChecks,
  getNestedValue,
  setNestedValue,
} from './helpers.js'
