import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {SnykResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Snyk2HDF extends Command {
  static usage = 'convert:snyk2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a Snyk results JSON file into a Heimdall Data Format JSON file\nA separate HDF JSON is generated for each project reported in the Snyk Report.'

  static examples = ['saf convert:snyk2hdf -i snyk_results.json -o output-file-prefix']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Snyk2HDF)

    const logger = createWinstonLogger('Snyk2HDF', flags.logLevel)
    // Read Data
    logger.verbose(`Reading Snyk Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from Snyk to HDF')
    const converted = converter.toHdf()

    // Write to file
    if (Array.isArray(converted)) {
      for (const element of converted) {
        const fileName = `${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`
        logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(element)}`)
        fs.writeFileSync(fileName, JSON.stringify(element))
        logger.verbose(`Converted HDF successfully written to ${fileName}`)
      }
    } else {
      // Strip Extra .json from output filename
      const fileName = checkSuffix(flags.output)
      logger.verbose(`Output Filename: ${fileName}`)
      logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
      fs.writeFileSync(fileName, JSON.stringify(converted))
      logger.verbose(`HDF successfully written to ${fileName}`)
    }
  }
}
