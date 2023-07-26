import {Command, Flags} from '@oclif/core'
import {DBProtectMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class DBProtect2HDF extends Command {
  static usage = 'convert dbprotect2hdf -i <dbprotect-xml> -o <hdf-scan-results-json> [-h] [-w]'

  static description = 'Translate a DBProtect report in "Check Results Details" XML format into a Heimdall Data Format JSON file'

  static examples = ['saf convert dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: '\'Check Results Details\' XML File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
    'with-raw': Flags.boolean({char: 'w', required: false, description: 'Include raw input file in HDF JSON file'}),
  }

  async run() {
    const {flags} = await this.parse(DBProtect2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'dbProtect', 'DBProtect report in "Check Results Details" XML format')

    const converter = new Mapper(data, flags['with-raw'])
    await writeFileURI(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
