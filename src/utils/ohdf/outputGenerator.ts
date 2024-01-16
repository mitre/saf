// utils/outputGenerator.ts
import fs from 'fs'
import _ from 'lodash'
import YAML from 'yaml'
import {Align, Table, getMarkdownTable} from 'markdown-table-ts'
import {convertFullPathToFilename} from '../global'
import {ContextualizedEvaluation} from 'inspecjs'
import {createWinstonLogger} from '../logging'
import {PrintableSummary, Data, DataOrArray, RowType, ColumnType} from './types'

/**
* The logger for command.
* It uses a Winston logger with the label 'view summary:'.
* @property {ReturnType<typeof createWinstonLogger>} logger - The logger for command. It uses a Winston logger with the label 'view summary:'.
*/
const logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:')

export const ROW_ORDER: RowType[] = ['total', 'critical', 'high', 'medium', 'low']
export const COLUMN_ORDER: ColumnType[] = ['passed', 'failed', 'skipped', 'no_impact', 'error']

export const COLUMN_EMOJI: Record<ColumnType, string> = {
  compliance: ':test_tube:',
  passed: ':white_check_mark:',
  failed: ':x:',
  skipped: ':leftwards_arrow_with_hook:',
  no_impact: ':heavy_minus_sign:',
  error: ':warning:',
}

/**
 * Prints the provided printable summaries to the console and optionally writes them to an output file.
 *
 * The function works as follows:
 * - It initializes an empty string to hold the output.
 * - It checks the format flag to determine how to format the output.
 * - If the format is 'json', it converts the printable summaries to a JSON string.
 * - If the format is 'markdown', it converts the printable summaries to Markdown tables and joins them with two newlines between each table.
 * - If the format is not provided or is not 'json' or 'markdown', it converts the printable summaries to a YAML string.
 * - If the stdout flag is provided, it prints the output to the console.
 * - If the output flag is provided, it writes the output to the specified file.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param printableSummaries - The printable summaries to print and write to the output file.
 * @param titleTable - Boolean to either enable or disable adding titles to the produced markdown tables.
 * @param format - The format to use for the output. This should be 'json', 'yaml', or 'markdown'.
 * @param printPretty - Boolean to either enable or disable pretty printing of the output.
 * @param stdout - Boolean to either enable or disable printing the output to the console.
 * @param logLevel - The log level to use when converting the printable summaries to Markdown.
 * @param output - The path of the file to write the output to. If this is not provided, the output is not written to a file.
 * @returns void - This method does not return anything.
 */
export function printAndWriteOutput(
  {printableSummaries, titleTable, format, printPretty, stdout, logLevel, output}: { printableSummaries: PrintableSummary[]; titleTable: boolean; format: string; printPretty: boolean; stdout: boolean; logLevel: string; output?: string },
): void {
  logger.verbose('In printAndWriteOutput')
  let outputStr = '' // Initialize output to an empty string
  switch (format) {
    case 'json': {
      outputStr = printPretty ? JSON.stringify(printableSummaries, null, 2) : JSON.stringify(printableSummaries)
      break
    }

    case 'markdown': {
      const markdownTables = convertToMarkdown(printableSummaries, titleTable ?? true, logLevel)
      outputStr = markdownTables.join('\n\n') // Join the tables with two newlines between each table
      break
    }

    default: { // Default to 'yaml'
      outputStr = YAML.stringify(printableSummaries)
    }
  }

  if (stdout) {
    console.log(outputStr)
  }

  if (output) {
    try {
      fs.writeFileSync(output, outputStr)
      logger.info(`Output written to ${output}`)
    } catch (error) {
      logger.error(`Failed to write output to ${output}: ${(error as Error).message}`)
    }
  }
}

/**
 * Creates a printable summary for a given profile.
 *
 * The function works as follows:
 * - It extracts the result sets for the given profile from the execution JSONs using the `extractResultSets` function.
 * - It calculates the average compliance score for the given profile from the compliance scores.
 * - It returns an object containing the profile name, the result sets, the average compliance score, and the profile metrics.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param profileName - The name of the profile to create the printable summary for.
 * @param profileMetrics - The metrics of the profile to create the printable summary for.
 * @param execJSONs - The execution JSONs to use for creating the printable summary.
 * @param complianceScores - The compliance scores to use for creating the printable summary.
 * @returns A printable summary.
 */
export function createPrintableSummary(
  profileName: string,
  profileMetrics: Record<string, number>,
  execJSONs: Record<string, ContextualizedEvaluation>,
  complianceScores: Record<string, number[]>,
): PrintableSummary {
  logger.verbose('In createPrintableSummary')
  return {
    profileName,
    resultSets: extractResultSets(execJSONs, profileName),
    compliance: _.mean(complianceScores[profileName]),
    ...profileMetrics,
  }
}

/**
 * Extracts the result sets for the provided execution JSONs and profile name.
 *
 * The function works as follows:
 * - It filters the execution JSONs to include only those where the name of the first profile matches the provided profile name.
 * - It maps over the filtered execution JSONs, converting the full path of each JSON file to a filename using the `convertFullPathToFilename` function.
 * - It returns an array of filenames.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param execJSONs - The execution JSONs to extract the result sets from. This should be an object where the keys are file paths and the values are ContextualizedEvaluation objects.
 * @param profileName - The name of the profile to extract the result sets for.
 * @returns An array of filenames representing the result sets.
 */
export function extractResultSets(execJSONs: Record<string, ContextualizedEvaluation>, profileName: string): string[] {
  logger.verbose('In extractResultSets')
  return Object.entries(execJSONs).filter(([, execJSON]) => {
    return execJSON.data.profiles[0].name === profileName
  }).map(([filePath]) => {
    return convertFullPathToFilename(filePath)
  })
}

/**
 * Generates a value for a specific cell in the Markdown table.
 *
 * The function works as follows:
 * - It retrieves the data for the specified column from the item.
 * - If the data exists and contains the specified key, it returns the value as a string.
 * - If the data does not exist or does not contain the specified key, it returns '0'.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param item - The PrintableSummary object containing the data for the table.
 * @param column - The name of the column to retrieve the data for.
 * @param key - The key to retrieve the value for from the column data.
 * @returns A string representing the value for the cell.
 */
export function generateValue(item: PrintableSummary, column: string, key: string): string {
  logger.debug('item:', item)
  logger.debug('column:', column)
  logger.debug('key:', key)

  const columnData = item[column] as Record<string, number>

  logger.debug('columnData:', columnData)

  if (columnData && key in columnData) {
    return columnData[key].toString()
  }

  return '0'
}

/**
 * Generates a row for the Markdown table.
 *
 * The function works as follows:
 * - It maps over the `COLUMN_ORDER` array, generating a value for each cell in the row using the `generateValue` function.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param row - The name of the row to generate the data for.
 * @param item - The PrintableSummary object containing the data for the table.
 * @returns An array of strings, each representing a cell in the row.
 */
export function generateMarkdownTableRow(row: string, item: PrintableSummary): string[] {
  return COLUMN_ORDER.map(column => generateValue(item, column, row))
}

/**
 * Converts the provided data to a Markdown table.
 *
 * The table has a row for each value in `ROW_ORDER` and a column for each value in `COLUMN_ORDER`.
 * The values in the table are extracted from the data object.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param data - The data object or array of data objects containing the values for the table.
 * @param titleTables - Boolean to either enable or disable adding titles to the produced markdown tables.
 * @param logLevel - The log level to control the verbosity of the logs.
 * @returns An array of strings, each representing a Markdown table.
 */
export function convertToMarkdown(data: DataOrArray, titleTables: boolean, logLevel: string): string[] {
  logger.verbose('In convertTomarkdown')
  let tables: string[] = []
  tables = Array.isArray(data) ? data.map(item => generateMarkdownTable(item, titleTables, logLevel)) : [generateMarkdownTable(data, titleTables, logLevel)]
  return tables
}

/**
 * Converts a row title to a pretty-printed version.
 *
 * The function works as follows:
 * - It capitalizes the first letter of the title.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param title - The original row title.
 * @returns The pretty-printed row title.
 */
export function prettyPrintRowTitle(title: string): string {
  return title.charAt(0).toUpperCase() + title.slice(1)
}

/**
 * Converts a column title to a pretty-printed version.
 *
 * The function works as follows:
 * - It capitalizes the first letter of the title.
 * - If the title is 'Skipped', it changes it to 'Not Reviewed'.
 * - If the title is 'No_impact', it changes it to 'Not Applicable'.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param title - The original column title.
 * @returns The pretty-printed column title.
 */
export function prettyPrintColumnTitle(title: string): string {
  title = title.charAt(0).toUpperCase() + title.slice(1)
  if (title === 'Skipped') {
    return 'Not Reviewed'
  }

  if (title === 'No_impact') {
    return 'Not Applicable'
  }

  return title
}

/**
 * Generates a Markdown table from the given data.
 *
 * The function works as follows:
 * - It starts by converting the compliance score to a string and creating the header row of the table.
 * - It then generates the body of the table by mapping over the `ROW_ORDER` array and generating a row for each item using the `generateMarkdownTableRow` function.
 * - It creates a `Table` object from the header row and the body of the table.
 * - If the `logLevel` is 'verbose', it logs the item to the console.
 * - It then determines the title of the table based on the `titleTables` parameter and the `profileName` property of the item.
 * - Finally, it returns the title and the Markdown table as a string.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param item - The data to generate the table from. This can be either a `Data` object or a `PrintableSummary` object.
 * @param titleTables - A boolean indicating whether to include the profile name as a Markdown header before the table.
 * @param logLevel - The log level. If this is 'verbose', the function logs the item to the console.
 * @returns A string representing the Markdown table.
 */
export function generateMarkdownTable(item: Data | PrintableSummary, titleTables: boolean, logLevel: string): string {
  const score = item.compliance.toString()
  const headerRow = ['Compliance: ' + score + '<br>:test_tube:', ...COLUMN_ORDER.map(column => `${prettyPrintColumnTitle(column)}<br>${COLUMN_EMOJI[column]}`)]
  const table: string[][] =
    ROW_ORDER.map(row => [prettyPrintRowTitle(row), ...generateMarkdownTableRow(row, item as PrintableSummary)])

  const myTable: Table = {
    head: headerRow,
    body: table,
  }
  const myAlignment: Align[] = [Align.Left, Align.Center, Align.Center, Align.Center, Align.Center, Align.Center]

  // Include the profileName as a Markdown header before the table if titleTables is true
  const profile_name = typeof item.profileName === 'string' ? item.profileName : 'Evalueated Profile'
  const title = titleTables ? `# ${profile_name}\n\n` : ''
  return title + getMarkdownTable({
    table: myTable,
    alignment: myAlignment,
    alignColumns: true,
  })
}
