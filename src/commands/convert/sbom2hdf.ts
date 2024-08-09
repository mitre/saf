import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {SBOMResults as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class SBOM2HDF extends Command {
  static usage = 'convert sbom2hdf -i <sbom-json> -o <hdf-scan-results-json> [-h] [-w]'

  static description = 'Translate a CycloneDX SBOM report into an HDF results set'

  static examples = ['saf convert sbom2hdf -i sbom.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input SBOM file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON file'}),
    'with-raw': Flags.boolean({char: 'w', required: false, description: 'Include raw input file in HDF JSON file'}),
  }

  async run() {
    const {flags} = await this.parse(SBOM2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'sbom', 'CycloneDX SBOM output file')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf(), null, 2))
  }
}
