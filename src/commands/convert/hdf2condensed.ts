import {Command, flags} from '@oclif/command'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import fs from 'fs'
import {calculateCompliance, extractControlSummariesBySeverity, extractStatusCounts, renameStatusName, severityTargetsObject} from '../../utils/threshold'
import _ from 'lodash'
import {checkSuffix} from '../../utils/global'

export default class Summary extends Command {
  static usage = 'hdf2condensed -i, --input=FILE -j, --json'

  static description = 'Condensed format used by some community members to pre-process data for elasticsearch and custom dashboards'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    output: flags.string({char: 'o', required: true, description: 'Output condensed JSON file'}),
  }

  static examples = ['saf convert:hdf2condensed -i rhel7-results.json -o rhel7-condensed.json']

  async run() {
    const {flags} = this.parse(Summary)
    const thresholds = {}
    const parsedExecJSON = convertFileContextual(fs.readFileSync(flags.input, 'utf8'))
    const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile
    const overallStatusCounts = extractStatusCounts(parsedProfile)
    const overallCompliance = calculateCompliance(overallStatusCounts)

    _.set(thresholds, 'compliance', overallCompliance)

    // Severity counts
    for (const [severity, severityTargets] of Object.entries(severityTargetsObject)) {
      const severityStatusCounts = extractStatusCounts(parsedProfile, severity)
      for (const severityTarget of severityTargets) {
        const [statusName, _severity, thresholdType] = severityTarget.split('.')
        _.set(thresholds, severityTarget.replace(`.${thresholdType}`, ''), _.get(severityStatusCounts, renameStatusName(statusName)))
      }
    }
    const result = {
      buckets: extractControlSummariesBySeverity(parsedProfile),
      status: thresholds,
    }
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(result))
  }
}
