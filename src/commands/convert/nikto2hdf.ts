import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {NiktoMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class NiktoMapper extends Command {
  static usage = 'convert:nikto2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a Nikto results JSON file into a Heimdall Data Format JSON file\nNote: Current this mapper only supports single target Nikto Scans'

  static examples = ['saf convert:nikto2hdf -i nikto-results.json -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(NiktoMapper)

    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
