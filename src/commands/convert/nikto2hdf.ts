import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {NiktoMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Nikto2HDF extends Command {
  static usage = 'convert nikto2hdf -i <nikto-json> -o <hdf-scan-results-json> [-h] [-w]'

  static description = 'Translate a Nikto results JSON file into a Heimdall Data Format JSON file\nNote: Current this mapper only supports single target Nikto Scans'

  static examples = ['saf convert nikto2hdf -i nikto-results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Niktop Results JSON File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
    'with-raw': Flags.boolean({char: 'w', required: false, description: 'Include raw input file in HDF JSON file'}),
  }

  async run() {
    const {flags} = await this.parse(Nikto2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'nikto', 'Nikto results JSON')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
