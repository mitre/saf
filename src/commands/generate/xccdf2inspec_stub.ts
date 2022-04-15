/* eslint-disable no-negated-condition */
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {DecodedDescription, DisaStig} from '../../types/xccdf'
import {InSpecControl, InSpecMetaData} from '../../types/inspec'
import {convertEncodedHTMLIntoJson, convertEncodedXmlIntoJson, impactNumberToSeverityString, inspecControlToRubyCode, severityStringToImpact} from '../../utils/xccdf2inspec'
import path from 'path'
import _ from 'lodash'
import YAML from 'yaml'
import {CciNistMappingData} from '@mitre/hdf-converters'

export default class XCCDF2InSpec extends Command {
  static usage = 'generate xccdf2inspec_stub -i, --input=XML -o, --output=FOLDER'

  static description = 'Translate a DISA STIG XCCDF XML file to a skeleton for an InSpec profile'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Path to the DISA STIG XCCDF file'}),
    metadata: Flags.string({char: 'm', required: false, description: 'Path to a JSON file with additional metadata for the inspec.yml file'}),
    singleFile: Flags.boolean({char: 's', required: false, default: false, description: 'Output the resulting controls as a single file'}),
    useVulnerabilityId: Flags.boolean({char: 'r', required: false, default: false, description: "Use Vulnerability IDs (ex. 'SV-XXXXX') instead of Group IDs (ex. 'V-XXXXX')", exclusive: ['useStigID']}),
    useStigID: Flags.boolean({char: 'S', required: false, default: false, description: "Use STIG IDs (<Group/Rule/Version>) instead of Group IDs (ex. 'V-XXXXX') for InSpec Control IDs", exclusive: ['useVulnerabilityId']}),
    lineLength: Flags.integer({char: 'l', required: false, default: 80, description: 'Characters between lines within InSpec controls'}),
    encodingHeader: Flags.boolean({char: 'e', required: false, default: false, description: 'Add the "# encoding: UTF-8" comment at the top of each control'}),
    output: Flags.string({char: 'o', required: true, default: 'profile'}),
  }

  async run() {
    const {flags} = await this.parse(XCCDF2InSpec)

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
    Object.entries(profileInfo).forEach(([key, value]) => {
      // Filter out any undefined values and omit summary and title
      if (value && key !== 'summary' && key !== 'summary') {
        readableMetadata[_.startCase(key)] = value
      }
    })

    // Write README.md
    fs.writeFileSync(path.join(flags.output, 'README.md'), `# ${profileInfo.name}\n${profileInfo.summary}\n---\n${YAML.stringify(readableMetadata)}`)

    // Convert Controls
    groups.forEach(group => {
      // Extract encoded XML values from the rule description
      const extractedDescription: DecodedDescription = convertEncodedHTMLIntoJson(group.Rule?.description)
      // Group must contain a vulnerability
      if (!group.Rule) {
        throw new Error(`Group exists without vulnerability ${group['@_id']}`)
      }

      if (!extractedDescription.VulnDiscussion) {
        throw new Error('Vulnerability exists without VulnDiscussion')
      }

      let controlID = group['@_id']
      if (flags.useVulnerabilityId) {
        controlID = group.Rule['@_id'].split('r')[0]
      } else if (flags.useStigID) {
        controlID = group.Rule.version
      }

      // Create a barebones InSpec control
      const inspecControl: InSpecControl = {
        id: controlID,
        title: group.Rule['@_severity'] ? group.Rule.title : `[[[MISSING SEVERITY FROM STIG]]] ${group.Rule.title}`, // This should never happen, yet it does with SV-203750r380182_rule of the General_Purpose_Operating_System_SRG_V2R1_Manual-xccdf.xml
        desc: extractedDescription.VulnDiscussion.split('Satisfies: ')[0],
        impact: severityStringToImpact(group.Rule['@_severity'] || 'critical'),
        rationale: '',
        descs: {
          check: typeof group.Rule.check === 'string' ? group.Rule.check : group.Rule.check['check-content'],
          fix: typeof group.Rule.fixtext === 'string' ? group.Rule.fixtext : group.Rule.fixtext['#text'],
        },
        tags: {
          severity: impactNumberToSeverityString(severityStringToImpact(group.Rule['@_severity'] || 'critical')),
          gtitle: group.title,
          satisfies: extractedDescription.VulnDiscussion.includes('Satisfies: ') && extractedDescription.VulnDiscussion.split('Satisfies: ').length >= 1 ? extractedDescription.VulnDiscussion.split('Satisfies: ')[1].split(',').map(satisfaction => satisfaction.trim()) : undefined,
          gid: group['@_id'],
          rid: group.Rule['@_id'],
          stig_id: group.Rule.version,
          fix_id: group.Rule.fix ? group.Rule.fix['@_id'] : undefined,
          false_negatives: extractedDescription.FalseNegatives,
          false_positives: extractedDescription.FalsePositives,
          documentable: extractedDescription.Documentable,
          mitigations: extractedDescription.Mitigations,
          severity_override_guidance: extractedDescription.SeverityOverrideGuidance,
          potential_impacts: extractedDescription.PotentialImpacts,
          third_party_tools: extractedDescription.ThirdPartyTools,
          mitigation_control: extractedDescription.MitigationControl, // This exists as mitigation_controls in inspec_tools, but is called mitigation_control in the xccdf, this shouldn't ever be defined but is still here for backwards compatibility
          mitigation_controls: extractedDescription.MitigationControls,
          responsibility: extractedDescription.Responsibility,
          ia_controls: extractedDescription.IAControls,
        },
      }
      if ('ident' in group.Rule) {
        const identifiers = Array.isArray(group.Rule.ident) ? group.Rule.ident : [group.Rule.ident]
        // Grab CCI/NIST/Legacy identifiers
        identifiers.forEach(identifier => {
          if (identifier['@_system'].toLowerCase().endsWith('cci')) {
            _.set(inspecControl, 'tags.cci', _.get(inspecControl, 'tags.cci') || [])
            inspecControl.tags.cci?.push(identifier['#text'])
            if (identifier['#text'] in CciNistMappingData.data) {
              _.set(inspecControl, 'tags.nist', _.get(inspecControl, 'tags.nist') || [])
              const nistMapping = _.get(CciNistMappingData.data, identifier['#text'])
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
    })
    // Convert all extracted controls to Ruby/InSpec code
    if (!flags.singleFile) {
      inspecControls.forEach(control => {
        fs.writeFileSync(path.join(flags.output, 'controls', control.id + '.rb'), inspecControlToRubyCode(control, flags.lineLength, flags.encodingHeader))
      })
    } else {
      const controlOutfile = fs.createWriteStream(path.join(flags.output, 'controls', 'controls.rb'), {flags: 'w'})
      inspecControls.forEach(control => {
        controlOutfile.write(inspecControlToRubyCode(control, flags.lineLength, flags.encodingHeader) + '\n\n')
      })
      controlOutfile.close()
    }
  }
}
