import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import fs from 'fs'
import {SarifMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export default class Sarif2HDF extends BaseCommand {
  static usage = 'convert:sarif2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a SARIF JSON file into a Heimdall Data Format JSON file\nSARIF level to HDF impact Mapping:\nSARIF level error -> HDF impact 0.7\nSARIF level warning -> HDF impact 0.5\nSARIF level note -> HDF impact 0.3\nSARIF level none -> HDF impact 0.1\nSARIF level not provided -> HDF impact 0.1 as default'

  static examples = ['saf convert:sarif2hdf -i sarif-results.json -o output-hdf-name.json']

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Sarif2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading Sarif Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    this.logger.info('Starting conversion from Sarif to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
