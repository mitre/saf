import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import fs from 'fs'
import {SnykResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export default class Snyk2HDF extends BaseCommand {
  static usage = 'convert:snyk2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a Snyk results JSON file into a Heimdall Data Format JSON file\nA separate HDF JSON is generated for each project reported in the Snyk Report.'

  static examples = ['saf convert:snyk2hdf -i snyk_results.json -o output-file-prefix']

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Snyk2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading Snyk Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Convert the data
    const converter = new Mapper(inputDataText)
    this.logger.info('Starting conversion from Snyk to HDF')
    const converted = converter.toHdf()

    // Write to file
    if (Array.isArray(converted)) {
      for (const element of converted) {
        const fileName = `${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`
        this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(element)}`)
        fs.writeFileSync(fileName, JSON.stringify(element))
        this.logger.verbose(`Converted HDF successfully written to ${fileName}`)
      }
    } else {
      // Strip Extra .json from output filename
      const fileName = checkSuffix(flags.output)
      this.logger.verbose(`Output Filename: ${fileName}`)
      this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
      fs.writeFileSync(fileName, JSON.stringify(converted))
      this.logger.verbose(`HDF successfully written to ${fileName}`)
    }
  }
}
