import {Command, Flags} from '@oclif/core'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import {calculateCompliance, extractControlSummariesBySeverity, extractStatusCounts, renameStatusName, severityTargetsObject} from '../../utils/threshold'
import _ from 'lodash'
import {checkSuffix} from '../../utils/global'
import {readFileURI, writeFileURI} from '../../utils/io'

export default class HDF2Condensed extends Command {
  static usage = 'convert hdf2condensed -i <hdf-scan-results-json> -o <condensed-json> [-h]'

  static description = 'Condensed format used by some community members to pre-process data for elasticsearch and custom dashboards'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output condensed JSON file'}),
  }

  static examples = ['saf convert hdf2condensed -i rhel7-results.json -o rhel7-condensed.json']

  async run() {
    const {flags} = await this.parse(HDF2Condensed)
    const thresholds: Record<string, Record<string, number>> = {}
    const parsedExecJSON = convertFileContextual(await readFileURI(flags.input, 'utf8'))
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

    // Total Counts
    for (const [type, counts] of Object.entries(thresholds)) {
      let total = 0
      for (const [, count] of Object.entries(counts)) {
        total += count
      }

      _.set(thresholds, `${type}.total`, total)
    }

    const result = {
      buckets: extractControlSummariesBySeverity(parsedProfile),
      status: thresholds,
    }
    await writeFileURI(checkSuffix(flags.output), JSON.stringify(result))
  }
}
