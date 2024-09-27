import {Command, Flags} from '@oclif/core';
import fs from 'fs';
import {ChecklistResults as Mapper} from '@mitre/hdf-converters';
import {checkInput, checkSuffix} from '../../utils/global';

export default class CKL2HDF extends Command {
  static readonly usage =
    'convert ckl2hdf -i <ckl-xml> -o <hdf-scan-results-json> [-h] [-s] [-w]';

  static readonly description =
    'Translate a Checklist XML file into a Heimdall Data Format JSON file';

  static readonly examples = [
    'saf convert ckl2hdf -i ckl_results.xml -o output-hdf-name.json'
  ];

  static readonly flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input Checklist XML File'
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON File'
    }),
    'with-raw': Flags.boolean({
      char: 'w',
      required: false,
      description: 'Include raw input file in HDF JSON file'
    })
  };

  async run() {
    const {flags} = await this.parse(CKL2HDF);

    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput({data, filename: flags.input}, 'checklist', 'DISA Checklist');

    try {
      const converter = new Mapper(data, flags['with-raw']);
      fs.writeFileSync(
        checkSuffix(flags.output),
        JSON.stringify(converter.toHdf(), null, 2)
      );
    } catch (error) {
      console.error(`Error converting to hdf:\n${error}`);
    }
  }
}
