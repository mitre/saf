import { Flags } from '@oclif/core';
import fs from 'fs';
import { DependencyTrackMapper as Mapper } from '@mitre/hdf-converters';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class DependencyTrack2HDF extends BaseCommand<typeof DependencyTrack2HDF> {
  static readonly usage = '<%= command.id %> -i <dt-fpf-json> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description = 'Translate a Dependency-Track results JSON file into a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i dt-fpf.json -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({ char: 'i', required: true, description: 'Input Dependency-Track FPF file' }),
    output: Flags.string({ char: 'o', required: true, description: 'Output HDF file' }),
    'with-raw': Flags.boolean({ char: 'w', required: false }),
  };

  async run() {
    const { flags } = await this.parse(DependencyTrack2HDF);
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      'dependencyTrack',
      'Dependency-Track results JSON',
    );

    const converter = new Mapper(data, flags['with-raw']);
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf(), null, 2));
  }
}
