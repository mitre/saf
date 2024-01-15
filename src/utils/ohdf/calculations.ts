// utils/calculations.ts

import _ from 'lodash'
import flat from 'flat'
import {ContextualizedEvaluation, ContextualizedProfile} from 'inspecjs'
import {calculateCompliance, extractStatusCounts, renameStatusName, severityTargetsObject} from '../../utils/threshold'
import {createWinstonLogger} from '../../utils/logging'

const UTF8_ENCODING = 'utf8'

/**
* The logger for this command.
 * It uses a Winston logger with the label 'view summary:'.
 * @property {ReturnType<typeof createWinstonLogger>} logger - The logger for this command. It uses a Winston logger with the label 'view summary:'.
 */
const logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:')

/**
 * Calculates the summaries for the provided execution JSONs.
 * @param execJSONs - An object mapping file paths to their corresponding execution JSONs.
 * @returns An object containing the calculated summaries.
 */
export function calculateSummariesForExecJSONs(execJSONs: Record<string, ContextualizedEvaluation>): Record<string, Record<string, Record<string, number>>[]> {
  logger.verbose('In calculateSummariesForExecJSONs')
  const summaries: Record<string, Record<string, Record<string, number>>[]> = {}
  Object.values(execJSONs).forEach(parsedExecJSON => {
    const summary: Record<string, Record<string, number>> = {}
    const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile
    const profileName = parsedProfile.data.name
    calculateSeverityCounts(summary, parsedProfile)
    calculateTotalCounts(summary)
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
export function calculateComplianceScoresForExecJSONs(execJSONs: Record<string, ContextualizedEvaluation>): Record<string, number[]> {
  logger.verbose('In calculateComplianceScoresForExecJSONs')
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
 * Calculates the totals for the provided summaries.
 * @param summaries - The summaries to calculate the totals for.
 * @returns An object containing the calculated totals.
 */
export function calculateTotalCountsForSummaries(summaries: Record<string, Record<string, Record<string, number>>[]>): Record<string, Record<string, number>> {
  logger.verbose('In calculateTotalCountsForSummaries')
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
 * Calculates the severity counts for the provided summary and profile.
 * @param summary - The summary to calculate the severity counts for.
 * @param parsedProfile - The profile to use for the calculation.
 * @returns void - This method does not return anything, it modifies the 'summary' object passed as a parameter.
 */
export function calculateSeverityCounts(summary: Record<string, Record<string, number>>, parsedProfile: ContextualizedProfile) {
  logger.verbose('In calculateComplianceScoresForExecJSONs')
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
export function calculateTotalCounts(summary: Record<string, Record<string, number>>) {
  logger.verbose('In calculateTotalCounts')
  for (const [type, counts] of Object.entries(summary)) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    _.set(summary, `${type}.total`, total)
  }
}
