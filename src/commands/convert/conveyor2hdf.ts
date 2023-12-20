import {ConveyorResults as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import path from 'path'

import {checkInput, checkSuffix} from '../../utils/global'
export default class Conveyor2HDF extends Command {
  static description = 'Translate a Conveyor JSON file into a Heimdall Data Format JSON files'

  static examples = ['saf convert conveyor2hdf -i conveyor_results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input Conveyor JSON File', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON Folder', required: true}),
  }

  static usage = 'convert conveyor2hdf -i <conveyor-json> -o <hdf-scan-results-json> [-h]'

  async run() {
    const {flags} = await this.parse(Conveyor2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'Conveyor', 'Conveyor JSON')

    const converter = new Mapper(data)
    const results = converter.toHdf()
    fs.mkdirSync(flags.output)
    for (const [filename, result] of Object.entries(results)) {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(filename)),
        JSON.stringify(result),
      )
    }
  }
}
