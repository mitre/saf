import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {VeracodeMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Veracode2HDF extends Command {
  static usage = 'convert veracode2hdf -i <veracode-xml> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a Veracode XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert veracode2hdf -i veracode_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Veracode XML File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(Veracode2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'veracode', 'Veracode XML')

    const converter = new Mapper(data)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
