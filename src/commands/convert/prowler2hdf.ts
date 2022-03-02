import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Prowler2HDF extends Command {
  static usage = 'convert:prowler2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a Prowler-derived AWS Security Finding Format results from concatenated JSON blobs into a Heimdall Data Format JSON file'

  static examples = ['saf convert:prowler2hdf -i prowler-asff.json -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Prowler2HDF)
    const logger = createWinstonLogger('Prowler2HDF', flags.logLevel)
    // Read Data
    logger.verbose(`Reading Prowler Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const meta = {name: 'Prowler', title: 'Prowler Findings'}
    // Prowler comes as an asff-json file which is basically all the findings concatenated into one file instead of putting it in the proper wrapper data structure
    const input = `{"Findings": [${inputDataText.trim().split('\n').join(',')}]}`
    logger.debug('Converted findings from ASFF-JSON Lines to ASFF-JSON')
    const converter = new Mapper(input, undefined, meta)
    logger.info('Starting conversion from Prowler to HDF')
    const converted = converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`Converted HDF successfully written to ${fileName}`)
  }
}

