import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {diffProfile, processJSON, processXCCDF} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'

export default class GenerateDelta extends Command {
  static usage = 'generate:delta -i, --input=JSON -o, --output=OUTPUT'

  static description: string = 'Update existing InSpec profiles with new STIG metadata'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input execution/profile JSON file(s) OR InSpec Profile Folder, and the updated XCCDF XML files'}),
    output: Flags.string({char: 'o', required: true, description: 'Output updated profile folder'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = await this.parse(GenerateDelta)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)

    let controls: Record<string, string> | null = null
    let existingProfile: any | null = null
    let updatedXCCDF: any = {}

    let existingProfileFolderPath = ''

    flags.input.forEach(inputPath => {
      // Check if input is a folder
      if (fs.lstatSync(inputPath).isDirectory()) {
        logger.debug(`Loading profile folder ${inputPath}`)
        const controlFiles = fs.readdirSync(path.join(inputPath, 'controls')).filter(file => file.toLowerCase().endsWith('.rb'))
        logger.debug(`Found ${controlFiles.length} control files in ${inputPath}`)

        controls = {}
        // Read all control files into an array as strings
        controlFiles.forEach(control => {
          logger.debug(`Loading ${control}`)
          const controlData = fs.readFileSync(path.join(inputPath, 'controls', control), 'utf8')
          controls![control.replace('.rb', '')] = controlData
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
            logger.debug(`Loading ${inputPath}`)
            const xccdfData = fs.readFileSync(inputPath, 'utf8')
            updatedXCCDF = processXCCDF(xccdfData)
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

    // If all variables have been satisfied, we can generate the delta
    if (existingProfile && updatedXCCDF) {
      if (!controls) {
        logger.warn('No existing control found in profile folder, delta will only be printedd to the console')
        controls = {}
      }

      // Find the difference between existingProfile and updatedXCCDF
      const diff = diffProfile(existingProfile, updatedXCCDF)

      console.log(Object.keys(diff))

      // Add all new controls to the existingControlsRubyCode
      diff.addedControlIDs.forEach((controlId: string) => {
        console.log(diff.changedControls[controlId].toRuby())
        controls![controlId] = diff.changedControls[controlId].toRuby()
      })

      logger.info(`Generating delta for ${existingProfile.title}`)
      // Write the delta to a file
      fs.writeFileSync(path.join(flags.output, 'delta.json'), JSON.stringify(diff, null, 2))
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
