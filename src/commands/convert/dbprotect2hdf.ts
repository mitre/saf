import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {DBProtectMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class DBProtect2HDF extends Command {
  static usage = 'convert dbprotect2hdf -i, --input=XML -o, --output=OUTPUT -w, --with-raw'

  static description = 'Translate a DBProtect report in "Check Results Details" XML format into a Heimdall Data Format JSON file'

  static examples = ['saf convert dbprotect2hdf -i check-results-details-report.xml -o output-hdf-name.json -w']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input DbProtect file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    'with-raw': Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(DBProtect2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'dbProtect', 'DBProtect report in "Check Results Details" XML format')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
