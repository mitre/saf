import {Command, flags} from '@oclif/command'
import fs from 'fs'
import path from 'path'
import parse from 'csv-parse/lib/sync'
import {InSpecControl, InSpecMetaData} from '../../types/inspec'
import YAML from 'yaml'
import XlsxPopulate from 'xlsx-populate'
import {impactNumberToSeverityString, inspecControlToRubyCode} from '../../utils/xccdf2inspec'
import _ from 'lodash'
import {CSVControl} from '../../types/csv'
import {extractValueViaPathOrNumber, findFieldIndex, getInstalledPath, SpreadsheetTypes} from '../../utils/global'
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

  async run() {
    const {flags} = this.parse(Spreadsheet2HDF)

    // Check if the output folder already exists
    if (fs.existsSync(flags.output)) {
      // Folder should not exist already
      // throw new Error('Profile output folder already exists, please specify a new folder')
      console.log('1')
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

    if (flags.format === 'general' && !flags.mapping) {
      throw new Error('Please provide your own mapping for spreadsheets that do not follow CIS or DISA specifications')
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
        // Read mapping file
        if (flags.mapping) {
          if (fs.existsSync(flags.mapping)) {
            mappings = YAML.parse(fs.readFileSync(flags.mapping, 'utf-8'))
          } else {
            throw new Error('Passed metadata file does not exist')
          }
        } else {
          mappings = YAML.parse(fs.readFileSync(path.join(getInstalledPath(), 'src', 'resources', 'cis.mapping.yml'), 'utf-8'))
        }
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
          mappedRecords.forEach(record => {
            // Get the control ID
            let controlId = extractValueViaPathOrNumber('mappings.id', mappings.id, record)
            if (controlId) {
              // Prevent controls that get parsed from 1.10 to 1.1 from being over-written, this assumes the controls are in order
              while (completedIds.indexOf(controlId) !== -1) {
                controlId += '0'
              }
              completedIds.push(controlId)
              const newControl: Partial<InSpecControl> = {
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
              if (flags.format === 'cis' && newControl.tags && newControl.tags.cis_controls && typeof newControl.tags.cis_controls === 'string') {
                // Match standard CIS benchmark XLSX spreadsheets
                // CIS controls are a string before they are parsed
                let cisControlMatches = (newControl.tags.cis_controls as unknown as string).match(/CONTROL:v(\d) (\d+)\.?(\d*)/)
                if (cisControlMatches) {
                  newControl.tags.cis_controls = []
                  const mappedCISControlsByVersion: Record<string, string[]> = {}
                  cisControlMatches.map(cisControl => cisControl.split(' ')).forEach(([revision, cisControl]) => {
                    const controlRevision = revision.split('CONTROL:v')[1]
                    const existingControls = _.get(mappedCISControlsByVersion, controlRevision) || []
                    existingControls.push(cisControl)
                    mappedCISControlsByVersion[controlRevision] = existingControls
                  })
                  Object.entries(mappedCISControlsByVersion).forEach(([version, controls]) => {
                    newControl.tags?.cis_controls?.push({
                      [version]: controls,
                    })
                  })
                } else {
                  // Match parsed CIS benchmark PDFs
                  // CIS controls are a string before they are parsed
                  cisControlMatches = (newControl.tags.cis_controls as unknown as string).match(/v\d\W\r?\n\d.?\d?\d?/gi)
                  if (cisControlMatches) {
                    newControl.tags.cis_controls = []
                    const mappedCISControlsByVersion: Record<string, string[]> = {}
                    cisControlMatches.map((cisControl => cisControl.replace(/\r?\n/, '').split(' '))).forEach(([revision, cisControl]) => {
                      if (revision === 'v7') {
                        if (cisControl in CISNistMappings) {
                          newControl.tags?.nist?.push(_.get(CISNistMappings, cisControl))
                        }
                      }
                      const revisionNumber = revision.replace('v', '')
                      const existingControls = _.get(mappedCISControlsByVersion, revisionNumber) || []
                      existingControls.push(cisControl)
                      mappedCISControlsByVersion[revisionNumber] = existingControls
                    })
                    Object.entries(mappedCISControlsByVersion).forEach(([version, controls]) => {
                      newControl.tags?.cis_controls?.push({
                        [version]: controls,
                      })
                    })
                  }
                }
              }
              if (newControl.ref) {
                const urlMatches = newControl.ref.replace(/\r/g, '').replace(/\n/g, '').match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g)
                if (urlMatches) {
                  newControl.refs = urlMatches
                }
                newControl.ref = undefined
              }
              inspecControls.push(newControl as unknown as InSpecControl)
            } else {
              // Possibly a section divider, possibly a bad mapping. Let the user know to verify
              const title = extractValueViaPathOrNumber('mappings.title', mappings.title || 'Title', record) || 'Unknown title'
              console.error(`Control "${title}" has no ID... skipping`)
            }
          })
        }
      })
    }).catch((error: any) => {
      // Read mapping file
      if (flags.mapping) {
        if (fs.existsSync(flags.mapping)) {
          mappings = YAML.parse(fs.readFileSync(flags.mapping, 'utf-8'))
        } else {
          throw new Error('Passed metadata file does not exist')
        }
      } else {
        mappings = YAML.parse(fs.readFileSync(path.join(getInstalledPath(), 'src', 'resources', 'disa.mapping.yml'), 'utf-8'))
      }
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

      records.forEach(record => {
        const newControl: Partial<InSpecControl> = {
          refs: [],
          tags: {
            nist: [],
            severity: impactNumberToSeverityString(extractValueViaPathOrNumber('mappings.impact', mappings.impact, record)),
          },
        }
        Object.entries(mappings).forEach(mapping => {
          if (mapping[0] === 'id' && flags.controlNamePrefix) {
            _.set(newControl, mapping[0].toLowerCase(), `${flags.controlNamePrefix ? flags.controlNamePrefix + '-' : ''}${extractValueViaPathOrNumber(mapping[0], mapping[1], record)}`)
          }
          _.set(newControl, mapping[0].toLowerCase(), extractValueViaPathOrNumber(mapping[0], mapping[1], record))
        })
        if (newControl.tags && newControl.tags?.cci) {
          newControl.tags.nist = []
          newControl.tags.cci.forEach(cci => {
            if (cci in CCINistMappings) {
              newControl.tags?.nist?.push(_.get(CCINistMappings, cci))
            }
          })
        }
        inspecControls.push(newControl as unknown as InSpecControl)
      })
    })

    // Convert all extracted controls to Ruby/InSpec code
    inspecControls.forEach(control => {
      fs.writeFileSync(path.join(flags.output, 'controls', control.id + '.rb'), inspecControlToRubyCode(control))
    })
  }
}
