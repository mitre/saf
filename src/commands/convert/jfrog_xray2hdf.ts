import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {JfrogXrayMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI} from '../../utils/io'

export default class JfrogXray2HDF extends Command {
  static usage = 'convert jfrog_xray2hdf -i <jfrog-xray-json> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a JFrog Xray results JSON file into a Heimdall Data Format JSON file'

  static examples = ['saf convert jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input JFrog JSON File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(JfrogXray2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'jfrog', 'JFrog Xray results JSON')

    const converter = new Mapper(data)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
