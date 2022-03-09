import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export default class Prowler2HDF extends BaseCommand {
  static usage = 'convert:prowler2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a Prowler-derived AWS Security Finding Format results from concatenated JSON blobs into a Heimdall Data Format JSON file'

  static examples = ['saf convert:prowler2hdf -i prowler-asff.json -o output-hdf-name.json']

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Prowler2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading Prowler Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const meta = {name: 'Prowler', title: 'Prowler Findings'}
    // Prowler comes as an asff-json file which is basically all the findings concatenated into one file instead of putting it in the proper wrapper data structure
    const input = `{"Findings": [${inputDataText.trim().split('\n').join(',')}]}`
    this.logger.debug('Converted findings from ASFF-JSON Lines to ASFF-JSON')
    const converter = new Mapper(input, undefined, meta)
    this.logger.info('Starting conversion from Prowler to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}

