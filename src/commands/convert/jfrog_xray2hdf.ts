import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import fs from 'fs'
import {JfrogXrayMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export class JfrogXray2HDF extends BaseCommand {
  static usage = 'convert:jfrog_xray2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a JFrog Xray results JSON file into a Heimdall Data Format JSON file'

  static examples = ['saf convert:jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json']

  static flags = {
    ...BaseCommand.flags,
    input: flags.string({char: 'i', required: true}),
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof JfrogXray2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading XRay Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    this.logger.info('Starting conversion from JFrog Xray to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
