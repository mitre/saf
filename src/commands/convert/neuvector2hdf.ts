import { Flags } from '@oclif/core';
import fs from 'fs';
import { NeuVectorMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class NeuVector2HDF extends BaseCommand<typeof NeuVector2HDF> {
  static readonly usage
    = '<%= command.id %> -i <neuvector-json> -o <hdf-scan-results-json>';

  static readonly description
    = 'Translate a NeuVector results JSON to a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i neuvector.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input NeuVector Results JSON File',
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
    const { flags } = await this.parse(NeuVector2HDF);
    const input = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data: input, filename: flags.input },
      'neuvector',
      'NeuVector results JSON',
    );

    const converter = new Mapper(input, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
