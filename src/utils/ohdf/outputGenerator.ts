// utils/outputGenerator.ts
import fs from 'fs'
import _ from 'lodash'
import YAML from 'yaml'
import {Align, Table, getMarkdownTable} from 'markdown-table-ts'
import {convertFullPathToFilename} from '../../utils/global'
import {ContextualizedEvaluation} from 'inspecjs'
import {createWinstonLogger} from '../../utils/logging'
import {PrintableSummary, Data, DataOrArray, RowType} from './types'

const UTF8_ENCODING = 'utf8'

/**
* The logger for command.
* It uses a Winston logger with the label 'view summary:'.
* @property {ReturnType<typeof createWinstonLogger>} logger - The logger for command. It uses a Winston logger with the label 'view summary:'.
*/
const logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:')

/**
* The order of the rows in the summary table.
* The table includes a row for each of these values.
* @property {string[]} ROW_ORDER - The order of the rows in the summary table. The table includes a row for each of these values.
*/
const ROW_ORDER: RowType[] = ['Total', 'Critical', 'High', 'Medium', 'Low', 'Not Applicable']

/**
 * The order of the columns in the summary table.
 * The table includes a column for each of these values.
 * @property {string[]} COLUMN_ORDER - The order of the columns in the summary table. The table includes a column for each of these values.
 */
const COLUMN_ORDER = [
  'Passed :white_check_mark:',
  'Failed :x:',
  'Not Reviewed :leftwards_arrow_with_hook:',
  'Not Applicable :heavy_minus_sign:',
  'Error :warning:',
]

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
 * Generates a Markdown table row based on the provided row name and data.
 *
 * The function works as follows:
 * - It defines an array of field names.
 * - It maps over the array of field names, generating a value for each field using the `generateValue` function.
 * - It returns an array containing the row name and the generated values.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param row - The name of the row. This should be one of the values in ROW_ORDER.
 * @param item - The data object containing the values for the row.
 * @returns An array representing a row in a Markdown table.
 */
export function generateMarkdownTableRow(row: RowType, item: Data | PrintableSummary): string[] {
  logger.verbose('In generateMarkdownTableRow')
  const fields: (keyof Data)[] = ['passed', 'failed', 'skipped', 'no_impact', 'error']
  const values = fields.map(field => generateValue(row, field, item))
  return [row, ...values]
}

/**
 * Generates a string value for a given row and field based on the provided data.
 *
 * The method works as follows:
 * - If the row is 'Total' or 'Not Applicable' and the field is 'no_impact', it will return the total for the given field.
 * - If the row is 'Not Applicable' and the field is not 'no_impact', or if the value is undefined, it will return '-'.
 * - In all other cases, it will return the value for the given row and field.
 *
 * The method uses a keyMap object to map row names to keys in the data object.
 * The key for the 'Total' row is 'total', and the key for the 'Not Applicable' row depends on the field name.
 * If the field is 'no_impact', the key is 'total'; otherwise, the key is the lowercase version of the row name.
 * For all other rows, the key is the lowercase version of the row name if the field is not 'no_impact', and 'default' otherwise.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param row - The name of the row. This should be 'Total', 'Not Applicable', or the name of a specific row.
 * @param field - The name of the field. This should be one of the keys of the Data interface.
 * @param data - The data object, which should match the shape of the Data interface.
 * @returns The generated value.
 */
export function generateValue(row: string, field: keyof Data, data: Data | PrintableSummary): string {
  const keyMap: Record<string, string> = {
    Total: 'total',
    'Not Applicable': field === 'no_impact' ? 'total' : row.toLowerCase(),
    default: field === 'no_impact' ? 'default' : row.toLowerCase(),
  }
  const key = keyMap[row] || keyMap.default
  return (data[field] as Record<string, number>)[key]?.toString() ?? '-'
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
 * Generates a Markdown table from a data object.
 *
 * The table has a row for each value in `ROW_ORDER` and a column for each value in `COLUMN_ORDER`.
 * The values in the table are extracted from the data object.
 *
 * @remarks
 * This function is part of the `outputGenerator.ts` module.
 *
 * @param item - The data object containing the values for the table.
 * @param titleTables - Boolean to either enable or disable adding titles to the produced markdown tables.
 * @param logLevel - The log level to control the verbosity of the logs.
 * @returns A string representing a Markdown table.
 */
export function generateMarkdownTable(item: Data | PrintableSummary, titleTables: boolean, logLevel: string): string {
  const score = item.compliance.toString()
  const table: string[][] = [
    ['Compliance: ' + score + '% :test_tube:', ...COLUMN_ORDER],
    ...ROW_ORDER.map(row => generateMarkdownTableRow(row, item)),
  ]
  const myTable: Table = {
    head: ROW_ORDER,
    body: table,
  }
  const myAlignment: Align[] = [Align.Left, Align.Center, Align.Center, Align.Center, Align.Center, Align.Center]
  if (logLevel === 'verbose') {
    console.log(item)
  }

  // Include the profileName as a Markdown header before the table if titleTables is true
  const profile_name = typeof item.profileName === 'string' ? item.profileName : 'Evalueated Profile'
  const title = titleTables ? `# ${profile_name}\n\n` : ''
  return title + getMarkdownTable({
    table: myTable,
    alignment: myAlignment,
    alignColumns: true,
  })
}
