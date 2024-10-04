import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {TrufflehogResults as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class Trufflehog2HDF extends Command {
  static readonly usage =
    'convert trufflehog2hdf -i <trufflehog-json> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description =
    'Translate a Trufflehog output file into an HDF results set';

  static readonly examples = [
    'saf convert trufflehog2hdf -i trufflehog.json -o output-hdf-name.json',
  ];

  static readonly flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Trufflehog file',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF file',
    }),
    'with-raw': Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file',
    }),
  };

  async run() {
    const {flags} = await this.parse(Trufflehog2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput(
      {data, filename: flags.input},
      'trufflehog',
      'Trufflehog output file',
    )

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    )
  }
}
