import {Command, flags} from '@oclif/command'
import flat from 'flat'
import YAML from 'yaml'
import fs from 'fs'
import {ContextualizedProfile, ControlStatus, convertFileContextual, Severity} from 'inspecjs'
import _ from 'lodash'

// The hash that we will generally be working with herein
export type ControlStatusHash = {
  [key in ControlStatus | 'Waived']: number;
};
export type StatusHash = ControlStatusHash & {
  PassedTests: number; // from passed controls
  FailedTests: number;
  PassingTestsFailedControl: number; // number of passing tests from failed controls
  Waived: number;
};

export type ThresholdValues = {
  compliance?: {min?: number; max?: number};
  passed?: {
    total: {min?: number; max?: number};
    critical: {min?: number; max?: number};
    high: {min?: number; max?: number};
    medium: {min?: number; max?: number};
    low: {min?: number; max?: number};
  };
  failed?: {
    total: {min?: number; max?: number};
    critical: {min?: number; max?: number};
    high: {min?: number; max?: number};
    medium: {min?: number; max?: number};
    low: {min?: number; max?: number};
  };
  skipped?: {
    total: {min?: number; max?: number};
    critical: {min?: number; max?: number};
    high: {min?: number; max?: number};
    medium: {min?: number; max?: number};
    low: {min?: number; max?: number};
  };
  no_impact?: {
    total: {min?: number; max?: number};
    critical: {min?: number; max?: number};
    high: {min?: number; max?: number};
    medium: {min?: number; max?: number};
    low: {min?: number; max?: number};
  };
  error?: {
    total: {min?: number; max?: number};
    critical: {min?: number; max?: number};
    high: {min?: number; max?: number};
    medium: {min?: number; max?: number};
    low: {min?: number; max?: number};
  };
}

export default class Threshold extends Command {
  static aliases = ['threshold']

  static usage = 'threshold -p, --port=PORT'

  static description = 'Validate the compliance of an HDF file'

  static flags = {
    help: flags.help({char: 'h'}),
    port: flags.integer({char: 'p', required: false, default: 3000}),
    input: flags.string({char: 'i', required: true}),
    templateInline: flags.string({char: 'T', required: false}),
    templateFile: flags.string({char: 'F', required: false}),

  }

  extractStatusCounts(profile: ContextualizedProfile, severity?: string) {
    const hash: StatusHash = {
      Failed: 0,
      'From Profile': 0,
      'Not Applicable': 0,
      'Not Reviewed': 0,
      Passed: 0,
      'Profile Error': 0,
      PassedTests: 0,
      FailedTests: 0,
      PassingTestsFailedControl: 0,
      Waived: 0,
    }

    for (const c of profile.contains.filter(control => control.extendedBy.length === 0)) {
      const control = c.root
      const status: ControlStatus = control.hdf.status
      const controlSeverity: Severity = control.hdf.severity
      if (!severity || (controlSeverity === severity)) {
        ++hash[status]
        if (status === 'Passed') {
          hash.PassedTests += (control.hdf.segments || []).length
        } else if (status === 'Failed') {
          hash.PassingTestsFailedControl += (control.hdf.segments || []).filter(
            s => s.status === 'passed'
          ).length
          hash.FailedTests += (control.hdf.segments || []).filter(
            s => s.status === 'failed'
          ).length
        } else if (status === 'Not Applicable' && control.hdf.waived) {
          hash.Waived += control.hdf.segments?.length || 0
        }
      }
    }

    return hash
  }

  calculateCompliance(statusHash: StatusHash): number {
    console.log(statusHash)
    const total = statusHash.Passed + statusHash.Failed + statusHash['Not Reviewed'] + statusHash['Profile Error']
    if (total === 0) {
      return 0
    }
    return Math.round((100 * statusHash.Passed) / total)
  }

  exitNonZeroIfTrue(condition: boolean, reason?: string) {
    if (condition) {
      throw new Error(reason || 'Compliance levels were not met')
    }
  }

  renameStatusName(statusName: string): string {
    switch (statusName) {
    case 'passed':
      return 'Passed'
    case 'failed':
      return 'Failed'
    case 'skipped':
      return 'Not Reviewed'
    case 'no_impact':
      return 'Not Applicable'
    case 'error':
      return 'Profile Error'
    default:
      return 'Profile Error'
    }
  }

  async run() {
    const {flags} = this.parse(Threshold)
    let thresholds: ThresholdValues = {}
    if (flags.templateInline) {
      // Need to do some processing to convert this into valid JSON
      const flattenedObjects = flags.templateInline.split(',').map(value => value.trim().replace('{', '').replace('}', ''))
      const toUnpack: Record<string, number> = {}
      for (const flattenedObject of flattenedObjects) {
        const [key, value] = flattenedObject.split(':')
        toUnpack[key] = Number.parseInt(value, 10)
      }
      thresholds = flat.unflatten(toUnpack)
    } else if (flags.templateFile) {
      const parsed = YAML.parse(fs.readFileSync(flags.templateFile, 'utf8'))
      thresholds = Object.values(parsed).every(key => typeof key === 'number') ? flat.unflatten(parsed) : parsed
    } else {
      console.log('Please provide an inline compliance template or a compliance file.')
      console.log('See https://github.com/mitre/saf#compliance for more information')
      return
    }

    const parsedExecJSON = convertFileContextual(fs.readFileSync(flags.input, 'utf8'))
    const overallStatusCounts = this.extractStatusCounts(parsedExecJSON.contains[0] as ContextualizedProfile)
    if (thresholds.compliance) {
      const overallCompliance = this.calculateCompliance(overallStatusCounts)
      this.exitNonZeroIfTrue(Boolean(thresholds.compliance.min && overallCompliance < thresholds.compliance.min), 'Overall compliance minimum was not satisfied') // Compliance Minimum
      this.exitNonZeroIfTrue(Boolean(thresholds.compliance.max && overallCompliance > thresholds.compliance.max), 'Overall compliance maximum was not satisfied') // Compliance Maximum
    }
    // Total Pass/Fail/Skipped/No Impact/Error
    const targets = ['passed.total.min', 'passed.total.max', 'failed.total.min', 'failed.total.max', 'skipped.total.min', 'skipped.total.max', 'no_impact.total.min', 'no_impact.total.max', 'error.total.min', 'error.total.max']
    for (const statusThreshold of targets) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [statusName, _total, thresholdType] = statusThreshold.split('.')
      if (thresholdType === 'min' && _.get(thresholds, statusThreshold)) {
        this.exitNonZeroIfTrue(
          Boolean(
            _.get(overallStatusCounts, this.renameStatusName(statusName))              <
            _.get(thresholds, statusThreshold)
          ),
          `${statusThreshold}: ${_.get(overallStatusCounts, this.renameStatusName(statusName))} < ${_.get(thresholds, statusThreshold)}`
        )
      } else if (thresholdType === 'max' && _.get(thresholds, statusThreshold)) {
        this.exitNonZeroIfTrue(
          Boolean(
            _.get(overallStatusCounts, this.renameStatusName(statusName))              >
            _.get(thresholds, statusThreshold)
          ),
          `${statusThreshold}: ${_.get(overallStatusCounts, this.renameStatusName(statusName))} > ${_.get(thresholds, statusThreshold)}`
        )
      }
    }

    // All Severities Pass/Fail/Skipped/No Impact/Error
    const severityTargetsObject = {
      critical: ['passed.critical.min', 'passed.critical.max', 'failed.critical.min', 'failed.critical.max', 'skipped.critical.min', 'skipped.critical.max', 'no_impact.critical.min', 'no_impact.critical.max', 'error.critical.max'],
      high: ['passed.high.min', 'passed.high.max', 'failed.high.min', 'failed.high.max', 'skipped.high.min', 'skipped.high.max', 'no_impact.high.min', 'no_impact.high.max', 'error.high.max'],
      medium: ['passed.medium.min', 'passed.medium.max', 'failed.medium.min', 'failed.medium.max', 'skipped.medium.min', 'skipped.medium.max', 'no_impact.medium.min', 'no_impact.medium.max', 'error.medium.max'],
      low: ['passed.low.min', 'passed.low.max', 'failed.low.min', 'failed.low.max', 'skipped.low.min', 'skipped.low.max', 'no_impact.low.min', 'no_impact.low.max', 'error.low.max'],
    }
    for (const [severity, targetPaths] of Object.entries(severityTargetsObject)) {
      const criticalStatusCounts = this.extractStatusCounts(parsedExecJSON.contains[0] as ContextualizedProfile, severity)
      for (const statusCountThreshold of targetPaths) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [statusName, _total, thresholdType] = statusCountThreshold.split('.')
        if (thresholdType === 'min' && _.get(thresholds, statusCountThreshold)) {
          this.exitNonZeroIfTrue(
            Boolean(
              _.get(criticalStatusCounts, this.renameStatusName(statusName)) < _.get(thresholds, statusCountThreshold)
            ),
            `${statusCountThreshold}: ${_.get(criticalStatusCounts, this.renameStatusName(statusName))} < ${_.get(thresholds, statusCountThreshold)}`
          )
        } else if (thresholdType === 'max' && _.get(thresholds, statusCountThreshold)) {
          this.exitNonZeroIfTrue(
            Boolean(
              _.get(criticalStatusCounts, this.renameStatusName(statusName)) > _.get(thresholds, statusCountThreshold)
            ),
            `${statusCountThreshold}: ${_.get(criticalStatusCounts, this.renameStatusName(statusName))} > ${_.get(thresholds, statusCountThreshold)}`
          )
        }
      }
    }
  }
}
