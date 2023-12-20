import {ContextualizedControl, ControlStatus, HDFControlSegment, Severity} from 'inspecjs'
import _ from 'lodash'
import {v4} from 'uuid'

import {ChecklistControl} from '../types/checklist'

export function cklSeverity(severity: Severity): 'high' | 'low' | 'medium' {
  switch (severity) {
    case 'critical':
    case 'high': {
      return 'high'
    }

    case 'medium': {
      return 'medium'
    }

    case 'low':
    case 'none': {
      return 'low'
    }

    default: {
      return 'high'
    }
  }
}

export function cklStatus(status: ControlStatus): string {
  switch (status) {
    case 'Not Applicable':
    case 'From Profile': {
      return 'Not_Applicable'
    }

    case 'Profile Error':
    case 'Not Reviewed': {
      return 'Not_Reviewed'
    }

    case 'Passed': {
      return 'NotAFinding'
    }

    default: {
      return 'Open'
    }
  }
}

// Get segments/results as strings
export function cklResults(segments?: HDFControlSegment[]): string {
  if (segments === undefined) {
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
    ccis: control.data.tags.cci,
    checkText: control.hdf.descriptions.check || control.data.tags.check,
    description: control.data.desc || '',
    fixText: control.hdf.descriptions.fix || control.data.tags.fix,
    gtitle: control.data.tags.gtitle || control.data.id,
    profileName,
    results: cklResults(control.hdf.segments),
    rid: control.data.tags.rid || control.data.id,
    ruleVersion: control.data.tags.stig_id || control.data.id,
    severity: cklSeverity(control.root.hdf.severity),
    startTime: _.get(control, 'hdf.segments![0].start_time', ''),
    status: cklStatus(control.hdf.status),
    targetKey: 0,
    title: control.data.title || '',
    uuidV4: v4(),
    vid: control.data.tags.gid || control.data.id,
  }
}
