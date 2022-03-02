import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import {createWinstonLogger} from '../../utils/logging'

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

    logger.verbose(`Reading ASFF file: ${flags.input}`)
    const inputData = fs.readFileSync(flags.input, 'utf-8')
    logger.info('Starting conversion from ASFF to HDF')
    const converter = new Mapper(inputData, securityhub)
    const converted = JSON.stringify(converter.toHdf())
    logger.info('Converted ASFF to HDF')
    logger.info(`Writing HDF to: ${checkSuffix(flags.output)}`)
    fs.writeFileSync(checkSuffix(flags.output), converted)
    logger.verbose(`Converted HDF successfully written to ${checkSuffix(flags.output)}`)
  }
}
