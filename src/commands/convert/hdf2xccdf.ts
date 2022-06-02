import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {FromHDFToXCCDFMapper as Mapper} from '@mitre/hdf-converters'
import {default as files} from '../../resources/files.json'

export default class HDF2XCCDF extends Command {
  static usage = 'convet hdf2xccdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate an HDF file into an XCCDF XML'

  static examples = ['saf convert hdf2xccdf -i hdf_input.json -o xccdf-results.xml']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(HDF2XCCDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'), files['xccdfTemplate.xml'].data)
    fs.writeFileSync(flags.output, converter.toXCCDF())
  }
}
