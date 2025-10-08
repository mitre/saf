// =============================================================================
// THRESHOLD UTILITIES - BACKWARD COMPATIBILITY WRAPPER
// =============================================================================
//
// This file maintains backward compatibility by re-exporting all functions
// from the new modular threshold structure.
//
// NEW LOCATION: src/utils/threshold/
//   - constants.ts       - Generated constants (eliminates DRY violations)
//   - type-guards.ts     - Runtime validation
//   - formatters.ts      - Format conversions
//   - status-conversion.ts - Status name mapping
//   - calculations.ts    - Core calculations
//   - control-mapping.ts - Control ID mapping
//   - ckl-conversion.ts  - Checklist conversions
//   - index.ts           - Main export point
//
// All existing imports continue to work unchanged.
// =============================================================================

export * from './threshold/index.js'
