import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import fs from 'fs'
import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export default class XCCDFResults2HDF extends BaseCommand {
  static usage = 'convert:xccdf_results2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a SCAP client XCCDF-Results XML report to HDF format Json be viewed on Heimdall'

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof XCCDFResults2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading XCCDF Results: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    this.logger.info('Starting conversion from XCCDF Results to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
