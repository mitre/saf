import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ScoutsuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Scoutsuite2HDF extends Command {
  static usage = 'convert scoutsuite2hdf -i, --input=SCOUTSUITE-RESULTS-JS -o, --output=OUTPUT'

  static description = 'Translate a ScoutSuite results from a Javascript object into a Heimdall Data Format JSON file\nNote: Currently this mapper only supports AWS.'

  static examples = ['saf convert scoutsuite2hdf -i scoutsuite-results.js -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Scoutsuite2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
