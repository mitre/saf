import {ContextualizedControl, ControlStatus, HDFControlSegment, Severity} from 'inspecjs'
import {ChecklistControl} from '../types/checklist'
import {v4} from 'uuid'
import _ from 'lodash'

export function cklSeverity(severity: Severity): 'low' | 'medium' | 'high' {
  switch (severity) {
  case 'critical':
  case 'high':
    return 'high'
  case 'medium':
    return 'medium'
  case 'low':
  case 'none':
    return 'low'
  default:
    return 'high'
  }
}

export function cklStatus(status: ControlStatus): string {
  switch (status) {
  case 'Not Applicable':
  case 'From Profile':
    return 'Not_Applicable'
  case 'Profile Error':
  case 'Not Reviewed':
    return 'Not_Reviewed'
  case 'Passed':
    return 'NotAFinding'
  default:
    return 'Open'
  }
}

// Get segments/results as strings
export function cklResults(segments?: HDFControlSegment[]): string {
  if (typeof segments === 'undefined') {
    return ''
  }

  return segments
  .map(segment => {
    if (segment.message) {
      return `${segment.status}\n${segment.code_desc}\n${segment.message}`
    }

    if (segment.skip_message) {
      return `${segment.status}\n${segment.code_desc}\n${segment.skip_message}`
    }

    return `${segment.status}\n${segment.code_desc}`
  })
  .join('\n--------------------------------\n')
}

export function getDetails(control: ContextualizedControl, profileName: string): ChecklistControl {
  return {
    vid: control.data.id,
    severity: cklSeverity(control.root.hdf.severity),
    title: control.data.title || '',
    description: control.data.desc || '',
    checkText: control.hdf.descriptions.check || control.data.tags.check,
    fixText: control.hdf.descriptions.fix || control.data.tags.fix,
    profileName: profileName,
    startTime: _.get(control, 'hdf.segments![0].start_time', ''),
    targetKey: 0,
    uuidV4: v4(),
    ccis: control.data.tags.cci,
    status: cklStatus(control.hdf.status),
    results: cklResults(control.hdf.segments),
  }
}
