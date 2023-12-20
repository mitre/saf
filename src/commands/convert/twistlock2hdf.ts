import {TwistlockResults as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkInput, checkSuffix} from '../../utils/global'

export default class Twistlock2HDF extends Command {
  static description = 'Translate a Twistlock CLI output file into an HDF results set'

  static examples = ['saf convert twistlock2hdf -i twistlock.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input Twistlock file', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    'with-raw': Flags.boolean({char: 'w', description: 'Include raw input file in HDF JSON file', required: false}),
  }

  static usage = 'convert twistlock2hdf -i <twistlock-json> -o <hdf-scan-results-json> [-h] [-w]'

  async run() {
    const {flags} = await this.parse(Twistlock2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'twistlock', 'Twistlock CLI output file')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}

