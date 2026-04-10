import fs from 'fs';
import { INPUT_TYPES, XCCDFResultsResults as Mapper } from '@mitre/hdf-converters';
import { Flags } from '@oclif/core';
import { checkInput, checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/base_command';

export default class XCCDFResults2HDF extends BaseCommand<typeof XCCDFResults2HDF> {
  static readonly usage
    = '<%= command.id %> -i <xccdf-results-xml> -o <hdf-scan-results-json> [-h] [-w]';

  static readonly description
    = 'Translate a SCAP client XCCDF-Results XML report to a Heimdall Data Format JSON file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i results-xccdf.xml -o output-hdf-name.json'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input XCCDF Results XML File',
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
  };

  async run() {
    const { flags } = await this.parse(XCCDFResults2HDF);

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8');
    checkInput(
      { data, filename: flags.input },
      INPUT_TYPES.XCCDF,
      'SCAP client XCCDF-Results XML report',
    );

    const converter = new Mapper(data, flags.includeRaw);
    fs.writeFileSync(
      checkSuffix(flags.output),
      JSON.stringify(await converter.toHdf(), null, 2),
    );
  }
}
