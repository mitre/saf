import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {TwistlockMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Twistlock2HDF extends Command {
  static usage = 'convert twistlock2hdf -i <twistlock-json> -o <hdf-scan-results-json>'

  static description = 'Translate a Twistlock CLI output file into an HDF results set'

  static examples = ['saf convert twistlock2hdf -i twistlock.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Twistlock file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    'with-raw': Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(Twistlock2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'twistlock', 'Twistlock CLI output file')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
