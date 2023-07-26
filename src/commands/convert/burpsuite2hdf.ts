import {Command, Flags} from '@oclif/core'
import {BurpSuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class Burpsuite2HDF extends Command {
  static usage = 'convert burpsuite2hdf -i <burpsuite-xml> -o <hdf-scan-results-json> [-h] [-w]'

  static description = 'Translate a BurpSuite Pro XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Burpsuite Pro XML File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
    'with-raw': Flags.boolean({char: 'w', required: false, description: 'Include raw input file in HDF JSON file'}),
  }

  async run() {
    const {flags} = await this.parse(Burpsuite2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'burp', 'BurpSuite Pro XML')

    const converter = new Mapper(data, flags['with-raw'])
    await writeFileURI(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
