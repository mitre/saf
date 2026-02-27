import { Flags } from '@oclif/core';
import fs from 'fs';
import { AnchoreGrypeMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class AnchoreGrype2HDF extends BaseCommand<typeof AnchoreGrype2HDF> {
  static readonly usage
    = '<%= command.id %> -i <anchoregrype-json> -o <hdf-scan-results-json>';

  static readonly description
    = 'Translate an Anchore Grype output file into an HDF results set';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i anchoregrype.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Anchore Grype file',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF file',
    }),
    includeRaw: Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw data from the input Anchore Grype file',
    }),
  };

  async run() {
    const { flags } = await this.parse(AnchoreGrype2HDF);
    const input = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data: input, filename: flags.input },
      'grype',
      'Anchore Grype JSON results file',
    );

    const converter = new Mapper(input, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
