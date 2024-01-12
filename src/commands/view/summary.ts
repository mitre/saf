import { Command, Flags } from '@oclif/core'
import { ContextualizedEvaluation, ContextualizedProfile, convertFileContextual } from 'inspecjs'
import fs from 'fs'
import YAML from 'yaml'
import { calculateCompliance, extractStatusCounts, renameStatusName, severityTargetsObject } from '../../utils/threshold'
import _ from 'lodash'
import flat from 'flat'
import { convertFullPathToFilename } from '../../utils/global'
import { createWinstonLogger } from '../../utils/logging'
import markdownTable from 'markdown-table'
// Constants
const UTF8_ENCODING = 'utf8'

interface Flags {
  logLevel?: string;
  input: string[];
  format: string;
  stdout: boolean;
  output?: string;
}
interface Data {
  compliance: number;
  passed: Record<string, number>;
  failed: Record<string, number>;
  skipped: Record<string, number>;
  no_impact: Record<string, number>;
  error: Record<string, number>;
}

interface PrintableSummary {
  profileName: string;
  resultSets: string[];
  compliance: number;
  [key: string]: unknown; // This is to allow for the spread operator in the `createPrintableSummary` method
}

/**
 * Summary Class
 *
 * This class represents a command in the CLI that provides a quick compliance overview of an HDF file.
 * It includes methods to convert the data to different formats (JSON, YAML, Markdown) and to print the data to the console or write it to a file.
 *
 * @class
 * @public
 * @property {string[]} aliases - The aliases for this command. Users can invoke this command by typing 'summary'.

 */
export default class Summary extends Command {
  /**
 * The aliases for this command.
 * Users can invoke this command by typing 'summary'.
 * @property {string[]} aliases - The aliases for this command. Users can invoke this command by typing 'summary'.
 */
  static aliases = ['summary']

  /**
 * The logger for this command.
 * It uses a Winston logger with the label 'view summary:'.
 * @property {ReturnType<typeof createWinstonLogger>} logger - The logger for this command. It uses a Winston logger with the label 'view summary:'.
 */
  private logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:');

  /**
 * The usage information for this command.
 * Users should invoke this command by typing 'view summary -i <hdf-file> [-h] [-j] [-o <output>]'.
 * @property {string} usage - The usage information for this command. Users should invoke this command by typing 'view summary -i <hdf-file> [-h] [-j] [-o <output>]'.
 */
  // static usage = 'view summary -i <hdf-file> [-h] [-j] [-o <output>]'

  /**
 * The description of this command.
 * This is displayed to the user in the help message.
 * @property {string} description - The description of this command. This is displayed to the user in the help message.
 */
  static description = 'Get a quick compliance overview of an HDF file '

  /**
 * The order of the rows in the summary table.
 * The table includes a row for each of these values.
 * @property {string[]} ROW_ORDER - The order of the rows in the summary table. The table includes a row for each of these values.
 */
  private readonly ROW_ORDER = ['Total', 'Critical', 'High', 'Medium', 'Low', 'Not Applicable'];

  /**
 * The order of the columns in the summary table.
 * The table includes a column for each of these values.
 * @property {string[]} COLUMN_ORDER - The order of the columns in the summary table. The table includes a column for each of these values.
 */
  private readonly COLUMN_ORDER = [
    'Passed :white_check_mark:',
    'Failed :x:',
    'Not Reviewed :leftwards_arrow_with_hook:',
    'Not Applicable :heavy_minus_sign:',
    'Error :warning:',
  ];

  static flags = {
    help: Flags.help({ char: 'h' }),
    input: Flags.string({ char: 'i', required: true, multiple: true, description: 'Input HDF files' }),
    output: Flags.string({ char: 'o', required: false }),
    format: Flags.string({ char: 'f', description: 'output format', options: ['json', 'yaml', 'markdown'], default: 'yaml' }),
    stdout: Flags.boolean({ char: 's', description: 'Print to console', default: true, allowNo: true }),
    logLevel: Flags.string({ char: 'l', description: 'Log level', default: 'info' }),
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * The main function that runs when the command is invoked.
   * It performs the following steps:
   * 1. Loads the execution JSONs from the provided input files.
   * 2. Calculates the summaries for each execution JSON.
   * 3. Calculates the total counts for each summary.
   * 4. Calculates the compliance scores for each execution JSON.
   * 5. Creates a printable summary for each profile using the total counts and compliance scores.
   * 6. Prints the printable summaries to the console and optionally writes them to an output file.
   */
  async run() {
    try {
      const { flags } = await this.parse(Summary)
      this.logger = createWinstonLogger('view summary:', flags.logLevel)
      const execJSONs = this.loadExecJSONs(flags.input)
      const summaries = this.calculateSummariesForExecJSONs(execJSONs)
      const totals = this.calculateTotalCountsForSummaries(summaries)
      const complianceScores = this.calculateComplianceScoresForExecJSONs(execJSONs)
      const printableSummaries = Object.entries(totals).map(([profileName, profileMetrics]) =>
        this.createPrintableSummary(profileName, profileMetrics, execJSONs, complianceScores),
      )
      this.printAndWriteOutput(flags, printableSummaries)
    } catch (error) {
      this.logger.error(error)
      // Handle the error appropriately
    }
  }

  /**
   * Loads the execution JSONs from the provided files.
   * @param files - An array of file paths to load the execution JSONs from.
   * @returns An object mapping file paths to their corresponding execution JSONs.
   */
  private loadExecJSONs(files: string[]): Record<string, ContextualizedEvaluation> {
    const execJSONs: Record<string, ContextualizedEvaluation> = {}
    files.forEach((file: string) => {
      execJSONs[file] = convertFileContextual(fs.readFileSync(file, UTF8_ENCODING)) as ContextualizedEvaluation
    })
    return execJSONs
  }

  /**
   * Calculates the summaries for the provided execution JSONs.
   * @param execJSONs - An object mapping file paths to their corresponding execution JSONs.
   * @returns An object containing the calculated summaries.
   */
  private calculateSummariesForExecJSONs(execJSONs: Record<string, ContextualizedEvaluation>): Record<string, Record<string, Record<string, number>>[]> {
    const summaries: Record<string, Record<string, Record<string, number>>[]> = {}

    Object.values(execJSONs).forEach(parsedExecJSON => {
      const summary: Record<string, Record<string, number>> = {}
      const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile
      const profileName = parsedProfile.data.name

      this.calculateSeverityCounts(summary, parsedProfile)
      this.calculateTotalCounts(summary)

      summaries[profileName] = (_.get(summaries, profileName) || [])
      summaries[profileName].push(summary)
    })

    return summaries
  }

  /**
   * Calculates the compliance scores for the provided execution JSONs.
   * @param execJSONs - An object mapping file paths to their corresponding execution JSONs.
   * @returns An object containing the calculated compliance scores.
   */
  private calculateComplianceScoresForExecJSONs(execJSONs: Record<string, ContextualizedEvaluation>): Record<string, number[]> {
    const complianceScores: Record<string, number[]> = {}

    Object.values(execJSONs).forEach(parsedExecJSON => {
      const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile
      const profileName = parsedProfile.data.name
      const overallStatusCounts = extractStatusCounts(parsedProfile)
      const overallCompliance = calculateCompliance(overallStatusCounts)

      const existingCompliance = _.get(complianceScores, profileName) || []
      existingCompliance.push(overallCompliance)
      _.set(complianceScores, `["${profileName.replaceAll('"', '\\"')}"]`, existingCompliance)
    })

    return complianceScores
  }

  /**
   * Calculates the severity counts for the provided summary and profile.
   * @param summary - The summary to calculate the severity counts for.
   * @param parsedProfile - The profile to use for the calculation.
   * @returns void - This method does not return anything, it modifies the 'summary' object passed as a parameter.
   */
  private calculateSeverityCounts(summary: Record<string, Record<string, number>>, parsedProfile: ContextualizedProfile) {
    for (const [severity, severityTargets] of Object.entries(severityTargetsObject)) {
      const severityStatusCounts = extractStatusCounts(parsedProfile, severity)
      for (const severityTarget of severityTargets) {
        const [statusName, _severity, thresholdType] = severityTarget.split('.')
        _.set(summary, severityTarget.replace(`.${thresholdType}`, ''), _.get(severityStatusCounts, renameStatusName(statusName)))
      }
    }
  }

  /**
   * Calculates the total counts for the provided summary.
   * @param summary - The summary to calculate the total counts for.
   * @returns void - This method does not return anything, it modifies the 'summary' object passed as a parameter.
   */
  private calculateTotalCounts(summary: Record<string, Record<string, number>>) {
    for (const [type, counts] of Object.entries(summary)) {
      const total = Object.values(counts).reduce((a, b) => a + b, 0)
      _.set(summary, `${type}.total`, total)
    }
  }

  /**
   * Calculates the totals for the provided summaries.
   * @param summaries - The summaries to calculate the totals for.
   * @returns An object containing the calculated totals.
   */
  private calculateTotalCountsForSummaries(summaries: Record<string, Record<string, Record<string, number>>[]>): Record<string, Record<string, number>> {
    const totals: Record<string, Record<string, number>> = {}
    Object.entries(summaries).forEach(([profileName, profileSummaries]) => {
      profileSummaries.forEach(profileSummary => {
        const flattened: Record<string, number> = flat.flatten(profileSummary)
        Object.entries(flattened).forEach(([key, value]) => {
          const existingValue = _.get(totals, `${profileName}.${key}`, 0)
          if (typeof existingValue === 'number') {
            _.set(totals, `["${profileName.replaceAll('"', '\\"')}"].${key}`, existingValue + value)
          } else {
            _.set(totals, `["${profileName.replaceAll('"', '\\"')}"].${key}`, value)
          }
        })
      })
    })
    return totals
  }

  /**
   * Creates a printable summary for a given profile.
   * The summary includes the profile name, the result sets extracted from the execution JSONs, the average compliance score, and the profile metrics.
   * @param profileName - The name of the profile to create the printable summary for.
   * @param profileMetrics - The metrics of the profile to create the printable summary for.
   * @param execJSONs - The execution JSONs to use for creating the printable summary.
   * @param complianceScores - The compliance scores to use for creating the printable summary.
   * @returns A printable summary.
   */
  private createPrintableSummary(
    profileName: string,
    profileMetrics: Record<string, number>,
    execJSONs: Record<string, ContextualizedEvaluation>,
    complianceScores: Record<string, number[]>,
  ): PrintableSummary {
    return {
      profileName: profileName,
      resultSets: this.extractResultSets(execJSONs, profileName),
      compliance: _.mean(complianceScores[profileName]),
      ...profileMetrics,
    }
  }

  /**
   * Extracts the result sets for the provided execution JSONs and profile name.
   * @param execJSONs - The execution JSONs to extract the result sets from.
   * @param profileName - The name of the profile to extract the result sets for.
   * @returns An array of result sets.
   */
  private extractResultSets(execJSONs: Record<string, ContextualizedEvaluation>, profileName: string): string[] {
    return Object.entries(execJSONs).filter(([, execJSON]) => {
      return execJSON.data.profiles[0].name === profileName
    }).map(([filePath]) => {
      return convertFullPathToFilename(filePath)
    })
  }

  /**
 * Generates a Markdown table row based on the provided row name and data.
 * @param row - The name of the row. This should be one of the values in ROW_ORDER.
 * @param data - The data object containing the values for the row.
 * @param columnWidths - The maximum width of each column in the table.
 * @returns A string representing a row in a Markdown table.
 */
  private generateMarkdownTableRow(row: string, data: any, columnWidths: number): string {
    let values: string[]
    if (row === 'Total') {
      values = [
        data.passed.total.toString(),
        data.failed.total.toString(),
        data.skipped.total.toString(),
        data.no_impact.total.toString(),
        data.error.total.toString(),
      ]
    } else if (row === 'Not Applicable') {
      values = ['-', '-', '-', data.no_impact.total.toString(), '-']
    } else {
      values = [
        data.passed[row.toLowerCase()].toString(),
        data.failed[row.toLowerCase()].toString(),
        data.skipped[row.toLowerCase()].toString(),
        '-',
        data.error[row.toLowerCase()].toString(),
      ]
    }

    return `| ${row.padEnd(columnWidths)} | ${values.map(val => val.padEnd(columnWidths)).join(' | ')} |\n`
  }

  /**
 * Converts the provided data to a Markdown table.
 * The table has a row for each value in ROW_ORDER and a column for each value in COLUMN_ORDER.
 * The values in the table are extracted from the data object.
 * @param data - The data object containing the values for the table.
 * @returns A string representing a Markdown table.
 */
  private convertToMarkdown(data: any): string {
    // Extract the first item from the list (assuming there's only one item)
    data = data[0]

    // Calculate the maximum width of each column
    const columnWidths = Math.max(...this.ROW_ORDER.map((row, i) => Math.max(row.length, (this.COLUMN_ORDER[i] ? this.COLUMN_ORDER[i].length : 0))))

    // Generate the Markdown table
    let table = `| Compliance: ${data.compliance}% :test_tube: | ${this.COLUMN_ORDER.map(col => col.padEnd(columnWidths)).join(' | ')} |\n`
    table += `| ${'-'.padEnd(columnWidths, '-')} | ${this.COLUMN_ORDER.map(() => '-'.padEnd(columnWidths, '-')).join(' | ')} |\n`

    for (const row of this.ROW_ORDER) {
      table += this.generateMarkdownTableRow(row, data, columnWidths)
    }

    return table
  }

  /**
   * Prints the provided printable summaries to the console and optionally writes them to an output file.
   * The format of the output is determined by the 'format' flag. The possible formats are 'json', 'yaml', and 'markdown'.
   * If the 'format' flag is not provided, the output is formatted as 'yaml' by default.
   * If the 'stdout' flag is provided, the output is printed to the console.
   * If the 'output' flag is provided, the output is written to the specified file.
   * @param flags - The flags provided when the command was invoked. This includes a 'format' flag to specify the output format, a 'stdout' flag to specify whether to print the output to the console, and an 'output' flag to specify the output file.
   * @param printableSummaries - The printable summaries to print and write to the output file.
   * @returns void - this method does not return anything.
   */
  private printAndWriteOutput(flags: Flags, printableSummaries: PrintableSummary[]) {
    let output = '' // Initialize output to an empty string

    switch (flags.format) {
      case 'json': {
        output = JSON.stringify(printableSummaries, null, 2)
        break
      }

      case 'yaml': {
        output = YAML.stringify(printableSummaries)
        break
      }

      case 'markdown': {
        output = this.convertToMarkdown(printableSummaries)
        break
      }

      default: { // Default to 'yaml'
        output = YAML.stringify(printableSummaries)
      }
    }

    if (flags.stdout) {
      console.log(output)
    }

    if (flags.output) {
      try {
        fs.writeFileSync(flags.output, output)
        this.logger.info(`Output written to ${flags.output}`)
      } catch (error) {
        this.logger.error(`Failed to write output to ${flags.output}: ${(error as Error).message}`)
      }
    }
  }
}
