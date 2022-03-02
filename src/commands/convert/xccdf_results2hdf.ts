import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import { createWinstonLogger, getHDFSummary } from '../../utils/logging'

export default class XCCDFResults2HDF extends Command {
  static usage = 'convert:xccdf_results2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a SCAP client XCCDF-Results XML report to HDF format Json be viewed on Heimdall'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']})
  }

  async run() {
    const {flags} = this.parse(XCCDFResults2HDF)
    
    const logger = createWinstonLogger('XCCDFResults2HDF', flags.logLevel)
    // Read Data
    logger.verbose(`Reading XCCDF Results: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')
    
    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)
    
    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info("Starting conversion from XCCDF Results to HDF")
    const converted = converter.toHdf()
    
    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`Converted HDF successfully written to ${fileName}`)
  }
}
