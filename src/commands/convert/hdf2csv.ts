import {Flags} from '@oclif/core'
import {ContextualizedEvaluation, contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import ObjectsToCsv from 'objects-to-csv'
import {ControlSetRows} from '../../types/csv'
import {convertRow, csvExportFields} from '../../utils/csv'
import {convertFullPathToFilename} from '../../utils/global'
import {BaseCommand} from '../../baseCommand'
import path from 'path'
import colors from 'colors' // eslint-disable-line no-restricted-imports
import inquirer from 'inquirer'
import inquirerSelectDirectory from 'inquirer-select-directory'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'

export default class HDF2CSV extends BaseCommand<typeof HDF2CSV> {
  static usage = 'convert hdf2csv -i <hdf-scan-results-json> -o <output-csv> [-h] [-f <csv-fields>] [-t]'

  static description = 'Translate a Heimdall Data Format JSON file into a Comma Separated Values (CSV) file'

  static flags = {
    input: Flags.string({char: 'i', required: false, description: 'Input HDF file', exclusive: ['interactive']}),
    output: Flags.string({char: 'o', required: false, description: 'Output CSV file', exclusive: ['interactive']}),
    fields: Flags.string({char: 'f', required: false, default: csvExportFields.join(','), description: 'Fields to include in output CSV, separated by commas'}),
    noTruncate: Flags.boolean({char: 't', required: false, default: false, description: 'Do not truncate fields longer than 32,767 characters (the cell limit in Excel)'}),
  }

  // The config.bin (translates to saf), the <%= command.id %> (translates to convert hdf2csv)
  static examples = [
    '<%= config.bin %> <%= command.id %> -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"',
    '<%= config.bin %> <%= command.id %> --interactive',
  ]

  async run() {
    const {flags} = await this.parse(HDF2CSV)

    let inputFile: string = ''
    let outputFile: string = ''
    let includeFields: string = ''
    let truncateFields: boolean = false

    if (flags.interactive) {
      const interactiveFlags = await getFlags()
      inputFile = interactiveFlags.inputFile
      outputFile = path.join(interactiveFlags.outputFile, 'hdf2csv.csv')
      includeFields = interactiveFlags.fields
      truncateFields = Boolean(interactiveFlags.truncateFields)
    } else {
      if (!flags.input) {
        this.warn('Missing required input HDF json file')
        return
      }

      if (!flags.output) {
        this.warn('Missing required output CSV file')
        return
      }

      inputFile = flags.input
      outputFile = flags.output
      includeFields = flags.fields
      truncateFields = flags.noTruncate
    }

    if (validFileFlags(inputFile, outputFile)) {
      const contextualizedEvaluation = contextualizeEvaluation(JSON.parse(fs.readFileSync(inputFile, 'utf8')))

      // Convert all controls from a file to ControlSetRows
      let rows: ControlSetRows = convertRows(contextualizedEvaluation, convertFullPathToFilename(inputFile), includeFields.split(','))
      rows = rows.map((row, index) => {
        const cleanedRow: Record<string, string> = {}
        for (const key in row) {
          if (row[key] !== undefined) {
            if ((row[key]).length > 32767 && truncateFields) {
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
        }

        return cleanedRow
      })

      await new ObjectsToCsv(rows).toDisk(outputFile)
    }
  }
}

function convertRows(evaluation: ContextualizedEvaluation, filename: string, fieldsToAdd: string[]): ControlSetRows {
  const controls = evaluation.contains.flatMap(profile => profile.contains) || []
  return controls.map(ctrl => convertRow(filename, ctrl, fieldsToAdd))
}

async function getFlags(): Promise<any> {
  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)
  inquirer.registerPrompt('directory', inquirerSelectDirectory)

  console.log(colors.yellow('Provide the necessary information:'))
  console.log(colors.green('  Required flag - HDF file to convert to a CSV formatted file'))
  console.log(colors.green('  Required flag - CSV output directory (output file name is hdf2csv.csv)'))
  console.log(colors.magenta('  Optional flag - Fields to include in output CSV (comma delineated)'))
  console.log(colors.magenta('  Optional flag - Truncate fields that exceed Excel cell limit (32,767 characters)'))

  const questions = [
    {
      type: 'file-tree-selection',
      name: 'inputFile',
      message: 'Select the HDF file to be converted to a CSV',
      filters: 'json',
      pageSize: 15,
      enableGoUpperDirectory: true,
      transformer: (input: any) => {
        const name = input.split(path.sep).pop()
        const fileExtension =  name.split('.').slice(1).pop()
        if (name[0] === '.') {
          return colors.grey(name)
        }

        if (fileExtension === 'json') {
          return colors.green(name)
        }

        return name
      },
      validate: (input: any) => {
        const name = input.split(path.sep).pop()
        const fileExtension =  name.split('.').slice(1).pop()
        if (fileExtension !== 'json') {
          return 'Not a .json file, please select another file'
        }

        return true
      },
    },
    {
      type: 'directory',
      name: 'outputFile',
      message: 'Select output directory for the generated CSV file (hdf2csv.csv)',
      pageSize: 15,
      enableGoUpperDirectory: true,
      basePath: './',
      transformer: (input: any) => {
        const name = input.split(path.sep).pop()
        if (name[0] === '.') {
          return colors.grey(name)
        }
      },
    },
    {
      type: 'input',
      name: 'fields',
      message: 'Fields to include in output CSV, separated by commas',
      default() {
        return csvExportFields.join(',')
      },
    },
    {
      type: 'list',
      name: 'Truncate fields longer than 32,767 characters (the cell limit in Excel)',
      message: 'truncateFields',
      choices: ['true', 'false'],
      default: false,
      filter(val: string) {
        return (val === 'true')
      },
    },
  ]

  let interactiveValues: any
  const rvalue = inquirer.prompt(questions).then((answers: any) => {
    interactiveValues = answers
  })

  await rvalue
  return interactiveValues
}

function validFileFlags(input: string, output: string): boolean {
  try {
    fs.lstatSync(input).isFile()
  } catch {
    throw new Error('Invalid or no HDF json file provided.')
  }

  if (!fs.existsSync(path.dirname(output))) {
    throw new Error('Invalid output directory provided for the CSV output file.')
  }

  return true
}
