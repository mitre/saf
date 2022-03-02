import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class ASFF2HDF extends Command {
  static usage = 'convert:asff2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file'

  static examples = ['saf convert:asff2hdf -i asff-findings.json -o output-file-name.json',
    'saf convert:asff2hdf -i asff-findings.json --sh <standard-1-json> ... <standard-n-json> -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    securityhub: flags.string({required: false, multiple: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(ASFF2HDF)
    const logger = createWinstonLogger('asff2hdf', flags.logLevel)
    let securityhub
    if (flags.securityhub) {
      logger.verbose('Reading ASFF standards')
      securityhub = flags.securityhub.map(file => fs.readFileSync(file, 'utf-8'))
    }

    // Read Data
    logger.verbose(`Reading ASFF file: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText, securityhub)
    logger.info('Starting conversion from ASFF to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
