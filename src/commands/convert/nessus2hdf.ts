import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {NessusResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Nessus2HDF extends Command {
  static usage = 'convert:nessus2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = "Translate a Nessus XML results file into a Heimdall Data Format JSON file\nThe current iteration maps all plugin families except 'Policy Compliance'\nA separate HDF JSON is generated for each host reported in the Nessus Report."

  static examples = ['saf convert:nessus2hdf -i nessus_results.xml -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Nessus2HDF)
    const logger = createWinstonLogger('Nessus2HDF', flags.logLevel)
    // Read Data
    logger.verbose(`Reading Nessus Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)

    // Convert the data
    const converter = new Mapper(inputDataText)
    logger.info('Starting conversion from Nessus to HDF')
    const result = converter.toHdf()
    if (Array.isArray(result)) {
      result.forEach((element, idx) => {
        const filename = `${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`
        logger.verbose(`Output Filename ${idx + 1}}: ${fileName}`)
        logger.info(`Output File "${convertFullPathToFilename(filename)}": ${getHDFSummary(element)}`)
        fs.writeFileSync(filename, JSON.stringify(element))
      })
    } else {
      logger.verbose(`Output Filename: ${fileName}`)
      logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(result)}`)
      fs.writeFileSync(fileName, JSON.stringify(result))
    }
  }
}
