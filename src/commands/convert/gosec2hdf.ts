import { Flags } from '@oclif/core';
import fs from 'fs';
import { GosecMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Gosec2HDF extends BaseCommand<typeof Gosec2HDF> {
  static readonly usage = '<%= command.id %> -i <gosec-json> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description = 'Translate a gosec (Golang Security Checker) results JSON to a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i gosec_results.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({ char: 'i', required: true, description: 'Input gosec Results JSON File' }),
    output: Flags.string({ char: 'o', required: true, description: 'Output HDF JSON File' }),
    includeRaw: Flags.boolean({ char: 'w', required: false, description: 'Include raw input file in HDF JSON file' }),
  };

  async run() {
    const { flags } = await this.parse(Gosec2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, 'gosec', 'gosec results JSON');

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf(), null, 2));
  }
}
