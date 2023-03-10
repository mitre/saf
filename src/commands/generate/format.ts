import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {processInSpecProfile} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'
import Control from '@mitre/inspec-objects/lib/objects/control'

export default class GenerateFormat extends Command {
  static description = 'Format an existing InSpec profile in-place. This can be done before using "saf generate delta" for easier comparison.'

  static flags = {
    help: Flags.help({char: 'h'}),
    inspecJsonFile: Flags.string({char: 'J', required: true, description: 'Input execution/profile JSON file - can be generated using the "inspec json <profile path> | jq . > profile.json" command'}),
    output: Flags.string({char: 'o', required: true, description: 'The output folder for the updated profile - if it is not empty, it will be overwritten'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = [
    'saf generate format -o ./redhat-enterprise-linux-6-stig-baseline/ -J ./redhat-enterprise-linux-6-stig-baseline/profile.json --logLevel debug -r rhel-6-format-report.md',
    'saf generate format -o ./canonical-ubuntu-18.04-lts-server-cis-baseline -J ./canonical-ubuntu-18.04-lts-server-cis-baseline/profile.json --logLevel debug',
  ]

  async run() {
    const {flags} = await this.parse(GenerateFormat)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    logger.warn("'saf generate delta' is currently a release candidate. Please report any questions/bugs to https://github.com/mitre/saf/issues.")

    let controls: Record<string, string> = {}
    let existingProfile: any | null = null

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

    // If all variables have been satisfied, we can generate the delta
    if (existingProfile) {
      if (!controls) {
        logger.warn('No existing control found in profile folder, delta will only be printed to the console')
        controls = {}
      }

      // If existingProfileFolderPath exists
      if (outputProfileFolderPath && fs.existsSync(path.join(outputProfileFolderPath, 'controls'))) {
        logger.debug(`Deleting existing profile folder ${path.join(outputProfileFolderPath, 'controls')}`)
        fse.emptyDirSync(path.join(outputProfileFolderPath, 'controls'))
      }

      logger.debug('Formatting the original controls with no diff.')
      existingProfile.controls.forEach((control: Control) => {
        // Write the new control to the controls folder
        logger.debug(`Writing updated control ${control.id} to profile`)
        fs.writeFileSync(path.join(outputProfileFolderPath, 'controls', `${control.id}.rb`), control.toRuby()) // Ensure we always have a newline at EOF
      })
    }
  }
}
