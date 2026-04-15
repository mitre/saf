import fs from 'fs';
import path from 'path';
import { FileExportTypes, FromHDFToHTMLMapper as Mapper } from '@mitre/hdf-converters';
import { Command, Flags } from '@oclif/core';

export default class HDF2HTML extends Command {
  static readonly usage = 'convert hdf2html -i <hdf-scan-results-json>... -o <output-html> [-t <output-type>] [-h]';

  static readonly description = 'Translate an HDF file into a Heimdall Report HTML file';

  static readonly examples = ['saf convert hdf2html -i hdf_input.json -o report.html -t manager'];

  static readonly flags = {
    help: Flags.help({ char: 'h' }),
    input: Flags.string({ char: 'i', required: true, multiple: true, description: 'Input HDF JSON file' }),
    output: Flags.string({ char: 'o', required: true, description: 'Output HTML file' }),
    type: Flags.string({ char: 't', default: FileExportTypes.Administrator,
      description: 'The report type to generate\nReport types differ with the information they include\nExecutive: Profile Info + Statuses + Compliance Level\nManager: Executive + Test Results and Details\nAdministrator: Manager + Test Code',
      options: ['Executive', 'Manager', 'Administrator'] }),
  };

  async run() {
    const { flags } = await this.parse(HDF2HTML);

    const files = flags.input.map((file, i) => ({ data: fs.readFileSync(file, 'utf8'), fileName: path.basename(file), fileID: `${i}` }));

    const converter = await new Mapper(files, FileExportTypes[flags.type as keyof typeof FileExportTypes]).toHTML();
    fs.writeFileSync(flags.output, converter);
  }
}
