import { Flags } from '@oclif/core';
import fs from 'fs';
import { VeracodeMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Veracode2HDF extends BaseCommand<typeof Veracode2HDF> {
  static readonly usage
    = '<%= command.id %> -i <veracode-xml> -o <hdf-scan-results-json> [-h]';

  static readonly description
    = 'Translate a Veracode XML file into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i veracode_results.xml -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Veracode XML File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
  };

  async run() {
    const { flags } = await this.parse(Veracode2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, 'veracode', 'Veracode XML');

    const converter = new Mapper(data);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    );
  }
}
