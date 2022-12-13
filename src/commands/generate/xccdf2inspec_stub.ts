/* eslint-disable no-negated-condition */
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {InSpecMetaData} from '../../types/inspec'
import path from 'path'
import {processOVAL, processXCCDF} from '@mitre/inspec-objects'

export default class XCCDF2InSpec extends Command {
  static usage =
    'generate xccdf2inspec_stub -i, --input=XML -o, --output=FOLDER';

  static description =
    'Translate an XCCDF benchmark file to a skeleton for an InSpec profile';

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Path to the XCCDF benchmark file'}),
    metadata: Flags.string({char: 'm', required: false, description: 'Path to a JSON file with additional metadata for the inspec.yml file'}),
    singleFile: Flags.boolean({char: 's', required: false, default: false, description: 'Output the resulting controls as a single file'}),
    useGroupID: Flags.boolean({char: 'g', description: "Use Group ID for control IDs (ex. 'V-XXXXX')"}),
    useVulnerabilityId: Flags.boolean({char: 'r', required: false, default: true, description: "Use Vulnerability IDs for control IDs (ex. 'SV-XXXXX')", exclusive: ['useStigID']}),
    useStigID: Flags.boolean({char: 'S', required: false, default: false, description: 'Use STIG IDs for control IDs (ex. RHEL-07-010020, also known as Version)', exclusive: ['useVulnerabilityId']}),
    useCISId: Flags.boolean({char: 'C', required: false, default: false, description: 'Use CIS Rule IDs for control IDs (ex. C-1.1.1.1)'}),
    ovalDefinitions: Flags.string({char: 'O', required: false, description: 'Path to an OVAL definitions file to use for definitions in the profile'}),
    output: Flags.string({char: 'o', required: true, default: 'profile'}),
  };

  async run() {
    const {flags} = await this.parse(XCCDF2InSpec)

    // Check if the output folder already exists
    if (!fs.existsSync(flags.output)) {
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
        metadata = JSON.parse(fs.readFileSync(flags.metadata, 'utf8'))
      } else {
        throw new Error('Passed metadata file does not exist')
      }
    }

    // Read OVAL definitions file if passed
    let ovalDefinitions

    if (flags.ovalDefinitions) {
      if (fs.existsSync(flags.ovalDefinitions)) {
        ovalDefinitions = processOVAL(fs.readFileSync(flags.ovalDefinitions, 'utf8'))
      } else {
        throw new Error('Passed OVAL definitions file does not exist')
      }
    }

    // Read the XCCDF file
    const xccdf = fs.readFileSync(flags.input, 'utf8')
    let profile
    if (flags.useGroupID) {
      profile = processXCCDF(xccdf, false, 'group', ovalDefinitions)
    } else if (flags.useStigID) {
      profile = processXCCDF(xccdf, false, 'version', ovalDefinitions)
    } else if (flags.useCISId) {
      profile = processXCCDF(xccdf, false, 'cis', ovalDefinitions)
    } else if (flags.useVulnerabilityId) {
      profile = processXCCDF(xccdf, false, 'rule', ovalDefinitions)
    } else {
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
    fs.writeFileSync(
      path.join(flags.output, 'inspec.yml'),
      profile.createInspecYaml(),
    )

    // Write all controls
    if (flags.singleFile) {
      const controls = profile.controls
        .map(control => control.toRuby())
        .join('\n\n')
      fs.writeFileSync(
        path.join(flags.output, 'controls', 'controls.rb'),
        controls,
      )
    } else {
      profile.controls.forEach(control => {
        fs.writeFileSync(
          path.join(flags.output, 'controls', control.id + '.rb'),
          control.toRuby(),
        )
      })
    }
  }
}
