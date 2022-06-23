import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {SarifMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Sarif2HDF extends Command {
  static usage = 'convert sarif2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a SARIF JSON file into a Heimdall Data Format JSON file\nSARIF level to HDF impact Mapping:\nSARIF level error -> HDF impact 0.7\nSARIF level warning -> HDF impact 0.5\nSARIF level note -> HDF impact 0.3\nSARIF level none -> HDF impact 0.1\nSARIF level not provided -> HDF impact 0.1 as default'

  static examples = ['saf convert sarif2hdf -i sarif-results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Sarif2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'sarif', 'SARIF JSON')

    const converter = new Mapper(data)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
