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
  static usage = 'convert hdf2html -i <hdf-scan-results-json>... -o <output-html> [-t <output-type>] [-h]'

  static description = 'Translate an HDF file into a Heimdall Report HTML file'

  static examples = ['saf convert hdf2html -i hdf_input.json -o report.html -t Manager']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Input HDF JSON file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HTML file'}),
    type: Flags.string({char: 't', default: FileExportTypes.Administrator, 
    description: 'The report type to generate\nReport types differ with the information they include\nExecutive: Profile Info + Statuses + Compliance Level\nManager: Executive + Compliance Level + Test Results and Details\nAdministrator: Manager + Test Code', options: ['Executive', 'Manager', 'Administrator']})
  }

  async run() {
    const {flags} = await this.parse(HDF2HTML)

    const files = []
    for (const file of flags.input) {
      // Create (somewhat) unique fileID for html reference
      const idCore = path.basename(file).replace(' ', '-')
      const idTail1 = Math.random() * 100
      const idTail2 = Math.random() * 100

      const data = fs.readFileSync(file, 'utf8')
      const fileName = path.basename(file)
      const fileID = `${idCore}-${idTail1}-${idTail2}`
      files.push({data, fileName, fileID})
    }

    const converter = await new Mapper(files, FileExportTypes.Administrator).toHTML()
    fs.writeFileSync(flags.output, converter)
  }
}
