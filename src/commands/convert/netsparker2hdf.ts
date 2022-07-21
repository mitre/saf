import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {NetsparkerMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Netsparker2HDF extends Command {
  static usage = 'convert netsparker2hdf -i, --input=XML -o, --output=OUTPUT -w, --with-raw'

  static description = 'Translate a Netsparker XML results file into a Heimdall Data Format JSON file\nThe current iteration only works with Netsparker Enterprise Vulnerabilities Scan.'

  static examples = ['saf convert netsparker2hdf -i netsparker-results.xml -o output-hdf-name.json -w']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Netsparker file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    'with-raw': Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(Netsparker2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'netsparker', 'Netsparker XML results file')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
