import { Flags } from '@oclif/core';
import fs from 'fs';
import { ChecklistResults as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class CKL2HDF extends BaseCommand<typeof CKL2HDF> {
  static readonly usage
    = '<%= command.id %> -i <ckl-xml> -o <hdf-scan-results-json> [-r]';

  static readonly description
    = 'Translate a Checklist XML file into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i ckl_results.xml -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Checklist XML File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
    includeRaw: Flags.boolean({
      char: 'r',
      required: false,
      description: 'Include raw input file in HDF JSON file',
    }),
  };

  async run() {
    const { flags } = await this.parse(CKL2HDF);

    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, 'checklist', 'DISA Checklist');

    try {
      const converter = new Mapper(data, flags.includeRaw);
      fs.writeFileSync(
        checkSuffix(flags.output),
        JSON.stringify(converter.toHdf(), null, 2),
      );
    } catch (error) {
      console.error(`Error converting to hdf:\n${error}`);
    }
  }
}
