import {ZapMapper as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkInput, checkSuffix} from '../../utils/global'

export default class Zap2HDF extends Command {
  static description = 'Translate a OWASP ZAP results JSON to a Heimdall Data Format JSON file'

  static examples = ['saf convert zap2hdf -i zap_results.json -n mitre.org -o scan_results.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input OWASP Zap Results JSON File', required: true}),
    name: Flags.string({char: 'n', description: 'Target Site Name', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    'with-raw': Flags.boolean({char: 'w', description: 'Include raw input file in HDF JSON file', required: false}),
  }

  static usage = 'convert zap2hdf -i <zap-json> -n <target-site-name> -o <hdf-scan-results-json> [-h] [-w]'

  async run() {
    const {flags} = await this.parse(Zap2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'zap', 'OWASP ZAP results JSON')

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'), flags.name, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
