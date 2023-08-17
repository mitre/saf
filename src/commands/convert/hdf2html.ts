import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import path from 'path'
import {____ as Mapper} from '@mitre/hdf-converters'

export default class HDF2HTML extends Command {
  static usage = 'convert hdf2html -i <hdf-scan-results-json>... -o <output-html> [-h]'

  static description = 'Translate an HDF file into a Heimdall Report HTML file'

  static examples = ['saf convert hdf2html -i hdf_input.json -o report.html']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input HDF JSON file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HTML file'}),
  }

  async run() {
    const {flags} = await this.parse(HDF2HTML)

    const inputData = flags.input.map(filename => ({data: fs.readFileSync(filename, 'utf8'), filename: path.basename(filename)}))

    const converter = new Mapper(inputData)
    fs.writeFileSync(flags.output, converter)
  }
}
