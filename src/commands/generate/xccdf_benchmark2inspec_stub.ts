
import {processOVAL, processXCCDF} from '@mitre/inspec-objects'
import Profile from '@mitre/inspec-objects/lib/objects/profile'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import path from 'path'

import {InSpecMetaData} from '../../types/inspec'
import {createWinstonLogger} from '../../utils/logging'

export default class XCCDFBenchmark2InSpec extends Command {
  static description =
    'Translate an XCCDF benchmark file to a skeleton for an InSpec profile'

  static examples = [
    'saf generate xccdf_benchmark2inspec_stub -i ./U_RHEL_6_STIG_V2R2_Manual-xccdf.xml -T group --logLevel debug -r rhel-6-update-report.md',
    'saf generate xccdf_benchmark2inspec_stub -i ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-xccdf.xml -O ./CIS_Ubuntu_Linux_18.04_LTS_Benchmark_v1.1.0-oval.xml --logLevel debug',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    idType: Flags.string({
      char: 'T',
      default: 'rule',
      description: "Control ID Types: 'rule' - Vulnerability IDs (ex. 'SV-XXXXX'), 'group' - Group IDs (ex. 'V-XXXXX'), 'cis' - CIS Rule IDs (ex. C-1.1.1.1), 'version' - Version IDs (ex. RHEL-07-010020 - also known as STIG IDs)",
      options: ['rule', 'group', 'cis', 'version'],
      required: false,
    }),
    input: Flags.string({char: 'i', description: 'Path to the XCCDF benchmark file', required: true}),
    logLevel: Flags.string({char: 'L', default: 'info', options: ['info', 'warn', 'debug', 'verbose'], required: false}),
    metadata: Flags.string({char: 'm', description: 'Path to a JSON file with additional metadata for the inspec.yml file', required: false}),
    output: Flags.string({char: 'o', default: 'profile', description: 'The output folder to write the generated InSpec content', required: false}),
    ovalDefinitions: Flags.string({char: 'O', description: 'Path to an OVAL definitions file to populate profile elements that reference OVAL definitions', required: false}),
    singleFile: Flags.boolean({char: 's', default: false, description: 'Output the resulting controls as a single file', required: false}),
  }

  static usage =
    'saf generate xccdf_benchmark2inspec_stub -i <stig-xccdf-xml> [-o <output-folder>] [-h] [-m <metadata-json>] [-T (rule|group|cis|version)] [-s] [-L (info|warn|debug|verbose)]'

  async run() {
    const {flags} = await this.parse(XCCDFBenchmark2InSpec)

    const logger = createWinstonLogger('generate:xccdf_benchmark2inspec_stub', flags.logLevel)
    // Check if the output folder already exists
    if (fs.existsSync(flags.output)) {
      // Folder should not exist already
      throw new Error(
        'Profile output folder already exists, please specify a new folder',
      )
    } else {
      logger.debug('Creating output folder with controls and libraries directories')
      fs.mkdirSync(flags.output)
      fs.mkdirSync(path.join(flags.output, 'controls'))
      fs.mkdirSync(path.join(flags.output, 'libraries'))
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
    let profile: Profile

    logger.debug(`Processing XCCDF Benchmark file: ${flags.input} using ${flags.idType} id.`)
    const idTypes = ['rule', 'group', 'cis', 'version']
    if (idTypes.includes(flags.idType)) {
      profile = processXCCDF(xccdf, false, flags.idType as 'cis' | 'group' | 'rule' | 'version', ovalDefinitions)
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
