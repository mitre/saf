import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {CycloneDXSBOMResults as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class CycloneDX_SBOM2HDF extends Command {
  static usage = 'convert cyclonedx_sbom2hdf -i <cyclonedx_sbom-json> -o <hdf-scan-results-json> [-h] [-w]'

  static description = 'Translate a CycloneDX SBOM report into an HDF results set'

  static examples = ['saf convert cyclonedx_sbom2hdf -i cyclonedx_sbom.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input CycloneDX SBOM file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON file'}),
    'with-raw': Flags.boolean({char: 'w', required: false, description: 'Include raw input file in HDF JSON file'}),
  }

  async run() {
    const {flags} = await this.parse(CycloneDX_SBOM2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'sbom', 'CycloneDX SBOM output file')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf(), null, 2))
  }
}
