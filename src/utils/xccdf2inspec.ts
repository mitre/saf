import parser from 'fast-xml-parser'
import {InSpecControl} from '../types/inspec'

// Breaks lines down to lineLength number of characters
export function wrap(s: string, lineLength = 80): string {
  let currentLineLength = 0
  let finalString = ''
  s.split(' ').forEach(word => {
    if (currentLineLength + word.length < lineLength || word.length >= lineLength) {
      currentLineLength += word.length
      finalString += word + ' '
    } else {
      currentLineLength = word.length
      finalString += `\n${word} `
    }
  })

  return finalString
}

export const escapeQuotes = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") // Escape backslashes and quotes
export const escapeDoubleQuotes = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') // Escape backslashes and double quotes
export const wrapAndEscapeQuotes = (s: string, lineLength?: number) => escapeDoubleQuotes(wrap(s, lineLength)) // Escape backslashes and quotes, and wrap long lines

export function convertEncodedXmlIntoJson(
  encodedXml: string,
): any {
  return parser.parse(encodedXml, {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })
}

export function severityStringToImpact(string: string): number {
  if (/none|na|n\/a|not[\s()*_|]?applicable/i.test(string)) {
    return 0.0
  }

  if (/low|cat(egory)?\s*(iii|3)/i.test(string)) {
    return 0.3
  }

  if (/med(ium)?|cat(egory)?\s*(ii|2)/i.test(string)) {
    return 0.5
  }

  if (/high|cat(egory)?\s*(i|1)/i.test(string)) {
    return 0.7
  }

  if (/crit(ical)?|severe/i.test(string)) {
    return 1.0
  }

  throw new Error(`${string}' is not a valid severity value. It should be one of the approved keywords`)
}

export function impactNumberToSeverityString(impact: number): string {
  // Impact must be 0.0 - 1.0
  if (impact < 0.0 || impact > 1.0) {
    throw new Error('Impact cannot be less than 0.0 or greater than 1.0')
  } else {
    if (impact >= 0.9) {
      return 'critical'
    }

    if (impact >= 0.7) {
      return 'high'
    }

    if (impact >= 0.4) {
      return 'medium'
    }

    if (impact >= 0.1) {
      return 'low'
    }

    return 'none'
  }
}

export function inspecControlToRubyCode(control: InSpecControl, lineLength?: number, showUtfEncoding?: boolean): string {
  let result = showUtfEncoding ? '# encoding: UTF-8\n\n' : ''

  result += `control "${control.id}" do\n`
  if (control.title) {
    result += `  title "${wrapAndEscapeQuotes(control.title, lineLength)}"\n`
  } else {
    console.error(`${control.id} does not have a title`)
  }

  if (control.desc) {
    result += `  desc "${wrapAndEscapeQuotes(control.desc, lineLength)}"\n`
  } else {
    console.error(`${control.id} does not have a desc`)
  }

  if (control.descs) {
    Object.entries(control.descs).forEach(([key, desc]) => {
      if (desc) {
        result += `  desc "${key}", "${wrapAndEscapeQuotes(desc, lineLength)}"\n`
      } else {
        console.error(`${control.id} does not have a desc for the value ${key}`)
      }
    })
  }

  if (control.impact) {
    result += `  impact ${control.impact}\n`
  } else {
    console.error(`${control.id} does not have an impact, please define impact within your mapping file or set tags.severity to set automatically`)
  }

  if (control.refs) {
    control.refs.forEach(ref => {
      result += `  ref '${escapeQuotes(ref)}'\n`
    })
  }

  Object.entries(control.tags).forEach(([tag, value]) => {
    if (value) {
      if (typeof value === 'object') {
        if (Array.isArray(value) && typeof value[0] === 'string') {
          result += `  tag ${tag}: ${JSON.stringify(value)}\n`
        } else {
          // Convert JSON Object to Ruby Hash
          const stringifiedObject = JSON.stringify(value, null, 2)
          .replace(/\n/g, '\n  ')
          .replace(/\{\n {6}/g, '{')
          .replace(/\[\n {8}/g, '[')
          .replace(/\n {6}\]/g, ']')
          .replace(/\n {4}\}/g, '}')
          .replace(/": \[/g, '" => [')
          result += `  tag ${tag}: ${stringifiedObject}\n`
        }
      } else if (typeof value === 'string') {
        result += `  tag ${tag}: "${wrapAndEscapeQuotes(value, lineLength)}"\n`
      }
    }
  })
  result += 'end'

  return result
}
