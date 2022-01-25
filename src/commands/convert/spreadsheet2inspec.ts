import {Command, flags} from '@oclif/command'
import fs from 'fs'
import path from 'path'
import parse from 'csv-parse/lib/sync'
import {InSpecControl, InSpecMetaData} from '../../types/inspec'
import YAML from 'yaml'
import XlsxPopulate from 'xlsx-populate'
import {impactNumberToSeverityString, inspecControlToRubyCode, severityStringToImpact} from '../../utils/xccdf2inspec'
import _ from 'lodash'
import {CSVControl} from '../../types/csv'
import {extractValueViaPathOrNumber, getInstalledPath, SpreadsheetTypes} from '../../utils/global'
import {default as CCINistMappings} from '@mitre/hdf-converters/lib/data/cci-nist-mapping.json'
import {default as CISNistMappings} from '../../resources/cis2nist.json'

export default class Spreadsheet2HDF extends Command {
  static usage = 'convert:spreadsheet2inspec -i, --input=<XLSX or CSV> -o, --output=FOLDER'

  static description = 'Convert CSV STIGs or CIS XLSX benchmarks into a skeleton InSpec profile'

  static examples = ['saf convert:spreadsheet2inspec -i spreadsheet.xlsx -o profile']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    controlNamePrefix: flags.string({char: 'c', required: false, default: '', description: 'Prefix for all control IDs'}),
    format: flags.string({char: 'f', required: false, default: 'general', options: ['cis', 'disa', 'general']}),
    metadata: flags.string({char: 'm', required: false, description: 'Path to a JSON file with additional metadata for the inspec.yml file'}),
    mapping: flags.string({char: 'M', required: false, description: 'Path to a YAML file with mappings for each field, by default, CIS Benchmark fields are used for XLSX, STIG Viewer CSV export is used by CSV'}),
    output: flags.string({char: 'o', required: true, description: 'Output InSpec profile folder'}),
  }

  matchReferences(control: Partial<InSpecControl>): Partial<InSpecControl> {
    if (control.ref) {
      const urlMatches = control.ref.replace(/\r/g, '').replace(/\n/g, '').match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g)
      if (urlMatches) {
        control.refs = urlMatches
      }
      control.ref = undefined
    }
    return control
  }

  matchImpactFromSeverityIfImpactNotSet(control: Partial<InSpecControl>): Partial<InSpecControl> {
    if (!control.impact && control.tags?.severity) {
      control.impact = severityStringToImpact(control.tags.severity)
    }
    return control
  }

  matchCISControls(control: Partial<InSpecControl>, flags: {[name: string]: any}): Partial<InSpecControl> {
    if (flags.format === 'cis' && control.tags && control.tags.cis_controls && typeof control.tags.cis_controls === 'string') {
      // Match standard CIS benchmark XLSX spreadsheets
      // CIS controls are a string before they are parsed
      let cisControlMatches = (control.tags.cis_controls as unknown as string).match(/CONTROL:v(\d) (\d+)\.?(\d*)/)
      if (cisControlMatches) {
        control.tags.cis_controls = []
        const mappedCISControlsByVersion: Record<string, string[]> = {}
        cisControlMatches.map(cisControl => cisControl.split(' ')).forEach(([revision, cisControl]) => {
          const controlRevision = revision.split('CONTROL:v')[1]
          const existingControls = _.get(mappedCISControlsByVersion, controlRevision) || []
          existingControls.push(cisControl)
          mappedCISControlsByVersion[controlRevision] = existingControls
        })
        Object.entries(mappedCISControlsByVersion).forEach(([version, controls]) => {
          if (version !== 'undefined') {
            control.tags?.cis_controls?.push({
              [version]: controls,
            })
          }
        })
      } else {
        // Match parsed CIS benchmark PDFs
        // CIS controls are a string before they are parsed
        cisControlMatches = (control.tags?.cis_controls as unknown as string).match(/v\d\W\r?\n\d.?\d?\d?/gi)
        if (cisControlMatches && control.tags) {
          control.tags.cis_controls = []
          const mappedCISControlsByVersion: Record<string, string[]> = {}
          cisControlMatches.map((cisControl => cisControl.replace(/\r?\n/, '').split(' '))).forEach(([revision, cisControl]) => {
            if (revision === 'v7') {
              if (cisControl in CISNistMappings) {
                control.tags?.nist?.push(_.get(CISNistMappings, cisControl))
              }
            }
            const revisionNumber = revision.replace('v', '')
            const existingControls = _.get(mappedCISControlsByVersion, revisionNumber) || []
            existingControls.push(cisControl)
            mappedCISControlsByVersion[revisionNumber] = existingControls
          })
          console.log(mappedCISControlsByVersion)
          Object.entries(mappedCISControlsByVersion).forEach(([version, controls]) => {
            if (version !== 'undefined') {
              control.tags?.cis_controls?.push({
                [version]: controls,
              })
            }
          })
        }
      }
    }
    return control
  }

  extractCCIsFromText(control: Partial<InSpecControl>): Partial<InSpecControl> {
    if (control.tags?.cci) {
      const extractedCCIs: string[] = []
      control.tags.cci.forEach(cci => {
        const cciMatches = cci.match(/CCI-\d{4,}/g)
        if (cciMatches) {
          cciMatches.forEach(match => {
            extractedCCIs.push(match)
          })
        }
      })
      control.tags.cci = extractedCCIs
    }
    return control
  }

  async run() {
    const {flags} = this.parse(Spreadsheet2HDF)

    if (flags.format === 'general' && !flags.mapping) {
      throw new Error('Please provide your own mapping file for spreadsheets that do not follow CIS or DISA specifications, or use --format to specify a template')
    }

    // Check if the output folder already exists
    if (fs.existsSync(flags.output)) {
      // Folder should not exist already
      throw new Error('Profile output folder already exists, please specify a new folder')
    } else {
      fs.mkdirSync(flags.output)
      fs.mkdirSync(path.join(flags.output, 'controls'))
      fs.mkdirSync(path.join(flags.output, 'libraries'))
    }
    let metadata: InSpecMetaData = {}
    let mappings: Record<string, string | string[] | number> = {}

    // Read metadata file if passed
    if (flags.metadata) {
      if (fs.existsSync(flags.metadata)) {
        metadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf-8'))
      } else {
        throw new Error('Passed metadata file does not exist')
      }
    }

    // Read mapping file
    if (flags.mapping) {
      if (fs.existsSync(flags.mapping)) {
        mappings = YAML.parse(fs.readFileSync(flags.mapping, 'utf-8'))
      } else {
        throw new Error('Passed metadata file does not exist')
      }
    } else {
      mappings = YAML.parse(fs.readFileSync(path.join(getInstalledPath(), 'src', 'resources', flags.format === 'disa' ? 'disa.mapping.yml' : 'cis.mapping.yml'), 'utf-8'))
    }

    const inspecControls: InSpecControl[] = []

    // Convert profile inspec.yml
    const profileInfo: Record<string, string | number | undefined> = {
      name: 'CIS Benchmark',
      title: 'InSpec Profile',
      maintainer: metadata.maintainer || 'The Authors',
      copyright: metadata.copyright || 'The Authors',
      copyright_email: metadata.copyright_email || 'you@example.com',
      license: metadata.license || 'Apache-2.0',
      summary: '"An InSpec Compliance Profile"',
      version: metadata.version || '0.1.0',
    }

    fs.writeFileSync(path.join(flags.output, 'inspec.yml'), YAML.stringify(profileInfo))

    // Write README.md
    const readableMetadata: Record<string, string | number> = {}
    Object.entries(profileInfo).forEach(async ([key, value]) => {
      // Filter out any undefined values and omit summary and title
      if (value && key !== 'summary' && key !== 'summary') {
        readableMetadata[_.startCase(key)] = value
      }
    })
    fs.writeFileSync(path.join(flags.output, 'README.md'), `# ${profileInfo.name}\n${profileInfo.summary}\n---\n${YAML.stringify(readableMetadata)}`)

    await XlsxPopulate.fromFileAsync(flags.input).then((workBook: any) => {
      const completedIds: string[] = [] // Numbers such as 1.10 can get parsed 1.1 which will over-write controls, keep track of existing controls to prevent this

      workBook.sheets().forEach((sheet: any) => {
        const usedRange = sheet.usedRange()
        if (usedRange) {
          // Get data from the spreadsheet into a 2D array
          const extractedData: (string | number)[][] = usedRange.value()
          // Map the data into an object array
          const headers = extractedData[0]
          const mappedRecords = extractedData.slice(1).map(record => {
            const mappedRecord: Record<string, string> = {}
            record.forEach((record, index) => {
              if (typeof record === 'string') {
                mappedRecord[headers[index]] = record
              }
              if (typeof record === 'number') {
                mappedRecord[headers[index]] = record.toString()
              }
            })
            return mappedRecord
          })
          // Convert the mapped objects into controls
          mappedRecords.forEach((record, index) => {
            // Get the control ID
            let controlId = extractValueViaPathOrNumber('mappings.id', mappings.id, record)
            if (controlId) {
              // Prevent controls that get parsed from 1.10 to 1.1 from being over-written, this assumes the controls are in order
              while (completedIds.indexOf(controlId) !== -1) {
                controlId += '0'
              }
              completedIds.push(controlId)
              let newControl: Partial<InSpecControl> = {
                refs: [],
                tags: {
                  nist: [],
                  severity: impactNumberToSeverityString(extractValueViaPathOrNumber('mappings.impact', mappings.impact, record)),
                },
              }
              Object.entries(mappings).forEach(mapping => {
                if (mapping[0] === 'id' && flags.controlNamePrefix) {
                  _.set(
                    newControl,
                    mapping[0].toLowerCase().replace('desc.', 'descs.'),
                    `${flags.controlNamePrefix ? flags.controlNamePrefix + '-' : ''}${extractValueViaPathOrNumber(mapping[0], mapping[1], record, flags.format as SpreadsheetTypes)}`
                  )
                } else {
                  _.set(
                    newControl,
                    mapping[0].toLowerCase().replace('desc.', 'descs.'),
                    extractValueViaPathOrNumber(mapping[0], mapping[1], record)
                  )
                }
              })
              newControl = this.matchReferences(newControl)
              newControl = this.matchCISControls(newControl, flags)
              newControl = this.matchImpactFromSeverityIfImpactNotSet(newControl)
              newControl = this.extractCCIsFromText(newControl)
              inspecControls.push(newControl as unknown as InSpecControl)
            } else {
              // Possibly a section divider, possibly a bad mapping. Let the user know to verify
              console.error(`Control at index "${index}" has no ID... skipping`)
            }
          })
        }
      })
    }).catch(() => {
      // Assume we have a CSV file
      // Read the input file into lines
      const inputDataLines = fs.readFileSync(flags.input, 'utf-8').split('\n')
      // Replace BOM if it exists
      inputDataLines[0] = inputDataLines[0].replace(/\uFEFF/g, '')
      // STIG Viewer embeds the classification level in the first and last line for CSV export, breaking parsing
      if (inputDataLines[0].match(/~~~~~.*~~~~~/)?.length) {
        inputDataLines.shift()
      }
      if (inputDataLines[inputDataLines.length - 1].match(/~~~~~.*~~~~~/)?.length) {
        inputDataLines.pop()
      }

      const records: CSVControl[] = parse(inputDataLines.join('\n'), {
        columns: true,
        skip_empty_lines: true,
      })

      records.forEach((record, index) => {
        let skipControlDueToError = false
        let newControl: Partial<InSpecControl> = {
          refs: [],
          tags: {
            nist: [],
            severity: impactNumberToSeverityString(extractValueViaPathOrNumber('mappings.impact', mappings.impact, record)),
          },
        }
        Object.entries(mappings).forEach(mapping => {
          if (mapping[0] === 'id') {
            const value = extractValueViaPathOrNumber(mapping[0], mapping[1], record)
            if (value) {
              _.set(newControl, mapping[0], `${flags.controlNamePrefix ? flags.controlNamePrefix + '-' : ''}${value}`)
            } else {
              console.error(`Control at index ${index} has no mapped control ID... skipping`)
              skipControlDueToError = true
            }
          } else {
            _.set(newControl, mapping[0].toLowerCase().replace('desc.', 'descs.'), extractValueViaPathOrNumber(mapping[0], mapping[1], record))
          }
        })
        if (skipControlDueToError) {
          return
        }
        if (newControl.tags && newControl.tags?.cci) {
          newControl.tags.nist = []
          newControl.tags.cci.forEach(cci => {
            if (cci in CCINistMappings) {
              newControl.tags?.nist?.push(_.get(CCINistMappings, cci))
            }
          })
        }

        newControl = this.matchReferences(newControl)
        newControl = this.matchCISControls(newControl, flags)
        newControl = this.matchImpactFromSeverityIfImpactNotSet(newControl)
        newControl = this.extractCCIsFromText(newControl)

        inspecControls.push(newControl as unknown as InSpecControl)
      })
    })

    // Convert all extracted controls to Ruby/InSpec code
    inspecControls.forEach(control => {
      fs.writeFileSync(path.join(flags.output, 'controls', control.id + '.rb'), inspecControlToRubyCode(control))
    })
  }
}
