import { Flags } from '@oclif/core';
import fs from 'fs';
import { BurpSuiteMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Burpsuite2HDF extends BaseCommand<typeof Burpsuite2HDF> {
  static readonly usage
    = '<%= command.id %> -i <burpsuite-xml> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a BurpSuite Pro XML file into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i burpsuite_results.xml -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Burpsuite Pro XML File',
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
    const { flags } = await this.parse(Burpsuite2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, 'burp', 'BurpSuite Pro XML');

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
