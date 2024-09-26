import {Command, Flags} from '@oclif/core';
import fs from 'fs';
import {NeuVectorMapper as Mapper} from '@mitre/hdf-converters';
import {checkSuffix} from '../../utils/global';

export default class NeuVector2HDF extends Command {
  static usage =
    'convert neuvector2hdf -i <neuvector-json> -o <hdf-scan-results-json>';

  static description =
    'Translate a NeuVector results JSON to a Heimdall Data Format JSON file';

  static examples = [
    'saf convert neuvector2hdf -i neuvector.json -o output-hdf-name.json'
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input NeuVector Results JSON File'
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON file'
    }),
    'with-raw': Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file'
    })
  };

  async run() {
    const {flags} = await this.parse(NeuVector2HDF);
    const input = fs.readFileSync(flags.input, 'utf8');

    const converter = new Mapper(input, flags['with-raw']);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf())
    );
  }
}
