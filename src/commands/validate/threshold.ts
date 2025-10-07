import fs from 'fs'
import YAML from 'yaml'
import {Flags} from '@oclif/core'
import {convertFileContextual, ContextualizedProfile} from 'inspecjs'
import type {ThresholdValues} from '../../types/threshold.js'
import type {OutputOptions} from '../../types/threshold-validation.js'
import {
  unflattenThreshold,
  validateThresholds,
  formatValidationResult,
  filterValidationResult,
} from '../../utils/threshold/index.js'
import {BaseCommand} from '../../utils/oclif/baseCommand.js'

/**
 * Validate command - checks HDF files against threshold requirements.
 *
 * Uses the new validation engine that collects ALL failures before reporting,
 * provides multiple output formats, and supports filtering.
 */
export default class Threshold extends BaseCommand<typeof Threshold> {
  static readonly usage = '<%= command.id %> -i <hdf-json> [-I <flattened-threshold-json> | -T <template-file>] [--format <format>] [--filter-severity <severities>] [--filter-status <statuses>] [-v] [--show-passed] [-q]'

  static readonly description = 'Validate HDF file against compliance thresholds\n\n'
    + 'Validates control counts and compliance percentages against defined thresholds.\n'
    + 'Collects ALL validation failures (not just the first) and supports multiple output\n'
    + 'formats including JSON, YAML, JUnit XML, and Markdown for CI/CD integration.\n\n'
    + 'Use "saf generate threshold" to create a threshold template from a baseline HDF file.'

  static readonly examples = [
    {
      description: 'Basic validation with default CLI output',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml',
    },
    {
      description: 'Detailed output with tables showing all checks',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --verbose --show-passed',
    },
    {
      description: 'CI/CD: Output JUnit XML for Jenkins/GitLab',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --format junit > results.xml',
    },
    {
      description: 'CI/CD: JSON output for automation/scripting',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --format json',
    },
    {
      description: 'CI/CD: Fail only on critical/high severity (with transparency warning)',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --filter-severity critical,high',
    },
    {
      description: 'Display only critical/high issues (validate all, reduce output noise)',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --display-severity critical,high',
    },
    {
      description: 'Display only failures (hide passing checks)',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --display-status failed',
    },
    {
      description: 'Markdown output for GitHub/documentation',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --format markdown',
    },
    {
      description: 'Quiet mode for CI/CD (exit code only, no output)',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -T threshold.yaml --quiet',
    },
    {
      description: 'Legacy: Inline threshold specification',
      command: '<%= config.bin %> <%= command.id %> -i rhel7-results.json -I "{compliance.min: 80}, {passed.total.min: 18}"',
    },
  ]

  static readonly flags = {
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'The HDF JSON file to validate',
    }),
    templateInline: Flags.string({
      char: 'I',
      required: false,
      exclusive: ['templateFile'],
      description: 'Inline flattened JSON threshold specification (legacy format)',
    }),
    templateFile: Flags.string({
      char: 'T',
      required: false,
      exclusive: ['templateInline'],
      description: 'Threshold YAML file (generate with: saf generate threshold)',
    }),
    format: Flags.string({
      char: 'f',
      options: ['default', 'detailed', 'json', 'yaml', 'markdown', 'junit', 'quiet'],
      description: 'Output format',
      default: 'default',
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed output with tables (alias for --format detailed)',
      default: false,
    }),
    showPassed: Flags.boolean({
      description: 'Include passing checks in output (use with --verbose)',
      default: false,
    }),
    quiet: Flags.boolean({
      char: 'q',
      description: 'Suppress output, only use exit code',
      default: false,
    }),
    'filter-severity': Flags.string({
      description: 'Only validate these severities (affects exit code). Shows warning about filtered checks.',
      helpValue: 'critical,high',
    }),
    'filter-status': Flags.string({
      description: 'Only validate these statuses (affects exit code). Shows warning about filtered checks.',
      helpValue: 'failed,error',
    }),
    'display-severity': Flags.string({
      description: 'Only display these severities in output (does not affect validation or exit code)',
      helpValue: 'critical,high',
    }),
    'display-status': Flags.string({
      description: 'Only display these statuses in output (does not affect validation or exit code)',
      helpValue: 'failed',
    }),
  }

  // eslint-disable-next-line complexity
  async run() {
    const {flags} = await this.parse(Threshold)

    // Parse threshold configuration
    let thresholds: ThresholdValues = {}

    if (flags.templateInline) {
      // Parse inline format (legacy)
      try {
        const flattenedObjects = flags.templateInline.split(',').map((value: string) => value.trim().replace('{', '').replace('}', ''))
        const toUnpack: Record<string, number> = {}
        for (const flattenedObject of flattenedObjects) {
          const [key, value] = flattenedObject.split(':')
          toUnpack[key.trim()] = Number.parseInt(value.trim(), 10)
        }
        thresholds = unflattenThreshold(toUnpack)
      } catch (error) {
        this.error(`Invalid inline threshold format: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else if (flags.templateFile) {
      // Validate threshold file exists
      if (!fs.existsSync(flags.templateFile)) {
        this.error(`Threshold file not found: ${flags.templateFile}`)
      }

      // Parse YAML file
      try {
        const content = fs.readFileSync(flags.templateFile, 'utf8')
        const parsed = YAML.parse(content)
        thresholds = Object.values(parsed).every(key => typeof key === 'number')
          ? unflattenThreshold(parsed)
          : parsed
      } catch (error) {
        this.error(`Failed to parse threshold file: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      this.error('Please provide a threshold template using -T or -I flag.\nSee https://github.com/mitre/saf/wiki/Validation-with-Thresholds for more information')
    }

    // Validate HDF file exists
    if (!fs.existsSync(flags.input)) {
      this.error(`HDF file not found: ${flags.input}`)
    }

    // Parse HDF file
    let profile: ContextualizedProfile
    try {
      const hdfContent = fs.readFileSync(flags.input, 'utf8')
      const parsedExecJSON = convertFileContextual(hdfContent)

      if (!parsedExecJSON.contains || parsedExecJSON.contains.length === 0) {
        this.error('Invalid HDF file: No profiles found')
      }

      profile = parsedExecJSON.contains[0] as ContextualizedProfile
    } catch (error) {
      this.error(`Failed to parse HDF file: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Validate thresholds (collects ALL failures!)
    let result = validateThresholds(profile, thresholds)

    // Apply validation filters if specified (affects exit code)
    const filterSeverities = flags['filter-severity']?.split(',').map(s => s.trim())
    const filterStatuses = flags['filter-status']?.split(',').map(s => s.trim())
    let filterMetadata: {filteredOutFailureCount: number, filteredOutCheckCount: number} | undefined

    if (filterSeverities || filterStatuses) {
      const filtered = filterValidationResult(result, filterSeverities, filterStatuses)
      result = filtered.result
      filterMetadata = {
        filteredOutFailureCount: filtered.filteredOutFailureCount,
        filteredOutCheckCount: filtered.filteredOutCheckCount,
      }
    }

    // Apply display filters if specified (presentation only, doesn't affect exit code)
    const displaySeverities = flags['display-severity']?.split(',').map(s => s.trim())
    const displayStatuses = flags['display-status']?.split(',').map(s => s.trim())
    let displayResult = result

    if (displaySeverities || displayStatuses) {
      const filtered = filterValidationResult(result, displaySeverities, displayStatuses)
      displayResult = filtered.result
      // Note: Display filtering doesn't affect exit code, so we use displayResult only for output
    }

    // Determine output format
    let outputFormat = flags.format as string
    if (flags.verbose && outputFormat === 'default') {
      outputFormat = 'detailed'
    }
    if (flags.quiet) {
      outputFormat = 'quiet'
    }

    // Format and output results (use displayResult for presentation)
    const outputOptions: OutputOptions = {
      format: outputFormat as OutputOptions['format'],
      showPassed: flags.showPassed,
      colors: !['json', 'yaml', 'junit'].includes(outputFormat),
      includeControlIds: true,
    }

    let output = formatValidationResult(displayResult, outputOptions)

    // Append transparency warning if validation was filtered
    if (filterMetadata && filterMetadata.filteredOutCheckCount > 0 && outputFormat !== 'quiet' && output) {
      if (filterMetadata.filteredOutFailureCount > 0) {
        output += `\n\n⚠️  Validation was filtered - ${filterMetadata.filteredOutFailureCount} failures were IGNORED`
        output += `\n   ${filterMetadata.filteredOutCheckCount} total checks were not validated`
        output += '\n   Run without --filter-* flags to see all issues'
      } else {
        output += `\n\nℹ️  Note: ${filterMetadata.filteredOutCheckCount} checks were filtered out (all passed or not applicable)`
      }
    }

    if (output) {
      console.log(output)
    }

    // Set exit code based on validation results (not display results!)
    process.exitCode = result.passed ? 0 : 1
  }
}
