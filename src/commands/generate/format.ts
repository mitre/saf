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
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input execution/profile JSON file(s) and InSpec Profile Folder'}),
    report: Flags.string({char: 'r', required: false, description: 'Output markdown report file'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = [
    'saf generate format -i ./redhat-enterprise-linux-6-stig-baseline/ ./redhat-enterprise-linux-6-stig-baseline/profile.json --logLevel debug -r rhel-6-format-report.md',
    'saf generate format -i ./canonical-ubuntu-18.04-lts-server-cis-baseline ./canonical-ubuntu-18.04-lts-server-cis-baseline/profile.json --logLevel debug',
  ]

  async run() {
    const {flags} = await this.parse(GenerateFormat)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    logger.warn("'saf generate delta' is currently a release candidate. Please report any questions/bugs to https://github.com/mitre/saf/issues.")

    let controls: Record<string, string> = {}
    let existingProfile: any | null = null

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
          existingProfile = processInSpecProfile(fs.readFileSync(inputPath, 'utf8'))
          logger.debug(`Loaded ${inputPath} as Profile JSON/Execution JSON`)
        } catch (error) {
          try {
            // Check if we have an XCCDF XML file
            const inputFile = fs.readFileSync(inputPath, 'utf8')
            const inputFirstLine = inputFile.split('\n').slice(0, 10).join('').toLowerCase()
            if (inputFirstLine.includes('xccdf')) {
              logger.debug(`No need to input XCCDF definitions at ${inputPath} for formatting only. To run a delta command, check "saf generate delta -h" instead.`)
            } else if (inputFirstLine.includes('oval_definitions')) {
              logger.debug(`No need to input OVAL definitions at ${inputPath} for formatting only. To run a delta command, check "saf generate delta -h" instead.`)
            } else {
              logger.error(`Unable to load ${inputPath} as XCCDF or OVAL`)
              process.exit(1)
            }

            logger.debug(`Loaded ${inputPath} as XCCDF`)
          } catch (xccdfError) {
            logger.error(`Could not load ${inputPath} as an execution/profile JSON because:`)
            logger.error(error)
            logger.error(`Could not load ${inputPath} as an XCCDF/OVAL XML file because:`)
            logger.error(xccdfError)
            throw error
          }
        }
      }
    })

    // If all variables have been satisfied, we can generate the delta
    if (existingProfile) {
      if (!controls) {
        logger.warn('No existing control found in profile folder, delta will only be printed to the console')
        controls = {}
      }

        // If existingProfileFolderPath exists
        if (existingProfileFolderPath && fs.existsSync(path.join(existingProfileFolderPath, 'controls'))) {
            logger.debug(`Deleting existing profile folder ${path.join(existingProfileFolderPath, 'controls')}`)
            fse.emptyDirSync(path.join(existingProfileFolderPath, 'controls'))
        }

        logger.debug('Formatting the original controls with no diff.')
        existingProfile.controls.forEach((control: Control) => {
            // Write the new control to the controls folder
            logger.debug(`Writing updated control ${control.id} to profile`)
            fs.writeFileSync(path.join(existingProfileFolderPath, 'controls', `${control.id}.rb`), control.toRuby()) // Ensure we always have a newline at EOF
        })
    }
  }
}
