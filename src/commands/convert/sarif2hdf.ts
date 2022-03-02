import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {SarifMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Sarif2HDF extends Command {
  static usage = 'convert:sarif2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a SARIF JSON file into a Heimdall Data Format JSON file\nSARIF level to HDF impact Mapping:\nSARIF level error -> HDF impact 0.7\nSARIF level warning -> HDF impact 0.5\nSARIF level note -> HDF impact 0.3\nSARIF level none -> HDF impact 0.1\nSARIF level not provided -> HDF impact 0.1 as default'

  static examples = ['saf convert:sarif2hdf -i sarif-results.json -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Sarif2HDF)

    const logger = createWinstonLogger('Sarif2HDF', flags.logLevel)
    // Read Data
    logger.verbose(`Reading Sarif Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from Sarif to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`Converted HDF successfully written to ${fileName}`)
  }
}
