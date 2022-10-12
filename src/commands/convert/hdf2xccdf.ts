import {Command, Flags} from '@oclif/core'
import {FromHDFToXCCDFMapper as Mapper} from '@mitre/hdf-converters'
import {default as files} from '../../resources/files.json'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class HDF2XCCDF extends Command {
  static usage = 'convert hdf2xccdf -i <hdf-scan-results-json> -o <output-xccdf-xml> [-h]'

  static description = 'Translate an HDF file into an XCCDF XML'

  static examples = ['saf convert hdf2xccdf -i hdf_input.json -o xccdf-results.xml']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(HDF2XCCDF)

    const converter = new Mapper(await readFileURI(flags.input, 'utf8'), files['xccdfTemplate.xml'].data)
    await writeFileURI(flags.output, converter.toXCCDF())
  }
}
