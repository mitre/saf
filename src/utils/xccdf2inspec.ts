import parser from 'fast-xml-parser'
import * as htmlparser from 'htmlparser2'
import _ from 'lodash'
import {InSpecControl} from '../types/inspec'
import {DecodedDescription} from '../types/xccdf'

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

export function convertEncodedHTMLIntoJson(encodedHTML?: string): DecodedDescription {
  if (encodedHTML) {
    // Some STIGs regarding XSS put the < character inside of the description which breaks parsing
    const patchedHTML = encodedHTML.replace(/"&lt;"/g, '[[[REPLACE_LESS_THAN]]]')

    const xmlChunks: string[] = []
    const htmlParser = new htmlparser.Parser({
      ontext(text: string) {
        xmlChunks.push(text)
      },
    })
    htmlParser.write(patchedHTML)
    htmlParser.end()
    const converted = convertEncodedXmlIntoJson(xmlChunks.join(''))
    let cleaned: Record<string, string | boolean | undefined> = {}

    if (typeof converted.VulnDiscussion === 'object') { // Some STIGs have xml tags inside of the actual text which breaks processing, e.g U_ASD_STIG_V5R1_Manual-xccdf.xml and all Oracle Database STIGs
      let extractedVulnDescription = ''
      const remainingFields = _.omit(converted.VulnDiscussion, ['FalsePositives', 'FalseNegatives', 'Documentable', 'Mitigations', 'SeverityOverrideGuidance', 'PotentialImpacts', 'ThirdPartyTools', 'MitigationControl', 'Responsibility', 'IAControls'])
      Object.entries(remainingFields).forEach(([field, value]) => {
        extractedVulnDescription += `<${field}> ${value}`
      })
      cleaned = {
        VulnDiscussion: extractedVulnDescription.replace(/\[\[\[REPLACE_LESS_THAN]]]/, '"<"'),
      }
      Object.entries(converted.VulnDiscussion).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cleaned[key] = (value as string).replace(/\[\[\[REPLACE_LESS_THAN]]]/, '"<"')
        } else {
          cleaned[key] = (value as boolean)
        }
      })
    } else {
      Object.entries(converted).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cleaned[key] = (value as string).replace(/\[\[\[REPLACE_LESS_THAN]]]/, '"<"')
        } else {
          cleaned[key] = (value as boolean)
        }
      })
    }

    return cleaned
  }

  return {}
}

export function severityStringToImpact(string: string): number {
  if (string.match(/none|na|n\/a|not[\s()*_|]?applicable/i)?.length) {
    return 0.0
  }

  if (string.match(/low|cat(egory)?\s*(iii|3)/i)?.length) {
    return 0.3
  }

  if (string.match(/med(ium)?|cat(egory)?\s*(ii|2)/i)?.length) {
    return 0.5
  }

  if (string.match(/high|cat(egory)?\s*(i|1)/i)?.length) {
    return 0.7
  }

  if (string.match(/crit(ical)?|severe/i)?.length) {
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
