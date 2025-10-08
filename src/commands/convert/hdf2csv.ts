/* eslint-disable @typescript-eslint/no-explicit-any */
import {Flags} from '@oclif/core'
import type {ContextualizedEvaluation} from 'inspecjs'
import {contextualizeEvaluation} from 'inspecjs'
import _ from 'lodash'
import fs, {promises as fse} from 'fs'
import stringify from 'csv-stringify'
import type {ControlSetRows} from '../../types/csv'
import {convertRow, csvExportFields} from '../../utils/csv'
import {basename} from '../../utils/global'
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

import colors from 'colors'
import {checkbox, input, select} from '@inquirer/prompts'

export default class HDF2CSV extends BaseCommand<typeof HDF2CSV> {
  static readonly usage
    = '<%= command.id %> [-i <hdf-json>|--interactive] [-o <csv-file>|--interactive] '
      + ' [-f <header-fields>|--interactive] [-t|--interactive] [-L info|warn|debug|verbose]'

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
      let rows: ControlSetRows = convertRows(contextualizedEvaluation, basename(inputFile), includeFields.split(','))
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
        await saveCSV(outputFile, rows)
        printGreen('\nTranslation completed successfully\n')
      } catch (error: any) {
        const error_ = error.code === 'EISDIR' ? new Error('The CSV output file name was not provided.') : error
        printRed(`\nTranslation failed: ${error_}\n`)
      } finally {
        saveProcessLogData()
      }
    }
  }

  requiredFlagsProvided(flags: {input: any, output: any}): boolean {
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

/**
 * Converts the rows of a given evaluation into a ControlSetRows format.
 *
 * @param evaluation - The contextualized evaluation containing profiles and controls.
 * @param filename - The name of the file to be used in the conversion.
 * @param fieldsToAdd - An array of additional fields to include in the conversion.
 * @returns An array of ControlSetRows representing the converted controls.
 */
function convertRows(evaluation: ContextualizedEvaluation, filename: string, fieldsToAdd: string[]): ControlSetRows {
  const controls = evaluation.contains.flatMap(profile => profile.contains) || []
  return controls.map(ctrl => convertRow(filename, ctrl, fieldsToAdd))
}

/**
 * Asynchronously saves data to a CSV file.
 *
 * @param filename - The path or file descriptor where the CSV file will be saved.
 * @param data - The data to be converted to CSV format.
 *
 * @remarks
 * The function converts the provided data to CSV format using specified options,
 * including column headers, consistent column order, and a customizable delimiter.
 * It then writes the CSV data to the specified file.
 *
 * @returns A promise that resolves when the CSV file has been written or rejects with an error.
 * @throws Will print an error message if there is an issue writing the CSV file or processing the data.
 */
async function saveCSV(filename: fs.PathLike | fs.promises.FileHandle, data: stringify.Input) {
  // CSV options
  const options = {
    header: true, // Include column headers
    columns: Object.keys(data[0]), // Ensure consistent column order
    delimiter: ',', // Customize delimiter (using standard comma)
  }

  try {
    const csvData = await convertToCSV(data, options)
    try {
      await fse.writeFile(filename, csvData as string, 'utf8')
    } catch (error) {
      printRed(`\nError writing CSV file: ${error}\n`)
    }
  } catch (error) {
    printRed(`\nError processing data to convert to CSV: ${error}\n`)
  }
}

/**
 * Converts the given data to a CSV string using the specified options.
 *
 * @param data - The input data to be converted to CSV format.
 * @param options - Optional configuration options for the CSV stringification process.
 * @returns A promise that resolves to the CSV string output or rejects with an error.
 */
function convertToCSV(data: stringify.Input, options: stringify.Options | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify.stringify(data, options, (err, output: string | PromiseLike<string>) => {
      if (err) reject(err)
      else resolve(output)
    })
  })
}

/**
 * Prompts the user to provide necessary information for converting an HDF file to a CSV file.
 *
 * This function dynamically imports `inquirer-file-selector` and `chalk` to facilitate user input.
 * It sets the `defaultMaxListeners` to 20 to accommodate the number of listeners required by the inquire checkbox.
 *
 * The user is prompted to provide:
 * - The HDF file to convert to a CSV formatted file.
 * - The output directory where the CSV file will be written.
 * - The output file name for the CSV (default is `hdf2csv.csv`).
 * - The fields to include in the output CSV (at least one field is required).
 * - An optional flag to truncate fields that exceed the Excel cell limit of 32,767 characters.
 *
 * @returns {Promise<any>} A promise that resolves to an object containing the user's input.
 */
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
    name: string
    value: string
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

  for (const tagName in answers) {
    if (Object.prototype.hasOwnProperty.call(answers, tagName)) {
      const answerValue = _.get(answers, tagName)
      if (answerValue !== null) {
        addToProcessLogData(tagName + '=' + answerValue)
      }
    }
  }

  return answers
}

/**
 * Validates the input and output file paths for the HDF to CSV conversion.
 *
 * @param input - The path to the input HDF json file.
 * @param output - The path to the output CSV file.
 * @returns A boolean indicating whether the file paths are valid.
 * @throws Will throw an error if the input file is not valid or if the output directory is invalid.
 */
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
