import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ZapMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Zap2HDF extends Command {
  static usage = 'convert:zap2hdf -i, --input=JSON -n, --name=NAME -o, --output=OUTPUT'

  static description = 'Translate a OWASP ZAP results JSON to HDF format Json be viewed on Heimdall'

  static examples = ['saf convert:zap2hdf -i zap_results.json -n site_name -o scan_results.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    name: flags.string({char: 'n', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Zap2HDF)
    const logger = createWinstonLogger('ZAP2HDF', flags.logLevel)
    // Read Data
    logger.verbose(`Reading OWASP ZAP Results: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from OWASP ZAP to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`Converted HDF successfully written to ${fileName}`)
  }
}
