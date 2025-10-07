import {describe, expect, it} from 'vitest'
import {
  STATUSES,
  SEVERITIES,
  STANDARD_SEVERITIES,
  HDF_STATUS_NAMES,
  THRESHOLD_STATUS_NAMES,
  STATUS_NAME_MAP,
  REVERSE_STATUS_NAME_MAP,
  severityTargetsObject,
  statusSeverityPaths,
  totalMin,
  totalMax,
  emptyStatusAndSeverityCounts,
} from '../../../src/utils/threshold/constants'

describe('Threshold Constants', () => {
  describe('Core Type Arrays', () => {
    it('STATUSES should contain all threshold status types', () => {
      expect(STATUSES).toEqual(['passed', 'failed', 'skipped', 'error', 'no_impact'])
      expect(STATUSES.length).toBe(5)
    })

    it('SEVERITIES should contain all severity levels including special values', () => {
      expect(SEVERITIES).toEqual(['critical', 'high', 'medium', 'low', 'total', 'none'])
      expect(SEVERITIES.length).toBe(6)
    })

    it('STANDARD_SEVERITIES should only include InSpec severity levels', () => {
      expect(STANDARD_SEVERITIES).toEqual(['critical', 'high', 'medium', 'low'])
      expect(STANDARD_SEVERITIES.length).toBe(4)
      expect(STANDARD_SEVERITIES).not.toContain('total')
      expect(STANDARD_SEVERITIES).not.toContain('none')
    })
  })

  describe('Status Name Mappings', () => {
    it('HDF_STATUS_NAMES should have all formal status names', () => {
      expect(HDF_STATUS_NAMES.PASSED).toBe('Passed')
      expect(HDF_STATUS_NAMES.FAILED).toBe('Failed')
      expect(HDF_STATUS_NAMES.NOT_REVIEWED).toBe('Not Reviewed')
      expect(HDF_STATUS_NAMES.NOT_APPLICABLE).toBe('Not Applicable')
      expect(HDF_STATUS_NAMES.PROFILE_ERROR).toBe('Profile Error')
    })

    it('THRESHOLD_STATUS_NAMES should have all simplified status names', () => {
      expect(THRESHOLD_STATUS_NAMES.PASSED).toBe('passed')
      expect(THRESHOLD_STATUS_NAMES.FAILED).toBe('failed')
      expect(THRESHOLD_STATUS_NAMES.SKIPPED).toBe('skipped')
      expect(THRESHOLD_STATUS_NAMES.NO_IMPACT).toBe('no_impact')
      expect(THRESHOLD_STATUS_NAMES.ERROR).toBe('error')
    })

    it('STATUS_NAME_MAP should map threshold names to HDF names', () => {
      expect(STATUS_NAME_MAP.passed).toBe('Passed')
      expect(STATUS_NAME_MAP.failed).toBe('Failed')
      expect(STATUS_NAME_MAP.skipped).toBe('Not Reviewed')
      expect(STATUS_NAME_MAP.no_impact).toBe('Not Applicable')
      expect(STATUS_NAME_MAP.error).toBe('Profile Error')
    })

    it('REVERSE_STATUS_NAME_MAP should map HDF names to threshold names', () => {
      expect(REVERSE_STATUS_NAME_MAP['Passed']).toBe('passed')
      expect(REVERSE_STATUS_NAME_MAP['Failed']).toBe('failed')
      expect(REVERSE_STATUS_NAME_MAP['Not Reviewed']).toBe('skipped')
      expect(REVERSE_STATUS_NAME_MAP['Not Applicable']).toBe('no_impact')
      expect(REVERSE_STATUS_NAME_MAP['Profile Error']).toBe('error')
    })

    it('STATUS_NAME_MAP and REVERSE_STATUS_NAME_MAP should be inverses', () => {
      for (const [thresholdStatus, hdfStatus] of Object.entries(STATUS_NAME_MAP)) {
        expect(REVERSE_STATUS_NAME_MAP[hdfStatus]).toBe(thresholdStatus)
      }
    })
  })

  describe('severityTargetsObject - Generated Paths', () => {
    it('should generate paths for all standard severities', () => {
      expect(severityTargetsObject).toHaveProperty('critical')
      expect(severityTargetsObject).toHaveProperty('high')
      expect(severityTargetsObject).toHaveProperty('medium')
      expect(severityTargetsObject).toHaveProperty('low')
      expect(severityTargetsObject).toHaveProperty('none')
    })

    it('should generate correct paths for critical severity', () => {
      expect(severityTargetsObject.critical).toContain('passed.critical.min')
      expect(severityTargetsObject.critical).toContain('passed.critical.max')
      expect(severityTargetsObject.critical).toContain('failed.critical.min')
      expect(severityTargetsObject.critical).toContain('failed.critical.max')
      expect(severityTargetsObject.critical).toContain('skipped.critical.min')
      expect(severityTargetsObject.critical).toContain('skipped.critical.max')
      expect(severityTargetsObject.critical).toContain('error.critical.min')
      expect(severityTargetsObject.critical).toContain('error.critical.max')
      expect(severityTargetsObject.critical).toContain('no_impact.critical.min')
      expect(severityTargetsObject.critical).toContain('no_impact.critical.max')

      // Should have exactly 10 paths (5 statuses × 2 types)
      expect(severityTargetsObject.critical.length).toBe(10)
    })

    it('should generate correct paths for high severity', () => {
      expect(severityTargetsObject.high).toContain('passed.high.min')
      expect(severityTargetsObject.high).toContain('failed.high.max')
      expect(severityTargetsObject.high.length).toBe(10)
    })

    it('should generate correct paths for medium severity', () => {
      expect(severityTargetsObject.medium).toContain('passed.medium.min')
      expect(severityTargetsObject.medium).toContain('failed.medium.max')
      expect(severityTargetsObject.medium.length).toBe(10)
    })

    it('should generate correct paths for low severity', () => {
      expect(severityTargetsObject.low).toContain('passed.low.min')
      expect(severityTargetsObject.low).toContain('failed.low.max')
      expect(severityTargetsObject.low.length).toBe(10)
    })

    it('should generate correct paths for none severity (no_impact only)', () => {
      expect(severityTargetsObject.none).toEqual(['no_impact.none.min', 'no_impact.none.max'])
      expect(severityTargetsObject.none.length).toBe(2)
    })

    it('should have no duplicate paths across all severities', () => {
      const allPaths = Object.values(severityTargetsObject).flat()
      const uniquePaths = new Set(allPaths)
      expect(allPaths.length).toBe(uniquePaths.size)
    })

    it('all paths should follow correct format: status.severity.type', () => {
      const allPaths = Object.values(severityTargetsObject).flat()
      const pathRegex = /^(passed|failed|skipped|error|no_impact)\.(critical|high|medium|low|none)\.(min|max)$/

      for (const path of allPaths) {
        expect(path).toMatch(pathRegex)
      }
    })
  })

  describe('statusSeverityPaths - Generated Control ID Paths', () => {
    it('should generate control paths for all standard severities', () => {
      expect(statusSeverityPaths).toHaveProperty('critical')
      expect(statusSeverityPaths).toHaveProperty('high')
      expect(statusSeverityPaths).toHaveProperty('medium')
      expect(statusSeverityPaths).toHaveProperty('low')
      expect(statusSeverityPaths).toHaveProperty('none')
    })

    it('should generate correct control paths for critical severity', () => {
      expect(statusSeverityPaths.critical).toContain('passed.critical.controls')
      expect(statusSeverityPaths.critical).toContain('failed.critical.controls')
      expect(statusSeverityPaths.critical).toContain('skipped.critical.controls')
      expect(statusSeverityPaths.critical).toContain('error.critical.controls')
      expect(statusSeverityPaths.critical).toContain('no_impact.critical.controls')

      // Should have exactly 5 paths (5 statuses)
      expect(statusSeverityPaths.critical.length).toBe(5)
    })

    it('should generate correct control paths for none severity', () => {
      expect(statusSeverityPaths.none).toEqual(['no_impact.none.controls'])
      expect(statusSeverityPaths.none.length).toBe(1)
    })

    it('should have no duplicate paths across all severities', () => {
      const allPaths = Object.values(statusSeverityPaths).flat()
      const uniquePaths = new Set(allPaths)
      expect(allPaths.length).toBe(uniquePaths.size)
    })

    it('all paths should follow correct format: status.severity.controls', () => {
      const allPaths = Object.values(statusSeverityPaths).flat()
      const pathRegex = /^(passed|failed|skipped|error|no_impact)\.(critical|high|medium|low|none)\.controls$/

      for (const path of allPaths) {
        expect(path).toMatch(pathRegex)
      }
    })
  })

  describe('totalMin - Generated Total Minimum Paths', () => {
    it('should contain paths for all applicable statuses', () => {
      expect(totalMin).toContain('passed.total.min')
      expect(totalMin).toContain('failed.total.min')
      expect(totalMin).toContain('skipped.total.min')
      expect(totalMin).toContain('error.total.min')
    })

    it('should have exactly 4 paths', () => {
      expect(totalMin.length).toBe(4)
    })

    it('should not include no_impact.total.min', () => {
      expect(totalMin).not.toContain('no_impact.total.min')
    })

    it('all paths should end with .total.min', () => {
      for (const path of totalMin) {
        expect(path).toMatch(/\.total\.min$/)
      }
    })
  })

  describe('totalMax - Generated Total Maximum Paths', () => {
    it('should contain paths for all applicable statuses', () => {
      expect(totalMax).toContain('passed.total.max')
      expect(totalMax).toContain('failed.total.max')
      expect(totalMax).toContain('skipped.total.max')
      expect(totalMax).toContain('error.total.max')
    })

    it('should have exactly 4 paths', () => {
      expect(totalMax.length).toBe(4)
    })

    it('should not include no_impact.total.max', () => {
      expect(totalMax).not.toContain('no_impact.total.max')
    })

    it('all paths should end with .total.max', () => {
      for (const path of totalMax) {
        expect(path).toMatch(/\.total\.max$/)
      }
    })
  })

  describe('emptyStatusAndSeverityCounts', () => {
    it('should have all status types', () => {
      expect(emptyStatusAndSeverityCounts).toHaveProperty('passed')
      expect(emptyStatusAndSeverityCounts).toHaveProperty('failed')
      expect(emptyStatusAndSeverityCounts).toHaveProperty('skipped')
      expect(emptyStatusAndSeverityCounts).toHaveProperty('no_impact')
      expect(emptyStatusAndSeverityCounts).toHaveProperty('error')
    })

    it('should have severity arrays for each status', () => {
      expect(emptyStatusAndSeverityCounts.passed).toHaveProperty('critical')
      expect(emptyStatusAndSeverityCounts.passed).toHaveProperty('high')
      expect(emptyStatusAndSeverityCounts.passed).toHaveProperty('medium')
      expect(emptyStatusAndSeverityCounts.passed).toHaveProperty('low')
    })

    it('should have none severity only for no_impact', () => {
      expect(emptyStatusAndSeverityCounts.no_impact).toHaveProperty('none')
      expect(emptyStatusAndSeverityCounts.passed).not.toHaveProperty('none')
      expect(emptyStatusAndSeverityCounts.failed).not.toHaveProperty('none')
    })

    it('all severity arrays should be empty', () => {
      expect(emptyStatusAndSeverityCounts.passed.critical).toEqual([])
      expect(emptyStatusAndSeverityCounts.failed.high).toEqual([])
      expect(emptyStatusAndSeverityCounts.no_impact.none).toEqual([])
    })
  })

  describe('Backward Compatibility Verification', () => {
    it('severityTargetsObject should have same structure as original', () => {
      // Verify it has the expected severity keys
      const expectedSeverities = ['critical', 'high', 'medium', 'low', 'none']
      expect(Object.keys(severityTargetsObject).sort()).toEqual(expectedSeverities.sort())
    })

    it('should generate same total number of paths as original implementation', () => {
      // Original had: 4 severities × 10 paths + 1 none × 2 paths = 42 total
      const totalPaths = Object.values(severityTargetsObject).flat()
      expect(totalPaths.length).toBe(42)
    })

    it('statusSeverityPaths should have same structure as original', () => {
      const expectedSeverities = ['critical', 'high', 'medium', 'low', 'none']
      expect(Object.keys(statusSeverityPaths).sort()).toEqual(expectedSeverities.sort())
    })

    it('should generate same total number of control paths as original', () => {
      // Original had: 4 severities × 5 paths + 1 none × 1 path = 21 total
      const totalPaths = Object.values(statusSeverityPaths).flat()
      expect(totalPaths.length).toBe(21)
    })

    it('totalMin should match original implementation', () => {
      expect(totalMin).toEqual([
        'passed.total.min',
        'failed.total.min',
        'skipped.total.min',
        'error.total.min',
      ])
    })

    it('totalMax should match original implementation', () => {
      expect(totalMax).toEqual([
        'passed.total.max',
        'failed.total.max',
        'skipped.total.max',
        'error.total.max',
      ])
    })
  })

  describe('Path Format Validation', () => {
    it('no paths should have trailing or leading whitespace', () => {
      const allPaths = [
        ...Object.values(severityTargetsObject).flat(),
        ...Object.values(statusSeverityPaths).flat(),
        ...totalMin,
        ...totalMax,
      ]

      for (const path of allPaths) {
        expect(path).toBe(path.trim())
        expect(path).not.toMatch(/\s/)
      }
    })

    it('all threshold type paths should use only min or max', () => {
      const allThresholdPaths = [
        ...Object.values(severityTargetsObject).flat(),
        ...totalMin,
        ...totalMax,
      ]

      for (const path of allThresholdPaths) {
        expect(path).toMatch(/\.(min|max)$/)
      }
    })

    it('all control paths should end with .controls', () => {
      const allControlPaths = Object.values(statusSeverityPaths).flat()

      for (const path of allControlPaths) {
        expect(path).toMatch(/\.controls$/)
      }
    })
  })

  describe('Consistency Checks', () => {
    it('severityTargetsObject and statusSeverityPaths should have same severity keys', () => {
      const targetKeys = Object.keys(severityTargetsObject).sort()
      const pathKeys = Object.keys(statusSeverityPaths).sort()
      expect(targetKeys).toEqual(pathKeys)
    })

    it('each status should appear in both min and max for each severity', () => {
      for (const severity of STANDARD_SEVERITIES) {
        const paths = severityTargetsObject[severity]
        for (const status of STATUSES) {
          const minPath = `${status}.${severity}.min`
          const maxPath = `${status}.${severity}.max`
          expect(paths).toContain(minPath)
          expect(paths).toContain(maxPath)
        }
      }
    })

    it('none severity should only have no_impact status', () => {
      const nonePaths = severityTargetsObject.none
      expect(nonePaths.every(path => path.startsWith('no_impact.'))).toBe(true)
      expect(nonePaths.length).toBe(2)
    })
  })
})
