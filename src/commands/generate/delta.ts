import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {processInSpecProfile, processOVAL, updateProfileUsingXCCDF} from '@mitre/inspec-objects'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import fse from 'fs-extra'

export default class GenerateDelta extends Command {
  static description = 'Update an existing InSpec profile in-place with new XCCDF metadata'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input execution/profile JSON file(s), InSpec Profile Folder, AND the updated XCCDF XML files'}),
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

    let controls: Record<string, string> = {}
    let existingProfile: any | null = null
    let updatedXCCDF: any = {}
    let ovalDefinitions: any = {}

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
              logger.debug(`Loading ${inputPath} as XCCDF`)
              updatedXCCDF = inputFile
              logger.debug(`Loaded ${inputPath} as XCCDF`)
            } else if (inputFirstLine.includes('oval_definitions')) {
              logger.debug(`Loading ${inputPath} as OVAL`)
              ovalDefinitions = processOVAL(inputFile)
              logger.debug(`Loaded ${inputPath} as OVAL`)
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
    if (existingProfile && updatedXCCDF) {
      if (!controls) {
        logger.warn('No existing control found in profile folder, delta will only be printed to the console')
        controls = {}
      }

      // Find the difference between existingProfile and updatedXCCDF
      let updatedResult
      logger.debug(`Processing XCCDF Benchmark file: ${flags.input} using ${flags.idType} id.`)
      const idTypes = ['rule', 'group', 'cis', 'version']
      if (idTypes.includes(flags.idType)) {
        updatedResult = updateProfileUsingXCCDF(existingProfile, updatedXCCDF, flags.idType as 'cis' | 'version' | 'rule' | 'group', logger, ovalDefinitions)
      } else {
        logger.error(`Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`)
        throw new Error('No ID type specified')
      }

      // If existingProfileFolderPath exists
      if (existingProfileFolderPath && fs.existsSync(path.join(existingProfileFolderPath, 'controls'))) {
        logger.debug(`Deleting existing profile folder ${path.join(existingProfileFolderPath, 'controls')}`)
        fse.emptyDirSync(path.join(existingProfileFolderPath, 'controls'))
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
