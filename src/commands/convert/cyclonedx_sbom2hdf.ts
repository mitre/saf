import { Flags } from '@oclif/core';
import fs from 'fs';
import { CycloneDXSBOMResults as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class CycloneDXSBOM2HDF extends BaseCommand<typeof CycloneDXSBOM2HDF> {
  static readonly usage
    = '<%= command.id %> -i <cyclonedx_sbom-json> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a CycloneDX SBOM report into an HDF results set';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i cyclonedx_sbom.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input CycloneDX SBOM file',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON file',
    }),
    includeRaw: Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file',
    }),
  };

  async run() {
    const { flags } = await this.parse(CycloneDXSBOM2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      'cyclonedx_sbom',
      'CycloneDX SBOM output file',
    );

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
