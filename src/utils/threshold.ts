import {StatusHash} from '../../types/threshold'
import {ContextualizedProfile, ControlStatus, Severity} from 'inspecjs'

export const severityTargetsObject = {
  critical: ['passed.critical.min', 'passed.critical.max', 'failed.critical.min', 'failed.critical.max', 'skipped.critical.min', 'skipped.critical.max', 'no_impact.critical.min', 'no_impact.critical.max', 'error.critical.min', 'error.critical.max'],
  high: ['passed.high.min', 'passed.high.max', 'failed.high.min', 'failed.high.max', 'skipped.high.min', 'skipped.high.max', 'no_impact.high.min', 'no_impact.high.max', 'error.high.min',  'error.high.max'],
  medium: ['passed.medium.min', 'passed.medium.max', 'failed.medium.min', 'failed.medium.max', 'skipped.medium.min', 'skipped.medium.max', 'no_impact.medium.min', 'no_impact.medium.max', 'error.medium.min', 'error.medium.max'],
  low: ['passed.low.min', 'passed.low.max', 'failed.low.min', 'failed.low.max', 'skipped.low.min', 'skipped.low.max', 'no_impact.low.min', 'no_impact.low.max', 'error.low.min', 'error.low.max'],
}

export function extractStatusCounts(profile: ContextualizedProfile, severity?: string) {
  const hash: StatusHash = {
    Failed: 0,
    'From Profile': 0,
    'Not Applicable': 0,
    'Not Reviewed': 0,
    Passed: 0,
    'Profile Error': 0,
    PassedTests: 0,
    FailedTests: 0,
    PassingTestsFailedControl: 0,
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
          s => s.status === 'passed'
        ).length
        hash.FailedTests += (control.hdf.segments || []).filter(
          s => s.status === 'failed'
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
  case 'passed':
    return 'Passed'
  case 'failed':
    return 'Failed'
  case 'skipped':
    return 'Not Reviewed'
  case 'no_impact':
    return 'Not Applicable'
  case 'error':
    return 'Profile Error'
  default:
    return 'Profile Error'
  }
}

export function reverseStatusName(statusName: string): string {
  switch (statusName) {
  case 'Passed':
    return 'passed'
  case 'Failed':
    return 'failed'
  case 'Not Reviewed':
    return 'skipped'
  case 'Not Applicable':
    return 'no_impact'
  case 'Profile Error':
    return 'error'
  default:
    return 'error'
  }
}
