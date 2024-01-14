import {createLogger, format, transports, transport, Logger} from 'winston'

import {ContextualizedControl, contextualizeEvaluation, ExecJSON} from 'inspecjs'
/**
 * Summary type represents a summary of an HDF execution.
 * @property {string[]} profileNames - An array of profile names.
 * @property {number} controlCount - The total number of controls.
 * @property {number} passedCount - The number of controls that passed.
 * @property {number} failedCount - The number of controls that failed.
 * @property {number} notApplicableCount - The number of controls that are not applicable.
 * @property {number} notReviewedCount - The number of controls that were not reviewed.
 * @property {number} errorCount - The number of controls that resulted in an error.
 */

export type Summary = {
  profileNames: string[];
  controlCount: number;
  passedCount: number;
  failedCount: number;
  notApplicableCount: number;
  notReviewedCount: number;
  errorCount: number;
}
/**
 * createWinstonLogger function creates a Winston logger.
 * @param {string} mapperName - The name of the mapper.
 * @param {string} [level='info'] - The log level. Default is 'info'.
 * @returns {Logger} A Winston logger.
 */

export function createWinstonLogger(mapperName: string, level = 'info'): Logger {
  const transportList: transport[] = [
    new transports.File({filename: 'saf-cli.log'}),
  ]
  if (level === 'verbose') {
    transportList.push(new transports.Console())
  }

  return createLogger({
    transports: transportList,
    level,
    format: format.combine(
      format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss Z',
      }),
      format.printf(
        info => `[${[info.timestamp]}] ${mapperName} ${info.message}`,
      ),
    ),
  })
}
/**
 * The function `getHDFSummary` takes an execution object and returns a summary string containing
 * information about the profiles, passed/failed/not applicable/not reviewed counts.
 * @param {ExecJSON.Execution} hdf - The `hdf` parameter is of type `ExecJSON.Execution` which represents the execution of a set of controls against a target.
 * @returns {string} A string that represents a summary of the execution.
 */

export function getHDFSummary(hdf: ExecJSON.Execution): string {
  let summary = 'Execution<'
  const summaryObject: Summary = {
    profileNames: [],
    controlCount: 0,
    passedCount: 0,
    failedCount: 0,
    notApplicableCount: 0,
    notReviewedCount: 0,
    errorCount: 0,
  }
  const contextualizedEvaluation = contextualizeEvaluation(hdf)
  contextualizedEvaluation.contains.forEach(profile => {
    summaryObject.profileNames.push(profile.data.name)
  })
  const controls: readonly ContextualizedControl[] = contextualizedEvaluation.contains.flatMap(
    profile => profile.contains,
  )
  controls.forEach(control => {
    switch (control.hdf.status) {
      case 'Passed': {
        summaryObject.passedCount += 1
        break
      }

      case 'Failed': {
        summaryObject.failedCount += 1
        break
      }

      case 'Not Applicable': {
        summaryObject.notApplicableCount += 1
        break
      }

      case 'Not Reviewed': {
        summaryObject.notReviewedCount += 1
        break
      }

      case 'Profile Error': {
        summaryObject.errorCount += 1
        break
      }

      default:
    }
  })
  summary += `Profiles: [Profile<${summaryObject.profileNames.join('> Profile<')}>], Passed=${summaryObject.passedCount}, Failed=${summaryObject.failedCount}, Not Applicable=${summaryObject.notApplicableCount}, Not Reviewed=${summaryObject.notReviewedCount}>`
  return summary
}
