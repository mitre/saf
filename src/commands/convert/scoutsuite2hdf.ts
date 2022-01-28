import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ScoutsuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Scoutsuite2HDF extends Command {
  static usage = 'convert:scoutsuite2hdf -i, --input=SCOUTSUITE-RESULTS-JS -o, --output=OUTPUT'

  static description = 'Translate a ScoutSuite results from a Javascript object into a Heimdall Data Format JSON file\nNote: Currently this mapper only supports AWS.'

  static examples = ['saf convert:scoutsuite2hdf -i scoutsuite-results.js -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(Scoutsuite2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
