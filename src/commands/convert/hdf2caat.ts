import { Flags } from '@oclif/core';
import fs from 'fs';
import { FromHDFToCAATMapper as Mapper } from '@mitre/hdf-converters';
import { basename } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class HDF2CAAT extends BaseCommand<typeof HDF2CAAT> {
  static readonly usage
    = '<%= command.id %> -i <hdf-scan-results-json>... -o <output-caat-xlsx> [-h]';

  static readonly description
    = 'Translate an HDF file into a Compliance Assessment and Audit Tracking (CAAT) XLSX file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i hdf_input.json -o caat-results.xlsx'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      multiple: true,
      description: 'Input HDF JSON file',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output CAAT XLSX file',
    }),
  };

  async run() {
    const { flags } = await this.parse(HDF2CAAT);

    const inputData = flags.input.map(filename => ({
      data: fs.readFileSync(filename, 'utf8'),
      filename: basename(filename),
    }));

    const converter = new Mapper(inputData);
    fs.writeFileSync(
      flags.output,
      converter.toCAAT(false, { bookType: 'xlsx', type: 'buffer' }),
    );
  }
}
