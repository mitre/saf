import {Flags} from '@oclif/core'
import {ContextualizedEvaluation, contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import ObjectsToCsv from 'objects-to-csv'
import {ControlSetRows} from '../../types/csv'
import {convertRow, csvExportFields} from '../../utils/csv'
import {convertFullPathToFilename} from '../../utils/global'
import {BaseCommand} from '../../utils/oclif/baseCommand'
import path from 'path'
import colors from 'colors' // eslint-disable-line no-restricted-imports
import inquirer from 'inquirer'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import {
  addToProcessLogData,
  printGreen,
  printMagenta,
  printYellow,
  saveProcessLogData} from '../../utils/oclif/cliHelper'
import {EventEmitter} from 'events'

export default class HDF2CSV extends BaseCommand<typeof HDF2CSV> {
  static readonly usage =
    '<%= command.id %> [-i <hdf-json>|--interactive] [-o <csv-file>|--interactive] ' +
    ' [-f <header-fields>|--interactive] [-t|--interactive] [-L info|warn|debug|verbose]'

    static readonly description = 'Translate a Heimdall Data Format JSON file into a Comma Separated Values (CSV) file'

    static readonly examples = [
      {
        description: '\x1B[93mRunning the CLI interactively\x1B[0m',
        command: '<%= config.bin %> <%= command.id %> --interactive',
      },
      {
        description: '\x1B[93mProviding flags at the command line\x1B[0m',
        command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -o rhel7.csv --fields "Results Set,Status,ID,Title,Severity"',
      },
    ]

    // eslint-disable-next-line no-warning-comments
    /*
      TODO: Find a way to make certain flags required when not using --interactive.
            In this CLI the -i and -o are required fields, but if required: is set
            to true, when using the --interactive the process will state that those
            fields are required. Currently we check the flags that are required
            programmatically when the --interactive is not used.
      The exclusive: ['interactive'] flag option is used to state that the flag
      cannot be specified alongside the --interactive flag
    */
    static readonly flags = {
      input: Flags.string({
        char: 'i',
        required: false,
        exclusive: ['interactive'],
        description: '(required if not --interactive) Input HDF file'}),
      output: Flags.string({
        char: 'o',
        required: false,
        exclusive: ['interactive'],
        description: '(required if not --interactive) Output CSV file'}),
      fields: Flags.string({
        char: 'f',
        required: false,
        exclusive: ['interactive'],
        default: csvExportFields.join(','),
        description: 'Fields to include in output CSV, separated by commas',
      }),
      noTruncate: Flags.boolean({
        char: 't',
        required: false,
        exclusive: ['interactive'],
        default: false,
        description: 'Do not truncate fields longer than 32,767 characters (the cell limit in Excel)'}),
    }

    async run() {
      const {flags} = await this.parse(HDF2CSV)

      addToProcessLogData('================== HDF2CSV CLI Process ===================')
      addToProcessLogData(`Date: ${new Date().toISOString()}\n`)

      let inputFile = ''
      let outputFile = ''
      let includeFields = ''
      let truncateFields = false

      if (flags.interactive) {
        const interactiveFlags = await getFlags()
        inputFile = interactiveFlags.inputFile
        outputFile = path.join(interactiveFlags.outputDirectory, interactiveFlags.outputFileName)
        includeFields = interactiveFlags.fields.join(',')
        truncateFields = Boolean(interactiveFlags.truncateFields)
      } else if (this.requiredFlagsProvided(flags)) {
        inputFile = flags.input as string
        outputFile = flags.output as string
        includeFields = flags.fields
        truncateFields = flags.noTruncate

        // Save the flags to the log object
        addToProcessLogData('Process Flags ============================================')
        for (const key in flags) {
          if (Object.prototype.hasOwnProperty.call(flags, key)) {
            addToProcessLogData(key + '=' + flags[key as keyof typeof flags])
          }
        }
      } else {
        return
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
        saveProcessLogData()
      }
    }

    requiredFlagsProvided(flags: { input: any; output: any }): boolean {
      let missingFlags = false
      let strMsg = 'Warning: The following errors occurred:\n'

      if (!flags.input) {
        strMsg += colors.dim('  Missing required flag input (HDF file)\n')
        missingFlags = true
      }

      if (!flags.output) {
        strMsg += colors.dim('  Missing required flag output (CSV file)\n')
        missingFlags = true
      }

      if (missingFlags) {
        strMsg += 'See more help with -h or --help'
        this.warn(strMsg)
      }

      return !missingFlags
    }
}

function convertRows(evaluation: ContextualizedEvaluation, filename: string, fieldsToAdd: string[]): ControlSetRows {
  const controls = evaluation.contains.flatMap(profile => profile.contains) || []
  return controls.map(ctrl => convertRow(filename, ctrl, fieldsToAdd))
}

// Interactively ask the user for the arguments required for the cli.
// All flags, required and optional are asked
async function getFlags(): Promise<any> {
  // The default max listeners is set to 10. The inquire checkbox sets a
  // listener for each entry it displays, we are providing 16 entries,
  // does using 16 listeners. Need to increase the defaultMaxListeners.
  EventEmitter.defaultMaxListeners = 20

  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

  printYellow('Provide the necessary information:')
  printGreen('  Required flag - HDF file to convert to a CSV formatted file')
  printGreen('  Required flag - CSV output directory (output file name is hdf2csv.csv)')
  printMagenta('  Optional flag - Fields to include in output CSV (comma delineated)')
  printMagenta('  Optional flag - Truncate fields that exceed Excel cell limit (32,767 characters)\n')

  const choices: string[] = []
  for (const str of csvExportFields) {
    choices.push(str)
  }

  const questions = [
    {
      type: 'file-tree-selection',
      name: 'inputFile',
      message: 'Select the HDF file to be converted to a CSV:',
      filters: 'json',
      pageSize: 15,
      require: true,
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
      type: 'file-tree-selection',
      name: 'outputDirectory',
      message: 'Select output directory for the generated CSV file:',
      pageSize: 15,
      require: true,
      onlyShowDir: true,
      enableGoUpperDirectory: true,
      transformer: (input: any) => {
        const name = input.split(path.sep).pop()
        if (name[0] === '.') {
          return colors.grey(name)
        }

        return name
      },
    },
    {
      type: 'input',
      name: 'outputFileName',
      message: 'Specify the output filename (.csv). It will be saved to the previously selected directory:',
      require: true,
      default() {
        return 'hdf2csv.csv'
      },
    },
    {
      type: 'checkbox',
      name: 'fields',
      message: 'Select fields to include in output CSV file:',
      choices,
      validate(answer: string | any[]) {
        if (answer.length === 0) {
          return 'You must choose at least one field to include in the output.'
        }

        return true
      },
    },
    {
      type: 'list',
      name: 'truncateFields',
      message: 'Truncate fields longer than 32,767 characters (the cell limit in Excel):',
      choices: ['true', 'false'],
      default: false,
      filter(val: string) {
        return (val === 'true')
      },
    },
  ]

  let interactiveValues: any
  const ask = inquirer.prompt(questions).then((answers: any) => {
    addToProcessLogData('Process Flags ============================================')
    for (const envVar in answers) {
      if (answers[envVar] !== null) {
        addToProcessLogData(envVar + '=' + answers[envVar])
      }
    }

    interactiveValues = answers
  })

  await ask
  return interactiveValues
}

function validFileFlags(input: string, output: string): boolean {
  // Do we have a file. Note that this check only ensures that a file was
  // provided, not necessary an HDF json file
  try {
    fs.lstatSync(input).isFile()
  } catch {
    throw new Error('Invalid or no HDF json file provided.')
  }

  // Here we simply check if the path leading to the provided output file is valid
  if (!fs.existsSync(path.dirname(output))) {
    throw new Error('Invalid output directory provided for the CSV output file.')
  }

  return true
}
