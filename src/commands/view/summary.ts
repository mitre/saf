import {Command, flags} from '@oclif/command'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import fs from 'fs'
import YAML from 'yaml'
import {calculateCompliance, extractControlSummariesBySeverity, extractStatusCounts, renameStatusName, severityTargetsObject} from '../../utils/threshold'
import _ from 'lodash'

export default class Summary extends Command {
  static aliases = ['summary']

  static usage = 'view -i, --input=FILE -j, --json'

  static description = 'Get a quick compliance overview of an HDF file '

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    json: flags.boolean({char: 'j', required: false, description: 'Output results as JSON'}),
    fullJson: flags.boolean({char: 'f', required: false, description: 'Include control information in summary'}),
  }

  static examples = ['saf view:summary -i rhel7-results.json']

  async run() {
    const {flags} = this.parse(Summary)
    const thresholds = {}
    const parsedExecJSON = convertFileContextual(fs.readFileSync(flags.input, 'utf8'))
    const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile
    const overallStatusCounts = extractStatusCounts(parsedProfile)
    const overallCompliance = calculateCompliance(overallStatusCounts)

    if (!flags.fullJson) {
      flags.json ? _.set(thresholds, 'compliance', overallCompliance) : console.log(`Overall Compliance: ${overallCompliance}%\n`)
    }

    // Severity counts
    for (const [severity, severityTargets] of Object.entries(severityTargetsObject)) {
      const severityStatusCounts = extractStatusCounts(parsedProfile, severity)
      for (const severityTarget of severityTargets) {
        const [statusName, _severity, thresholdType] = severityTarget.split('.')
        _.set(thresholds, severityTarget.replace(`.${thresholdType}`, ''), _.get(severityStatusCounts, renameStatusName(statusName)))
      }
    }
    if (flags.fullJson) {
      const result = {
        buckets: {},
        status: thresholds,
      }
      result.buckets = extractControlSummariesBySeverity(parsedProfile)
      console.log(JSON.stringify(result, null, 2).trim())
    } else {
      flags.json ? console.log(JSON.stringify(thresholds, null, 2).trim()) : console.log(YAML.stringify(thresholds).trim())
    }
  }
}
