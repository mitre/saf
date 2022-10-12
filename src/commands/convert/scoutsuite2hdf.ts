import {Command, Flags} from '@oclif/core'
import {ScoutsuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class Scoutsuite2HDF extends Command {
  static usage = 'convert scoutsuite2hdf -i <scoutsuite-results-js> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a ScoutSuite results from a Javascript object into a Heimdall Data Format JSON file\nNote: Currently this mapper only supports AWS.'

  static examples = ['saf convert scoutsuite2hdf -i scoutsuite-results.js -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input ScoutSuite Results JS File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(Scoutsuite2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'scoutsuite', 'ScoutSuite results from a Javascript object')

    const converter = new Mapper(data)
    await writeFileURI(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
