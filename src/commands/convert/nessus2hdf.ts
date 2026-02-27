import { Flags } from '@oclif/core';
import fs from 'fs';
import { NessusResults as Mapper } from '@mitre/hdf-converters';
import _ from 'lodash';
import { basename, checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Nessus2HDF extends BaseCommand<typeof Nessus2HDF> {
  static readonly usage
    = '<%= command.id %> -i <nessus-xml> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a Nessus XML results file into a Heimdall Data Format JSON file\n'
      + "The current iteration maps all plugin families except 'Policy Compliance'\n"
      + 'A separate HDF JSON is generated for each host reported in the Nessus Report.';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i nessus_results.xml -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Nessus XML File',
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
    const { flags } = await this.parse(Nessus2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      'nessus',
      'Nessus XML results file',
    );

    const converter = new Mapper(data, flags.includeRaw);
    const result = converter.toHdf();
    if (Array.isArray(result)) {
      for (const element of result) {
        fs.writeFileSync(
          `${flags.output.replaceAll(/\.json/gi, '')}-${basename(_.get(element, 'platform.target_id') || '')}.json`,
          JSON.stringify(element, null, 2),
        );
      }
    } else {
      fs.writeFileSync(
        checkSuffix(flags.output),
        JSON.stringify(result, null, 2),
      );
    }
  }
}
