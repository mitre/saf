import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {JfrogXrayMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class JfrogXray2HDF extends Command {
  static usage = 'convet:jfrog_xray2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a JFrog Xray results JSON file into a Heimdall Data Format JSON file'

  static examples = ['saf convert:jfrog_xray2hdf -i xray_results.json -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(JfrogXray2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
