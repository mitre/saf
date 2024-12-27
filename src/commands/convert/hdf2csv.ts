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
import {
  addToProcessLogData,
  printGreen,
  printMagenta,
  printRed,
  printYellow,
  saveProcessLogData} from '../../utils/oclif/cliHelper'
import {EventEmitter} from 'events'
// eslint-disable-next-line no-restricted-imports
import colors from 'colors'
// eslint-disable-next-line node/no-extraneous-import
import {checkbox, input, select} from '@inquirer/prompts'

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
        description: '\x1B[31m(required if not --interactive)\x1B[34m Input HDF file'}),
      output: Flags.string({
        char: 'o',
        required: false,
        exclusive: ['interactive'],
        description: '\x1B[31m(required if not --interactive)\x1B[34m Output CSV file'}),
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

        try {
          await new ObjectsToCsv(rows).toDisk(outputFile)
          printGreen('\nTranslation completed successfully')
        } catch (error: any) {
          const error_ = error.code === 'EISDIR' ? new Error('The CSV output file mane was not provided.') : error
          printRed(`\nTranslation failed: ${error_}`)
        } finally {
          saveProcessLogData() // skipcq: JS-0328
        }
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

  // Dynamically import inquirer-file-selector and chalk
  // Once we move the SAF CLI from a CommonJS to an ES modules we can use the regular import
  const {default: fileSelector} = await import('inquirer-file-selector')
  const {default: chalk} = await import('chalk')

  printYellow('Provide the necessary information:')
  printGreen('  Required flag - HDF file to convert to a CSV formatted file')
  printGreen('  Required flag - Translation output directory (where the CSV file is written to)')
  printGreen('  Required flag - CSV output file name (default name is hdf2csv.csv)')
  printGreen('  Required flag - Field(s) (at least one) to include in output CSV (comma delineated)')
  printMagenta('  Optional flag - Truncate fields that exceed Excel cell limit (32,767 characters)\n')

  interface ChoiceItems {
    name: string,
    value: string,
    checked: boolean
  }
  const choices: ChoiceItems[] = []
  for (const str of csvExportFields) {
    choices.push({name: str, value: str, checked: true})
  }

  const fileSelectorTheme = {
    style: {
      file: (text: unknown) => chalk.green(text),
      help: (text: unknown) => chalk.yellow(text),
    },
  }

  const answers = {
    inputFile: await fileSelector({
      message: 'Select the HDF file to be converted to a CSV:',
      pageSize: 15,
      loop: true,
      type: 'file',
      allowCancel: false,
      cancelText: 'No HDF file to be converted was selected',
      emptyText: 'Directory is empty',
      showExcluded: false,
      filter: file => file.isDirectory() || file.name.endsWith('.json'),
      theme: fileSelectorTheme,
    }),
    outputDirectory: await fileSelector({
      message: 'Select output directory for the generated CSV file:',
      pageSize: 15,
      loop: true,
      type: 'directory',
      allowCancel: false,
      cancelText: 'No output directory was selected',
      emptyText: 'Directory is empty',
      theme: fileSelectorTheme,
    }),
    outputFileName: await input({
      message: 'Specify the output filename (.csv). It will be saved to the previously selected directory:',
      default: 'hdf2csv.csv',
      required: true,
    }),
    fields: await checkbox({
      message: 'Select fields to include in output CSV file:',
      required: true,
      choices,
    }),
    truncateFields: await select({
      message: 'Truncate fields longer than 32,767 characters (the cell limit in Excel):',
      default: false,
      choices: [
        {name: 'true', value: true},
        {name: 'false', value: false},
      ],
    }),
  }

  addToProcessLogData('Process Flags ============================================')
  // eslint-disable-next-line guard-for-in
  for (const tagName in answers) {
    const answerValue = _.get(answers, tagName)
    if (answerValue !== null) {
      addToProcessLogData(tagName + '=' + answerValue)
    }
  }

  return answers
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
