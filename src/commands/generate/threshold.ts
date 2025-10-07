import {Flags} from '@oclif/core'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import YAML from 'yaml'
import {ThresholdValues} from '../../types/threshold'
import {
  calculateCompliance,
  extractStatusCounts,
  getControlIdMap,
  renameStatusName,
  severityTargetsObject,
} from '../../utils/threshold'
import {BaseCommand} from '../../utils/oclif/baseCommand'

/**
 * Command to generate threshold templates for HDF compliance validation.
 *
 * This command analyzes an HDF JSON file and generates a YAML threshold template
 * that can be used with the 'saf validate threshold' command. The template
 * defines acceptable ranges for control counts by status and severity.
 */
export default class GenerateThreshold extends BaseCommand<typeof GenerateThreshold> {
  static readonly usage = '<%= command.id %> -i <hdf-json> [-o <threshold-yaml>] [-h] [-e] [-c]'

  static readonly description = 'Generate a compliance threshold template for "saf validate threshold".\n\n'
    + 'This command analyzes an HDF JSON file and creates a threshold template that defines\n'
    + 'acceptable compliance levels. By default, the template requires that future validation\n'
    + 'results have the same or better control counts (more passes, fewer failures).\n\n'
    + 'The generated template can be customized and used with "saf validate threshold" to\n'
    + 'ensure compliance requirements are met in CI/CD pipelines or regular assessments.'

  static readonly examples = [
    {
      description: 'Generate a basic threshold template',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -o threshold.yaml',
    },
    {
      description: 'Generate exact match thresholds with control ID validation',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -e -c -o strict-threshold.yaml',
    },
    {
      description: 'Output threshold to console instead of file',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json',
    },
  ]

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input HDF JSON file to analyze',
    }),
    output: Flags.string({
      char: 'o',
      required: false,
      description: 'Output threshold YAML file (if not specified, outputs to console)',
    }),
    exact: Flags.boolean({
      char: 'e',
      description: 'Generate exact match thresholds instead of minimum/maximum ranges',
    }),
    generateControlIds: Flags.boolean({
      char: 'c',
      required: false,
      description: 'Include control ID validation in the threshold template',
    }),
  }

  async run() {
    const {flags} = await this.parse(GenerateThreshold)
    const thresholds: ThresholdValues = {}
    const parsedExecJSON = convertFileContextual(fs.readFileSync(flags.input, 'utf8'))
    const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile
    const overallStatusCounts = extractStatusCounts(parsedProfile)
    const overallCompliance = calculateCompliance(overallStatusCounts)

    // Overall compliance counts
    _.set(thresholds, 'compliance.min', overallCompliance)
    if (flags.exact) {
      _.set(thresholds, 'compliance.max', overallCompliance)
    }

    // Severity counts
    for (const [severity, severityTargets] of Object.entries(severityTargetsObject)) {
      const severityStatusCounts = extractStatusCounts(parsedProfile, severity)
      for (const severityTarget of severityTargets) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        const [statusName, _total, thresholdType] = severityTarget.split('.')
        if ((statusName === 'passed' && thresholdType === 'min') || flags.exact) {
          _.set(thresholds, severityTarget, _.get(severityStatusCounts, renameStatusName(statusName)))
        } else if ((statusName !== 'passed' && thresholdType === 'max') || flags.exact) {
          _.set(thresholds, severityTarget, _.get(severityStatusCounts, renameStatusName(statusName)))
        }
      }
    }

    // Total counts
    const severityStatusCounts = extractStatusCounts(parsedProfile)
    _.set(thresholds, 'passed.total.min', severityStatusCounts.Passed)
    _.set(thresholds, 'failed.total.max', severityStatusCounts.Failed)
    _.set(thresholds, 'skipped.total.max', severityStatusCounts['Not Reviewed'])
    _.set(thresholds, 'error.total.max', severityStatusCounts['Profile Error'])
    _.set(thresholds, 'no_impact.total.max', severityStatusCounts['Not Applicable'])

    // Expected control ID status and severity
    if (flags.generateControlIds) {
      getControlIdMap(parsedProfile, thresholds)
    }

    if (flags.output) {
      fs.writeFileSync(flags.output, YAML.stringify(thresholds))
    } else {
      console.log(YAML.stringify(thresholds))
    }
  }
}
