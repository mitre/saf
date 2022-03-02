import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import {FortifyMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import {createWinstonLogger} from '../../utils/logging'

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

    logger.verbose(`Reading Fortify file: ${flags.input}`)
    const inputData = fs.readFileSync(flags.input, 'utf-8')
    logger.info('Starting conversion from Fortify to HDF')
    const converter = new Mapper(inputData)
    const converted = JSON.stringify(converter.toHdf())
    logger.info('Converted Fortify to HDF')
    logger.info(`Writing HDF to: ${checkSuffix(flags.output)}`)
    fs.writeFileSync(checkSuffix(flags.output), converted)
    logger.verbose(`HDF successfully written to ${checkSuffix(flags.output)}`)
  }
}
