import {Command, Flags} from '@oclif/core';
import fs from 'fs';
import {AnchoreGrypeMapper as Mapper} from '@mitre/hdf-converters';
import {checkInput, checkSuffix} from '../../utils/global';

export default class AnchoreGrype2HDF extends Command {
  static readonly usage =
    'convert anchoregrype2hdf -i <anchoregrype-json> -o <hdf-scan-results-json>';

  static readonly description =
    'Translate a Anchore Grype output file into an HDF results set';

  static readonly examples = [
    'saf convert anchoregrype2hdf -i anchoregrype.json -o output-hdf-name.json'
  ];

  static readonly flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Anchore Grype file'
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF file'
    }),
    'with-raw': Flags.boolean({char: 'w', required: false})
  };

  async run() {
    const {flags} = await this.parse(AnchoreGrype2HDF);
    const input = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      {data: input, filename: flags.input},
      'grype',
      'Anchore Grype JSON results file'
    );

    const converter = new Mapper(input, flags['with-raw']);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2)
    );
  }
}
