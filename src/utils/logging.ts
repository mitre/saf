import {ContextualizedControl, contextualizeEvaluation, ExecJSON} from 'inspecjs'
import winston from 'winston'

export type Summary = {
    profileNames: string[];
    controlCount: number;
    passedCount: number;
    failedCount: number;
    notApplicableCount: number;
    notReviewedCount: number;
    errorCount: number;
}

export function createWinstonLogger(
  mapperName: string,
  level = 'debug',
): winston.Logger {
  return winston.createLogger({
    transports: [new winston.transports.Console()],
    level: level,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss Z',
      }),
      winston.format.printf(
        info => `[${[info.timestamp]}] ${mapperName} ${info.message}`,
      ),
    ),
  })
}

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
      case 'Passed':
        summaryObject.passedCount += 1
        break
      case 'Failed':
        summaryObject.failedCount += 1
        break
      case 'Not Applicable':
        summaryObject.notApplicableCount += 1
        break
      case 'Not Reviewed':
        summaryObject.notReviewedCount += 1
        break
      case 'Profile Error':
        summaryObject.errorCount += 1
        break
      default:
    }
  })

  summary += `Profiles: [Profile<${summaryObject.profileNames.join('> Profile<')}>], Passed=${summaryObject.passedCount}, Failed=${summaryObject.failedCount}, Not Applicable=${summaryObject.notApplicableCount}, Not Reviewed=${summaryObject.notReviewedCount}>`

  return summary
}
