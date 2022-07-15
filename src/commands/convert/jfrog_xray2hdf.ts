import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {JfrogXrayMapper as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class JfrogXray2HDF extends Command {
  static usage = 'convet:jfrog_xray2hdf -i, --input=JSON -o, --output=OUTPUT -w, --with-raw'

  static description = 'Translate a JFrog Xray results JSON file into a Heimdall Data Format JSON file'

  static examples = ['saf convert jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json -w']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
    'with-raw': Flags.boolean({char: 'w', required: false}),
  }

  async run() {
    const {flags} = await this.parse(JfrogXray2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'jfrog', 'JFrog Xray results JSON')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
