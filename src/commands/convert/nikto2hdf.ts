import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {NiktoMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Nikto2HDF extends Command {
  static usage = 'convert:nikto2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a Nikto results JSON file into a Heimdall Data Format JSON file\nNote: Current this mapper only supports single target Nikto Scans'

  static examples = ['saf convert:nikto2hdf -i nikto-results.json -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Nikto2HDF)

    const logger = createWinstonLogger('Nikto2HDF', flags.logLevel)
    // Read Data
    logger.verbose(`Reading Nikto Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from Nikto to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`Converted HDF successfully written to ${fileName}`)
  }
}
