import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {NetsparkerMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI} from '../../utils/io'

export default class Netsparker2HDF extends Command {
  static usage = 'convert netsparker2hdf -i <netsparker-xml> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a Netsparker XML results file into a Heimdall Data Format JSON file\nThe current iteration only works with Netsparker Enterprise Vulnerabilities Scan.'

  static examples = ['saf convert netsparker2hdf -i netsparker_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Netsparker XML File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(Netsparker2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'netsparker', 'Netsparker XML results file')

    const converter = new Mapper(data)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
