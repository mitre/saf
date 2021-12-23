import {Command, flags} from '@oclif/command'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import _ from 'lodash'
import fs from 'fs'
import YAML from 'yaml'
import {ThresholdValues} from '../../types/threshold'
import {calculateCompliance, extractStatusCounts, getControlIdMap, renameStatusName, severityTargetsObject} from '../../utils/threshold'

export default class GenerateThreshold extends Command {
  static usage = 'generate:threshold -i, --input=JSON -o, --output=YAML -e, --exact -c, --generateControlIds'

  static description = 'Generate a compliance template for "saf validate threshold"'

  static examples = ['saf generate:threshold -i rhel7-results.json -e -c -o output.yaml']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
    exact: flags.boolean({char: 'e', description: 'All counts should be exactly the same when validating, not just less than or greater than'}),
    generateControlIds: flags.boolean({char: 'c', required: false}),
  }

  async run() {
    const {flags} = this.parse(GenerateThreshold)
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [statusName, _total, thresholdType] = severityTarget.split('.')
        if ((statusName === 'passed' && thresholdType === 'min') || flags.exact) {
          _.set(thresholds, severityTarget, _.get(severityStatusCounts, renameStatusName(statusName)))
        } else if ((statusName !== 'passed' && thresholdType === 'max') || flags.exact) {
          _.set(thresholds, severityTarget, _.get(severityStatusCounts, renameStatusName(statusName)))
        }
      }
    }

    // Expected control ID status and severity
    if (flags.generateControlIds) {
      getControlIdMap(parsedProfile, thresholds)
    }

    fs.writeFileSync(flags.output, YAML.stringify(thresholds))
  }
}
