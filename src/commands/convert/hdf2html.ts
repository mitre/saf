import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import path from 'path'
import {FromHDFToHTMLMapper as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'

// All selectable export types for an HTML export
enum FileExportTypes {
  Executive = 'Executive',
  Manager = 'Manager',
  Administrator = 'Administrator'
}

export default class HDF2HTML extends Command {
  static usage = 'convert hdf2html -i <hdf-scan-results-json>... -o <output-html> [-t <output-type>] [-h]'

  static description = 'Translate an HDF file into a Heimdall Report HTML file'

  static examples = ['saf convert hdf2html -i hdf_input.json -o report.html -t manager']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input HDF JSON file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HTML file'}),
    type: Flags.string({char: 't', default: FileExportTypes.Administrator,
      description: 'The report type to generate\nReport types differ with the information they include\nExecutive: Profile Info + Statuses + Compliance Level\nManager: Executive + Test Results and Details\nAdministrator: Manager + Test Code',
      options: ['executive', 'manager', 'administrator']}),
  }

  async run() {
    const {flags} = await this.parse(HDF2HTML)

    const files = []

    let i = 0
    for (const file of flags.input) {
      // Create unique fileID for html reference
      const fileID = `${i++}`

      const data = fs.readFileSync(file, 'utf8')
      const fileName = path.basename(file)
      files.push({data, fileName, fileID})
    }

    const converter = await new Mapper(files, _.startCase(flags.type) as FileExportTypes).toHTML()
    fs.writeFileSync(flags.output, converter)
  }
}
