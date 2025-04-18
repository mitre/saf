import {Flags} from '@oclif/core'
import fs from 'fs'
import {ZapMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {BaseCommand} from '../../utils/oclif/baseCommand'

export default class Zap2HDF extends BaseCommand<typeof Zap2HDF> {
  static readonly usage
    = '<%= command.id %> -i <zap-json> -n <target-site-name> -o <hdf-scan-results-json> [-h] [-w]'

  static readonly description
    = 'Translate a OWASP ZAP results JSON to a Heimdall Data Format JSON file'

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i zap_results.json -n mitre.org -o scan_results.json']

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input OWASP Zap Results JSON File',
    }),
    name: Flags.string({
      char: 'n',
      required: true,
      description: 'Target Site Name',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
    includeRaw: Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file',
    }),
  }

  async run() {
    const {flags} = await this.parse(Zap2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'zap', 'OWASP ZAP results JSON')

    const converter = new Mapper(
      fs.readFileSync(flags.input, 'utf8'),
      flags.name,
      flags.includeRaw,
    )
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    )
  }
}
