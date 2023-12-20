import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkInput, checkSuffix} from '../../utils/global'

export default class XCCDFResults2HDF extends Command {
  static description = 'Translate a SCAP client XCCDF-Results XML report to a Heimdall Data Format JSON file'

  static examples = ['saf convert xccdf_results2hdf -i results-xccdf.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input XCCDF Results XML File', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    'with-raw': Flags.boolean({char: 'w', description: 'Include raw input file in HDF JSON file', required: false}),
  }

  static usage = 'convert xccdf_results2hdf -i <xccdf-results-xml> -o <hdf-scan-results-json> [-h] [-w]'

  async run() {
    const {flags} = await this.parse(XCCDFResults2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'xccdf', 'SCAP client XCCDF-Results XML report')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
