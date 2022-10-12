import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ZapMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'
import {readFileURI} from '../../utils/io'

export default class Zap2HDF extends Command {
  static usage = 'convert zap2hdf -i <zap-json> -n <target-site-name> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a OWASP ZAP results JSON to a Heimdall Data Format JSON file'

  static examples = ['saf convert zap2hdf -i zap_results.json -n mitre.org -o scan_results.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input OWASP Zap Results JSON File'}),
    name: Flags.string({char: 'n', required: true, description: 'Target Site Name'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(Zap2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'zap', 'OWASP ZAP results JSON')

    const converter = new Mapper(await readFileURI(flags.input, 'utf8'), flags.name)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
