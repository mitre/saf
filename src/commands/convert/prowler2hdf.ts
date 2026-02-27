import { Flags } from '@oclif/core';
import fs from 'fs';
import { ASFFResults as Mapper } from '@mitre/hdf-converters';
import { basename, checkInput, checkSuffix } from '../../utils/global';
import _ from 'lodash';
import path from 'path';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Prowler2HDF extends BaseCommand<typeof Prowler2HDF> {
  static readonly usage
    = '<%= command.id %> -i <prowler-finding-json> -o <hdf-output-folder> [-h]';

  static readonly description
    = 'Translate a Prowler-derived AWS Security Finding Format results from JSONL into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i prowler-asff.json -o output-folder'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Prowler ASFF JSON File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON Folder',
    }),
  };

  async run() {
    const { flags } = await this.parse(Prowler2HDF);
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data: data, filename: flags.input }, // skipcq: JS-0240
      'asff',
      'Prowler-derived AWS Security Finding Format results',
    );
    const converter = new Mapper(data);
    const results = converter.toHdf();

    // Create output folder if not exists
    if (!fs.existsSync(flags.output)) {
      fs.mkdirSync(flags.output);
    }

    _.forOwn(results, (result, filename) => {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(basename(filename))),
        JSON.stringify(result, null, 2),
      );
    });
  }
}
