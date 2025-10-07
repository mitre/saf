import {describe, expect, it} from 'vitest'
import {
  isValidStatus,
  isValidSeverity,
  isValidThresholdType,
  isThresholdKey,
  isControlIdKey,
  isValidThresholdCount,
  isValidCompliancePercentage,
} from '../../../src/utils/threshold/type-guards'

describe('Type Guard Functions', () => {
  describe('isValidStatus', () => {
    it('should return true for all valid threshold statuses', () => {
      expect(isValidStatus('passed')).toBe(true)
      expect(isValidStatus('failed')).toBe(true)
      expect(isValidStatus('skipped')).toBe(true)
      expect(isValidStatus('error')).toBe(true)
      expect(isValidStatus('no_impact')).toBe(true)
    })

    it('should return false for invalid statuses', () => {
      expect(isValidStatus('invalid')).toBe(false)
      expect(isValidStatus('Passed')).toBe(false) // HDF format, not threshold format
      expect(isValidStatus('PASSED')).toBe(false)
      expect(isValidStatus('')).toBe(false)
      expect(isValidStatus('pass')).toBe(false)
    })

    it('should return false for non-string types', () => {
      expect(isValidStatus(123 as any)).toBe(false)
      expect(isValidStatus(null as any)).toBe(false)
      expect(isValidStatus(undefined as any)).toBe(false)
      expect(isValidStatus({} as any)).toBe(false)
    })
  })

  describe('isValidSeverity', () => {
    it('should return true for standard InSpec severities', () => {
      expect(isValidSeverity('critical')).toBe(true)
      expect(isValidSeverity('high')).toBe(true)
      expect(isValidSeverity('medium')).toBe(true)
      expect(isValidSeverity('low')).toBe(true)
    })

    it('should return true for special severity values', () => {
      expect(isValidSeverity('total')).toBe(true)
      expect(isValidSeverity('none')).toBe(true)
    })

    it('should return false for invalid severities', () => {
      expect(isValidSeverity('invalid')).toBe(false)
      expect(isValidSeverity('Critical')).toBe(false)
      expect(isValidSeverity('HIGH')).toBe(false)
      expect(isValidSeverity('')).toBe(false)
      expect(isValidSeverity('info')).toBe(false)
    })

    it('should return false for non-string types', () => {
      expect(isValidSeverity(123 as any)).toBe(false)
      expect(isValidSeverity(null as any)).toBe(false)
      expect(isValidSeverity(undefined as any)).toBe(false)
    })
  })

  describe('isValidThresholdType', () => {
    it('should return true for min and max', () => {
      expect(isValidThresholdType('min')).toBe(true)
      expect(isValidThresholdType('max')).toBe(true)
    })

    it('should return false for invalid threshold types', () => {
      expect(isValidThresholdType('minimum')).toBe(false)
      expect(isValidThresholdType('maximum')).toBe(false)
      expect(isValidThresholdType('MIN')).toBe(false)
      expect(isValidThresholdType('exact')).toBe(false)
      expect(isValidThresholdType('')).toBe(false)
    })

    it('should return false for non-string types', () => {
      expect(isValidThresholdType(123 as any)).toBe(false)
      expect(isValidThresholdType(null as any)).toBe(false)
    })
  })

  describe('isThresholdKey', () => {
    describe('Two-part keys (compliance)', () => {
      it('should return true for valid compliance keys', () => {
        expect(isThresholdKey('compliance.min')).toBe(true)
        expect(isThresholdKey('compliance.max')).toBe(true)
      })

      it('should return false for invalid compliance keys', () => {
        expect(isThresholdKey('compliance.minimum')).toBe(false)
        expect(isThresholdKey('compliance.invalid')).toBe(false)
        expect(isThresholdKey('compliances.min')).toBe(false)
      })
    })

    describe('Three-part keys (status.severity.type)', () => {
      it('should return true for valid status.severity.type combinations', () => {
        expect(isThresholdKey('passed.critical.min')).toBe(true)
        expect(isThresholdKey('failed.high.max')).toBe(true)
        expect(isThresholdKey('skipped.medium.min')).toBe(true)
        expect(isThresholdKey('error.low.max')).toBe(true)
        expect(isThresholdKey('no_impact.none.min')).toBe(true)
        expect(isThresholdKey('passed.total.min')).toBe(true)
      })

      it('should return false for invalid status in key', () => {
        expect(isThresholdKey('invalid.critical.min')).toBe(false)
        expect(isThresholdKey('Passed.critical.min')).toBe(false)
      })

      it('should return false for invalid severity in key', () => {
        expect(isThresholdKey('passed.invalid.min')).toBe(false)
        expect(isThresholdKey('passed.Critical.min')).toBe(false)
      })

      it('should return false for invalid type in key', () => {
        expect(isThresholdKey('passed.critical.minimum')).toBe(false)
        expect(isThresholdKey('passed.critical.exact')).toBe(false)
      })
    })

    describe('Invalid key formats', () => {
      it('should return false for single-part keys', () => {
        expect(isThresholdKey('passed')).toBe(false)
        expect(isThresholdKey('compliance')).toBe(false)
      })

      it('should return false for four-part keys', () => {
        expect(isThresholdKey('passed.critical.min.extra')).toBe(false)
      })

      it('should return false for empty or malformed keys', () => {
        expect(isThresholdKey('')).toBe(false)
        expect(isThresholdKey('.')).toBe(false)
        expect(isThresholdKey('..')).toBe(false)
        expect(isThresholdKey('a.')).toBe(false)
        expect(isThresholdKey('.b')).toBe(false)
      })
    })

    describe('Real-world threshold keys', () => {
      it('should validate all common threshold patterns', () => {
        const validKeys = [
          'compliance.min',
          'compliance.max',
          'passed.total.min',
          'failed.total.max',
          'passed.critical.min',
          'failed.high.max',
          'skipped.medium.max',
          'error.low.max',
          'no_impact.none.min',
        ]

        for (const key of validKeys) {
          expect(isThresholdKey(key)).toBe(true)
        }
      })
    })
  })

  describe('isControlIdKey', () => {
    it('should return true for valid control ID keys', () => {
      expect(isControlIdKey('passed.critical.controls')).toBe(true)
      expect(isControlIdKey('failed.high.controls')).toBe(true)
      expect(isControlIdKey('skipped.medium.controls')).toBe(true)
      expect(isControlIdKey('error.low.controls')).toBe(true)
      expect(isControlIdKey('no_impact.none.controls')).toBe(true)
    })

    it('should return false for keys ending in min/max instead of controls', () => {
      expect(isControlIdKey('passed.critical.min')).toBe(false)
      expect(isControlIdKey('failed.high.max')).toBe(false)
    })

    it('should return false for invalid status or severity', () => {
      expect(isControlIdKey('invalid.critical.controls')).toBe(false)
      expect(isControlIdKey('passed.invalid.controls')).toBe(false)
    })

    it('should return false for wrong number of parts', () => {
      expect(isControlIdKey('controls')).toBe(false)
      expect(isControlIdKey('passed.controls')).toBe(false)
      expect(isControlIdKey('passed.critical.high.controls')).toBe(false)
    })

    it('should return false for wrong suffix', () => {
      expect(isControlIdKey('passed.critical.control')).toBe(false)
      expect(isControlIdKey('passed.critical.ids')).toBe(false)
    })
  })

  describe('isValidThresholdCount', () => {
    it('should return true for valid non-negative numbers', () => {
      expect(isValidThresholdCount(0)).toBe(true)
      expect(isValidThresholdCount(1)).toBe(true)
      expect(isValidThresholdCount(100)).toBe(true)
      expect(isValidThresholdCount(1000000)).toBe(true)
    })

    it('should return false for negative numbers', () => {
      expect(isValidThresholdCount(-1)).toBe(false)
      expect(isValidThresholdCount(-100)).toBe(false)
    })

    it('should return false for non-finite numbers', () => {
      expect(isValidThresholdCount(Infinity)).toBe(false)
      expect(isValidThresholdCount(-Infinity)).toBe(false)
      expect(isValidThresholdCount(NaN)).toBe(false)
    })

    it('should return false for non-number types', () => {
      expect(isValidThresholdCount('10')).toBe(false)
      expect(isValidThresholdCount(null)).toBe(false)
      expect(isValidThresholdCount(undefined)).toBe(false)
      expect(isValidThresholdCount({})).toBe(false)
      expect(isValidThresholdCount([])).toBe(false)
    })

    it('should accept decimal numbers', () => {
      expect(isValidThresholdCount(10.5)).toBe(true)
      expect(isValidThresholdCount(0.1)).toBe(true)
    })
  })

  describe('isValidCompliancePercentage', () => {
    it('should return true for valid percentages (0-100)', () => {
      expect(isValidCompliancePercentage(0)).toBe(true)
      expect(isValidCompliancePercentage(50)).toBe(true)
      expect(isValidCompliancePercentage(66)).toBe(true)
      expect(isValidCompliancePercentage(100)).toBe(true)
    })

    it('should return true for decimal percentages', () => {
      expect(isValidCompliancePercentage(66.5)).toBe(true)
      expect(isValidCompliancePercentage(99.9)).toBe(true)
    })

    it('should return false for values above 100', () => {
      expect(isValidCompliancePercentage(101)).toBe(false)
      expect(isValidCompliancePercentage(200)).toBe(false)
    })

    it('should return false for negative values', () => {
      expect(isValidCompliancePercentage(-1)).toBe(false)
      expect(isValidCompliancePercentage(-50)).toBe(false)
    })

    it('should return false for non-finite numbers', () => {
      expect(isValidCompliancePercentage(Infinity)).toBe(false)
      expect(isValidCompliancePercentage(-Infinity)).toBe(false)
      expect(isValidCompliancePercentage(NaN)).toBe(false)
    })

    it('should return false for non-number types', () => {
      expect(isValidCompliancePercentage('66')).toBe(false)
      expect(isValidCompliancePercentage(null)).toBe(false)
      expect(isValidCompliancePercentage(undefined)).toBe(false)
    })
  })

  describe('Type Guard Integration', () => {
    it('type guards should work together to validate complex keys', () => {
      const key = 'passed.critical.min'
      const [status, severity, type] = key.split('.')

      expect(isValidStatus(status)).toBe(true)
      expect(isValidSeverity(severity)).toBe(true)
      expect(isValidThresholdType(type)).toBe(true)
      expect(isThresholdKey(key)).toBe(true)
    })

    it('should reject keys with any invalid component', () => {
      const invalidKeys = [
        'invalid.critical.min',  // bad status
        'passed.invalid.min',    // bad severity
        'passed.critical.invalid', // bad type
      ]

      for (const key of invalidKeys) {
        expect(isThresholdKey(key)).toBe(false)
      }
    })
  })
})
