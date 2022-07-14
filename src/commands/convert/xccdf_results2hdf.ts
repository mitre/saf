import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class XCCDFResults2HDF extends Command {
  static usage = 'convert xccdf_results2hdf -i <xccdf-results-xml> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a SCAP client XCCDF-Results XML report to HDF format Json be viewed on Heimdall'

  static examples = ['saf convert xccdf_results2hdf -i results-xccdf.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input XCCDF Results XML File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(XCCDFResults2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'xccdf', 'SCAP client XCCDF-Results XML report')

    const converter = new Mapper(data)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
