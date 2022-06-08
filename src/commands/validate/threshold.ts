import {Command, Flags} from '@oclif/core'
import flat from 'flat'
import YAML from 'yaml'
import fs from 'fs'
import {ContextualizedProfile, convertFileContextual} from 'inspecjs'
import _ from 'lodash'
import {ThresholdValues} from '../../types/threshold'
import {calculateCompliance, exitNonZeroIfTrue, extractStatusCounts, getControlIdMap, renameStatusName, severityTargetsObject, statusSeverityPaths} from '../../utils/threshold'
import {expect} from 'chai'

export default class Threshold extends Command {
  static usage = 'validate threshold -i, --input=JSON -T, --templateInline="JSON Data" -F --templateFile=YAML File'

  static description = 'Validate the compliance and status counts of an HDF file'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    templateInline: Flags.string({char: 'T', required: false}),
    templateFile: Flags.string({char: 'F', required: false, description: 'Expected data template, generate one with "saf generate threshold"'}),
    totalMinimum: Flags.boolean({char: 'e', required: false, default: false, description: 'Treat passed.total/failed.total/etc as an minimum requirement, if this is false, it will be an exact requirement.'})
  }

  async run() {
    const {flags} = await this.parse(Threshold)
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
    const overallStatusCounts = extractStatusCounts(parsedExecJSON.contains[0] as ContextualizedProfile)
    if (thresholds.compliance) {
      const overallCompliance = calculateCompliance(overallStatusCounts)
      exitNonZeroIfTrue(Boolean(thresholds.compliance.min && overallCompliance < thresholds.compliance.min), 'Overall compliance minimum was not satisfied') // Compliance Minimum
      exitNonZeroIfTrue(Boolean(thresholds.compliance.max && overallCompliance > thresholds.compliance.max), 'Overall compliance maximum was not satisfied') // Compliance Maximum
    }

    // Total Pass/Fail/Skipped/No Impact/Error
    const targets = ['passed.total', 'failed.total', 'skipped.total', 'no_impact.total', 'error.total']
    for (const statusThreshold of targets) {
      const [statusName, _total] = statusThreshold.split('.')
      if (_.get(thresholds, statusThreshold) !== undefined) {
        if (flags.totalMinimum) {
          exitNonZeroIfTrue(
            Boolean(
              _.get(overallStatusCounts, renameStatusName(statusName))              <
              _.get(thresholds, statusThreshold),
            ),
            `${statusThreshold}: ${_.get(overallStatusCounts, renameStatusName(statusName))} < ${_.get(thresholds, statusThreshold)}`,
          )
        } else {
          exitNonZeroIfTrue(
            Boolean(
              _.get(overallStatusCounts, renameStatusName(statusName))              !==
              _.get(thresholds, statusThreshold),
            ),
            `${statusThreshold}: ${_.get(overallStatusCounts, renameStatusName(statusName))} != ${_.get(thresholds, statusThreshold)}`,
          )
        }
      }
    }

    // All Severities Pass/Fail/Skipped/No Impact/Error
    for (const [severity, targetPaths] of Object.entries(severityTargetsObject)) {
      const criticalStatusCounts = extractStatusCounts(parsedExecJSON.contains[0] as ContextualizedProfile, severity)
      for (const statusCountThreshold of targetPaths) {
        const [statusName, _total, thresholdType] = statusCountThreshold.split('.')
        if (thresholdType === 'min' && _.get(thresholds, statusCountThreshold) !== undefined) {
          exitNonZeroIfTrue(
            Boolean(
              _.get(criticalStatusCounts, renameStatusName(statusName)) < _.get(thresholds, statusCountThreshold),
            ),
            `${statusCountThreshold}: ${_.get(criticalStatusCounts, renameStatusName(statusName))} < ${_.get(thresholds, statusCountThreshold)}`,
          )
        } else if (thresholdType === 'max' && _.get(thresholds, statusCountThreshold) !== undefined) {
          exitNonZeroIfTrue(
            Boolean(
              _.get(criticalStatusCounts, renameStatusName(statusName)) > _.get(thresholds, statusCountThreshold),
            ),
            `${statusCountThreshold}: ${_.get(criticalStatusCounts, renameStatusName(statusName))} > ${_.get(thresholds, statusCountThreshold)}`,
          )
        }
      }
    }

    // Expect Control IDs to match placed severities
    const controlIdMap = getControlIdMap(parsedExecJSON.contains[0] as ContextualizedProfile)
    for (const [severity, targetPaths] of Object.entries(statusSeverityPaths)) {
      for (const targetPath of targetPaths) {
        const expectedControlIds: string[] | undefined = _.get(thresholds, targetPath)
        const actualControlIds: string[] | undefined = _.get(controlIdMap, targetPath)
        if (expectedControlIds) {
          for (const expectedControlId of expectedControlIds) {
            try {
              expect(actualControlIds).to.contain(expectedControlId)
            } catch {
              exitNonZeroIfTrue(true, `Expected ${targetPath} to contain ${expectedControlId} controls but it only contained [${actualControlIds?.join(', ')}]`) // Chai doesn't print the actual object diff anymore
            }
          }

          try {
            expect(expectedControlIds.length).to.equal(actualControlIds?.length)
          } catch {
            exitNonZeroIfTrue(true, `Expected ${targetPath} to contain ${expectedControlIds.length} controls but it contained ${actualControlIds?.length}`)
          }
        }
      }
    }
  }
}
