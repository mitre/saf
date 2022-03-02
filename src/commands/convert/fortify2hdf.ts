import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import {FortifyMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Fortify2HDF extends Command {
  static usage = 'convert:fortify2hdf -i, --input=FVDL -o, --output=OUTPUT'

  static description = 'Translate a Fortify results FVDL file into a Heimdall Data Format JSON file'

  static examples = ['saf convert:fortify2hdf -i audit.fvdl -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Fortify2HDF)
    const logger = createWinstonLogger('fortify2hdf', flags.logLevel)

    // Read Data
    logger.verbose(`Reading Fortify file: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from Fortify to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
