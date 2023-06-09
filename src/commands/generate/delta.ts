import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {processInSpecProfile, processOVAL, UpdatedProfileReturn, updateProfileUsingXCCDF} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'

export default class GenerateDelta extends Command {
  static description = 'Update an existing InSpec profile with updated XCCDF guidance'

  static flags = {
    help: Flags.help({char: 'h'}),
    inspecJsonFile: Flags.string({char: 'J', required: true, description: 'Input execution/profile JSON file - can be generated using the "inspec json <profile path> | jq . > profile.json" command'}),
    xccdfXmlFile: Flags.string({char: 'X', required: true, description: 'The XCCDF XML file containing the new guidance - in the form of .xml file'}),
    ovalXmlFile: Flags.string({char: 'O', required: false, description: 'The OVAL XML file containing definitions used in the new guidance - in the form of .xml file'}),
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
    'saf generate delta -J ./the_profile_json_file.json -X ./the_xccdf_guidance_file.xml  -o the_output_directory -O ./the_oval_file.xml -T group -r the_update_report_file.md -L debug',
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
        logger.error(`ERROR: No entity found for: ${flags.inspecJsonFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`ERROR: Unable to process Input execution/profile JSON ${flags.inspecJsonFile} because: ${error}`)
        throw error
      }
    }

    // Process the XCCDF XML file containing the new/updated profile guidance
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
          logger.error(`ERROR: Unable to load ${xccdfXmlFile} as XCCDF`)
          throw new Error('Cannot load XCCDF file')
        }

        logger.debug(`Loaded ${xccdfXmlFile} as XCCDF`)
      } else {
        throw new Error('No benchmark (XCCDF) file was provided.')
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`ERROR: No entity found for: ${flags.xccdfXmlFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`ERROR: Unable to process the XCCDF XML file ${flags.xccdfXmlFile} because: ${error}`)
        throw error
      }
    }

    // Process the OVAL XML file
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
            logger.error(`ERROR: Unable to load ${ovalXmlFile} as OVAL`)
            throw new Error('Cannot load OVAL file')
          }
        } else {
          logger.error(`ERROR: An OVAL flag option was detected, but no file was provided, received: ${flags.ovalXmlFile}`)
          throw new Error('No OVAL file detected')
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`ERROR: No entity found for: ${flags.ovalXmlFile}. Run the --help command to more information on expected input files.`)
        throw error
      } else {
        logger.error(`Unable to process the OVAL XML file ${flags.ovalXmlFile} because: ${error}`)
        throw error
      }
    }

    // Process the output folder
    try {
      // Create the folder if it doesn't exist
      if (!fs.existsSync(flags.output)) {
        fs.mkdirSync(path.join(flags.output), {recursive: true})
      }

      if (path.basename(flags.output) === 'controls') {
        logger.debug(`Deleting existing profile folder ${flags.output}`)
        fse.emptyDirSync(flags.output)
        outputProfileFolderPath = path.dirname(flags.output)
      } else {
        const controlDir = path.join(flags.output, 'controls')
        if (fs.existsSync(controlDir)) {
          logger.debug(`Deleting content within existing controls folder within the profile folder ${flags.output}`)
          fse.emptyDirSync(controlDir)
        } else {
          fse.mkdirSync(controlDir)
        }

        outputProfileFolderPath = flags.output
      }
    } catch (error: any) {
      logger.error(`ERROR: Could not process output ${flags.output}. Check the --help command for more information on the -o flag.`)
      throw error
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
      let updatedResult: UpdatedProfileReturn
      logger.debug(`Processing XCCDF Benchmark file: ${flags.input} using ${flags.idType} id.`)
      const idTypes = ['rule', 'group', 'cis', 'version']
      if (idTypes.includes(flags.idType)) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, flags.idType as 'cis' | 'version' | 'rule' | 'group', logger, ovalDefinitions)
      } else {
        logger.error(`ERROR: Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`)
        throw new Error('Invalid ID Type')
      }

      logger.debug('Computed the delta between the existing profile and updated benchmark.')

      updatedResult.profile.controls.forEach(control => {
        logger.debug(`Writing updated control ${control.id}.`)
        fs.writeFileSync(path.join(outputProfileFolderPath, 'controls', `${control.id}.rb`), control.toRuby())
      })

      logger.info(`Writing delta file for ${existingProfile.title}`)
      fs.writeFileSync(path.join(outputProfileFolderPath, 'delta.json'), JSON.stringify(updatedResult.diff, null, 2))

      if (flags.report) {
        logger.debug('Writing report markdown file')
        fs.writeFileSync(path.join(markDownFile), updatedResult.markdown)
      }
    } else {
      if (!existingProfile) {
        logger.error('ERROR: Could not generate delta because the existingProfile variable was not satisfied.')
      }

      if (!updatedXCCDF) {
        logger.error('ERROR: Could not generate delta because the updatedXCCDF variable was not satisfied.')
      }
    }
  }
}
