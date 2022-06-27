<<<<<<< HEAD
import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
=======
import {Command, Flags} from '@oclif/core'
>>>>>>> main
import fs from 'fs'
import {ZapMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

<<<<<<< HEAD
export default class Zap2HDF extends BaseCommand {
  static usage = 'convert:zap2hdf -i, --input=JSON -n, --name=NAME -o, --output=OUTPUT'
=======
export default class Zap2HDF extends Command {
  static usage = 'convert zap2hdf -i, --input=JSON -n, --name=NAME -o, --output=OUTPUT'
>>>>>>> main

  static description = 'Translate a OWASP ZAP results JSON to HDF format Json be viewed on Heimdall'

  static examples = ['saf convert zap2hdf -i zap_results.json -n site_name -o scan_results.json']

  static flags = {
<<<<<<< HEAD
    ...BaseCommand.flags,
    name: flags.string({char: 'n', required: true}),
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Zap2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading OWASP ZAP Results: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    this.logger.info('Starting conversion from OWASP ZAP to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
=======
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    name: Flags.string({char: 'n', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Zap2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'), flags.name)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
>>>>>>> main
  }
}
