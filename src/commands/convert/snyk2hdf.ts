import fs from 'fs';
import path from 'path';
import { INPUT_TYPES, SnykResults as Mapper } from '@mitre/hdf-converters';
import { Flags } from '@oclif/core';
import _ from 'lodash';
import { BaseCommand } from '../../utils/oclif/base_command';
import { basename, checkInput, checkSuffix, resolveSafeChild } from '../../utils/global';

export default class Snyk2HDF extends BaseCommand<typeof Snyk2HDF> {
  static readonly usage
    = '<%= command.id %> -i <snyk-json> -o <hdf-scan-results-json> [-h]';

  static readonly description
    = 'Translate a Snyk results JSON file into a Heimdall Data Format JSON file\n'
      + 'A separate HDF JSON is generated for each project reported in the Snyk Report.';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i snyk_results.json -o output-file-prefix'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Snyk Results JSON File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File',
    }),
  };

  async run() {
    const { flags } = await this.parse(Snyk2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data: data, filename: flags.input }, // skipcq: JS-0240
      INPUT_TYPES.SNYK,
      'Snyk results JSON',
    );

    const converter = new Mapper(data);
    const result = converter.toHdf();
    if (Array.isArray(result)) {
      const outputBase = path.dirname(flags.output);
      const outputPrefix = basename(flags.output.replaceAll(/\.json/gi, ''));
      for (const element of result) {
        fs.writeFileSync(
          resolveSafeChild(outputBase, `${outputPrefix}-${basename(_.get(element, 'platform.target_id') || '')}.json`),
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
