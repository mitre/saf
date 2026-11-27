import { CciNistMappingData } from '@mitre/hdf-converters';
import promptSync from 'prompt-sync';
import type { Vulnerability } from '../types/stig';

const prompt = promptSync();

export function extractSTIGUrl(findingDetails: string): string {
  const matches = findingDetails.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/gs);
  if (matches) {
    let match = '';
    for (const link of matches) {
      const url = new URL(link);
      if (url.host === 'dl.dod.cyber.mil') {
        match = url.pathname.split('/').pop()?.replace('.zip', '') || '';
      }
    }
    return match;
  }

  return '';
}

export function cklSeverityToPOAMSeverity(severity: string): string {
  switch (severity) {
    case 'none': {
      return '';
    }

    case 'low': {
      return 'Low';
    }

    case 'medium': {
      return 'Moderate';
    }

    case 'high':
    case 'critical': {
      return 'High';
    }

    default: {
      throw new Error(`Invalid severity passed: ${severity}`);
    }
  }
}

export function cklSeverityToRelevanceOfThreat() {
  return 'Moderate';
}

export function cklSeverityToLikelihood(severity: string) {
  switch (severity) {
    case 'none': {
      return '';
    }

    case 'low': {
      return 'Low';
    }

    case 'medium': {
      return 'Moderate';
    }

    case 'high':
    case 'critical': {
      return 'Moderate';
    }
  }
}

export function cklSeverityToImpact(severity: string) {
  switch (severity) {
    case 'none': {
      return '';
    }

    case 'low': {
      return 'Low';
    }

    case 'medium': {
      return 'Moderate';
    }

    case 'high':
    case 'critical': {
      return 'High';
    }
  }
}

export function cklSeverityToResidualRiskLevel(severity: string) {
  switch (severity) {
    case 'none': {
      return '';
    }

    case 'low': {
      return 'Low';
    }

    case 'medium': {
      return 'Moderate';
    }

    case 'high':
    case 'critical': {
      return 'Moderate';
    }
  }
}

export function createCVD(vulnerability: Vulnerability): string {
  return vulnerability.FINDING_DETAILS?.includes('Solution :')
    ? `Rule Title: ${vulnerability.Rule_Title}\r\n\r\n${vulnerability.FINDING_DETAILS?.split('Solution :')[0]}`
    : `Rule Title: ${vulnerability.Rule_Title}\r\n\r\n${vulnerability.FINDING_DETAILS}`;
}

export function convertToRawSeverity(severity: string) {
  switch (severity) {
    case 'none': {
      return 'Unknown';
    }

    case 'low': {
      return 'III';
    }

    case 'medium': {
      return 'II';
    }

    case 'high':
    case 'critical': {
      return 'I';
    }
  }
}

export function cleanStatus(status: string) {
  switch (status) {
    case 'Not_Applicable': {
      return 'Not Applicable';
    }

    case 'Open': {
      return 'Ongoing';
    }

    default: {
      return status;
    }
  }
}

export function replaceSpecialCharacters(text: string): string {
  return text.replaceAll(/['"]/g, '`').replaceAll('<', '(').replaceAll('>', ')').replaceAll('\\', '\\\\');
}

function cleanComments(comments: string): string {
  return comments.replace(/Automated(.*?)project\.\n/, '').replaceAll(/Profile shasum.*/sg, '').trim();
}

export function combineComments(vulnerability: Vulnerability, host: string) {
  return vulnerability.STATUS === 'Open'
    ? `${vulnerability.Rule_ID} failed on ${host}\r\n${cleanComments(vulnerability.COMMENTS || '')}`
    : `${vulnerability.Rule_ID} not applicable on ${host}\r\n${cleanComments(vulnerability.COMMENTS || '')}\r\n\r\n${vulnerability.FINDING_DETAILS}`;
}

export function extractSolution(findingDetails: string): string | undefined {
  if (findingDetails.includes('Solution')) {
    const matches = findingDetails.match(/Solution(.*)Message/gs);
    if (matches && matches.length > 0) {
      const text = matches.join('').split('Solution : ')[1].trim();
      return text.includes('Message:') ? text.split('Message:')[0].trim() : text;
    }

    return '';
  }

  return '';
}

export function cci2nist(cci: string) {
  if (typeof cci === 'string') {
    return Object.hasOwn(CciNistMappingData.data, cci)
      ? (CciNistMappingData.data as unknown as Record<string, string>)[cci].replace(' ', '')
      : prompt(`What is the NIST ID for CCI ${cci}? `);
  }

  return 'UM-1';
}
