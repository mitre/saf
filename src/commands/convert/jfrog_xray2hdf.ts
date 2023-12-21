import {JfrogXrayMapper as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkInput, checkSuffix} from '../../utils/global'

export default class JfrogXray2HDF extends Command {
  static description = 'Translate a JFrog Xray results JSON file into a Heimdall Data Format JSON file'

  static examples = ['saf convert jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input JFrog JSON File', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    'with-raw': Flags.boolean({char: 'w', description: 'Include raw input file in HDF JSON file', required: false}),
  }

  static usage = 'convert jfrog_xray2hdf -i <jfrog-xray-json> -o <hdf-scan-results-json> [-h] [-w]'

  async run() {
    const {flags} = await this.parse(JfrogXray2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'jfrog', 'JFrog Xray results JSON')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
