import _ from 'lodash';
import { ContextualizedEvaluation, ContextualizedProfile } from 'inspecjs';
import { calculateCompliance, extractStatusCounts, flattenProfileSummary, renameStatusName, severityTargetsObject } from '../threshold';
import { createWinstonLogger } from '../logging';

/**
* The logger for this command.
 * It uses a Winston logger with the label 'view summary:'.
 * @property {ReturnType<typeof createWinstonLogger>} logger - The logger for this command. It uses a Winston logger with the label 'view summary:'.
 */
const logger: ReturnType<typeof createWinstonLogger> = createWinstonLogger('View Summary:');

/**
 * Calculates the summaries for the provided execution JSONs.
 * @param execJSONs - An object mapping file paths to their corresponding execution JSONs.
 * @returns An object containing the calculated summaries.
 */
export function calculateSummariesForExecJSONs(execJSONs: Record<string, ContextualizedEvaluation>): Record<string, Record<string, Record<string, number>>[]> {
  logger.verbose('In calculateSummariesForExecJSONs');
  const summaries: Record<string, Record<string, Record<string, number>>[]> = {};
  for (const parsedExecJSON of Object.values(execJSONs)) {
    const summary: Record<string, Record<string, number>> = {};
    const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile;
    const profileName = parsedProfile.data.name;
    calculateSeverityCounts(summary, parsedProfile);
    calculateTotalCounts(summary);
    summaries[profileName] = (_.get(summaries, profileName) || []);
    summaries[profileName].push(summary);
  }
  return summaries;
}

/**
 * Calculates the compliance scores for the provided execution JSONs.
 * @param execJSONs - An object mapping file paths to their corresponding execution JSONs.
 * @returns An object containing the calculated compliance scores.
 */
export function calculateComplianceScoresForExecJSONs(execJSONs: Record<string, ContextualizedEvaluation>): Record<string, number[]> {
  logger.verbose('In calculateComplianceScoresForExecJSONs');
  const complianceScores: Record<string, number[]> = {};
  for (const parsedExecJSON of Object.values(execJSONs)) {
    const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile;
    const profileName = parsedProfile.data.name;
    const overallStatusCounts = extractStatusCounts(parsedProfile);
    const overallCompliance = calculateCompliance(overallStatusCounts);
    const existingCompliance = _.get(complianceScores, profileName) || [];
    existingCompliance.push(overallCompliance);
    _.set(complianceScores, `["${profileName.replaceAll('"', String.raw`\"`)}"]`, existingCompliance);
  }
  return complianceScores;
}

/**
 * Calculates the totals for the provided summaries.
 * @param summaries - The summaries to calculate the totals for.
 * @returns An object containing the calculated totals.
 */
export function calculateTotalCountsForSummaries(summaries: Record<string, Record<string, Record<string, number>>[]>): Record<string, Record<string, number>> {
  logger.verbose('In calculateTotalCountsForSummaries');
  const totals: Record<string, Record<string, number>> = {};
  for (const [profileName, profileSummaries] of Object.entries(summaries)) {
    for (const profileSummary of profileSummaries) {
      const flattened: Record<string, number> = flattenProfileSummary(profileSummary);
      for (const [key, value] of Object.entries(flattened)) {
        const existingValue = _.get(totals, `${profileName}.${key}`, 0);
        if (typeof existingValue === 'number') {
          _.set(totals, `["${profileName.replaceAll('"', String.raw`\"`)}"].${key}`, existingValue + value);
        } else {
          _.set(totals, `["${profileName.replaceAll('"', String.raw`\"`)}"].${key}`, value);
        }
      }
    }
  }
  return totals;
}

/**
 * Calculates the severity counts for the provided summary and profile.
 * @param summary - The summary to calculate the severity counts for.
 * @param parsedProfile - The profile to use for the calculation.
 * @returns void - This method does not return anything, it modifies the 'summary' object passed as a parameter.
 */
export function calculateSeverityCounts(summary: Record<string, Record<string, number>>, parsedProfile: ContextualizedProfile) {
  logger.verbose('In calculateComplianceScoresForExecJSONs');
  for (const [severity, severityTargets] of Object.entries(severityTargetsObject)) {
    const severityStatusCounts = extractStatusCounts(parsedProfile, severity);
    for (const severityTarget of severityTargets) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [statusName, _severity, thresholdType] = severityTarget.split('.');
      _.set(summary, severityTarget.replace(`.${thresholdType}`, ''), _.get(severityStatusCounts, renameStatusName(statusName)));
    }
  }
}

/**
 * Calculates the total counts for the provided summary.
 * @param summary - The summary to calculate the total counts for.
 * @returns void - This method does not return anything, it modifies the 'summary' object passed as a parameter.
 */
export function calculateTotalCounts(summary: Record<string, Record<string, number>>) {
  logger.verbose('In calculateTotalCounts');
  for (const [type, counts] of Object.entries(summary)) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    _.set(summary, `${type}.total`, total);
  }
}
