import {Command, Flags} from '@oclif/core'
import {createWinstonLogger} from '../../utils/logging'
import {loadExecJSONs} from '../../utils/ohdf/dataLoader'
import {calculateSummariesForExecJSONs, calculateTotalCountsForSummaries, calculateComplianceScoresForExecJSONs} from '../../utils/ohdf/calculations'
import {createPrintableSummary, printAndWriteOutput} from '../../utils/ohdf/outputGenerator'

/** The prefix used for logging messages in this command */
const VIEW_SUMMARY = 'view summary:'

/** The help group for input/output related flags */
const IO_GROUP = 'I/O'

/** The help group for formatting related flags */
const FORMATTING_GROUP = 'formatting'

/** The default log level for this command */
const DEFAULT_LOG_LEVEL = 'info'

/** The available format options for the output */
const FORMAT_OPTIONS = ['json', 'yaml', 'markdown']

/**
 * CommandFlags interface represents the flags that can be passed to the command.
 * @property {string[]} input - An array of input file paths.
 * @property {string} [output] - The output file path. This is optional.
 * @property {string} format - The format of the output (e.g., 'json', 'yaml').
 * @property {boolean} stdout - If true, the output will be printed to the console.
 * @property {boolean} 'print-pretty' - If true, the output will be formatted for human readability.
 * @property {boolean} [title-table] - If true, the output will include a title table. This is optional.
 * @property {string} [logLevel] - The level of logging to use (e.g., 'info', 'debug'). This is optional.
 * @property {unknown} help - The help flag. The type is unknown because it can be a boolean or a string depending on the command line library used.
 */
interface CommandFlags {
  input: string[];
  output?: string;
  format: string;
  stdout: boolean;
  'print-pretty': boolean;
  'title-table'?: boolean;
  logLevel?: string;
  help: string | undefined;
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
   * @property {string[]} aliases - Alternative command name.
   */
  static aliases = ['summary']

  /**
   * @property {ReturnType<typeof createWinstonLogger>} logger - Winston logger for this command.
   */
  private logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:');

  /**
   * @property {string} description - Command description displayed in the help message.
   */
  static description = 'Generate a comprehensive summary of compliance data, including totals and counts, from your HDF files.\n The output can be displayed in the console, or exported as YAML, JSON, or a GitHub-flavored Markdown table.';

  static flags = {
    input: Flags.string({char: 'i', required: true, multiple: true, description: 'Specify input HDF file(s)', helpGroup: IO_GROUP}),
    output: Flags.string({char: 'o', description: 'Specify output file(s)', helpGroup: IO_GROUP}),
    format: Flags.string({char: 'f', description: 'Specify output format', helpGroup: FORMATTING_GROUP, options: FORMAT_OPTIONS, default: 'yaml'}),
    stdout: Flags.boolean({char: 's', description: 'Enable printing to console', default: true, allowNo: true, helpGroup: IO_GROUP}),
    'print-pretty': Flags.boolean({char: 'r', description: 'Enable human-readable data output', helpGroup: FORMATTING_GROUP, default: true, allowNo: true}),
    'title-table': Flags.boolean({char: 't', description: 'Add titles to the markdown table(s)', helpGroup: FORMATTING_GROUP, default: true, allowNo: true}),
    logLevel: Flags.string({char: 'l', description: 'Set log level', helpGroup: 'debugging', default: DEFAULT_LOG_LEVEL}),
    help: Flags.help({char: 'h', description: 'Show help information'}),
  };

  static examples = [
    // Basic usage
    'Basic Usage:',
    "Summarize 'input.hdf' single HDF file:",
    '$ mycli summary -i input.hdf',

    // Specify output format
    'Specify Formats:',
    '$ mycli summary -i input.json --format=json',
    'Output GitHub Flavored Markdown Table, skip the console, and save to \'output.md\':',
    '$ mycli summary -i input.json --format=markdown --no-stdout -o output.md',

    // Multiple input files
    'Summarize multiple HDF files:',
    '$ mycli summary --input input1.hdf --input input2.hdf',
    'The input (`-i`) flag also accepts a space delimited list of files:',
    '$ mycli summary --input input1.hdf input2.hdf',

    // Specify output file
    "Save summary to 'output.json' and the print to the console:",
    '$ mycli summary -i input.hdf --output output.json',

    // Short and long form flags
    'Use short or long flag(s):',
    '$ mycli summary --input input.hdf --format json',
    '$ mycli summary -i input.hdf -f yaml',

    // Enable and disable flags
    '  Formmated or RAW output:',
    '$ mycli summary --input input.hdf --pretty-print # enable human-readable output',
    '$ mycli summary -i input.hdf --no-pretty-print  # for scripts or data-processing (RAW yaml/json/etc.)',
  ]

  /**
   * @private
   * Holds the parsed command line flags.
   * @type {CommandFlags}
   */
  private parsedFlags!: CommandFlags;

  /**
   * This is the main function that runs when the 'summary' command is invoked.
   * It performs the following steps:
   * 1. Parses the command line flags.
   * 2. Loads the execution JSONs from the provided input files.
   * 3. Calculates the summaries for each execution JSON.
   * 4. Calculates the total counts for each summary.
   * 5. Calculates the compliance scores for each execution JSON.
   * 6. Creates a printable summary for each profile using the total counts and compliance scores.
   * 7. Prints the printable summaries to the console and optionally writes them to an output file.
   *
   * @throws {Error} If there's an error during the execution, it will be logged and the process will exit.
   * @returns {Promise<void>} A promise that resolves when the command has finished executing.
   */
  async run() {
    try {
      const {flags} = await this.parse(Summary)
      this.parsedFlags = flags as CommandFlags
      const {format, 'print-pretty': printPretty, stdout, output, 'title-table': titleTable, logLevel} = flags
      const loglevel = this.parsedFlags.logLevel || process.env.LOG_LEVEL || 'info'
      this.logger = createWinstonLogger(VIEW_SUMMARY, loglevel)
      this.logger.verbose('Parsed command line flags')
      const executionData = loadExecJSONs(this.parsedFlags.input)
      this.logger.verbose(`Loaded execution data from ${this.parsedFlags.input.length} file(s)`)
      const summaries = calculateSummariesForExecJSONs(executionData)
      this.logger.verbose(`Calculated summaries for ${executionData.length} execution data`)
      const totals = calculateTotalCountsForSummaries(summaries)
      this.logger.verbose(`Calculated total counts for ${summaries.length} summaries`)
      const complianceScores = calculateComplianceScoresForExecJSONs(executionData)
      this.logger.verbose(`Calculated compliance scores for ${executionData.length} execution data`)
      const printableSummaries = Object.entries(totals).map(([profileName, profileMetrics]) => {
        this.logger.verbose(`Building printable summary for profile: ${profileName}`)
        return createPrintableSummary(profileName, profileMetrics, executionData, complianceScores)
      })
      this.logger.verbose(`Generated ${printableSummaries.length} printable summaries`)
      printAndWriteOutput({printableSummaries, titleTable, format, printPretty, stdout, output, logLevel})
      this.logger.verbose('Printed and wrote the output')
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error occurred: ${error.message}`)
      } else {
        this.logger.error(`An unknown error occurred: ${error}`)
      }

      process.exit(1)
    }
  }
}
