import { Flags } from '@oclif/core';
import fs from 'fs';
import { ScoutsuiteMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Scoutsuite2HDF extends BaseCommand<typeof Scoutsuite2HDF> {
  static readonly usage
    = '<%= command.id %> -i <scoutsuite-results-js> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a ScoutSuite results from a Javascript object into a Heimdall Data Format JSON file\n'
      + 'Note: Currently this mapper only supports AWS.';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i scoutsuite-results.js -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input ScoutSuite Results JS File',
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
    const { flags } = await this.parse(Scoutsuite2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      'scoutsuite',
      'ScoutSuite results from a Javascript object',
    );

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
