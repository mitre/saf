/**
 * PrintableSummary interface represents a summary that can be printed to the console or written to a file.
 * @property {string} profileName - The name of the profile.
 * @property {string[]} resultSets - An array of result sets.
 * @property {number} compliance - The compliance score.
 * @property {[key: string]: unknown} - This is to allow for the spread operator in the `createPrintableSummary` method.
 */
export interface PrintableSummary {
  profileName: string;
  resultSets: string[];
  compliance: number;
  [key: string]: unknown;
}

/**
 * Data interface represents the data structure used in the application.
 * @property {[key: string]: Record<string, number> | number} - This property can be a record of string to number or a number. It's used to store various data.
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
 * DataOrArray is a type that can be either a single Data object, an array of Data objects,
 * a single PrintableSummary object, or an array of PrintableSummary objects.
 * This type is used in functions where the input can be either a single object or an array of objects.
 */
export type DataOrArray = Data | Data[] | PrintableSummary | PrintableSummary[];

/**
 * RowType is a type that represents the possible values for the row names in the generated Markdown table.
 * The possible values are 'Total', 'Critical', 'High', 'Medium', 'Low', and 'Not Applicable'.
 */
export type RowType = 'total' | 'critical' | 'high' | 'medium' | 'low' | 'Not Applicable';
export type ColumnType = 'compliance' | 'passed' | 'failed' | 'skipped' | 'no_impact' | 'error';

