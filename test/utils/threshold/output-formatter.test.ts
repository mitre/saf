import {describe, expect, it} from 'vitest'
import {formatValidationResult, filterValidationResult} from '../../../src/utils/threshold/output-formatter.js'
import type {ValidationResult} from '../../../src/types/threshold-validation.js'

describe('Output Formatter', () => {
  const mockResult: ValidationResult = {
    passed: false,
    checks: [
      {
        path: 'compliance.min',
        type: 'compliance',
        status: 'failed',
        actual: 64,
        expected: {min: 66},
        violation: {type: 'below', amount: 2, details: 'Compliance is 64%, required ≥66%'},
      },
      {
        path: 'passed.critical.min',
        type: 'count',
        status: 'passed',
        actual: 10,
        expected: {min: 5},
        severity: 'critical',
        statusType: 'passed',
      },
      {
        path: 'failed.high.max',
        type: 'count',
        status: 'failed',
        actual: 15,
        expected: {max: 10},
        severity: 'high',
        statusType: 'failed',
        violation: {type: 'exceeds', amount: 5},
      },
    ],
    summary: {
      totalChecks: 3,
      passedChecks: 1,
      failedChecks: 2,
      totalControls: 100,
      compliance: 64,
      complianceRequired: {min: 66},
    },
  }

  describe('formatValidationResult', () => {
    it('should format as JSON', () => {
      const output = formatValidationResult(mockResult, {format: 'json', showPassed: false, colors: false, includeControlIds: true})
      const parsed = JSON.parse(output)
      expect(parsed.passed).toBe(false)
      expect(parsed.checks.length).toBe(3)
    })

    it('should format as YAML', () => {
      const output = formatValidationResult(mockResult, {format: 'yaml', showPassed: false, colors: false, includeControlIds: true})
      expect(output).toContain('passed: false')
      expect(output).toContain('checks:')
    })

    it('should format as markdown', () => {
      const output = formatValidationResult(mockResult, {format: 'markdown', showPassed: false, colors: false, includeControlIds: true})
      expect(output).toContain('# Threshold Validation')
      expect(output).toContain('| Check | Actual | Required | Violation |')
      expect(output).toContain('compliance.min')
    })

    it('should format as JUnit XML', () => {
      const output = formatValidationResult(mockResult, {format: 'junit', showPassed: false, colors: false, includeControlIds: true})
      expect(output).toContain('<?xml version="1.0"')
      expect(output).toContain('<testsuites')
      expect(output).toContain('tests="3"')
      expect(output).toContain('failures="2"')
      expect(output).toContain('<testcase')
      expect(output).toContain('<failure')
    })

    it('should format as default (concise)', () => {
      const output = formatValidationResult(mockResult, {format: 'default', showPassed: false, colors: false, includeControlIds: true})
      expect(output).toContain('Threshold validation failed')
      expect(output).toContain('Failed:')
      expect(output).toContain('compliance.min')
    })

    it('should format as detailed with tables', () => {
      const output = formatValidationResult(mockResult, {format: 'detailed', showPassed: false, colors: false, includeControlIds: true})
      expect(output).toContain('FAILED CHECKS')
      expect(output).toContain('Summary')
      expect(output).toContain('Recommendations')
    })

    it('should return empty string for quiet mode', () => {
      const output = formatValidationResult(mockResult, {format: 'quiet', showPassed: false, colors: false, includeControlIds: true})
      expect(output).toBe('')
    })
  })

  describe('filterValidationResult', () => {
    it('should filter by severity', () => {
      const filtered = filterValidationResult(mockResult, ['critical'], undefined)
      expect(filtered.result.checks.length).toBe(1)
      expect(filtered.result.checks[0].severity).toBe('critical')
      expect(filtered.filteredOutCheckCount).toBe(2)
    })

    it('should filter by status', () => {
      const filtered = filterValidationResult(mockResult, undefined, ['failed'])
      expect(filtered.result.checks.length).toBe(1)
      expect(filtered.result.checks[0].statusType).toBe('failed')
    })

    it('should filter by both severity and status', () => {
      const filtered = filterValidationResult(mockResult, ['high'], ['failed'])
      expect(filtered.result.checks.length).toBe(1)
      expect(filtered.result.checks[0].path).toBe('failed.high.max')
    })

    it('should recalculate summary statistics after filtering', () => {
      const filtered = filterValidationResult(mockResult, ['critical'], undefined)
      expect(filtered.result.summary.totalChecks).toBe(1)
      expect(filtered.result.summary.passedChecks).toBe(1)
      expect(filtered.result.summary.failedChecks).toBe(0)
      expect(filtered.result.passed).toBe(true) // All filtered checks passed
    })

    it('should track filtered out failures for transparency', () => {
      const filtered = filterValidationResult(mockResult, ['critical'], undefined)
      expect(filtered.originalFailureCount).toBe(2) // Total failures before filter
      expect(filtered.filteredOutFailureCount).toBe(2) // Failures hidden by filter
    })

    it('should return all checks when no filters specified', () => {
      const filtered = filterValidationResult(mockResult, undefined, undefined)
      expect(filtered.result.checks.length).toBe(mockResult.checks.length)
      expect(filtered.filteredOutCheckCount).toBe(0)
    })
  })
})
