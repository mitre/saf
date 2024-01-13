import {Command, Flags} from '@oclif/core'
import {ContextualizedEvaluation, ContextualizedProfile, convertFileContextual} from 'inspecjs'
import fs from 'fs'
import YAML from 'yaml'
import {calculateCompliance, extractStatusCounts, renameStatusName, severityTargetsObject} from '../../utils/threshold'
import _ from 'lodash'
import flat from 'flat'
import {convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger} from '../../utils/logging'
import {Align, Table, getMarkdownTable} from 'markdown-table-ts'

const UTF8_ENCODING = 'utf8'

interface CommandFlags {
  input: string[];
  output?: string;
  format: string;
  stdout: boolean;
  'print-pretty': boolean;
  'title-table'?: boolean;
  logLevel?: string;
  help: void;
}
interface Data {
  [key: string]: Record<string, number> | number;
  passed: Record<string, number>;
  failed: Record<string, number>;
  skipped: Record<string, number>;
  no_impact: Record<string, number>;
  error: Record<string, number>;
  total: number;
  default: number;
}

interface PrintableSummary {
  profileName: string;
  resultSets: string[];
  compliance: number;
  [key: string]: unknown; // This is to allow for the spread operator in the `createPrintableSummary` method
}
type DataOrArray = Data | Data[] | PrintableSummary | PrintableSummary[];

type RowType = 'Total' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Not Applicable'

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
 * A static readonly property that defines the types of rows that can be used in the table.
 * It is an array of string literals, and the 'as const' assertion ensures that TypeScript treats it as a readonly tuple, not a mutable array.
 * This means that you cannot add or remove elements from ROW_TYPES, and each element in ROW_TYPES is treated as a unique string literal type (not just a string).
 * This is useful when you want to create a type based on the values in ROW_TYPES (for example, type RowType = typeof YourClass.ROW_TYPES[number];).
 */
  static readonly ROW_TYPES = ['Total', 'Critical', 'High', 'Medium', 'Low', 'Not Applicable'] as const;
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
  static description = 'Generate a comprehensive summary of compliance data, including totals and counts, from your HDF files. The output can be displayed in the console, or exported as YAML, JSON, or a GitHub-flavored Markdown table.';  /**

  * The order of the rows in the summary table.
 * The table includes a row for each of these values.
 * @property {string[]} ROW_ORDER - The order of the rows in the summary table. The table includes a row for each of these values.
 */
  private readonly ROW_ORDER: RowType[] = ['Total', 'Critical', 'High', 'Medium', 'Low', 'Not Applicable'];
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
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Specify input HDF file(s)', helpGroup: 'I/O'}),
    output: Flags.string({char: 'o', description: 'Specify output file(s)', helpGroup: 'I/O'}),
    format: Flags.string({char: 'f', description: 'Specify output format', helpGroup: 'formatting', options: ['json', 'yaml', 'markdown'], default: 'yaml'}),
    stdout: Flags.boolean({char: 's', description: 'Enable printing to console', default: true, allowNo: true, helpGroup: 'I/O'}),
    'print-pretty': Flags.boolean({char: 'r', description: 'Enable human-readable data output', helpGroup: 'formatting', default: true, allowNo: true}),
    'title-table': Flags.boolean({char: 't', description: 'Add titles to the markdown table(s)', helpGroup: 'formatting', default: true, allowNo: true}),
    logLevel: Flags.string({char: 'l', description: 'Set log level', helpGroup: 'debugging', default: 'info'}),
    help: Flags.help({char: 'h', description: 'Show help information'}),
  }

  /**
 * An object to hold the parsed command line flags.
 * It is of type Partial<CommandFlags>, which means it is an object that has all the properties of CommandFlags, but all of them are optional.
 * This is useful when you don't know at the time of object creation which properties will be provided.
 * It is initialized as an empty object, and the actual values will be assigned later when the flags are parsed.
 */
  private parsedFlags!: CommandFlags

  // helpGroup: 'THE BEST FLAGS',
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
      const {flags} = await this.parse(Summary)
      this.parsedFlags = flags
      this.logger = createWinstonLogger('view summary:', this.parsedFlags.logLevel)
      const execJSONs = this.loadExecJSONs(this.parsedFlags.input)
      this.logger.verbose('got the exec JSONs')
      const summaries = this.calculateSummariesForExecJSONs(execJSONs)
      this.logger.verbose('calulated the summaries')
      const totals = this.calculateTotalCountsForSummaries(summaries)
      this.logger.verbose('calulated the total counts for the summaries')
      const complianceScores = this.calculateComplianceScoresForExecJSONs(execJSONs)
      this.logger.verbose('calulated the compliance scores')
      const printableSummaries = Object.entries(totals).map(([profileName, profileMetrics]) => {
        this.logger.verbose(`build the printable summaries for: ${profileName}`)
        return this.createPrintableSummary(profileName, profileMetrics, execJSONs, complianceScores)
      })
      this.logger.verbose('generated the printable summmaries')
      this.printAndWriteOutput(printableSummaries)
      this.logger.verbose('printed and wrote the output')
    } catch (error) {
      this.logger.error(error)
      // Handle the error appropriately
    }
  }

  /**
 * The function `validateFlags` checks if all the required properties are present in the `parsedFlags`
 * object.
 * @returns a boolean value.
 */
  private validateFlags(): boolean {
    const requiredProperties = ['input', 'format', 'stdout', 'print-pretty', 'title-table', 'logLevel', 'help']
    return requiredProperties.every(prop => Object.prototype.hasOwnProperty.call(this.parsedFlags, prop))
  }

  /**
   * Loads the execution JSONs from the provided files.
   * @param files - An array of file paths to load the execution JSONs from.
   * @returns An object mapping file paths to their corresponding execution JSONs.
   */
  private loadExecJSONs(files: string[]): Record<string, ContextualizedEvaluation> {
    this.logger.verbose('In loadExecJSONs')
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
    this.logger.verbose('In calculateSummariesForExecJSONs')
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
    this.logger.verbose('In calculateComplianceScoresForExecJSONs')
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
    this.logger.verbose('In calculateComplianceScoresForExecJSONs')
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
    this.logger.verbose('In calculateTotalCounts')
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
    this.logger.verbose('In calculateTotalCountsForSummaries')
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
    this.logger.verbose('In createPrintableSummary')
    return {
      profileName,
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
    this.logger.verbose('In extractResultSets')
    return Object.entries(execJSONs).filter(([, execJSON]) => {
      return execJSON.data.profiles[0].name === profileName
    }).map(([filePath]) => {
      return convertFullPathToFilename(filePath)
    })
  }

  /* The above code is a TypeScript function that generates a Markdown table row based on the provided
  row name and data. It takes in three parameters: `row` (the name of the row), `data` (the data
  object containing the values for the row), and `columnWidths` (the maximum width of each column in
  the table). */
  /**
 * Generates a Markdown table row based on the provided row name and data.
 * @param row - The name of the row. This should be one of the values in ROW_ORDER.
 * @param item - The data object containing the values for the row.
 * @param columnWidths - The maximum width of each column in the table.
 * @returns A string representing a row in a Markdown table.
 */
  private generateMarkdownTableRow(row: RowType, item: Data | PrintableSummary): string[] {
    this.logger.verbose('In generateMarkdownTableRow')

    const fields: (keyof Data)[] = ['passed', 'failed', 'skipped', 'no_impact', 'error']
    const values = fields.map(field => this.generateValue(row, field, item))

    return [row, ...values]
  }

  /**
   * Generates a string value for a given row and field based on the provided data.
   *
   * @param row - The name of the row. This should be 'Total', 'Not Applicable', or the name of a specific row.
   * @param field - The name of the field. This should be one of the keys of the Data interface.
   * @param data - The data object, which should match the shape of the Data interface.
   * @returns The generated value.
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
   */
  private generateValue(row: string, field: keyof Data, data: Data | PrintableSummary): string {
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
   * The table has a row for each value in ROW_ORDER and a column for each value in COLUMN_ORDER.
   * The values in the table are extracted from the data object.
   * @param data - The data object or array of data objects containing the values for the table.
   * @param titleTables - Boolean to either enable or disable adding titles to the produced markdown tables.
   * @returns An array of strings, each representing a Markdown table.
   */
  private convertToMarkdown(data: DataOrArray, titleTables: boolean): string[] {
    this.logger.verbose('In convertTomarkdown')

    let tables: string[] = []

    tables = Array.isArray(data) ? data.map(item => this.generateMarkdownTable(item, titleTables)) : [this.generateMarkdownTable(data, titleTables)]

    return tables
  }

  /**
   * Generates a Markdown table from a data object.
   * The table has a row for each value in ROW_ORDER and a column for each value in COLUMN_ORDER.
   * The values in the table are extracted from the data object.
   * @param item - The data object containing the values for the table.
   * @param titleTables - Boolean to either enable or disable adding titles to the produced markdown tables.
   * @returns A string representing a Markdown table.
   */
  private generateMarkdownTable(item: Data | PrintableSummary, titleTables: boolean): string {
    const table: string[][] = [
      ['Compliance: ' + item.compliance + '% :test_tube:', ...this.COLUMN_ORDER],
      ...this.ROW_ORDER.map(row => this.generateMarkdownTableRow(row, item)),
    ]

    const myTable: Table = {
      head: this.ROW_ORDER,
      body: table,
    }

    const myAlignment: Align[] = [Align.Left, Align.Center, Align.Center, Align.Center, Align.Center, Align.Center]

    if (this.parsedFlags.logLevel === 'verbose') {
      console.log(item)
    }

    // Include the profileName as a Markdown header before the table if titleTables is true
    const title = titleTables ? `# ${item.profileName}\n\n` : ''
    return title + getMarkdownTable({
      table: myTable,
      alignment: myAlignment,
      alignColumns: true,
    })
  }

  /**
   * Prints the provided printable summaries to the console and optionally writes them to an output file.
   * The format of the output is determined by the 'format' flag. The possible formats are 'json', 'yaml', and 'markdown'.
   * If the 'format' flag is not provided, the output is formatted as 'yaml' by default.
   * If the 'stdout' flag is provided, the output is printed to the console.
   * If the 'output' flag is provided, the output is written to the specified file.
   * @param printableSummaries - The printable summaries to print and write to the output file.
   * @returns void - this method does not return anything.
   */
  private printAndWriteOutput(printableSummaries: PrintableSummary[]) {
    this.logger.verbose('In printAndWriteOutput')
    let output = '' // Initialize output to an empty string

    switch (this.parsedFlags.format) {
      case 'json': {
        output = this.parsedFlags['print-pretty'] ? JSON.stringify(printableSummaries, null, 2) : JSON.stringify(printableSummaries)
        break
      }

      case 'markdown': {
        const markdownTables = this.convertToMarkdown(printableSummaries, this.parsedFlags['title-table'] ?? true)
        output = markdownTables.join('\n\n') // Join the tables with two newlines between each table
        break
      }

      default: { // Default to 'yaml'
        output = YAML.stringify(printableSummaries)
      }
    }

    if (this.parsedFlags.stdout) {
      console.log(output)
    }

    if (this.parsedFlags.output) {
      try {
        fs.writeFileSync(this.parsedFlags.output, output)
        this.logger.info(`Output written to ${this.parsedFlags.output}`)
      } catch (error) {
        this.logger.error(`Failed to write output to ${this.parsedFlags.output}: ${(error as Error).message}`)
      }
    }
  }
}
