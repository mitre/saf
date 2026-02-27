import { Flags } from '@oclif/core';
import fs from 'fs';
import { ASFFResults as Mapper } from '@mitre/hdf-converters';
import { basename, checkInput, checkSuffix } from '../../utils/global';
import _ from 'lodash';
import path from 'path';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Trivy2HDF extends BaseCommand<typeof Trivy2HDF> {
  static readonly usage
    = '<%= command.id %> -i <trivy-finding-json> -o <hdf-output-folder>';

  static readonly description
    = 'Translate a Trivy-derived AWS Security Finding Format results from JSONL into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i trivy-asff.json -o output-folder'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Trivy ASFF JSON File',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON Folder',
    }),
  };

  async run() {
    const { flags } = await this.parse(Trivy2HDF);
    // The data comes as an _asff.json file which is basically the array of findings
    // but without the surrounding object; however, could also be properly formed
    // asff since it depends on the template used
    const input = fs.readFileSync(flags.input, 'utf8').trim();
    // if (Array.isArray(JSON.parse(input))) {
    //   input = `{"Findings": ${fs.readFileSync(flags.input, 'utf8').trim()}}`
    // }

    checkInput(
      { data: input, filename: flags.input },
      'asff',
      'Trivy-derived AWS Security Finding Format results',
    );

    const converter = new Mapper(input);
    const results = converter.toHdf();

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
