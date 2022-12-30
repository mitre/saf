import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {processInSpecProfile, processOVAL, UpdatedProfileReturn, updateProfileUsingXCCDF} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'

export default class GenerateDelta extends Command {
  static description = 'Update an existing InSpec profile in-place with new XCCDF metadata'

  static flags = {
    help: Flags.help({char: 'h'}),
    // input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input execution/profile JSON file(s), InSpec Profile Folder, AND the updated XCCDF XML files'}),
    inputProfile: Flags.string({char: 'i', required: true, description: 'Input execution/profile JSON file - can be generated using the "inspec json" command'}),
    xccdfFile: Flags.string({char: 'x', required: true, description: 'The XCCDF or Oval XML file containing the new profile guidance - in the form of .xml file'}),
    outputFolder: Flags.string({char: 'o', required: true, description: 'The output folder for the updated profile - if not empty it will be overwritten'}),

    report: Flags.string({char: 'r', required: false, description: 'Output markdown report file'}),
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
    'saf generate delta -i ./redhat-enterprise-linux-6-stig-baseline/ ./redhat-enterprise-linux-6-stig-baseline/profile.json ./U_RHEL_6_STIG_V2R2_Manual-xccdf.xml -T group --logLevel debug -r rhel-6-update-report.md',
    'saf generate delta -i ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-xccdf.xml ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-oval.xml ./canonical-ubuntu-18.04-lts-server-cis-baseline ./canonical-ubuntu-18.04-lts-server-cis-baseline/profile.json --logLevel debug',
  ]

  async run() {
    const {flags} = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    logger.warn("'saf generate delta' is currently a release candidate. Please report any questions/bugs to https://github.com/mitre/saf/issues.")

    let existingProfile: any | null = null
    let updatedXCCDF: any = {}
    let ovalDefinitions: any = {}

    let outputProfileFolderPath = ''

    // Process the Input execution/profile JSON file
    try {
      if (fs.lstatSync(flags.inputProfile).isFile()) {
        const inputProfile = flags.inputProfile
        try {
          // This should fail if we aren't passed an execution/profile JSON
          logger.debug(`Loading ${inputProfile} as Profile JSON/Execution JSON`)
          existingProfile = processInSpecProfile(fs.readFileSync(inputProfile, 'utf8'))
          logger.debug(`Loaded ${inputProfile} as Profile JSON/Execution JSON`)
        } catch (error) {
          logger.error(`Could not processed ${inputProfile} as an InsPec Profile JSON because:`)
          logger.error(error)
          throw error
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`Invalid InsPec Profile JSON file: ${flags.inputProfile}. Check the --help command for expected input file.`)
        throw new Error('Invalid InsPec Profile JSON file provided')
      } else {
        logger.error(`Unable to process Input execution/profile JSON ${flags.inputProfile} because:`)
        logger.error(error)
        throw error
      }
    }

    // Process the The XCCDF or Oval XML file containing the new/updated profile guidance
    try {
      if (fs.lstatSync(flags.xccdfFile).isFile()) {
        const xccdfFile = flags.xccdfFile
        try {
          // Check if we have an XCCDF XML file
          const inputFile = fs.readFileSync(xccdfFile, 'utf8')
          const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
          if (inputFirstLine.includes('xccdf')) {
            logger.debug(`Loading ${xccdfFile} as XCCDF`)
            updatedXCCDF = inputFile
            logger.debug(`Loaded ${xccdfFile} as XCCDF`)
          } else if (inputFirstLine.includes('oval_definitions')) {
            logger.debug(`Loading ${xccdfFile} as OVAL`)
            ovalDefinitions = processOVAL(inputFile)
            logger.debug(`Loaded ${xccdfFile} as OVAL`)
          } else {
            logger.error(`Unable to load ${xccdfFile} as XCCDF or OVAL`)
            process.exit(1)
          }

          logger.debug(`Loaded ${xccdfFile} as XCCDF`)
        } catch (error) {
          logger.error(`Could not load ${xccdfFile} as an XCCDF/OVAL XML file because:`)
          logger.error(error)
          throw error
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.error(`Invalid XCCDF or Oval file: ${flags.xccdfFile}. Check the --help command for expected input file.`)
        throw new Error('Invalid XCCDF or Oval XML file containing the new/updated profile guidance provided')
      } else {
        logger.error(`Unable to process the XCCDF or Oval XML file ${flags.xccdfFile} because:`)
        logger.error(error)
        throw error
      }
    }

    // Process the output folder for the updated profile
    if (fs.lstatSync(flags.outputFolder).isDirectory()) {
      if (path.basename(flags.outputFolder) === 'controls') {
        logger.debug(`Deleting existing profile folder ${flags.outputFolder}`)
        fse.emptyDirSync(flags.outputFolder)
        outputProfileFolderPath = path.dirname(flags.outputFolder)
      } else {
        const controlDir = path.join(flags.outputFolder, 'controls')
        try {
          if (fs.lstatSync(controlDir).isDirectory()) {
            outputProfileFolderPath = flags.outputFolder
          }
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            fse.mkdirSync(controlDir)
            outputProfileFolderPath = flags.outputFolder
          } else {
            throw error
          }
        }
      }

      logger.debug(`Output folder for the updated profile is: ${outputProfileFolderPath}`)
    } else {
      logger.error('No output folder provided for the updated profile controls.')
      throw new Error(`Expected a folder to output the updated profile controls, received: ${flags.outputFolder}.`)
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
        fs.writeFileSync(path.join(flags.report), updatedResult.markdown)
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
