import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import { ZapMapper as Mapper } from '@mitre/hdf-converters'
import { checkInput, checkSuffix } from '../../utils/global'

export default class Zap2HDF extends Command {
  static usage = 'convert zap2hdf -i <zap-json> -n <target-site-name> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a OWASP ZAP results JSON to HDF format Json be viewed on Heimdall'

  static examples = ['saf convert zap2hdf -i zap_results.json -n site_name -o scan_results.json']

  static flags = {
    help: Flags.help({ char: 'h' }),
    input: Flags.string({ char: 'i', required: true }),
    name: Flags.string({ char: 'n', required: true }),
    output: Flags.string({ char: 'o', required: true }),
  }

  async run() {
    const { flags } = await this.parse(Zap2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({ data: data, filename: flags.input }, 'zap', 'OWASP ZAP results JSON')

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'), flags.name)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
