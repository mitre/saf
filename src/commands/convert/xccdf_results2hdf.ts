import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class XCCDFResults2HDF extends Command {
  static usage = 'convert:xccdf_results2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a SCAP client XCCDF-Results XML report to HDF format Json be viewed on Heimdall'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(XCCDFResults2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
