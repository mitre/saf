import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class XCCDFResults2HDF extends Command {
  static usage = 'convert:xccdf_results2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a SCAP client XCCDF-Results XML report to HDF format Json be viewed on Heimdall'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(XCCDFResults2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
