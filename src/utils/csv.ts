import {ContextualizedControl, ExecJSON, HDFControlSegment} from 'inspecjs'
import _ from 'lodash'
import {ControlSetRow} from '../types/csv'
import {getDescription} from './global'

export const csvExportFields = [
  'Results Set',
  'Status',
  'ID',
  'Title',
  'Description',
  'Descriptions',
  'Impact',
  'Severity',
  'Code',
  'Check',
  'Fix',
  '800-53 Controls',
  'CCI IDs',
  'Results',
  'Waived',
  'Waiver Data',
]
function descriptionsToString(
  descriptions?:
    | ExecJSON.ControlDescription[]
    | { [key: string]: unknown }
    | null,
): string {
  let result = ''
  if (Array.isArray(descriptions)) {
    // Caveats are the first thing displayed if defined
    // There should only ever be one, but better safe than sorry
    const caveats = descriptions.filter(
      description => description.label === 'caveat',
    )
    if (caveats.length) {
      descriptions = descriptions.filter( // skipcq: JS-0083
        description => description.label !== 'caveat',
      )
      caveats.forEach(caveat => {
        result += `${caveat.label}: ${caveat.data}`
      })
    }

    descriptions.forEach((description: ExecJSON.ControlDescription) => {
      result += `${description.label}: ${description.data}\r\n\r\n`
    })
  }

  return result
}

function segmentsToString(segments: HDFControlSegment[] | undefined): string {
  if (segments) {
    let result = ''
    segments.forEach((segment: HDFControlSegment) => {
      result += segment.message ?
        `${segment.status.toUpperCase()} -- Test: ${
          segment.code_desc
        }\r\nMessage: ${segment.message}\r\n\r\n`        :
        `${segment.status.toUpperCase()} -- Test: ${
          segment.code_desc
        }\r\n\r\n`
    })
    return result
  }

  return ''
}

// Convert HDF into Single key-field values
export function convertRow(
  filename: string,
  control: ContextualizedControl,
  fieldsToAdd: string[],
): ControlSetRow {
  let check = ''
  let fix = ''
  const result: ControlSetRow = {}

  if (control.data.tags.check) {
    check = control.data.tags.check
  } else if (control.data.descriptions) {
    check = getDescription(control.data.descriptions, 'check') || ''
  }

  if (control.data.tags.fix) {
    fix = control.data.tags.fix
  } else if (control.data.descriptions) {
    fix = getDescription(control.data.descriptions, 'fix') || ''
  }

  fieldsToAdd.forEach(field => { // skipcq: JS-0044
    switch (field) { // skipcq: JS-0047
      // Results Set
      case csvExportFields[0]:
        result[csvExportFields[0]] = filename
        break
      // Status
      case csvExportFields[1]:
        result[csvExportFields[1]] = control.hdf.status
        break
      // ID
      case csvExportFields[2]:
        result[csvExportFields[2]] = control.data.id
        break
      // Title
      case csvExportFields[3]:
        result[csvExportFields[3]] = control.data.title?.toString() || ''
        break
      // Description
      case csvExportFields[4]:
        result[csvExportFields[4]] = control.data.desc?.toString() || ''
        break
      // Descriptions
      case csvExportFields[5]:
        result[csvExportFields[5]] = descriptionsToString(
          control.data.descriptions,
        )
        break
      // Impact
      case csvExportFields[6]:
        result[csvExportFields[6]] = control.data.impact.toString()
        break
      // Severity
      case csvExportFields[7]:
        result[csvExportFields[7]] = control.hdf.severity
        break
      // Code
      case csvExportFields[8]:
        result[csvExportFields[8]] = control.full_code
        break
      // Check
      case csvExportFields[9]:
        result[csvExportFields[9]] = check
        break
      // Fix
      case csvExportFields[10]:
        result[csvExportFields[10]] = fix
        break
      // NIST IDs
      case csvExportFields[11]:
        result[csvExportFields[12]] = control.hdf.rawNistTags.join(', ')
        break
      // CCI IDs
      case csvExportFields[12]:
        result[csvExportFields[12]] = (control.data.tags.cci || []).join(', ')
        break
      // Results
      case csvExportFields[13]:
        result[csvExportFields[13]] = segmentsToString(
          control.hdf.segments,
        )
        break
      // Is Waived
      case csvExportFields[14]:
        result[csvExportFields[14]] = control.hdf.waived ? 'True' : 'False'
        break
      // Waiver Data (JSON)
      case csvExportFields[15]:
        result[csvExportFields[15]] = JSON.stringify(
          _.get(control, 'hdf.wraps.waiver_data'),
        )
        break
    }
  })
  return result
}
