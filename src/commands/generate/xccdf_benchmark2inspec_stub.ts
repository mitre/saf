/* eslint-disable no-negated-condition */
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {InSpecMetaData} from '../../types/inspec'
import path from 'path'
import {createWinstonLogger} from '../../utils/logging'
import {processOVAL, processXCCDF} from '@mitre/inspec-objects'

export default class XCCDF2InSpec extends Command {
  static usage =
    'generate xccdf_benchmark2inspec_stub -i, --input=XML -o, --output=FOLDER';

  static description =
    'Translate an XCCDF benchmark file to a skeleton for an InSpec profile';

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Path to the XCCDF benchmark file'}),
    metadata: Flags.string({char: 'm', required: false, description: 'Path to a JSON file with additional metadata for the inspec.yml file'}),
    singleFile: Flags.boolean({char: 's', required: false, default: false, description: 'Output the resulting controls as a single file'}),
    idType: Flags.string({
      char: 'T', 
      required: false, 
      default: 'vuln', 
      options: ['vuln', 'group', 'cis', 'stig'], 
      description: "Control ID Types: Vulnerability IDs (ex. 'SV-XXXXX'), Group IDs (ex. 'V-XXXXX'), CIS Rule IDs (ex. C-1.1.1.1), STIG IDs (ex. RHEL-07-010020 - also known as Version)"
    }),
    ovalDefinitions: Flags.string({char: 'O', required: false, description: 'Path to an OVAL definitions file to populate profile elements that reference OVAL defintions'}),
    output: Flags.string({char: 'o', required: false, default: 'profile', description: 'The output folder to write the generated InSpec content'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  };

  async run() {
    const {flags} = await this.parse(XCCDF2InSpec)

    const logger = createWinstonLogger('generate:delta', flags.logLevel)
    // Check if the output folder already exists
    if (!fs.existsSync(flags.output)) {
      logger.debug("Creating output folder with controls and libraries directories")
      fs.mkdirSync(flags.output)
      fs.mkdirSync(path.join(flags.output, 'controls'))
      fs.mkdirSync(path.join(flags.output, 'libraries'))
    } else {
      // Folder should not exist already
      throw new Error(
        'Profile output folder already exists, please specify a new folder',
      )
    }

    // This will get overridden if a metadata file is passed
    let metadata: InSpecMetaData = {}
    // Read metadata file if passed
    if (flags.metadata) {
      if (fs.existsSync(flags.metadata)) {
        logger.debug(`Reading metadata file: ${flags.metadata}.`)
        metadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf8'))
      } else {
        throw new Error('Passed metadata file does not exist')
      }
    }

    // Read OVAL definitions file if passed
    let ovalDefinitions

    if (flags.ovalDefinitions) {
      if (fs.existsSync(flags.ovalDefinitions)) {
        logger.debug(`Reading oval definitions file: ${flags.ovalDefinitions}.`)
        ovalDefinitions = processOVAL(fs.readFileSync(flags.ovalDefinitions, 'utf8'))
      } else {
        throw new Error('Passed OVAL definitions file does not exist')
      }
    }

    // Read the XCCDF file
    const xccdf = fs.readFileSync(flags.input, 'utf8')
    let profile
    logger.debug(`Processing XCCDF Benchmark file: ${flags.input} using ${flags.idType} id.`)
    if (flags.idType === 'group') {
      profile = processXCCDF(xccdf, false, 'group', ovalDefinitions)
    } else if (flags.idType === 'stig') {
      profile = processXCCDF(xccdf, false, 'version', ovalDefinitions)
    } else if (flags.idType === 'cis') {
      profile = processXCCDF(xccdf, false, 'cis', ovalDefinitions)
    } else if (flags.idType === 'vuln') {
      profile = processXCCDF(xccdf, false, 'rule', ovalDefinitions)
    } else {
      logger.error(`Invalid ID Type: ${flags.idType}. Check the --help command for the available ID Type options.`)
      throw new Error('No ID type specified')
    }

    profile.version = '1.0.0'

    // Add metadata if provided
    if (flags.metadata) {
      profile.maintainer = metadata.maintainer
      profile.copyright = metadata.copyright
      profile.license = metadata.license
      profile.version = metadata.version || '1.0.0'
    }

    // Write inspec.yml
    logger.debug(`Writing inspec.yml file to: ${path.join(flags.output, 'inspec.yml')}`)
    fs.writeFileSync(
      path.join(flags.output, 'inspec.yml'),
      profile.createInspecYaml(),
    )

    // Write all controls
    if (flags.singleFile) {
      const controls = profile.controls
      .map(control => control.toRuby())
      .join('\n\n')
      logger.debug(`Writing control to: ${path.join(flags.output, 'controls', 'controls.rb')}`)
      fs.writeFileSync(
        path.join(flags.output, 'controls', 'controls.rb'),
        controls,
      )
    } else {
      profile.controls.forEach(control => {
        logger.debug(`Writing control to: ${path.join(flags.output, 'controls', control.id + '.rb')}`)
        fs.writeFileSync(
          path.join(flags.output, 'controls', control.id + '.rb'),
          control.toRuby(),
        )
      })
    }
  }
}
