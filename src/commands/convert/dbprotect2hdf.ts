import {DBProtectMapper as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkInput, checkSuffix} from '../../utils/global'

export default class DBProtect2HDF extends Command {
  static description = 'Translate a DBProtect report in "Check Results Details" XML format into a Heimdall Data Format JSON file'

  static examples = ['saf convert dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: '\'Check Results Details\' XML File', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    'with-raw': Flags.boolean({char: 'w', description: 'Include raw input file in HDF JSON file', required: false}),
  }

  static usage = 'convert dbprotect2hdf -i <dbprotect-xml> -o <hdf-scan-results-json> [-h] [-w]'

  async run() {
    const {flags} = await this.parse(DBProtect2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'dbProtect', 'DBProtect report in "Check Results Details" XML format')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
