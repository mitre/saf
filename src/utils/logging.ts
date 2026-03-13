import { contextualizeEvaluation, type ContextualizedControl, type ExecJSON } from 'inspecjs';
import _ from 'lodash';
import { createLogger, format, type transport, transports, type Logger } from 'winston';

/**
 * Summary type represents a summary of an HDF execution.
 * @property {string[]} profileNames     - An array of profile names.
 * @property {number} controlCount       - The total number of controls.
 * @property {number} passedCount        - The number of controls that passed.
 * @property {number} failedCount        - The number of controls that failed.
 * @property {number} notApplicableCount - The number of controls that are not applicable.
 * @property {number} notReviewedCount   - The number of controls that were not reviewed.
 * @property {number} errorCount         - The number of controls that resulted in an error.
 */

export type Summary = {
  profileNames: string[];
  controlCount: number;
  passedCount: number;
  failedCount: number;
  notApplicableCount: number;
  notReviewedCount: number;
  errorCount: number;
};

// Use user defined colors. Used by the console log transporter
const syslogColors = {
  debug: 'blue',
  info: 'cyan',
  notice: 'white',
  warn: 'magenta',
  warning: 'bold magenta',
  error: 'bold red',
  verbose: 'blue',
  crit: 'inverse yellow',
  alert: 'bold inverse red',
  emerg: 'bold inverse magenta',
  prefix: 'yellow',
};

/**
 * createWinstonLogger function creates a Winston logger.
 * @param {string} mapperName     - The name of the mapper.
 * @param {string} [level='info'] - The log level. Default is 'info'.
 * @returns {Logger}              - A Winston logger.
 */

export function createWinstonLogger(module = 'SAF CLI', level = 'info'): Logger {
  const colorizer = format.colorize({ colors: syslogColors });

  const transportList: transport[] = [new transports.File({ filename: 'saf-cli.log' })];

  if ((process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') || level === 'verbose') {
    transportList.push(new transports.Console());
  }

  return createLogger({
    transports: transportList,
    level,
    format: format.combine(
      format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss Z',
      }),
      format.errors({ stack: true }),
      format.printf(
        (info) => {
          const prefix = colorizer.colorize('prefix', `[${info.timestamp as string} -> ${module}]`);
          const lvl = colorizer.colorize(info.level, info.level);
          let msg = '';
          if (info.message) {
            msg = _.isString(info.message) ? info.message : JSON.stringify(info.message, null, 2);
          }
          if (info.stack) {
            msg += `\n${_.isString(info.stack) ? info.stack : JSON.stringify(info.stack, null, 2)}`;
          }
          msg = colorizer.colorize(info.level, msg);
          return `${prefix} - ${lvl}: ${msg}`;
        },
      ),
    ),
  });
}

/**
 * The function `getHDFSummary` takes an execution object and returns a summary string containing
 * information about the profiles, passed/failed/not applicable/not reviewed counts.
 * @param {ExecJSON.Execution} hdf - The `hdf` parameter is of type `ExecJSON.Execution` which represents the execution of a set of controls against a target.
 * @returns {string} A string that represents a summary of the execution.
 */

export function getHDFSummary(hdf: ExecJSON.Execution): string {
  let summary = 'Execution<';
  const summaryObject: Summary = {
    profileNames: [],
    controlCount: 0,
    passedCount: 0,
    failedCount: 0,
    notApplicableCount: 0,
    notReviewedCount: 0,
    errorCount: 0,
  };
  const contextualizedEvaluation = contextualizeEvaluation(hdf);
  for (const profile of contextualizedEvaluation.contains) {
    summaryObject.profileNames.push(profile.data.name);
  }
  const controls: readonly ContextualizedControl[] = contextualizedEvaluation.contains.flatMap(
    profile => profile.contains,
  );
  for (const control of controls) {
    switch (control.hdf.status) {
      case 'Passed': {
        summaryObject.passedCount += 1;
        break;
      }

      case 'Failed': {
        summaryObject.failedCount += 1;
        break;
      }

      case 'Not Applicable': {
        summaryObject.notApplicableCount += 1;
        break;
      }

      case 'Not Reviewed': {
        summaryObject.notReviewedCount += 1;
        break;
      }

      case 'Profile Error': {
        summaryObject.errorCount += 1;
        break;
      }

      default:
    }
  }
  summary += `Profiles: [Profile<${summaryObject.profileNames.join('> Profile<')}>], Passed=${summaryObject.passedCount}, Failed=${summaryObject.failedCount}, Not Applicable=${summaryObject.notApplicableCount}, Not Reviewed=${summaryObject.notReviewedCount}>`;
  return summary;
}
