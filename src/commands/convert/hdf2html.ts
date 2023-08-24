import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import path from 'path'
import {FromHDFToHTMLMapper as Mapper} from '@mitre/hdf-converters'

// All selectable export types for an HTML export
enum FileExportTypes {
  Executive = 'Executive',
  Manager = 'Manager',
  Administrator = 'Administrator'
}

export default class HDF2HTML extends Command {
  static usage = 'convert hdf2html -i <hdf-scan-results-json>... -o <output-html> [-h]'

  static description = 'Translate an HDF file into a Heimdall Report HTML file'

  static examples = ['saf convert hdf2html -i hdf_input.json -o report.html']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input HDF JSON file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HTML file'}),
  }

  async run() {
    const {flags} = await this.parse(HDF2HTML)

    const files = [];
    for (const file of flags.input) {
      const data = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file);
      files.push({data, fileName});
    }

    const converter = await new Mapper(files, FileExportTypes.Administrator).toHTML('/html/');
    fs.writeFileSync(flags.output, converter)
  }
}
