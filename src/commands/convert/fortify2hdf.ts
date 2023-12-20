import {FortifyMapper as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkInput, checkSuffix} from '../../utils/global'

export default class Fortify2HDF extends Command {
  static description = 'Translate a Fortify results FVDL file into a Heimdall Data Format JSON file; the FVDL file is an XML that can be extracted from the Fortify FPR project file using standard file compression tools'

  static examples = ['saf convert fortify2hdf -i audit.fvdl -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input FVDL File', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    'with-raw': Flags.boolean({char: 'w', description: 'Include raw input file in HDF JSON file', required: false}),
  }

  static usage = 'convert fortify2hdf -i <fortify-fvdl> -o <hdf-scan-results-json> [-h] [-w]'

  async run() {
    const {flags} = await this.parse(Fortify2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'fortify', 'Fortify results FVDL file')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
