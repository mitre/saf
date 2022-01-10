/* eslint-disable no-negated-condition */
import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {DisaStig} from '../../types/xccdf'
import {InSpecControl} from '../../types/inspec'
import {convertEncodedHTMLIntoJson, convertEncodedXmlIntoJson, impactStringToSeverity, inspecControlToRubyCode, severityStringToImpact} from '../../utils/xccdf2inspec'
import path from 'path'
import _ from 'lodash'
import {default as CCINistMappings} from '@mitre/hdf-converters/lib/data/cci-nist-mapping.json'

export default class XCCDFResultsMapper extends Command {
  static usage = 'convert:xccdf2inspec -i, --input=XML -o, --output=FOLDER'

  static description = 'Translate a DISA STIG XCCDF XML file to a skeleton for an InSpec profile'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true, default: 'profile'}),
  }

  async run() {
    const {flags} = this.parse(XCCDFResultsMapper)

    if (!fs.existsSync(flags.output)) {
      fs.mkdirSync(flags.output)
      fs.mkdirSync(path.join(flags.output, 'controls'))
    } else {
      console.error('Profile output folder already exists, please specify a new folder')
      // process.exit(1)
    }
    const parsedXML: DisaStig = convertEncodedXmlIntoJson(fs.readFileSync(flags.input, 'utf-8'))
    const groups = parsedXML.Benchmark.Group
    const inspecControls: InSpecControl[] = []
    for (const group of groups) {
      const extractedDescription = convertEncodedHTMLIntoJson(group.Rule?.description)
      if (!group.Rule) {
        throw new Error(`Group exists without vulnerability ${group['@_id']}`)
      }
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
      group.Rule.ident.forEach(identifier => {
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
      inspecControls.push(inspecControl)
    }
    inspecControls.forEach(control => {
      fs.writeFileSync(path.join(flags.output, 'controls', control.id + '.rb'), inspecControlToRubyCode(control))
    })
  }
}
