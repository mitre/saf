import {describe, expect, it} from 'vitest'
import {
  validateThresholds,
  validateCompliance,
  validateTotalCounts,
  validateSeverityCounts,
  validateControlIds,
} from '../../../src/utils/threshold/validators.js'
import {getControlIdMap} from '../../../src/utils/threshold/control-mapping.js'
import {convertFileContextual, ContextualizedProfile} from 'inspecjs'
import type {ThresholdValues} from '../../../src/types/threshold.js'
import fs from 'fs'
import path from 'path'

describe('Threshold Validators', () => {
  // Helper to load test HDF data
  const loadTestProfile = (filename: string): ContextualizedProfile => {
    const filePath = path.resolve(`./test/sample_data/HDF/input/${filename}`)
    const hdfData = fs.readFileSync(filePath, 'utf8')
    const parsed = convertFileContextual(hdfData)
    return parsed.contains[0] as ContextualizedProfile
  }

  describe('validateCompliance', () => {
    const profile = loadTestProfile('red_hat_good.json')

    it('should return empty array when no compliance threshold specified', () => {
      const thresholds: ThresholdValues = {}
      const checks = validateCompliance(profile, thresholds)
      expect(checks).toEqual([])
    })

    it('should pass when compliance meets minimum', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 90},
      }
      const checks = validateCompliance(profile, thresholds)

      expect(checks.length).toBe(1)
      expect(checks[0].status).toBe('passed')
      expect(checks[0].path).toBe('compliance.min')
      expect(checks[0].type).toBe('compliance')
      expect(checks[0].violation).toBeUndefined()
    })

    it('should fail when compliance below minimum', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 99},
      }
      const checks = validateCompliance(profile, thresholds)

      expect(checks.length).toBe(1)
      expect(checks[0].status).toBe('failed')
      expect(checks[0].violation).toBeDefined()
      expect(checks[0].violation?.type).toBe('below')
      expect(checks[0].violation?.amount).toBeGreaterThan(0)
    })

    it('should pass when compliance under maximum', () => {
      const thresholds: ThresholdValues = {
        compliance: {max: 100},
      }
      const checks = validateCompliance(profile, thresholds)

      expect(checks.length).toBe(1)
      expect(checks[0].status).toBe('passed')
    })

    it('should fail when compliance exceeds maximum', () => {
      const thresholds: ThresholdValues = {
        compliance: {max: 50},
      }
      const checks = validateCompliance(profile, thresholds)

      expect(checks.length).toBe(1)
      expect(checks[0].status).toBe('failed')
      expect(checks[0].violation?.type).toBe('exceeds')
    })

    it('should check both min and max if both specified', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 90, max: 100},
      }
      const checks = validateCompliance(profile, thresholds)

      expect(checks.length).toBe(2)
      expect(checks[0].path).toBe('compliance.min')
      expect(checks[1].path).toBe('compliance.max')
    })
  })

  describe('validateTotalCounts', () => {
    const profile = loadTestProfile('red_hat_good.json')

    it('should return empty array when no total thresholds specified', () => {
      const thresholds: ThresholdValues = {}
      const checks = validateTotalCounts(profile, thresholds)
      expect(checks).toEqual([])
    })

    it('should validate exact match totals (legacy format)', () => {
      // Tests lines 159-177 - exact match validation
      const thresholds: ThresholdValues = {
        passed: {total: 213 as any}, // Legacy format: number instead of {min/max}
      }
      const checks = validateTotalCounts(profile, thresholds)

      const exactCheck = checks.find(c => c.path === 'passed.total')
      expect(exactCheck).toBeDefined()
      expect(exactCheck?.expected.exact).toBe(213)
      expect(exactCheck?.status).toBe('passed')
    })

    it('should fail exact match when count differs', () => {
      const thresholds: ThresholdValues = {
        passed: {total: 999 as any}, // Wrong exact count
      }
      const checks = validateTotalCounts(profile, thresholds)

      const exactCheck = checks.find(c => c.path === 'passed.total')
      expect(exactCheck?.status).toBe('failed')
      expect(exactCheck?.violation?.details).toContain('Expected exactly')
    })

    it('should validate total minimum counts', () => {
      const thresholds: ThresholdValues = {
        passed: {total: {min: 200}},
      }
      const checks = validateTotalCounts(profile, thresholds)

      expect(checks.length).toBeGreaterThan(0)
      const passedCheck = checks.find(c => c.path === 'passed.total.min')
      expect(passedCheck).toBeDefined()
      expect(passedCheck?.status).toBe('passed')
    })

    it('should validate total maximum counts', () => {
      const thresholds: ThresholdValues = {
        failed: {total: {max: 10}},
      }
      const checks = validateTotalCounts(profile, thresholds)

      const failedCheck = checks.find(c => c.path === 'failed.total.max')
      expect(failedCheck).toBeDefined()
    })

    it('should fail when count below minimum', () => {
      const thresholds: ThresholdValues = {
        passed: {total: {min: 1000}}, // Unrealistic minimum
      }
      const checks = validateTotalCounts(profile, thresholds)

      const failedCheck = checks.find(c => c.path === 'passed.total.min')
      expect(failedCheck?.status).toBe('failed')
      expect(failedCheck?.violation?.type).toBe('below')
    })

    it('should fail when count exceeds maximum', () => {
      const thresholds: ThresholdValues = {
        passed: {total: {max: 10}}, // Unrealistic maximum
      }
      const checks = validateTotalCounts(profile, thresholds)

      const failedCheck = checks.find(c => c.path === 'passed.total.max')
      expect(failedCheck?.status).toBe('failed')
      expect(failedCheck?.violation?.type).toBe('exceeds')
    })
  })

  describe('validateSeverityCounts', () => {
    const profile = loadTestProfile('red_hat_good.json')

    it('should return empty array when no severity thresholds specified', () => {
      const thresholds: ThresholdValues = {}
      const checks = validateSeverityCounts(profile, thresholds)
      expect(checks).toEqual([])
    })

    it('should validate critical severity counts', () => {
      const thresholds: ThresholdValues = {
        passed: {critical: {min: 0}},
      }
      const checks = validateSeverityCounts(profile, thresholds)

      const criticalCheck = checks.find(c => c.path === 'passed.critical.min')
      expect(criticalCheck).toBeDefined()
      expect(criticalCheck?.severity).toBe('critical')
    })

    it('should validate high severity counts', () => {
      const thresholds: ThresholdValues = {
        passed: {high: {min: 10}},
      }
      const checks = validateSeverityCounts(profile, thresholds)

      const highCheck = checks.find(c => c.path === 'passed.high.min')
      expect(highCheck).toBeDefined()
      expect(highCheck?.severity).toBe('high')
    })

    it('should validate multiple severities', () => {
      const thresholds: ThresholdValues = {
        passed: {
          critical: {min: 0},
          high: {min: 10},
          medium: {min: 100},
          low: {min: 5},
        },
      }
      const checks = validateSeverityCounts(profile, thresholds)

      expect(checks.length).toBeGreaterThanOrEqual(4)
      expect(checks.some(c => c.severity === 'critical')).toBe(true)
      expect(checks.some(c => c.severity === 'high')).toBe(true)
      expect(checks.some(c => c.severity === 'medium')).toBe(true)
      expect(checks.some(c => c.severity === 'low')).toBe(true)
    })
  })

  describe('validateControlIds', () => {
    const profile = loadTestProfile('red_hat_good.json')

    it('should return empty array when no control IDs specified', () => {
      const thresholds: ThresholdValues = {}
      const checks = validateControlIds(profile, thresholds)
      expect(checks).toEqual([])
    })

    it('should pass when control IDs match exactly', () => {
      // Use the actual control map to get ALL control IDs for this combination
      const controlMap = getControlIdMap(profile)
      const actualHighPassedControls = controlMap.passed?.high?.controls || []

      // If there are no high passed controls, skip this specific check
      if (actualHighPassedControls.length === 0) {
        expect(true).toBe(true) // Test passes trivially
        return
      }

      const thresholds: ThresholdValues = {
        passed: {
          high: {
            controls: actualHighPassedControls,
          },
        },
      }

      const checks = validateControlIds(profile, thresholds)

      const highCheck = checks.find(c => c.path === 'passed.high.controls')
      expect(highCheck).toBeDefined()
      expect(highCheck?.status).toBe('passed')
      expect(highCheck?.violation).toBeUndefined()
    })

    it('should fail when control IDs do not match', () => {
      const thresholds: ThresholdValues = {
        passed: {
          critical: {
            controls: ['V-NONEXISTENT-123', 'V-FAKE-456'],
          },
        },
      }

      const checks = validateControlIds(profile, thresholds)

      const criticalCheck = checks.find(c => c.path === 'passed.critical.controls')
      expect(criticalCheck).toBeDefined()
      expect(criticalCheck?.status).toBe('failed')
      expect(criticalCheck?.violation?.type).toBe('mismatch')
      expect(criticalCheck?.violation?.expected).toBeDefined()
    })
  })

  describe('validateThresholds - Integration', () => {
    const profile = loadTestProfile('red_hat_good.json')

    it('should validate a complete threshold configuration', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 90},
        passed: {
          total: {min: 200},
          high: {min: 10},
        },
        failed: {
          total: {max: 10},
        },
      }

      const result = validateThresholds(profile, thresholds)

      expect(result).toHaveProperty('passed')
      expect(result).toHaveProperty('checks')
      expect(result).toHaveProperty('summary')
      expect(result.checks.length).toBeGreaterThan(0)
    })

    it('should collect ALL checks before returning (not exit on first failure)', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 99}, // Will fail
        passed: {total: {min: 1000}}, // Will fail
        failed: {total: {max: 0}}, // Might fail
      }

      const result = validateThresholds(profile, thresholds)

      // Should have collected multiple checks even though some failed
      expect(result.checks.length).toBeGreaterThan(1)

      // Should have both passing and failing checks
      const failedChecks = result.checks.filter(c => c.status === 'failed')
      expect(failedChecks.length).toBeGreaterThan(0)
    })

    it('should mark overall result as passed when all checks pass', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 90},
        passed: {total: {min: 100}},
      }

      const result = validateThresholds(profile, thresholds)

      expect(result.passed).toBe(true)
      expect(result.summary.failedChecks).toBe(0)
    })

    it('should mark overall result as failed when any check fails', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 99}, // This will fail for red_hat_good
      }

      const result = validateThresholds(profile, thresholds)

      expect(result.passed).toBe(false)
      expect(result.summary.failedChecks).toBeGreaterThan(0)
    })

    it('should calculate correct summary statistics', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 90, max: 100},
        passed: {total: {min: 200}},
        failed: {total: {max: 10}},
      }

      const result = validateThresholds(profile, thresholds)

      expect(result.summary.totalChecks).toBe(result.checks.length)
      expect(result.summary.passedChecks + result.summary.failedChecks).toBe(result.summary.totalChecks)
      expect(result.summary.totalControls).toBeGreaterThan(0)
      expect(result.summary.compliance).toBeDefined()
      expect(result.summary.complianceRequired).toEqual({min: 90, max: 100})
    })

    it('should include severity and statusType in count checks', () => {
      const thresholds: ThresholdValues = {
        passed: {
          critical: {min: 0},
          high: {min: 10},
        },
      }

      const result = validateThresholds(profile, thresholds)

      const criticalCheck = result.checks.find(c => c.path === 'passed.critical.min')
      expect(criticalCheck?.severity).toBe('critical')
      expect(criticalCheck?.statusType).toBe('passed')
    })
  })

  describe('Real-world validation scenarios', () => {
    it('should validate RHEL-8 hardened profile with exact thresholds', () => {
      const profile = loadTestProfile('rhel-8_hardened.json')
      const thresholds: ThresholdValues = {
        compliance: {min: 66, max: 66},
        passed: {
          total: {min: 227},
          critical: {min: 0, max: 0},
          high: {min: 11, max: 11},
          medium: {min: 208, max: 208},
          low: {min: 8, max: 8},
        },
        failed: {
          total: {max: 112},
          critical: {min: 0, max: 0},
          high: {min: 6, max: 6},
          medium: {min: 87, max: 87},
          low: {min: 19, max: 19},
        },
      }

      const result = validateThresholds(profile, thresholds)

      expect(result.passed).toBe(true)
      expect(result.summary.failedChecks).toBe(0)
    })

    it('should collect all failures from triple overlay example', () => {
      const profile = loadTestProfile('triple_overlay_profile_example.json')
      const thresholds: ThresholdValues = {
        compliance: {min: 99}, // Will fail
        passed: {total: {min: 1000}}, // Will fail
        failed: {total: {max: 0}}, // Will fail
      }

      const result = validateThresholds(profile, thresholds)

      // Should have collected ALL failures (not exit on first)
      const failedChecks = result.checks.filter(c => c.status === 'failed')
      expect(failedChecks.length).toBe(3)

      // Each failure should have violation details
      for (const check of failedChecks) {
        expect(check.violation).toBeDefined()
        expect(check.violation?.type).toBeDefined()
        expect(check.violation?.details).toBeDefined()
      }
    })
  })

  describe('Validation with control IDs', () => {
    it('should validate control IDs when specified', () => {
      const profile = loadTestProfile('red_hat_good.json')

      // Get some actual control IDs
      const passedHighControls = profile.contains
        .filter(c => c.extendedBy.length === 0 && c.root.hdf.severity === 'high' && c.root.hdf.status === 'Passed')
        .map(c => c.root.data.id)

      const thresholds: ThresholdValues = {
        passed: {
          high: {
            controls: passedHighControls,
          },
        },
      }

      const result = validateThresholds(profile, thresholds)

      const controlCheck = result.checks.find(c => c.type === 'control_id')
      expect(controlCheck).toBeDefined()
      expect(controlCheck?.path).toBe('passed.high.controls')
    })
  })

  describe('Empty threshold scenarios', () => {
    it('should return empty result for completely empty threshold', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const thresholds: ThresholdValues = {}

      const result = validateThresholds(profile, thresholds)

      expect(result.checks).toEqual([])
      expect(result.passed).toBe(true) // No checks = all pass
      expect(result.summary.totalChecks).toBe(0)
    })
  })

  describe('Summary statistics', () => {
    const profile = loadTestProfile('red_hat_good.json')

    it('should calculate total controls correctly', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 90},
      }

      const result = validateThresholds(profile, thresholds)

      expect(result.summary.totalControls).toBeGreaterThan(0)
      expect(typeof result.summary.totalControls).toBe('number')
    })

    it('should include compliance in summary when checked', () => {
      const thresholds: ThresholdValues = {
        compliance: {min: 90},
      }

      const result = validateThresholds(profile, thresholds)

      expect(result.summary.compliance).toBeDefined()
      expect(result.summary.complianceRequired).toEqual({min: 90})
    })

    it('should not include compliance in summary when not checked', () => {
      const thresholds: ThresholdValues = {
        passed: {total: {min: 100}},
      }

      const result = validateThresholds(profile, thresholds)

      expect(result.summary.compliance).toBeUndefined()
      expect(result.summary.complianceRequired).toBeUndefined()
    })
  })
})
