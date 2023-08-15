import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import path from 'path'
import {FromHDFToCAATMapper as Mapper} from '@mitre/hdf-converters'

export default class HDF2CAAT extends Command {
  static usage = 'convert hdf2caat -i <hdf-scan-results-json>... -o <output-caat-xlsx> [-h]'

  static description = 'Translate an HDF file into a CAAT XLSX'

  static examples = ['saf convert hdf2caat -i hdf_input.json -o caat-results.xlsx']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input HDF JSON file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output CAAT XLSX File'}),
  }

  async run() {
    const {flags} = await this.parse(HDF2CAAT)

    const inputData = flags.input.map(filename => ({data: fs.readFileSync(filename, 'utf8'), filename: path.basename(filename)}))

    const converter = new Mapper(inputData)
    fs.writeFileSync(flags.output, converter.toCAAT(false, {bookType: 'xlsx', type: 'buffer'}))
  }
}
