import {FromHDFToCAATMapper as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import path from 'path'

export default class HDF2CAAT extends Command {
  static description = 'Translate an HDF file into a Compliance Assessment and Audit Tracking (CAAT) XLSX file'

  static examples = ['saf convert hdf2caat -i hdf_input.json -o caat-results.xlsx']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input HDF JSON file', multiple: true, required: true}),
    output: Flags.string({char: 'o', description: 'Output CAAT XLSX file', required: true}),
  }

  static usage = 'convert hdf2caat -i <hdf-scan-results-json>... -o <output-caat-xlsx> [-h]'

  async run() {
    const {flags} = await this.parse(HDF2CAAT)

    const inputData = flags.input.map(filename => ({data: fs.readFileSync(filename, 'utf8'), filename: path.basename(filename)}))

    const converter = new Mapper(inputData)
    fs.writeFileSync(flags.output, converter.toCAAT(false, {bookType: 'xlsx', type: 'buffer'}))
  }
}
