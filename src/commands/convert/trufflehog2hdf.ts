import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {TrufflehogResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Trufflehog2HDF extends Command {
  static usage =
    'convert trufflehog2hdf -i <trufflehog-json> -o <hdf-scan-results-json>';

  static description =
    'Translate a Trufflehog output file into an HDF results set';

  static examples = [
    'saf convert trufflehog2hdf -i trufflehog.json -o output-hdf-name.json',
  ];

  static flags = {
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
    'with-raw': Flags.boolean({char: 'w', required: false}),
  };

  async run() {
    const {flags} = await this.parse(Trufflehog2HDF)
    const input = fs.readFileSync(flags.input, 'utf8')

    const converter = new Mapper(input, flags['with-raw'])
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(converter.toHdf(), null, 2),
    )
  }
}
