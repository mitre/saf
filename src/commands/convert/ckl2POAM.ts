import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import _ from 'lodash'
import moment from 'moment'
import path from 'path'
import promptSync from 'prompt-sync'
import {createLogger, format, transports} from 'winston'
import XlsxPopulate from 'xlsx-populate'
import xml2js from 'xml2js'

import {default as files} from '../../resources/files.json'
import {STIG, STIGHolder, Vulnerability} from '../../types/STIG'
import {cci2nist, cklSeverityToImpact, cklSeverityToLikelihood, cklSeverityToPOAMSeverity, cklSeverityToRelevanceOfThreat, cklSeverityToResidualRiskLevel, cleanStatus, combineComments, convertToRawSeverity, createCVD, extractSTIGUrl, extractSolution, replaceSpecialCharacters} from '../../utils/ckl2poam'
import {convertFullPathToFilename, dataURLtoU8Array} from '../../utils/global'

const prompt = promptSync()
const {printf} = format

const fmt = printf(({
  file,
  level,
  message,
}) => {
  return `${level.toUpperCase()}: ${file}: ${message}`
})

const logger = createLogger({
  format: fmt,
  transports: [
    new transports.Console(),
  ],
})

const STARTING_ROW = 8 // The row we start inserting controls into

export default class CKL2POAM extends Command {
  static aliases = ['convert:ckl2poam']

  static description = 'Translate DISA Checklist CKL file(s) to POA&M files'

  static examples = ['saf convert ckl2POAM -i checklist_file.ckl -o output-folder -d abcdefg -s 2']

  static flags = {
    deviceName: Flags.string({char: 'd', default: '', description: 'Name of target device (prompts for each file if not set)', required: false}),
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Path to the DISA Checklist File(s)', multiple: true, required: true}),
    officeOrg: Flags.string({char: 'O', default: '', description: 'Default value for Office/org (prompts for each file if not set)', required: false}),
    output: Flags.string({char: 'o', description: 'Path to output PO&M File(s)', required: true}),
    rowsToSkip: Flags.integer({char: 's', default: 4, description: 'Rows to leave between POA&M Items for milestones', required: false}),
  }

  static usage = 'convert ckl2POAM -i <disa-checklist>... -o <poam-output-folder> [-h] [-O <office/org>] [-d <device-name>] [-s <num-rows>]'

  async run() {
    const {flags} = await this.parse(CKL2POAM)
    // Create output folder if it doesn't exist already
    if (!fs.existsSync(flags.output)) {
      fs.mkdirSync(flags.output)
    }

    flags.input.forEach((fileName: string) => {
      // Ignore files that start with . (e.g .gitignore)
      if (fileName.startsWith('.')) {
        return
      }

      logger.log({
        file: fileName,
        level: 'info',
        message: 'Opening file',
      })
      const parser = new xml2js.Parser()
      fs.readFile(fileName, function (readFileError, data) {
        if (readFileError) {
          logger.log({
            file: fileName,
            level: 'error',
            message: `An error occurred opening the file ${fileName}: ${readFileError}`,
          })
        }

        // Parse the XML to a javascript object
        parser.parseString(data, function (parseFileError: any, result: STIG) {
          if (parseFileError) {
            logger.log({
              file: fileName,
              level: 'error',
              message: `An error occurred parsing the file: ${readFileError}`,
            })
          } else {
            const infos: Record<string, string> = {}
            let vulnerabilities: Vulnerability[] = []
            const iStigs: STIGHolder[] = []
            const stigs = result.CHECKLIST.STIGS
            logger.log({
              file: fileName,
              level: 'info',
              message: `Found ${stigs?.length} STIGs`,
            })
            // Get nested iSTIGs
            stigs?.forEach(stig => {
              stig.iSTIG?.forEach(iStig => {
                iStigs.push(iStig)
              })
            })
            logger.log({
              file: fileName,
              level: 'info',
              message: `Found ${iStigs.length} iSTIGs`,
            })
            // Get the controls/vulnerabilities from each stig
            iStigs.forEach(iSTIG => {
              iSTIG.STIG_INFO?.forEach(info => {
                info.SI_DATA?.forEach(data => {
                  if (data.SID_DATA) {
                    infos[data.SID_NAME[0]] = data.SID_DATA[0]
                  }
                })
              })
              if (iSTIG.VULN) {
                vulnerabilities = [
                  ...vulnerabilities,
                  ...iSTIG.VULN.map(vulnerability => {
                    const values: Record<string, unknown> = {}
                    // Extract STIG_DATA
                    vulnerability.STIG_DATA?.reverse().forEach(data => {
                      values[data.VULN_ATTRIBUTE[0]] = data.ATTRIBUTE_DATA[0]
                    })
                    // Extract remaining fields (status, finding details, comments, security override, and severity justification)
                    Object.entries(vulnerability).forEach(([key, value]) => {
                      values[key] = value[0]
                    })
                    return values
                  }),
                ]
              }
            })
            logger.log({
              file: fileName,
              level: 'info',
              message: `Found ${vulnerabilities.length} vulnerabilities`,
            })
            const officeOrg = flags.officeOrg || prompt('What should the default value be for Office/org? ')
            const host = flags.deviceName || prompt('What is the device name? ')
            // Read our template
            XlsxPopulate.fromDataAsync(dataURLtoU8Array(files.POAMTemplate.data)).then((workBook: any) => {
              // eMASS reads the first sheet in the notebook
              const sheet = workBook.sheet(0)
              // The current row we are on
              let currentRow = STARTING_ROW
              // The scheduled completion date, default of one year from today
              const aYearFromNow = moment(new Date(new Date().setFullYear(new Date().getFullYear() + 1))).format('M/DD/YYYY')
              // For each vulnerability
              vulnerabilities.forEach(vulnerability => {
                if (vulnerability.STATUS !== 'NotAFinding' && vulnerability.STATUS !== 'Not_Reviewed') {
                  // Control Vulnerability Description
                  if (vulnerability.STATUS === 'Not_Applicable') {
                    sheet.cell(`C${currentRow}`).value('Not Applicable')
                  } else {
                    sheet.cell(`C${currentRow}`).value(replaceSpecialCharacters(createCVD(vulnerability)))
                  }

                  // Security Control Number
                  sheet.cell(`D${currentRow}`).value(cci2nist(vulnerability.CCI_REF || ''))
                  // Office/org
                  sheet.cell(`E${currentRow}`).value(officeOrg)
                  // Security Checks
                  sheet.cell(`F${currentRow}`).value(vulnerability.Rule_ID?.split(',')[0])
                  // Resources Required
                  sheet.cell(`G${currentRow}`).value('NA')
                  // Scheduled Completion Date
                  // Default is one year from today
                  sheet.cell(`H${currentRow}`).value(aYearFromNow)
                  // Source Identifying Vulnerability
                  sheet.cell(`K${currentRow}`).value(infos.title || '')
                  // Status
                  sheet.cell(`L${currentRow}`).value(cleanStatus(vulnerability.STATUS || ''))
                  // Comments
                  if (vulnerability.STATUS === 'Open' || vulnerability.STATUS === 'Not_Applicable') {
                    if (host.startsWith('Nessus')) {
                      sheet.cell(`M${currentRow}`).value(combineComments(vulnerability, extractSTIGUrl(vulnerability.FINDING_DETAILS || '')))
                    } else {
                      sheet.cell(`M${currentRow}`).value(combineComments(vulnerability, host))
                    }
                  }

                  // Raw Severity
                  sheet.cell(`N${currentRow}`).value(convertToRawSeverity(vulnerability.Severity || ''))
                  // Severity
                  sheet.cell(`P${currentRow}`).value(cklSeverityToPOAMSeverity(vulnerability.Severity || ''))
                  // Relevance of Threat
                  sheet.cell(`Q${currentRow}`).value(cklSeverityToRelevanceOfThreat(vulnerability.Severity || ''))
                  // Likelihood
                  sheet.cell(`R${currentRow}`).value(cklSeverityToLikelihood(vulnerability.Severity || ''))
                  // Impact
                  sheet.cell(`S${currentRow}`).value(cklSeverityToImpact(vulnerability.Severity || ''))
                  // Residual Risk Level
                  sheet.cell(`U${currentRow}`).value(cklSeverityToResidualRiskLevel(vulnerability.Severity || ''))
                  // Impact Description
                  sheet.cell(`T${currentRow}`).value(replaceSpecialCharacters(vulnerability.Vuln_Discuss || ''))
                  // Recommendations
                  sheet.cell(`V${currentRow}`).value(replaceSpecialCharacters(vulnerability.Fix_Text || extractSolution(vulnerability.FINDING_DETAILS || '') || ''))
                  // Go to the next row
                  currentRow += flags.rowsToSkip + 1
                }
              })
              return workBook.toFileAsync(path.join(flags.output, `${convertFullPathToFilename(fileName)}-${moment(new Date()).format('YYYY-MM-DD-HHmm')}.xlsm`))
            })
          }
        })
      })
    })
  }
}
