import {ContextualizedControl, ContextualizedProfile, ControlStatus, Severity} from 'inspecjs'
import {ControlDescription} from 'inspecjs/lib/generated_parsers/v_1_0/exec-json'
import _ from 'lodash'

import {StatusHash, ThresholdValues} from '../types/threshold'

export const severityTargetsObject = {
  critical: ['passed.critical.min', 'passed.critical.max', 'failed.critical.min', 'failed.critical.max', 'skipped.critical.min', 'skipped.critical.max', 'error.critical.min', 'error.critical.max'],
  high: ['passed.high.min', 'passed.high.max', 'failed.high.min', 'failed.high.max', 'skipped.high.min', 'skipped.high.max', 'error.high.min',  'error.high.max'],
  low: ['passed.low.min', 'passed.low.max', 'failed.low.min', 'failed.low.max', 'skipped.low.min', 'skipped.low.max', 'error.low.min', 'error.low.max'],
  medium: ['passed.medium.min', 'passed.medium.max', 'failed.medium.min', 'failed.medium.max', 'skipped.medium.min', 'skipped.medium.max', 'error.medium.min', 'error.medium.max'],
  none: ['no_impact.none.min', 'no_impact.none.max'],
}

export const totalMin = ['passed.total.min', 'failed.total.min', 'skipped.total.min', 'error.total.min']
export const totalMax = ['passed.total.max', 'failed.total.max', 'skipped.total.max', 'error.total.max']

export const statusSeverityPaths = {
  critical: ['passed.critical.controls', 'failed.critical.controls', 'skipped.critical.controls', 'error.critical.controls'],
  high: ['passed.high.controls', 'failed.high.controls', 'skipped.high.controls', 'error.high.controls'],
  low: ['passed.low.controls', 'failed.low.controls', 'skipped.low.controls', 'error.low.controls'],
  medium: ['passed.medium.controls', 'failed.medium.controls', 'skipped.medium.controls', 'error.medium.controls'],
  none: ['no_impact.none.controls'],
}

export const emptyStatusAndSeverityCounts = {
  error: {
    critical: [],
    high: [],
    low: [],
    medium: [],
  },
  failed: {
    critical: [],
    high: [],
    low: [],
    medium: [],
  },
  no_impact: {
    none: [],
  },
  passed: {
    critical: [],
    high: [],
    low: [],
    medium: [],
  },
  skipped: {
    critical: [],
    high: [],
    low: [],
    medium: [],
  },
}

export function extractStatusCounts(profile: ContextualizedProfile, severity?: string) {
  const hash: StatusHash = {
    Failed: 0,
    FailedTests: 0,
    'From Profile': 0,
    'Not Applicable': 0,
    'Not Reviewed': 0,
    Passed: 0,
    PassedTests: 0,
    PassingTestsFailedControl: 0,
    'Profile Error': 0,
    Waived: 0,
  }

  for (const c of profile.contains.filter(control => control.extendedBy.length === 0)) {
    const control = c.root
    const status: ControlStatus = control.hdf.status
    const controlSeverity: Severity = control.hdf.severity
    if (!severity || (controlSeverity === severity)) {
      ++hash[status]
      if (status === 'Passed') {
        hash.PassedTests += (control.hdf.segments || []).length
      } else if (status === 'Failed') {
        hash.PassingTestsFailedControl += (control.hdf.segments || []).filter(
          s => s.status === 'passed',
        ).length
        hash.FailedTests += (control.hdf.segments || []).filter(
          s => s.status === 'failed',
        ).length
      } else if (status === 'Not Applicable' && control.hdf.waived) {
        hash.Waived += control.hdf.segments?.length || 0
      }
    }
  }

  return hash
}

export function calculateCompliance(statusHash: StatusHash): number {
  const total = statusHash.Passed + statusHash.Failed + statusHash['Not Reviewed'] + statusHash['Profile Error']
  if (total === 0) {
    return 0
  }

  return Math.round((100 * statusHash.Passed) / total)
}

export function exitNonZeroIfTrue(condition: boolean, reason?: string) {
  if (condition) {
    throw new Error(reason || 'Compliance levels were not met')
  }
}

export function renameStatusName(statusName: string): string {
  switch (statusName) {
    case 'passed': {
      return 'Passed'
    }

    case 'failed': {
      return 'Failed'
    }

    case 'skipped': {
      return 'Not Reviewed'
    }

    case 'no_impact': {
      return 'Not Applicable'
    }

    case 'error': {
      return 'Profile Error'
    }

    default: {
      return 'Profile Error'
    }
  }
}

export function reverseStatusName(statusName: string): 'error' | 'failed' | 'no_impact' | 'passed' | 'skipped' {
  switch (statusName) {
    case 'Passed': {
      return 'passed'
    }

    case 'Failed': {
      return 'failed'
    }

    case 'Not Reviewed': {
      return 'skipped'
    }

    case 'Not Applicable': {
      return 'no_impact'
    }

    case 'Profile Error': {
      return 'error'
    }

    default: {
      return 'error'
    }
  }
}

export function getControlIdMap(profile: ContextualizedProfile, thresholds?: ThresholdValues) {
  if (!thresholds) {
    thresholds = {} // skipcq: JS-0083
  }

  for (const c of profile.contains.filter(control => control.extendedBy.length === 0)) {
    const control = c.root
    const severity = c.root.hdf.severity
    const path = `${reverseStatusName(control.hdf.status)}.${severity}.controls`
    const existingData = (_.get(thresholds, path) as string[]) || []
    _.set(thresholds, path, [...existingData, control.data.id])
  }

  return thresholds
}

function getDescriptionContentsOrUndefined(label: string, descriptions?: {[key: string]: any} | ControlDescription[] | null) {
  let found
  if (descriptions) {
    descriptions.forEach((description: any) => {
      if (description.label === label) {
        found = description.data
      }
    })
  }

  return found
}

function cklControlStatus(control: ContextualizedControl, for_summary?: boolean): 'Not_Applicable' | 'Not_Reviewed' | 'NotAFinding' | 'Open' | 'Profile_Error' {
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

function controlFindingDetails(control: {message: string[]}, controlCKLStatus: 'Not_Applicable' | 'Not_Reviewed' | 'NotAFinding' | 'Open' | 'Profile_Error') {
  control.message.sort()
  switch (controlCKLStatus) {
    case 'Open': {
      return `One or more of the automated tests failed or was inconclusive for the control \n\n ${control.message.join('\n')}`
    }

    case 'NotAFinding': {
      return `All Automated tests passed for the control \n\n ${control.message.join('\n')}`
    }

    case 'Not_Reviewed': {
      return `Automated test skipped due to known accepted condition in the control : \n\n${control.message.join('\n')}`
    }

    case 'Not_Applicable': {
      return `Justification: \n ${control.message.join('\n')}`
    }

    default: {
      return 'No test available or some test errors occurred for this control'
    }
  }
}

export function extractControlSummariesBySeverity(profile: ContextualizedProfile): Record<string, Record<string, Record<string, number | string | string[] | undefined>>> {
  const result: Record<string, Record<string, Record<string, number | string | string[] | undefined>>>  = {
    error: {},
    failed: {},
    no_impact: {},
    passed: {},
    skipped: {},
  }
  for (const c of profile.contains.filter(control => control.extendedBy.length === 0)) {
    const control = c.root
    const status: ControlStatus = control.hdf.status
    const extracted: Record<string, string | string[] | undefined> & {message: string[]}  = {
      cci_ref: control.data.tags.cci,
      check_content: getDescriptionContentsOrUndefined('check', control.data.descriptions),
      control_status: cklControlStatus(control, true),
      fix_text: getDescriptionContentsOrUndefined('fix', control.data.descriptions),
      gid: control.data.tags.gid,
      group_title: control.data.tags.gtitle,
      impact: control.data.impact.toString() || undefined,
      message: [],
      nist: (control.data.tags.nist || []).join(' '),
      profile_name: profile.data.name,
      profile_shasum: profile.data.sha256,
      rule_id: control.data.tags.rid,
      rule_title: control.data.title || undefined,
      rule_ver: control.data.tags.stig_id,
      severity: control.hdf.severity,
      status: control.hdf.segments?.map(segment => segment.status),
      vuln_discuss: control.data.desc || undefined,
      vuln_num: control.data.id,
    }
    control.hdf.segments?.forEach(segment => {
      switch (segment.status) {
        case 'skipped': {
          extracted.message.push(`SKIPPED -- Test: ${segment.code_desc}\nMessage: ${segment.skip_message}\n`)
          break
        }

        case 'failed': {
          extracted.message.push(`FAILED -- Test: ${segment.code_desc}\nMessage: ${segment.message}\n`)
          break
        }

        case 'passed': {
          extracted.message.push(`PASS -- ${segment.code_desc}\n`)
          break
        }

        case 'error': {
          extracted.message.push(`PROFILE_ERROR -- Test: ${segment.code_desc}\nMessage: ${segment.code_desc}\n`)
          break
        }

        default: {
          break
        }
      }
    })
    if (control.data.impact === 0) {
      extracted.message.push(`NOT_APPLICABLE -- Description: ${control.data.desc}\n\n`)
    }

    extracted.finding_details = controlFindingDetails(extracted, cklControlStatus(control, true))
    result[reverseStatusName(status)][control.data.id] = extracted
  }

  return result
}
