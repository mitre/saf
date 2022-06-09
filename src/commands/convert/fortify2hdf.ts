import {Command, Flags} from '@oclif/core'
import * as fs from 'fs'
import {FortifyMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Fortify2HDF extends Command {
  static usage = 'convert fortify2hdf -i, --input=FVDL -o, --output=OUTPUT'

  static description = 'Translate a Fortify results FVDL file into a Heimdall Data Format JSON file'

  static examples = ['saf convert fortify2hdf -i audit.fvdl -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Fortify2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
