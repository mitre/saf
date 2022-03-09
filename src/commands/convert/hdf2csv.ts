import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import {ContextualizedEvaluation, contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import ObjectsToCsv from 'objects-to-csv'
import {ControlSetRows} from '../../types/csv'
import {convertRow, csvExportFields} from '../../utils/csv'
import {convertFullPathToFilename} from '../../utils/global'

export default class HDF2CSV extends BaseCommand {
  static usage = 'hdf2csv -i, --input <INPUT-JSON> -o, --output <OUTPUT-CSV> -f, --fields <CSV Fields>'

  static description = 'Translate a Heimdall Data Format JSON file into a Comma Separated Values (CSV) file'

  static flags = {
    ...BaseCommand.flags,
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    fields: flags.string({char: 'f', required: false, default: csvExportFields.join(','), description: 'Fields to include in output CSV, separated by commas'}),
    noTruncate: flags.boolean({char: 't', required: false, default: false, description: "Don't truncate fields longer than 32,767 characters (the cell limit in Excel)"}),
  }

  static examples = ['saf convert:hdf2csv -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"']

  convertRows(evaluation: ContextualizedEvaluation, filename: string, fieldsToAdd: string[]): ControlSetRows {
    const controls = evaluation.contains.flatMap(profile => profile.contains) || []
    return controls.map(ctrl => convertRow(filename, ctrl, fieldsToAdd))
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof HDF2CSV.flags>

    // Read data
    this.logger.verbose(`Reading HDF file: ${flags.input}`)
    const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(fs.readFileSync(flags.input, 'utf-8')))
    this.logger.verbose(`Output Filename: ${flags.output}`)

    // Convert all controls from a file to ControlSetRows
    this.logger.info('Starting conversion from HDF to CSV')
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
    this.logger.info(`CSV data successfully written to ${flags.output}`)
  }
}
