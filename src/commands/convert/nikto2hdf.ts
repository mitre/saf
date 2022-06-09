import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {NiktoMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Nikto2HDF extends Command {
  static usage = 'convert nikto2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a Nikto results JSON file into a Heimdall Data Format JSON file\nNote: Current this mapper only supports single target Nikto Scans'

  static examples = ['saf convert nikto2hdf -i nikto-results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Nikto2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
