/* eslint-disable no-negated-condition */
import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {DisaStig} from '../../types/xccdf'
import {InSpecControl, InSpecMetaData} from '../../types/inspec'
import {convertEncodedHTMLIntoJson, convertEncodedXmlIntoJson, impactStringToSeverity, inspecControlToRubyCode, severityStringToImpact} from '../../utils/xccdf2inspec'
import path from 'path'
import _ from 'lodash'
import YAML from 'yaml'
import {default as CCINistMappings} from '@mitre/hdf-converters/lib/data/cci-nist-mapping.json'

export default class XCCDFResultsMapper extends Command {
  static usage = 'convert:xccdf2inspec -i, --input=XML -o, --output=FOLDER'

  static description = 'Translate a DISA STIG XCCDF XML file to a skeleton for an InSpec profile'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Path to the DISA STIG XCCDF file'}),
    metadata: flags.string({char: 'm', required: false, description: 'Path to a JSON file with additional metadata for the inspec.yml file'}),
    output: flags.string({char: 'o', required: true, default: 'profile'}),
  }

  async run() {
    const {flags} = this.parse(XCCDFResultsMapper)

    // Check if the output folder already exists
    if (!fs.existsSync(flags.output)) {
      fs.mkdirSync(flags.output)
      fs.mkdirSync(path.join(flags.output, 'controls'))
      fs.mkdirSync(path.join(flags.output, 'libraries'))
    } else {
      // Folder should not exist already
      throw new Error('Profile output folder already exists, please specify a new folder')
    }
    // This will get overridden if a metadata file is passed
    let metadata: InSpecMetaData = {}
    // Read metadata file if passed
    if (flags.metadata) {
      if (fs.existsSync(flags.metadata)) {
        metadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf-8'))
      } else {
        throw new Error('Passed metadata file does not exist')
      }
    }
    // Read XCCDF file
    const parsedXML: DisaStig = convertEncodedXmlIntoJson(fs.readFileSync(flags.input, 'utf-8'))
    // Extract groups (these contain controls)
    const groups = parsedXML.Benchmark.Group
    // All of our extracted controls to be converted into Ruby/InSpec code
    const inspecControls: InSpecControl[] = []
    // Convert profile inspec.yml
    const profileInfo: Record<string, string | number | undefined> = {
      name: parsedXML.Benchmark['@_id'],
      title: parsedXML.Benchmark.title,
      maintainer: metadata.maintainer || 'The Authors',
      copyright: metadata.copyright || 'The Authors',
      copyright_email: metadata.copyright_email || 'you@example.com',
      license: metadata.license || 'Apache-2.0',
      summary: `"${parsedXML.Benchmark.description}"`,
      version: metadata.version || '0.1.0',
    }
    // Write inspec.yml
    fs.writeFileSync(path.join(flags.output, 'inspec.yml'), YAML.stringify(profileInfo))

    // Add Status, release, and reference information for README.md
    if (parsedXML.Benchmark.status && parsedXML.Benchmark.status['#text'] && parsedXML.Benchmark.status['@_date']) {
      profileInfo.status = `${parsedXML.Benchmark.status['#text']} on ${parsedXML.Benchmark.status['@_date']}`
    }
    if (parsedXML.Benchmark['plain-text']) {
      const plainTextMetaDataValues = Array.isArray(parsedXML.Benchmark['plain-text']) ? parsedXML.Benchmark['plain-text'] : [parsedXML.Benchmark['plain-text']]
      profileInfo.release = plainTextMetaDataValues.find(metadataValue => metadataValue['@_id'].toLowerCase().trim() === 'release-info')?.['#text']
    }
    profileInfo.reference = parsedXML.Benchmark.reference['@_href']
    profileInfo.referenceBy = parsedXML.Benchmark.reference['dc:publisher']
    profileInfo.referenceSource = parsedXML.Benchmark.reference['dc:source']
    // Convert camelCase and snake_case to human readable for README.md
    const readableMetadata: Record<string, string | number> = {}
    for (const [key, value] of Object.entries(profileInfo)) {
      // Filter out any undefined values and omit summary and title
      if (value && key !== 'summary' && key !== 'summary') {
        readableMetadata[_.startCase(key)] = value
      }
    }

    // Write README.md
    fs.writeFileSync(path.join(flags.output, 'README.md'), `# ${profileInfo.name}\n${profileInfo.summary}\n---\n${YAML.stringify(readableMetadata)}`)

    // Convert Controls
    for (const group of groups) {
      // Extract encoded XML values from the rule description
      const extractedDescription = convertEncodedHTMLIntoJson(group.Rule?.description)
      // Vulnerability must contain a rule
      if (!group.Rule) {
        throw new Error(`Group exists without vulnerability ${group['@_id']}`)
      }
      // Create a barebones InSpec control
      const inspecControl: InSpecControl = {
        id: group['@_id'],
        title: group.Rule.title,
        desc: extractedDescription.VulnDiscussion,
        impact: severityStringToImpact(group.Rule['@_severity']),
        rationale: '',
        tags: {
          check: group.Rule.check['check-content'],
          fix: group.Rule.fixtext['#text'],
          severity: impactStringToSeverity(severityStringToImpact(group.Rule['@_severity'])),
          gtitle: group.title,
          gid: group['@_id'],
          rid: group.Rule['@_id'],
          stig_id: group.Rule.version,
          fix_id: group.Rule.fix['@_id'],
        },
      }
      if ('ident' in group.Rule) {
        let identifiers = []
        if (Array.isArray(group.Rule.ident)) {
          identifiers = group.Rule.ident
        } else {
          identifiers = [group.Rule.ident]
        }
        // Grab CCI/NIST/Legacy identifiers
        identifiers.forEach(identifier => {
          if (identifier['@_system'].toLowerCase().endsWith('cci')) {
            _.set(inspecControl, 'tags.cci', _.get(inspecControl, 'tags.cci') || [])
          inspecControl.tags.cci?.push(identifier['#text'])
          if (identifier['#text'] in CCINistMappings) {
            _.set(inspecControl, 'tags.nist', _.get(inspecControl, 'tags.nist') || [])
            const nistMapping = _.get(CCINistMappings, identifier['#text'])
            if (inspecControl.tags.nist?.indexOf(nistMapping) === -1) {
              inspecControl.tags.nist?.push(nistMapping)
            }
          }
          }
          if (identifier['@_system'].toLowerCase().endsWith('legacy')) {
            _.set(inspecControl, 'tags.legacy', _.get(inspecControl, 'tags.legacy') || [])
        inspecControl.tags.legacy?.push(identifier['#text'])
          }
        })
      }

      inspecControls.push(inspecControl)
    }
    // Convert all extracted controls to Ruby/InSpec code
    inspecControls.forEach(control => {
      fs.writeFileSync(path.join(flags.output, 'controls', control.id + '.rb'), inspecControlToRubyCode(control))
    })
  }
}
