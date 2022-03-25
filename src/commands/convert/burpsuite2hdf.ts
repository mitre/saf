import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {BurpSuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Burpsuite2HDF extends Command {
  static usage = 'convert burpsuite2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a BurpSuite Pro XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Burpsuite2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
