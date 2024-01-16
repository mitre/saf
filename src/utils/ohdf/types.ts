/**
 * Represents a summary that can be printed to the console or written to a file.
 * @property {string} profileName - The name of the profile.
 * @property {string[]} resultSets - An array of result sets.
 * @property {number} compliance - The compliance score.
 * @property {[key: string]: unknown} - Allows for the spread operator in the `createPrintableSummary` method.
 */
export interface PrintableSummary {
  profileName: string;
  resultSets: string[];
  compliance: number;
  [key: string]: unknown;
}

/**
 * Represents the data structure used in the application.
 * @property {[key: string]: Record<string, number> | number} - Can be a record of string to number or a number. Used to store various data.
 * @property {number} compliance - The compliance score.
 * @property {Record<string, number>} passed - A record of passed tests.
 * @property {Record<string, number>} failed - A record of failed tests.
 * @property {Record<string, number>} skipped - A record of skipped tests.
 * @property {Record<string, number>} no_impact - A record of tests with no impact.
 * @property {Record<string, number>} error - A record of tests with errors.
 * @property {number} total - The total number of tests.
 * @property {number} default - The default value.
 */
export interface Data {
  [key: string]: Record<string, number> | number;
  compliance: number;
  passed: Record<string, number>;
  failed: Record<string, number>;
  skipped: Record<string, number>;
  no_impact: Record<string, number>;
  error: Record<string, number>;
  total: number;
  default: number;
}

/**
 * Represents a type that can be either a single Data object, an array of Data objects,
 * a single PrintableSummary object, or an array of PrintableSummary objects.
 * Used in functions where the input can be either a single object or an array of objects.
 */
export type DataOrArray = Data | Data[] | PrintableSummary | PrintableSummary[];

/**
 * Represents the possible values for the row names in the generated Markdown table.
 * The possible values are 'Total', 'Critical', 'High', 'Medium', 'Low', and 'Not Applicable'.
 */
export type RowType = 'total' | 'critical' | 'high' | 'medium' | 'low' | 'Not Applicable';

/**
 * Represents the possible values for the column names in the generated Markdown table.
 * The possible values are 'compliance', 'passed', 'failed', 'skipped', 'no_impact', and 'error'.
 */
export type ColumnType = 'compliance' | 'passed' | 'failed' | 'skipped' | 'no_impact' | 'error';

/**
 * Represents the arguments for the `printAndWriteOutput` function.
 * @property {PrintableSummary[]} printableSummaries - The printable summaries to print and write to the output file.
 * @property {boolean} titleTable - Whether to add titles to the produced markdown tables.
 * @property {string} format - The format to use for the output. Should be 'json', 'yaml', or 'markdown'.
 * @property {boolean} printPretty - Whether to pretty print the output.
 * @property {boolean} stdout - Whether to print the output to the console.
 * @property {string} logLevel - The log level to use when converting the printable summaries to Markdown.
 * @property {string} [output] - The path of the file to write the output to. If not provided, the output is not written to a file.
 */
export interface PrintAndWriteOutputArgs {
  printableSummaries: PrintableSummary[];
  titleTable: boolean;
  format: string;
  printPretty: boolean;
  stdout: boolean;
  logLevel: string;
  output?: string;
}
