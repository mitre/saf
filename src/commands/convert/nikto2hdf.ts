import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {NiktoMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Nikto2HDF extends Command {
  static usage = 'convert nikto2hdf -i, --input=JSON -o, --output=OUTPUT -w, --withRaw'

  static description = 'Translate a Nikto results JSON file into a Heimdall Data Format JSON file\nNote: Current this mapper only supports single target Nikto Scans'

  static examples = ['saf convert nikto2hdf -i nikto-results.json -o output-hdf-name.json -w']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Nikto file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    withRaw: Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(Nikto2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'), flags.withRaw)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
