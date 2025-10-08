import type {ContextualizedControl} from 'inspecjs'

// =============================================================================
// CHECKLIST (CKL) CONVERSION UTILITIES
// =============================================================================

/**
 * CKL status type for checklist conversion.
 */
export type CKLStatus = 'Not_Applicable' | 'Profile_Error' | 'Open' | 'NotAFinding' | 'Not_Reviewed'

/**
 * Determines the CKL (Checklist) status for a control.
 *
 * Converts HDF control status to the equivalent CKL status used in
 * STIG checklists and similar compliance formats.
 *
 * @param control - The contextualized control to analyze
 * @param for_summary - Whether this is for summary purposes
 * @returns CKL status string
 *
 * @example
 * ```typescript
 * const cklStatus = cklControlStatus(control);
 * // Returns: 'NotAFinding', 'Open', 'Not_Reviewed', etc.
 * ```
 */
export function cklControlStatus(control: ContextualizedControl, for_summary?: boolean): CKLStatus {
  const statuses = control.hdf.segments?.map(segment => segment.status)

  if (control.data.impact === 0) {
    return 'Not_Applicable'
  }

  if (statuses?.includes('error') || (statuses?.length === 0 && for_summary)) {
    return 'Profile_Error'
  }

  if (statuses?.includes('failed')) {
    return 'Open'
  }

  if (statuses?.includes('passed')) {
    return 'NotAFinding'
  }

  return 'Not_Reviewed'
}

/**
 * Generates finding details text based on control status and messages.
 *
 * Creates human-readable finding details for checklist formats,
 * combining test results and messages into a coherent description.
 *
 * @param control - Control object with message array
 * @param controlCKLStatus - The CKL status of the control
 * @returns Formatted finding details string
 *
 * @example
 * ```typescript
 * const details = controlFindingDetails(control, 'Open');
 * // Returns formatted finding details string
 * ```
 */
export function controlFindingDetails(
  control: {message: string[]},
  controlCKLStatus: CKLStatus,
): string {
  control.message.sort()
  const messages = control.message.join('\n')

  switch (controlCKLStatus) {
    case 'Open': {
      return `One or more of the automated tests failed or was inconclusive for the control \n\n ${messages}`
    }
    case 'NotAFinding': {
      return `All Automated tests passed for the control \n\n ${messages}`
    }
    case 'Not_Reviewed': {
      return `Automated test skipped due to known accepted condition in the control : \n\n${messages}`
    }
    case 'Not_Applicable': {
      return `Justification: \n ${messages}`
    }
    default: {
      return 'No test available or some test errors occurred for this control'
    }
  }
}
