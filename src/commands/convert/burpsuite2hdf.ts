<<<<<<< HEAD
import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
=======
import {Command, Flags} from '@oclif/core'
>>>>>>> main
import fs from 'fs'
import {BurpSuiteMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

<<<<<<< HEAD
export default class Burpsuite2HDF extends BaseCommand {
  static usage = 'convert:burpsuite2hdf -i, --input=XML -o, --output=OUTPUT'
=======
export default class Burpsuite2HDF extends Command {
  static usage = 'convert burpsuite2hdf -i, --input=XML -o, --output=OUTPUT'
>>>>>>> main

  static description = 'Translate a BurpSuite Pro XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert burpsuite2hdf -i burpsuite_results.xml -o output-hdf-name.json']

  static flags = {
<<<<<<< HEAD
    ...BaseCommand.flags,
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Burpsuite2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading Burpsuite Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    this.logger.info('Starting conversion from Burpsuite to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
=======
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Burpsuite2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
>>>>>>> main
  }
}
