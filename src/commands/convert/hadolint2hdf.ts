import { Flags } from '@oclif/core';
import fs from 'fs';
import { HadolintMapper as Mapper, INPUT_TYPES } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/base_command';

export default class Hadolint2HDF extends BaseCommand<typeof Hadolint2HDF> {
  static readonly usage
    = '<%= command.id %> -i <hadolint-json> -o <hdf-scan-results-json> [-h] [-w] [-d]';

  static readonly description
    = 'Translate a Hadolint results JSON file into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i hadolint-results.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Hadolint Results JSON File',
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
    includeRuleDescriptions: Flags.boolean({
      char: 'd',
      required: false,
      description: 'Include Hadolint and ShellCheck rule descriptions in HDF JSON file',
    }),
  };

  async run() {
    const { flags } = await this.parse(Hadolint2HDF);

    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({ data, filename: flags.input }, INPUT_TYPES.HADOLINT, 'Hadolint results JSON');

    const converter = new Mapper(data, flags.includeRaw, flags.includeRuleDescriptions);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(await converter.toHdf(), null, 2),
    );
  }
}
