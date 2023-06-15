import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ConveyorResults as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Conveyor2HDF extends Command {
  static usage = 'convert conveyor2hdf -i <conveyor-json> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a Conveyor JSON file into a Heimdall Data Format JSON files'

  static examples = ['saf convert conveyor2hdf -i conveyor_results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Conveyor JOSN File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON Folder'}),
  }

  async run() {
    const {flags} = await this.parse(Conveyor2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'Conveyor', 'Conveyor JSON')

    const converter = new Mapper(data)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
    fs.mkdirSync(flags.output)
    _.forOwn(results, (result, filename) => {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(filename)),
        JSON.stringify(result),
      )
    })
  }
}
