import { Flags } from '@oclif/core';
import fs from 'fs';
import { SarifMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Sarif2HDF extends BaseCommand<typeof Sarif2HDF> {
  static readonly usage
    = '<%= command.id %> -i <sarif-json> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a SARIF JSON file into a Heimdall Data Format JSON file\n'
      + 'SARIF levels to HDF impact mapping are:\n  '
      + 'SARIF level error -> HDF impact 0.7\n'
      + 'SARIF level warning -> HDF impact 0.5\n'
      + 'SARIF level note -> HDF impact 0.3\n'
      + 'SARIF level none -> HDF impact 0.1\n'
      + 'SARIF level not provided -> HDF impact 0.1 as default';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i sarif-results.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input SARIF JSON File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
    includeRaw: Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file',
    }),
  };

  async run() {
    const { flags } = await this.parse(Sarif2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, 'sarif', 'SARIF JSON');

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
