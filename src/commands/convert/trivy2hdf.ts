import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export default class Trivy2HDF extends BaseCommand {
  static usage = 'convert:trivy2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a Trivy-derived AWS Security Finding Format results from concatenated JSON blobs into a Heimdall Data Format JSON file'

  static examples = ['saf convert:trivy2hdf -i trivy-asff.json -o output-hdf-name.json']

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Trivy2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading Trivy File: ${flags.input}`)
    let inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const meta = {name: 'Trivy', title: 'Trivy Findings'}
    // comes as an _asff.json file which is basically the array of findings but without the surrounding object; however, could also be properly formed asff since it depends on the template used
    if (Array.isArray(JSON.parse(inputDataText))) {
      this.logger.debug('Converted findings from ASFF-JSON Findings Array to ASFF-JSON')
      inputDataText = `{"Findings": ${inputDataText.trim()}}`
    }

    const converter = new Mapper(inputDataText, undefined, meta)
    this.logger.info('Starting conversion from Trivy to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}

