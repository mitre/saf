import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ContextualizedEvaluation, contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import ObjectsToCsv from 'objects-to-csv'

import {ControlSetRows} from '../../types/csv'
import {convertRow, csvExportFields} from '../../utils/csv'
import {convertFullPathToFilename} from '../../utils/global'

export default class HDF2CSV extends Command {
  static description = 'Translate a Heimdall Data Format JSON file into a Comma Separated Values (CSV) file'

  static examples = ['saf convert hdf2csv -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"']

  static flags = {
    fields: Flags.string({char: 'f', default: csvExportFields.join(','), description: 'Fields to include in output CSV, separated by commas', required: false}),
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input HDF file', required: true}),
    noTruncate: Flags.boolean({char: 't', default: false, description: "Don't truncate fields longer than 32,767 characters (the cell limit in Excel)", required: false}),
    output: Flags.string({char: 'o', description: 'Output CSV file', required: true}),
  }

  static usage = 'convert hdf2csv -i <hdf-scan-results-json> -o <output-csv> [-h] [-f <csv-fields>] [-t]'

  convertRows(evaluation: ContextualizedEvaluation, filename: string, fieldsToAdd: string[]): ControlSetRows {
    const controls = evaluation.contains.flatMap(profile => profile.contains) || []
    return controls.map(ctrl => convertRow(filename, ctrl, fieldsToAdd))
  }

  async run() {
    const {flags} = await this.parse(HDF2CSV)
    const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(fs.readFileSync(flags.input, 'utf8')))

    // Convert all controls from a file to ControlSetRows
    let rows: ControlSetRows = this.convertRows(contextualizedEvaluation, convertFullPathToFilename(flags.input), flags.fields.split(','))
    rows = rows.map((row, index) => {
      const cleanedRow: Record<string, string> = {}
      for (const key in row) {
        if ((row[key]).length > 32767) {
          if ('ID' in row) {
            console.error(`Field ${key} of control ${row.ID} is longer than 32,767 characters and has been truncated for compatibility with Excel. To disable this behavior use the option --noTruncate`)
          } else {
            console.error(`Field ${key} of control at index ${index} is longer than 32,767 characters and has been truncated for compatibility with Excel. To disable this behavior use the option --noTruncate`)
          }

          cleanedRow[key] = _.truncate(row[key], {length: 32757, omission: 'TRUNCATED'})
        } else {
          cleanedRow[key] = row[key]
        }
      }

      return cleanedRow
    })
    await new ObjectsToCsv(rows).toDisk(flags.output)
  }
}
