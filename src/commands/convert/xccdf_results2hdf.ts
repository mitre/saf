import {Command, Flags} from '@oclif/core'
import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class XCCDFResults2HDF extends Command {
  static usage = 'convert xccdf_results2hdf -i <xccdf-results-xml> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a SCAP client XCCDF-Results XML report to a Heimdall Data Format JSON file'

  static examples = ['saf convert xccdf_results2hdf -i results-xccdf.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input XCCDF Results XML File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(XCCDFResults2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'xccdf', 'SCAP client XCCDF-Results XML report')

    const converter = new Mapper(data)
    await writeFileURI(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
