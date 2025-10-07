import type {ContextualizedProfile} from 'inspecjs'
import type {ThresholdValues, ControlSummary, ControlSummariesByStatus} from '../../types/threshold.js'
import {ControlDescription} from 'inspecjs/lib/generated_parsers/v_1_0/exec-json'
import _ from 'lodash'
import {reverseStatusName} from './status-conversion.js'
import {cklControlStatus, controlFindingDetails} from './ckl-conversion.js'
import {getRootControls} from './helpers.js'

// =============================================================================
// CONTROL ID MAPPING
// =============================================================================

/**
 * Creates a mapping of control IDs organized by status and severity.
 *
 * This function analyzes a profile and organizes control IDs into a structure
 * that can be used for threshold validation. It groups controls by their
 * status (passed, failed, etc.) and severity (critical, high, etc.).
 *
 * @param profile - The contextualized profile to analyze
 * @param thresholds - Optional existing threshold object to populate
 * @returns ThresholdValues object with control IDs organized by status and severity
 *
 * @example
 * ```typescript
 * const controlMap = getControlIdMap(profile);
 * const criticalFailedControls = controlMap.failed?.critical?.controls;
 * console.log('Critical failed controls:', criticalFailedControls);
 * ```
 */
export function getControlIdMap(profile: ContextualizedProfile, thresholds?: ThresholdValues): ThresholdValues {
  const result = thresholds ?? {}

  // Get only root controls (not extended controls)
  const rootControls = getRootControls(profile)

  for (const c of rootControls) {
    const control = c.root
    const severity = control.hdf.severity
    const status = reverseStatusName(control.hdf.status)
    const path = `${status}.${severity}.controls`

    // Get existing control IDs for this path, or initialize empty array
    const existingControlIds = (_.get(result, path) as string[]) || []

    // Add this control ID to the list
    _.set(result, path, [...existingControlIds, control.data.id])
  }

  return result
}

/**
 * Extracts specific description content from control descriptions.
 *
 * Searches through control descriptions to find content with a specific label
 * (e.g., 'check', 'fix'). Returns undefined if not found.
 *
 * @param label - The description label to search for
 * @param descriptions - Array of control descriptions or other description format
 * @returns The description data if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const checkContent = getDescriptionContentsOrUndefined('check', control.data.descriptions);
 * const fixContent = getDescriptionContentsOrUndefined('fix', control.data.descriptions);
 * ```
 */
export function getDescriptionContentsOrUndefined(
  label: string,
  descriptions?: ControlDescription[] | Record<string, unknown> | null,
): unknown {
  if (!descriptions) {
    return undefined
  }

  if (Array.isArray(descriptions)) {
    for (const description of descriptions) {
      if (description.label === label) {
        return description.data
      }
    }
  }

  return undefined
}

/**
 * Extracts detailed control summaries organized by status.
 *
 * This function processes all controls in a profile and creates detailed
 * summary objects containing all relevant control information, organized
 * by their status (passed, failed, etc.).
 *
 * @param profile - The contextualized profile to analyze
 * @returns Object with control summaries organized by status and control ID
 *
 * @example
 * ```typescript
 * const summaries = extractControlSummariesBySeverity(profile);
 * const failedControls = summaries.failed;
 * console.log('Failed controls:', Object.keys(failedControls));
 * ```
 */
export function extractControlSummariesBySeverity(
  profile: ContextualizedProfile,
): ControlSummariesByStatus {
  const result: ControlSummariesByStatus = {
    failed: {},
    passed: {},
    no_impact: {},
    skipped: {},
    error: {},
  }

  // Get only root controls (not extended controls)
  const rootControls = getRootControls(profile)

  for (const c of rootControls) {
    const control = c.root
    const thresholdStatus = reverseStatusName(control.hdf.status)

    // Build control summary object
    const summary: ControlSummary = {
      vuln_num: control.data.id,
      rule_title: control.data.title || undefined,
      vuln_discuss: control.data.desc || undefined,
      severity: control.hdf.severity,
      gid: control.data.tags.gid,
      group_title: control.data.tags.gtitle,
      rule_id: control.data.tags.rid,
      rule_ver: control.data.tags.stig_id,
      cci_ref: control.data.tags.cci,
      nist: (control.data.tags.nist || []).join(' '),
      check_content: getDescriptionContentsOrUndefined('check', control.data.descriptions) as string | string[] | undefined,
      fix_text: getDescriptionContentsOrUndefined('fix', control.data.descriptions) as string | string[] | undefined,
      impact: control.data.impact.toString() || undefined,
      profile_name: profile.data.name,
      profile_shasum: profile.data.sha256,
      status: control.hdf.segments?.map(segment => segment.status),
      message: [],
      control_status: cklControlStatus(control, true),
    }

    // Process test segments to build messages
    control.hdf.segments?.forEach((segment) => {
      switch (segment.status) {
        case 'skipped': {
          summary.message.push(`SKIPPED -- Test: ${segment.code_desc}\nMessage: ${segment.skip_message}\n`)
          break
        }
        case 'failed': {
          summary.message.push(`FAILED -- Test: ${segment.code_desc}\nMessage: ${segment.message}\n`)
          break
        }
        case 'passed': {
          summary.message.push(`PASS -- ${segment.code_desc}\n`)
          break
        }
        case 'error': {
          summary.message.push(`PROFILE_ERROR -- Test: ${segment.code_desc}\nMessage: ${segment.code_desc}\n`)
          break
        }
        default: {
          break
        }
      }
    })

    // Add not applicable message if impact is 0
    if (control.data.impact === 0) {
      summary.message.push(`NOT_APPLICABLE -- Description: ${control.data.desc}\n\n`)
    }

    // Generate finding details
    summary.finding_details = controlFindingDetails(summary, cklControlStatus(control, true))

    // Add to result
    result[thresholdStatus][control.data.id] = summary
  }

  return result
}
