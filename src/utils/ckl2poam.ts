import {CciNistMappingData} from '@mitre/hdf-converters'
import {Vulnerability} from '../types/STIG'
import promptSync from 'prompt-sync'
const prompt = promptSync()

export function extractSTIGUrl(findingDetails: string): string {
  const matches = findingDetails.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/gs) // skipcq: JS-0113
  if (matches) {
    let match = ''
    matches.forEach(link => {
      const url = new URL(link)
      if (url.host === 'dl.dod.cyber.mil') {
        match = url.pathname.split('/').pop()?.replace('.zip', '') || ''
      }
    })
    return match
  }

  return ''
}

export function cklSeverityToPOAMSeverity(severity: string): string {
  switch (severity) {
    case 'none': {
      return ''
    }

    case 'low': {
      return 'Low'
    }

    case 'medium': {
      return 'Moderate'
    }

    case 'high':
    case 'critical': {
      return 'High'
    }

    default: {
      throw new Error(`Invalid severity passed: ${severity}`)
    }
  }
}

export function cklSeverityToRelevanceOfThreat(severity: string) {
  let severityAsThreat = ''
  switch (severity) {
    default: {
      severityAsThreat = 'Moderate'

      break
    }
  }

  return severityAsThreat
}

export function cklSeverityToLikelihood(severity: string) { // skipcq: JS-0045
  switch (severity) { // skipcq: JS-0045, JS-0047
    case 'none': {
      return ''
    }

    case 'low': {
      return 'Low'
    }

    case 'medium': {
      return 'Moderate'
    }

    case 'high':
    case 'critical': {
      return 'Moderate'
    }
  }
}

export function cklSeverityToImpact(severity: string) { // skipcq: JS-0045
  switch (severity) { // skipcq: JS-0045, JS-0047
    case 'none': {
      return ''
    }

    case 'low': {
      return 'Low'
    }

    case 'medium': {
      return 'Moderate'
    }

    case 'high':
    case 'critical': {
      return 'High'
    }
  }
}

export function cklSeverityToResidualRiskLevel(severity: string) { // skipcq: JS-0045
  switch (severity) { // skipcq: JS-0045, JS-0047
    case 'none': {
      return ''
    }

    case 'low': {
      return 'Low'
    }

    case 'medium': {
      return 'Moderate'
    }

    case 'high':
    case 'critical': {
      return 'Moderate'
    }
  }
}

export function createCVD(vulnerability: Vulnerability): string {
  if (vulnerability.FINDING_DETAILS?.includes('Solution :')) {
    return `Rule Title: ${vulnerability.Rule_Title}\r\n\r\n${vulnerability.FINDING_DETAILS?.split('Solution :')[0]}`
  }

  return `Rule Title: ${vulnerability.Rule_Title}\r\n\r\n${vulnerability.FINDING_DETAILS}`
}

export function convertToRawSeverity(severity: string) { // skipcq: JS-0045
  switch (severity) { // skipcq: JS-0047
    case 'none': {
      return 'Unknown'
    }

    case 'low': {
      return 'III'
    }

    case 'medium': {
      return 'II'
    }

    case 'high':
    case 'critical': {
      return 'I'
    }
  }
}

export function cleanStatus(status: string) {
  switch (status) {
    case 'Not_Applicable': {
      return 'Not Applicable'
    }

    case 'Open': {
      return 'Ongoing'
    }

    default: {
      return status
    }
  }
}

export function replaceSpecialCharacters(text: string): string {
  return text.replace(/'/g, '`').replace(/"/g, '`').replace(/</g, '(').replace(/>/g, ')').replace(/\\/g, '\\\\')
}

function cleanComments(comments: string): string {
  return comments.replace(/Automated(.*?)project\.\n/, '').replace(/Profile shasum.*/sg, '').trim() // skipcq: JS-0113
}

export function combineComments(vulnerability: Vulnerability, host: string) {
  if (vulnerability.STATUS === 'Open') {
    return `${vulnerability.Rule_ID} failed on ${host}\r\n${cleanComments(vulnerability.COMMENTS || '')}`
  }

  return `${vulnerability.Rule_ID} not applicable on ${host}\r\n${cleanComments(vulnerability.COMMENTS || '')}\r\n\r\n${vulnerability.FINDING_DETAILS}`
}

export function extractSolution(findingDetails: string): string | undefined {
  if (findingDetails.includes('Solution')) {
    const matches = findingDetails.match(/Solution(.*)Message/gs) // skipcq: JS-0113
    if (matches && matches.length !== 0) {
      const text = matches.join('').split('Solution : ')[1].trim()
      if (text.includes('Message:')) {
        return text.split('Message:')[0].trim()
      }

      return text
    }

    return ''
  }

  return ''
}

export function cci2nist(cci: string) {
  if (typeof cci === 'string') {
    if (cci in CciNistMappingData.data) {
      return (CciNistMappingData.data as unknown as Record<string, string>)[cci].replace(' ', '')
    }

    return prompt(`What is the NIST ID for CCI ${cci}? `)
  }

  return 'UM-1'
}
