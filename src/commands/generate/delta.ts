import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {processJSON, updateProfileUsingXCCDF} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'

export default class GenerateDelta extends Command {
  static usage = 'generate:delta -i, --input=JSON -o'

  static description = 'Update an existing InSpec profile in-place with new XCCDF metadata'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input execution/profile JSON file(s) OR InSpec Profile Folder, and the updated XCCDF XML files'}),
    report: Flags.string({char: 'r', required: false, description: 'Output markdown report file'}),
    useGroupID: Flags.boolean({char: 'g', description: "Use Group ID for control IDs (ex. 'V-XXXXX')"}),
    useVulnerabilityId: Flags.boolean({char: 'r', required: false, default: true, description: "Use Vulnerability IDs for control IDs (ex. 'SV-XXXXX')", exclusive: ['useStigID']}),
    useStigID: Flags.boolean({char: 'S', required: false, default: false, description: 'Use STIG IDs for control IDs (ex. RHEL-07-010020, also known as Version)', exclusive: ['useVulnerabilityId']}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    let controls: Record<string, string> = {}
    let existingProfile: any | null = null
    let updatedXCCDF: any = {}

    let existingProfileFolderPath = ''

    flags.input.forEach((inputPath: string) => {
      // Check if input is a folder
      if (fs.lstatSync(inputPath).isDirectory()) {
        logger.debug(`Loading profile folder ${inputPath}`)
        const controlFiles = fs.readdirSync(path.join(inputPath, 'controls')).filter(file => file.toLowerCase().endsWith('.rb'))
        logger.debug(`Found ${controlFiles.length} control files in ${inputPath}`)

        controls = {}
        // Read all control files into an array as strings
        controlFiles.forEach(control => {
          const controlData = fs.readFileSync(path.join(inputPath, 'controls', control), 'utf8')
          controls[control.replace('.rb', '')] = controlData
        })

        logger.debug(`Loaded ${inputPath} as profile folder`)

        existingProfileFolderPath = inputPath
      } else {
        try {
          // This should fail if we aren't passed an execution/profile JSON
          logger.debug(`Loading ${inputPath} as Profile JSON/Execution JSON`)
          existingProfile = processJSON(fs.readFileSync(inputPath, 'utf8'))
          logger.debug(`Loaded ${inputPath} as Profile JSON/Execution JSON`)
        } catch (error) {
          try {
            // Attempt to read the file as an XCCDF XML file
            updatedXCCDF = fs.readFileSync(inputPath, 'utf8')
            logger.debug(`Loaded ${inputPath} as XCCDF`)
          } catch (xccdfError) {
            logger.error(`Could not load ${inputPath} as an execution/profile JSON because:`)
            logger.error(error)
            logger.error(`Could not load ${inputPath} as an XCCDF XML file because:`)
            logger.error(xccdfError)
            throw error
          }
        }
      }
    })

    // If existingProfileFolderPath exists
    if (existingProfileFolderPath && fs.existsSync(path.join(existingProfileFolderPath, 'controls'))) {
      logger.debug(`Deleting existing profile folder ${existingProfileFolderPath}/controls/`)
      fse.emptyDirSync(path.join(existingProfileFolderPath, 'controls'))
    }

    // If all variables have been satisfied, we can generate the delta
    if (existingProfile && updatedXCCDF) {
      if (!controls) {
        logger.warn('No existing control found in profile folder, delta will only be printed to the console')
        controls = {}
      }

      // Find the difference between existingProfile and updatedXCCDF
      let updatedResult
      if (flags.useGroupID) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, 'group', logger)
      } else if (flags.useStigID) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, 'version', logger)
      } else if (flags.useVulnerabilityId) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, 'rule', logger)
      } else {
        throw new Error('No ID type specified')
      }

      logger.debug('Recieved updated profile from inspec-objects')
      updatedResult.profile.controls.forEach(control => {
        // Write the new control to the controls folder
        logger.debug(`Writing updated control ${control.id} to profile`)
        fs.writeFileSync(path.join(existingProfileFolderPath, 'controls', `${control.id}.rb`), control.toRuby()) // Ensure we always have a newline at EOF
      })

      logger.info(`Writing delta file for ${existingProfile.title}`)
      // Write the delta to a file
      fs.writeFileSync(path.join(existingProfileFolderPath, 'delta.json'), JSON.stringify(updatedResult.diff, null, 2))
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
