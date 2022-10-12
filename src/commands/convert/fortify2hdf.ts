import {Command, Flags} from '@oclif/core'
import {FortifyMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, checkInput} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class Fortify2HDF extends Command {
  static usage = 'convert fortify2hdf -i <fortify-fvdl> -o <hdf-scan-results-json> [-h]'

  static description = 'Translate a Fortify results FVDL file into a Heimdall Data Format JSON file; the FVDL file is an XML that can be extracted from the Fortify FPR project file using standard file compression tools'

  static examples = ['saf convert fortify2hdf -i audit.fvdl -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input FVDL File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(Fortify2HDF)

    // Check for correct input type
    const data = await readFileURI(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'fortify', 'Fortify results FVDL file')

    const converter = new Mapper(data)
    await writeFileURI(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
