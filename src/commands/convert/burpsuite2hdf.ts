import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {BurpSuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Burpsuite2HDF extends Command {
  static usage = 'convert burpsuite2hdf -i, --input=XML -o, --output=OUTPUT -w, --withRaw'

  static description = 'Translate a BurpSuite Pro XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert burpsuite2hdf -i burpsuite-results.xml -o output-hdf-name.json -w']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input BurpSuite file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    withRaw: Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(Burpsuite2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'), flags.withRaw)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
