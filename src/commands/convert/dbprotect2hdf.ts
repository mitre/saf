import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {DBProtectMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import {createWinstonLogger} from '../../utils/logging'

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

    logger.verbose(`Reading DB Protect file: ${flags.input}`)
    const inputData = fs.readFileSync(flags.input, 'utf-8')
    const converter = new Mapper(inputData)
    const converted = JSON.stringify(converter.toHdf())
    logger.info('Converted DB Protect to HDF')
    logger.info(`Writing HDF to: ${checkSuffix(flags.output)}`)
    fs.writeFileSync(checkSuffix(flags.output), converted)
    logger.verbose(`HDF successfully written to ${checkSuffix(flags.output)}`)
  }
}
