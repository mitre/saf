import { Flags } from '@oclif/core';
import fs from 'fs';
import { DBProtectMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class DBProtect2HDF extends BaseCommand<typeof DBProtect2HDF> {
  static readonly usage
    = '<%= command.id %> -i <dbprotect-xml> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a DBProtect report in "Check Results Details" XML format into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i check_results_details_report.xml -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: "'Check Results Details' XML File",
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
    const { flags } = await this.parse(DBProtect2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      'dbProtect',
      'DBProtect report in "Check Results Details" XML format',
    );

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
