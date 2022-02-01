import {Command, flags} from '@oclif/command'
import {ContextualizedEvaluation, contextualizeEvaluation, ExecJSON} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import ObjectsToCsv from 'objects-to-csv'
import {ControlSetRows} from '../../types/csv'
import {convertRow, csvExportFields} from '../../utils/csv'
import {convertFullPathToFilename} from '../../utils/global'

export default class HDF2CSV extends Command {
  static usage = 'hdf2csv -i, --input <INPUT-JSON> -o, --output <OUTPUT-CSV> -f, --fields <CSV Fields>'

  static description = 'Translate a Heimdall Data Format JSON file into a Comma Separated Values (CSV) file'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    output: flags.string({char: 'o', required: true, description: 'Output CSV file'}),
    fields: flags.string({char: 'f', required: false, default: csvExportFields.join(','), description: 'Fields to include in output CSV, separated by commas'}),
    noTruncate: flags.boolean({char: 't', required: false, default: false, description: "Don't truncate fields longer than 32,767 characters (the cell limit in Excel)"}),
  }

  static examples = ['saf convert:hdf2csv -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"']

  convertRows(evaluation: ContextualizedEvaluation, filename: string, fieldsToAdd: string[]): ControlSetRows {
    const rows: ControlSetRows = []
    const controls = evaluation.contains.flatMap(profile => profile.contains) || []
    const hitIds = new Set()
    for (const ctrl of controls) {
      const root = ctrl.root
      if (hitIds.has(root.hdf.wraps.id)) {
        continue
      } else {
        hitIds.add(root.hdf.wraps.id)
        rows.push(convertRow(filename, root, fieldsToAdd))
      }
    }
    return rows
  }

  async run() {
    const {flags} = this.parse(HDF2CSV)
    const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(fs.readFileSync(flags.input, {encoding: 'utf-8'})))

    // Convert all controls from a file to ControlSetRows
    let rows: ControlSetRows = this.convertRows(contextualizedEvaluation, convertFullPathToFilename(flags.input), flags.fields.split(','))
    rows = rows.map((row, index) => {
      const cleanedRow: Record<string, string> = {}
      for (const key in row) {
        if ((row[key] as string).length > 32767) {
          if ('ID' in row) {
            console.error(`Field ${key} of control ${row.ID} is longer than 32,767 characters and has been truncated for compatibility with Excel. To disable this behavior use the option --noTruncate`)
          } else {
            console.error(`Field ${key} of control at index ${index} is longer than 32,767 characters and has been truncated for compatibility with Excel. To disable this behavior use the option --noTruncate`)
          }
          cleanedRow[key] = _.truncate(row[key] as string, {length: 32757, omission: 'TRUNCATED'})
        } else {
          cleanedRow[key] = row[key]
        }
      }
      return cleanedRow
    })
    await new ObjectsToCsv(rows).toDisk(flags.output, {bom: true})
  }
}
