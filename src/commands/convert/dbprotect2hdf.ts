import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {DBProtectMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class DBProtect2HDF extends Command {
  static usage = 'convert:dbprotect2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a DBProtect report in "Check Results Details" XML format into a Heimdall Data Format JSON file'

  static examples = ['saf convert:dbprotect2hdf -i check_results_details_report.xml -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(DBProtect2HDF)
    const logger = createWinstonLogger('dbprotect2hdf', flags.logLevel)

    // Read Data
    logger.verbose(`Reading DB Protect file: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from DB Protect to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
