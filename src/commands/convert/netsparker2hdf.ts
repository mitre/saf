import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {NetsparkerMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Netsparker2HDF extends Command {
  static usage = 'convert netsparker2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a Netsparker XML results file into a Heimdall Data Format JSON file\nThe current iteration only works with Netsparker Enterprise Vulnerabilities Scan.'

  static examples = ['saf convert netsparker2hdf -i netsparker_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Netsparker2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
