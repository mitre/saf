import {Command, Flags} from '@oclif/core'
import {TwistlockResults as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class Twistlock2HDF extends Command {
  static usage = 'convert twistlock2hdf -i <twistlock-json> -o <hdf-scan-results-json> [-h] [-w]'

  static description = 'Translate a Twistlock CLI output file into an HDF results set'

  static examples = ['saf convert twistlock2hdf -i twistlock.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Twistlock file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
    'with-raw': Flags.boolean({char: 'w', required: false, description: 'Include raw input file in HDF JSON file'}),
  }

  async run() {
    const {flags} = await this.parse(Twistlock2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'twistlock', 'Twistlock CLI output file')

    const converter = new Mapper(data, flags['with-raw'])
    await writeFileURI(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}

