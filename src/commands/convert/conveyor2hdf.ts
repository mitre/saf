import { Flags } from '@oclif/core';
import fs from 'fs';
import { ConveyorResults as Mapper } from '@mitre/hdf-converters';
import { basename, checkInput, checkSuffix } from '../../utils/global';
import path from 'path';
import { BaseCommand } from '../../utils/oclif/baseCommand';
export default class Conveyor2HDF extends BaseCommand<typeof Conveyor2HDF> {
  static readonly usage
    = '<%= command.id %> -i <conveyor-json> -o <hdf-scan-results-json> [-h]';

  static readonly description
    = 'Translate a Conveyor JSON file into a Heimdall Data Format JSON files';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i conveyor_results.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Conveyor JSON File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON Folder',
    }),
  };

  async run() {
    const { flags } = await this.parse(Conveyor2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, 'Conveyor', 'Conveyor JSON');

    const converter = new Mapper(data);
    const results = converter.toHdf();
    fs.mkdirSync(flags.output);
    for (const [filename, result] of Object.entries(results)) {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(basename(filename))),
        JSON.stringify(result, null, 2),
      );
    }
  }
}
