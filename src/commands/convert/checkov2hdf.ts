import { Flags } from '@oclif/core';
import fs from 'fs';
import { CheckovMapper as Mapper, INPUT_TYPES } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/base_command';

export default class Checkov2HDF extends BaseCommand<typeof Checkov2HDF> {
  static readonly usage
    = '<%= command.id %> -i <checkov-json> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a Checkov JSON file into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i checkov_results.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Checkov JSON File',
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
    const { flags } = await this.parse(Checkov2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, INPUT_TYPES.CHECKOV, 'Checkov JSON');

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
