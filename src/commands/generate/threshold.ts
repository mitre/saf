import {Flags} from '@oclif/core'
import type {ContextualizedProfile} from 'inspecjs'
import {convertFileContextual} from 'inspecjs'
import fs from 'fs'
import YAML from 'yaml'
import type {ThresholdValues} from '../../types/threshold'
import {
  calculateCompliance,
  extractStatusCounts,
  getControlIdMap,
  renameStatusName,
  severityTargetsObject,
  setNestedValue,
  getNestedValue,
} from '../../utils/threshold'
import {BaseCommand} from '../../utils/oclif/baseCommand'
import {validateFilePath, safeReadFile} from '../../utils/path-validator.js'

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
    'generate-control-ids': Flags.boolean({
      char: 'c',
      required: false,
      description: 'Include control ID validation in the threshold template',
    }),
  }

  async run() {
    const {flags} = await this.parse(GenerateThreshold)
    const thresholds: ThresholdValues = {}

    // Validate and read HDF file safely (with 100MB limit)
    validateFilePath(flags.input, 'read')
    const hdfContent = safeReadFile(flags.input, 100)

    const parsedExecJSON = convertFileContextual(hdfContent)

    // Check for prototype pollution in parsed HDF data
    if (parsedExecJSON && typeof parsedExecJSON === 'object' && (Object.prototype.hasOwnProperty.call(parsedExecJSON, '__proto__')
      || Object.prototype.hasOwnProperty.call(parsedExecJSON, 'constructor')
      || Object.prototype.hasOwnProperty.call(parsedExecJSON, 'prototype'))) {
      this.error('Invalid HDF file: contains dangerous properties')
    }

    const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile
    const overallStatusCounts = extractStatusCounts(parsedProfile)
    const overallCompliance = calculateCompliance(overallStatusCounts)

    // Overall compliance counts
    setNestedValue(thresholds, 'compliance.min', overallCompliance)
    if (flags.exact) {
      setNestedValue(thresholds, 'compliance.max', overallCompliance)
    }

    // Severity counts
    for (const [severity, severityTargets] of Object.entries(severityTargetsObject)) {
      const severityStatusCounts = extractStatusCounts(parsedProfile, severity)
      for (const severityTarget of severityTargets) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        const [statusName, _total, thresholdType] = severityTarget.split('.')
        const value = getNestedValue(severityStatusCounts, renameStatusName(statusName))
        if ((statusName === 'passed' && thresholdType === 'min') || flags.exact) {
          setNestedValue(thresholds, severityTarget, value)
        } else if ((statusName !== 'passed' && thresholdType === 'max') || flags.exact) {
          setNestedValue(thresholds, severityTarget, value)
        }
      }
    }

    // Total counts
    const severityStatusCounts = extractStatusCounts(parsedProfile)
    setNestedValue(thresholds, 'passed.total.min', severityStatusCounts.Passed)
    setNestedValue(thresholds, 'failed.total.max', severityStatusCounts.Failed)
    setNestedValue(thresholds, 'skipped.total.max', severityStatusCounts['Not Reviewed'])
    setNestedValue(thresholds, 'error.total.max', severityStatusCounts['Profile Error'])
    setNestedValue(thresholds, 'no_impact.total.max', severityStatusCounts['Not Applicable'])

    // Expected control ID status and severity
    if (flags['generate-control-ids']) {
      getControlIdMap(parsedProfile, thresholds)
    }

    if (flags.output) {
      // Validate output path before writing
      validateFilePath(flags.output, 'write')
      fs.writeFileSync(flags.output, YAML.stringify(thresholds))
    } else {
      console.log(YAML.stringify(thresholds))
    }
  }
}
