/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs';
import _ from 'lodash';
import YAML from 'yaml';
import { expect } from 'chai';
import { Flags } from '@oclif/core';
import { ContextualizedProfile, convertFileContextual } from 'inspecjs';
import { ThresholdValues } from '../../types/threshold';
import {
  calculateCompliance,
  exitNonZeroIfTrue,
  extractStatusCounts,
  getControlIdMap,
  renameStatusName,
  severityTargetsObject,
  statusSeverityPaths,
  totalMax,
  totalMin,
  unflattenThreshold,
} from '../../utils/threshold';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class Threshold extends BaseCommand<typeof Threshold> {
  static readonly usage = '<%= command.id %> -i <hdf-json> [-I <flattened-threshold-json> | -T <template-file>] [-h] [-L info|warn|debug|verbose]';

  static readonly description = 'Validate the compliance and status counts of an HDF file';

  static readonly examples = [
    {
      description: '\u001B[93mProviding a threshold template file\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml',
    },
    {
      description: '\u001B[93mSpecifying the threshold inline\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -I "{compliance.min: 80}, {passed.total.min: 18}, {failed.total.max: 2}"',
    },
  ];

  static readonly flags = {
    input: Flags.string({
      char: 'i', required: true, description: 'The HDF JSON File to be validated by the threshold values' }),
    templateInline: Flags.string({
      char: 'I', required: false, exclusive: ['templateFile'],
      description: 'An inline (on the command line) flattened JSON containing the validation thresholds (Intended for backwards compatibility with InSpec Tools)',
    }),
    templateFile: Flags.string({
      char: 'T', required: false, exclusive: ['templateInline'],
      description: 'A threshold YAML file containing expected threshold values. Generate it using the "saf generate threshold" command',
    }),
  };

  async run() { // skipcq: JS-R1005
    const { flags } = await this.parse(Threshold);
    let thresholds: ThresholdValues = {};
    // inline does not seem to support the controls array option
    if (flags.templateInline) {
      // Need to do some processing to convert this into valid JSON
      const flattenedObjects = flags.templateInline.split(',').map((value: string) => value.trim().replace('{', '').replace('}', ''));
      const toUnpack: Record<string, number> = {};
      for (const flattenedObject of flattenedObjects) {
        const [key, value] = flattenedObject.split(':');
        toUnpack[key] = Number.parseInt(value, 10);
      }

      thresholds = unflattenThreshold(toUnpack);
    } else if (flags.templateFile) {
      const parsed = YAML.parse(fs.readFileSync(flags.templateFile, 'utf8'));
      thresholds = Object.values(parsed).every(key => typeof key === 'number') ? unflattenThreshold(parsed) : parsed;
    } else {
      console.log('Please provide an inline compliance template or a compliance file.');
      console.log('See https://github.com/mitre/saf/wiki/Validation-with-Thresholds for more information');
      return;
    }

    const parsedExecJSON = convertFileContextual(fs.readFileSync(flags.input, 'utf8'));
    const overallStatusCounts = extractStatusCounts(parsedExecJSON.contains[0] as ContextualizedProfile);
    if (thresholds.compliance) {
      const overallCompliance = calculateCompliance(overallStatusCounts);
      try {
        exitNonZeroIfTrue(Boolean(thresholds.compliance.min && overallCompliance < thresholds.compliance.min), 'Overall compliance minimum was not satisfied'); // Compliance Minimum
        exitNonZeroIfTrue(Boolean(thresholds.compliance.max && overallCompliance > thresholds.compliance.max), 'Overall compliance maximum was not satisfied'); // Compliance Maximum
      } catch {
        process.exitCode = 1;
        return;
      }
    }

    // Total Pass/Fail/Skipped/No Impact/Error
    const targets = ['passed.total', 'failed.total', 'skipped.total', 'no_impact.total', 'error.total'];
    for (const statusThreshold of targets) {
      const [statusName, _total] = statusThreshold.split('.');
      if (_.get(thresholds, statusThreshold) !== undefined && typeof _.get(thresholds, statusThreshold) !== 'object') {
        try {
          exitNonZeroIfTrue(
            Boolean(
              _.get(overallStatusCounts, renameStatusName(statusName))
              !== _.get(thresholds, statusThreshold),
            ),
            `${statusThreshold}: Threshold not met. Number of received total ${statusThreshold.split('.')[0]} controls (${_.get(overallStatusCounts, renameStatusName(statusName))}) is not equal to your set threshold for the number of ${statusThreshold.split('.')[0]} controls (${_.get(thresholds, statusThreshold)})`,
          );
        } catch {
          process.exitCode = 1;
          return;
        }
      }
    }

    for (const totalMinimum of totalMin) {
      const [statusName] = totalMinimum.split('.');
      if (_.get(thresholds, totalMinimum) !== undefined) {
        try {
          exitNonZeroIfTrue(
            Boolean(
              _.get(overallStatusCounts, renameStatusName(statusName))
              < _.get(thresholds, totalMinimum),
            ),
            `${totalMinimum}: Threshold not met. Number of received total ${totalMinimum.split('.')[0]} controls (${_.get(overallStatusCounts, renameStatusName(statusName))}) is less than your set threshold for the number of ${totalMinimum.split('.')[0]} controls (${_.get(thresholds, totalMinimum)})`,
          );
        } catch {
          process.exitCode = 1;
          return;
        }
      }
    }

    for (const totalMaximum of totalMax) {
      const [statusName] = totalMaximum.split('.');
      if (_.get(thresholds, totalMaximum) !== undefined) {
        try {
          exitNonZeroIfTrue(
            Boolean(
              _.get(overallStatusCounts, renameStatusName(statusName))
              > _.get(thresholds, totalMaximum),
            ),
            `${totalMaximum}: Threshold not met. Number of received total ${totalMaximum.split('.')[0]} controls (${_.get(overallStatusCounts, renameStatusName(statusName))}) is greater than your set threshold for the number of ${totalMaximum.split('.')[0]} controls (${_.get(thresholds, totalMaximum)})`,
          );
        } catch {
          process.exitCode = 1;
          return;
        }
      }
    }

    // All Severities Pass/Fail/Skipped/No Impact/Error
    for (const [severity, targetPaths] of Object.entries(severityTargetsObject)) {
      const criticalStatusCounts = extractStatusCounts(parsedExecJSON.contains[0] as ContextualizedProfile, severity);
      for (const statusCountThreshold of targetPaths) {
        const [statusName, _total, thresholdType] = statusCountThreshold.split('.');
        if (thresholdType === 'min' && _.get(thresholds, statusCountThreshold) !== undefined) {
          try {
            exitNonZeroIfTrue(
              Boolean(
                _.get(criticalStatusCounts, renameStatusName(statusName)) < _.get(thresholds, statusCountThreshold),
              ),
              `${statusCountThreshold}: Threshold not met. Number of received total ${statusCountThreshold.split('.')[0]} controls (${_.get(criticalStatusCounts, renameStatusName(statusName))}) is less than your set threshold for the number of ${statusCountThreshold.split('.')[0]} controls (${_.get(thresholds, statusCountThreshold)})`,
            );
          } catch {
            process.exitCode = 1;
            return;
          }
        } else if (thresholdType === 'max' && _.get(thresholds, statusCountThreshold) !== undefined) {
          try {
            exitNonZeroIfTrue(
              Boolean(
                _.get(criticalStatusCounts, renameStatusName(statusName)) > _.get(thresholds, statusCountThreshold),
              ),
              `${statusCountThreshold}: Threshold not met. Number of received total ${statusCountThreshold.split('.')[0]} controls (${_.get(criticalStatusCounts, renameStatusName(statusName))}) is greater than your set threshold for the number of ${statusCountThreshold.split('.')[0]} controls (${_.get(thresholds, statusCountThreshold)})`,
            );
          } catch {
            process.exitCode = 1;
            return;
          }
        }
      }
    }

    // Expect Control IDs to match placed severities
    const controlIdMap = getControlIdMap(parsedExecJSON.contains[0] as ContextualizedProfile);
    for (const [_severity, targetPaths] of Object.entries(statusSeverityPaths)) {
      for (const targetPath of targetPaths) {
        const expectedControlIds: string[] | undefined = _.get(thresholds, targetPath);
        const actualControlIds: string[] | undefined = _.get(controlIdMap, targetPath);
        if (expectedControlIds) {
          for (const expectedControlId of expectedControlIds) {
            try {
              expect(actualControlIds).to.contain(expectedControlId);
            } catch {
              try {
                exitNonZeroIfTrue(true, `Expected ${targetPath} to contain ${expectedControlId} controls but it only contained [${actualControlIds?.join(', ')}]`); // Chai doesn't print the actual object diff anymore
              } catch {
                process.exitCode = 1;
                return;
              }
            }
          }

          try {
            expect(expectedControlIds.length).to.equal(actualControlIds?.length);
          } catch {
            try {
              exitNonZeroIfTrue(true, `Expected ${targetPath} to contain ${expectedControlIds.length} controls but it contained ${actualControlIds?.length}`);
            } catch {
              process.exitCode = 1;
              return;
            }
          }
        }
      }
    }

    console.log('All validation tests passed');
  }
}
