import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ZapMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Zap2HDF extends Command {
  static usage = 'convert zap2hdf -i, --input=JSON -n, --name=NAME -o, --output=OUTPUT -w, --withRaw'

  static description = 'Translate a OWASP ZAP results JSON to HDF format Json be viewed on Heimdall'

  static examples = ['saf convert zap2hdf -i zap-results.json -n site-name -o output-hdf-name.json, -w']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input OWASP ZAP file'}),
    name: Flags.string({char: 'n', required: true, description: 'Target site name'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF file'}),
    withRaw: Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(Zap2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'zap', 'OWASP ZAP results JSON')

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'), flags.name, flags.withRaw)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
