import {Flags} from '@oclif/core'
import fs from 'fs'
import {NiktoMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {BaseCommand} from '../../utils/oclif/baseCommand'

export default class Nikto2HDF extends BaseCommand<typeof Nikto2HDF> {
  static readonly usage
    = '<%= command.id %> -i <nikto-json> -o <hdf-scan-results-json> [-h] [-w]'

  static readonly description
    = 'Translate a Nikto results JSON file into a Heimdall Data Format JSON file\n'
      + 'Note: Current this mapper only supports single target Nikto Scans'

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i nikto-results.json -o output-hdf-name.json']

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Niktop Results JSON File',
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
    const {flags} = await this.parse(Nikto2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'nikto', 'Nikto results JSON')

    const converter = new Mapper(data, flags.includeRaw)
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    )
  }
}
