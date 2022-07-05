import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {TwistlockMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Twistlock2HDF extends Command {
  static usage = 'convert twistlock2hdf -i, --input=<twistlock-json> -o, output=<hdf-scan-results-json> -w, --withRaw'

  static description = 'Translate a Twistlock CLI output file into an HDF results set'

  static examples = ['saf convert twistlock2hdf -i twistlock.json -o output-hdf-name.json -w']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Twistlock file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    withRaw: Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(Twistlock2HDF)
    const input = fs.readFileSync(flags.input, 'utf8')

    const converter = new Mapper(input, flags.withRaw)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
