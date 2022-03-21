import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {DBProtectMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class DBProtect2HDF extends Command {
  static usage = 'convert:dbprotect2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a DBProtect report in "Check Results Details" XML format into a Heimdall Data Format JSON file'

  static examples = ['saf convert:dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(DBProtect2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
