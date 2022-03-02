import {Command, flags} from '@oclif/command'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import fs from 'fs'
import {calculateCompliance, extractControlSummariesBySeverity, extractStatusCounts, renameStatusName, severityTargetsObject} from '../../utils/threshold'
import _ from 'lodash'
import {checkSuffix} from '../../utils/global'
import {createWinstonLogger} from '../../utils/logging'

export default class HDF2Condensed extends Command {
  static usage = 'hdf2condensed -i, --input=FILE -j, --json'

  static description = 'Condensed format used by some community members to pre-process data for elasticsearch and custom dashboards'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    output: flags.string({char: 'o', required: true, description: 'Output condensed JSON file'}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = ['saf convert:hdf2condensed -i rhel7-results.json -o rhel7-condensed.json']

  async run() {
    const {flags} = this.parse(HDF2Condensed)
    const logger = createWinstonLogger('hdf2condensed', flags.logLevel)

    const thresholds: Record<string, Record<string, number>> = {}

    // Read data
    logger.verbose(`Reading HDF file: ${flags.input}`)
    const parsedExecJSON = convertFileContextual(fs.readFileSync(flags.input, 'utf8'))

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    logger.info('Starting conversion from HDF to Condensed')
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
      for (const [_severity, count] of Object.entries(counts)) {
        total += count
      }

      _.set(thresholds, `${type}.total`, total)
    }

    const result = {
      buckets: extractControlSummariesBySeverity(parsedProfile),
      status: thresholds,
    }
    fs.writeFileSync(fileName, JSON.stringify(result))
    logger.info(`Condensed data successfully written to ${fileName}`)
  }
}
