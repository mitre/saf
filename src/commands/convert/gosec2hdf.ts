import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {GoSecMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class GoSec2HDF extends Command {
  static usage = 'convert gosec2hdf -i <gosec-json> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a GoSec (Golang Security Checker) results JSON to a Heimdall Data Format JSON file'

  static examples = ['saf convert gosec2hdf -i gosec_results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input GoSec Results JSON File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(GoSec2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'gosec', 'GoSec results JSON')

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'), flags.name)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
