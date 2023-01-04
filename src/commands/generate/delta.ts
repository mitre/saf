import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {processInSpecProfile, processOVAL, UpdatedProfileReturn, updateProfileUsingXCCDF} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'

export default class GenerateDelta extends Command {
  static description = 'Update an existing InSpec profile in-place with new/updated XCCDF or OVAL metadata'

  static flags = {
    help: Flags.help({char: 'h'}),
    inspecJsonFile: Flags.string({char: 'J', required: true, description: 'Input execution/profile JSON file - can be generated using the "inspec json <profile path> | jq . > profile.json" command'}),
    xccdfXmlFile: Flags.string({char: 'X', required: true, description: 'The XCCDF XML file containing the new profile guidance - in the form of .xml file'}),
    ovalXmlFile: Flags.string({char: 'O', required: false, description: 'The OVAL XML file containing definitions used in the new profile guidance - in the form of .xml file'}),
    output: Flags.string({char: 'o', required: true, description: 'The output folder for the updated profile - if it is not empty, it will be overwritten'}),
    report: Flags.string({char: 'r', required: false, description: 'Output markdown report file - must have an extension of .md'}),
    idType: Flags.string({
      char: 'T',
      required: false,
      default: 'rule',
      options: ['rule', 'group', 'cis', 'version'],
      description: "Control ID Types: 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 'group' - Group IDs (ex. 'V-XXXXX'), 'cis' - CIS Rule IDs (ex. C-1.1.1.1), 'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)",
    }),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = [
    'saf generate delta -J ./the_profile_json_file.json -X ./the_xccdf_profile_guidance_file.xml  -o the_output_directory -O ./the_oval_profile_guidance_file.xml -T group -r the_update_report_file.md -L debug',
  ]

  async run() { // skipcq: JS-0044
    const {flags} = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    logger.warn("'saf generate delta' is currently a release candidate. Please report any questions/bugs to https://github.com/mitre/saf/issues.")

    let existingProfile: any | null = null
    let updatedXCCDF: any = {}
    let ovalDefinitions: any = {}

    let markDownFile = ''
    let outputProfileFolderPath = ''

    // Process the Input execution/profile JSON file
    try {
      if (fs.lstatSync(flags.inspecJsonFile).isFile()) {
        const inspecJsonFile = flags.inspecJsonFile
        logger.debug(`Loading ${inspecJsonFile} as Profile JSON/Execution JSON`)
        existingProfile = processInSpecProfile(fs.readFileSync(inspecJsonFile, 'utf8'))
        logger.debug(`Loaded ${inspecJsonFile} as Profile JSON/Execution JSON`)
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`Invalid InSpec Profile JSON file: ${flags.inspecJsonFile}. Check the --help command for expected input file.`)
        throw new Error('Invalid InSpec Profile JSON file provided')
      } else {
        logger.error(`Unable to process Input execution/profile JSON ${flags.inspecJsonFile} because: ${error}`)
        throw error
      }
    }

    // Process the XCCDF XML file containing the new/updated profile guidance failures
    try {
      if (fs.lstatSync(flags.xccdfXmlFile).isFile()) {
        const xccdfXmlFile = flags.xccdfXmlFile
        const inputFile = fs.readFileSync(xccdfXmlFile, 'utf8')
        const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
        if (inputFirstLine.includes('xccdf')) {
          logger.debug(`Loading ${xccdfXmlFile} as XCCDF`)
          updatedXCCDF = inputFile
          logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`)
        } else {
          logger.error(`Unable to load ${xccdfXmlFile} as XCCDF`)
          process.exit(1)
        }

        logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`)
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`Invalid XCCDF file: ${flags.xccdfXmlFile}. Check the --help command for expected input file.`)
        throw new Error('Invalid XCCDF XML file containing the new/updated profile guidance provided')
      } else {
        logger.error(`Unable to process the XCCDF XML file ${flags.xccdfXmlFile} because: ${error}`)
        throw error
      }
    }

    // Process the OVAL XML file containing the new/updated profile guidance failures
    try {
      if (flags.ovalXmlFile) {
        if (fs.lstatSync(flags.ovalXmlFile).isFile()) {
          const ovalXmlFile = flags.ovalXmlFile
          const inputFile = fs.readFileSync(ovalXmlFile, 'utf8')
          const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()

          if (inputFirstLine.includes('oval_definitions')) {
            logger.debug(`Loading ${ovalXmlFile} as OVAL`)
            ovalDefinitions = processOVAL(inputFile)
            logger.debug(`Loaded ${ovalXmlFile} as OVAL`)
          } else {
            logger.error(`Unable to load ${ovalXmlFile} as OVAL`)
            process.exit(1)
          }

          logger.debug(`Loaded ${ovalXmlFile} as OVAL`)
        } else {
          logger.error(`An OVAL flag option was detected, but no file was provided, received: ${flags.ovalXmlFile}`)
          process.exit(1)
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`Invalid OVAL file: ${flags.ovalXmlFile}. Check the --help command for expected input file.`)
        throw new Error('Invalid OVAL XML file containing the new/updated profile guidance provided')
      } else {
        logger.error(`Unable to process the OVAL XML file ${flags.ovalXmlFile} because: ${error}`)
        throw error
      }
    }

    // Process the output folder for the updated profile
    try {
      if (fs.lstatSync(flags.output).isDirectory()) {
        if (path.basename(flags.output) === 'controls') {
          logger.debug(`Deleting existing profile folder ${flags.output}`)
          fse.emptyDirSync(flags.output)
          outputProfileFolderPath = path.dirname(flags.output)
        } else {
          const controlDir = path.join(flags.output, 'controls')
          try {
            // eslint-disable-next-line max-depth
            if (fs.lstatSync(controlDir).isDirectory()) {
              outputProfileFolderPath = flags.output
            }
          } catch (error: any) {
            // eslint-disable-next-line max-depth
            if (error.code === 'ENOENT') {
              fse.mkdirSync(controlDir)
              outputProfileFolderPath = flags.output
            } else {
              throw error
            }
          }
        }

        logger.debug(`Output folder for the updated profile is: ${outputProfileFolderPath}`)
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        try {
          fs.mkdirSync(path.join(flags.output, 'controls'), {recursive: true})
          outputProfileFolderPath = flags.output
        } catch (error_: any) {
          logger.error(`Failed to create output directory ${flags.output}`)
          throw error_
        }
      } else {
        logger.error(`Unable to create the output directory ${flags.output} because: ${error}`)
        throw error
      }
    }

    // Set the report markdown file location
    if (flags.report) {
      if (fs.existsSync(flags.report) && fs.lstatSync(flags.report).isDirectory()) {
        // Not a file - directory provided
        markDownFile = path.join(flags.report, 'delta.md')
      } else if (fs.existsSync(flags.report) && fs.lstatSync(flags.report).isFile()) {
        // File name provided and exists - will be overwritten
        markDownFile = flags.report
      } else if (path.extname(flags.report) === '.md') {
        markDownFile = flags.report
      } else {
        markDownFile = path.join(outputProfileFolderPath, 'delta.md')
      }
    }

    // If all variables have been satisfied, we can generate the delta
    if (existingProfile && updatedXCCDF) {
      // Find the difference between existingProfile and updatedXCCDF
      let updatedResult: UpdatedProfileReturn
      logger.debug(`Processing XCCDF Benchmark file: ${flags.input} using ${flags.idType} id.`)
      const idTypes = ['rule', 'group', 'cis', 'version']
      if (idTypes.includes(flags.idType)) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, flags.idType as 'cis' | 'version' | 'rule' | 'group', logger, ovalDefinitions)
      } else {
        logger.error(`Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`)
        throw new Error('No ID type specified')
      }

      logger.debug('Received updated profile from inspec-objects')
      updatedResult.profile.controls.forEach(control => {
        // Write the new control to the controls folder
        logger.debug(`Writing updated control ${control.id} to profile`)
        fs.writeFileSync(path.join(outputProfileFolderPath, 'controls', `${control.id}.rb`), control.toRuby()) // Ensure we always have a newline at EOF
      })

      logger.info(`Writing delta file for ${existingProfile.title}`)
      // Write the delta to a file
      fs.writeFileSync(path.join(outputProfileFolderPath, 'delta.json'), JSON.stringify(updatedResult.diff, null, 2))
      if (flags.report) {
        logger.debug('Writing report markdown file')
        fs.writeFileSync(path.join(markDownFile), updatedResult.markdown)
      }
    } else {
      logger.error('Could not generate delta because one or more of the following variables were not satisfied:')

      if (!existingProfile) {
        logger.error('existingProfile')
      }

      if (!updatedXCCDF) {
        logger.error('updatedXCCDF')
      }
    }
  }
}
