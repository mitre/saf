import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {BurpSuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Burpsuite2HDF extends Command {
  static usage = 'convert:burpsuite2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a BurpSuite Pro XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert:burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Burpsuite2HDF)

    const logger = createWinstonLogger('burpsuite2hdf', flags.logLevel)
    // Read Data
    logger.verbose(`Reading Burpsuite Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from Burpsuite to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
