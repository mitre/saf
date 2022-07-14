import {Command, Flags} from '@oclif/core'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import YAML from 'yaml'
import {ThresholdValues} from '../../types/threshold'
import {calculateCompliance, extractStatusCounts, getControlIdMap, renameStatusName, severityTargetsObject} from '../../utils/threshold'

export default class GenerateThreshold extends Command {
  static usage = 'generate threshold -i <hdf-json> -o <threshold-yaml> [-h] [-e] [-c]'

  static description = 'Generate a compliance template for "saf validate threshold". Default output states that you must have your current control counts or better (More Passes and/or less Fails/Skips/Not Applicable/No Impact/Errors)'

  static examples = ['saf generate threshold -i rhel7-results.json -e -c -o output.yaml']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input HDF JSON File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output Threshold YAML File'}),
    exact: Flags.boolean({char: 'e', description: 'All counts should be exactly the same when validating, not just less than or greater than'}),
    generateControlIds: Flags.boolean({char: 'c', required: false, description: 'Validate control IDs have the correct severity and status'}),
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

    fs.writeFileSync(flags.output, YAML.stringify(thresholds))
  }
}
