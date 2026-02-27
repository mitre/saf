import { Flags } from '@oclif/core';
import fs from 'fs';
import { TwistlockResults as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Twistlock2HDF extends BaseCommand<typeof Twistlock2HDF> {
  static readonly usage
    = '<%= command.id %> -i <twistlock-json> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a Twistlock CLI output file into an HDF results set';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i twistlock.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Twistlock file',
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
    const { flags } = await this.parse(Twistlock2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      'twistlock',
      'Twistlock CLI output file',
    );

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
