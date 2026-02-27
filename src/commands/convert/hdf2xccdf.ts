import { Flags } from '@oclif/core';
import fs from 'fs';
import { FromHDFToXCCDFMapper as Mapper } from '@mitre/hdf-converters';
import files from '../../resources/files.json';
import { checkSuffix } from '../../utils/global';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class HDF2XCCDF extends BaseCommand<typeof HDF2XCCDF> {
  static readonly usage
    = '<%= command.id %> -i <hdf-scan-results-json> -o <output-xccdf-xml> [-h]';

  static readonly description = 'Translate an HDF file into an XCCDF XML file';

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i hdf_input.json -o xccdf-results.xml'];

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input HDF JSON file',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output XCCDF XML file',
    }),
  };

  async run() {
    const { flags } = await this.parse(HDF2XCCDF);

    const converter = new Mapper(
      fs.readFileSync(flags.input, 'utf8'),
      files['xccdfTemplate.xml'].data,
    );
    fs.writeFileSync(checkSuffix(flags.output, '.xml'), converter.toXCCDF());
  }
}
