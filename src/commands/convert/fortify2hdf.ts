import { Flags } from '@oclif/core';
import fs from 'fs';
import { FortifyMapper as Mapper } from '@mitre/hdf-converters';
import { checkSuffix, checkInput } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Fortify2HDF extends BaseCommand<typeof Fortify2HDF> {
  static readonly usage
    = '<%= command.id %> -i <fortify-fvdl> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a Fortify results FVDL file into a Heimdall Data Format JSON file; '
      + 'the FVDL file is an XML that can be extracted from the Fortify FPR project file '
      + 'using standard file compression tools';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i audit.fvdl -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input FVDL File',
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
    const { flags } = await this.parse(Fortify2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      'fortify',
      'Fortify results FVDL file',
    );

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
