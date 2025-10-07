import {describe, expect, it} from 'vitest'
import {flattenProfileSummary, unflattenThreshold} from '../../../src/utils/threshold/formatters.js'
import {ThresholdValidationError, VALIDATION_ERROR_CODES} from '../../../src/types/threshold-validation.js'
import type {FlattenedThreshold, ProfileSummary} from '../../../src/types/threshold.js'

describe('Threshold Formatters', () => {
  describe('flattenProfileSummary', () => {
    it('should flatten nested profile summary to dot notation', () => {
      const summary: ProfileSummary = {
        passed: {critical: 0, high: 11, medium: 208, low: 8, total: 227},
        failed: {critical: 0, high: 6, medium: 87, low: 19, total: 112},
      }
      const result = flattenProfileSummary(summary)

      expect(result['passed.critical']).toBe(0)
      expect(result['passed.high']).toBe(11)
      expect(result['passed.total']).toBe(227)
      expect(result['failed.critical']).toBe(0)
      expect(result['failed.total']).toBe(112)
    })

    it('should handle all status types', () => {
      const summary: ProfileSummary = {
        passed: {total: 100},
        failed: {total: 10},
        skipped: {total: 5},
        error: {total: 0},
        no_impact: {total: 20, none: 15},
      }
      const result = flattenProfileSummary(summary)

      expect(result['passed.total']).toBe(100)
      expect(result['failed.total']).toBe(10)
      expect(result['skipped.total']).toBe(5)
      expect(result['error.total']).toBe(0)
      expect(result['no_impact.total']).toBe(20)
      expect(result['no_impact.none']).toBe(15)
    })

    it('should return empty object for empty input', () => {
      const result = flattenProfileSummary({})
      expect(result).toEqual({})
    })
  })

  describe('unflattenThreshold - Valid Inputs', () => {
    it('should convert flattened compliance threshold', () => {
      const flattened: FlattenedThreshold = {'compliance.min': 80, 'compliance.max': 90}
      const result = unflattenThreshold(flattened)

      expect(result.compliance).toBeDefined()
      expect(result.compliance?.min).toBe(80)
      expect(result.compliance?.max).toBe(90)
    })

    it('should convert three-part keys for status.severity.type', () => {
      const flattened: FlattenedThreshold = {
        'passed.critical.min': 5,
        'passed.high.min': 10,
        'failed.high.max': 3,
        'failed.medium.max': 15,
      }
      const result = unflattenThreshold(flattened)

      expect(result.passed?.critical?.min).toBe(5)
      expect(result.passed?.high?.min).toBe(10)
      expect(result.failed?.high?.max).toBe(3)
      expect(result.failed?.medium?.max).toBe(15)
    })

    it('should handle all status types correctly', () => {
      const flattened: FlattenedThreshold = {
        'passed.total.min': 100,
        'failed.total.max': 10,
        'skipped.total.max': 5,
        'error.total.max': 0,
        'no_impact.total.max': 20,
      }
      const result = unflattenThreshold(flattened)

      expect(result.passed?.total?.min).toBe(100)
      expect(result.failed?.total?.max).toBe(10)
      expect(result.skipped?.total?.max).toBe(5)
      expect(result.error?.total?.max).toBe(0)
      expect(result.no_impact?.total?.max).toBe(20)
    })

    it('should handle no_impact.none correctly', () => {
      const flattened: FlattenedThreshold = {
        'no_impact.none.min': 0,
        'no_impact.none.max': 50,
      }
      const result = unflattenThreshold(flattened)

      expect(result.no_impact?.none?.min).toBe(0)
      expect(result.no_impact?.none?.max).toBe(50)
    })

    it('should return empty object for empty input', () => {
      const result = unflattenThreshold({})
      expect(result).toEqual({})
    })
  })

  describe('unflattenThreshold - Input Validation', () => {
    describe('Type validation', () => {
      it('should throw error for null input', () => {
        expect(() => unflattenThreshold(null as any))
          .toThrow(ThresholdValidationError)

        try {
          unflattenThreshold(null as any)
        } catch (error) {
          expect(error).toBeInstanceOf(ThresholdValidationError)
          expect((error as ThresholdValidationError).code).toBe(VALIDATION_ERROR_CODES.INVALID_THRESHOLD_FORMAT)
        }
      })

      it('should throw error for array input', () => {
        expect(() => unflattenThreshold([] as any))
          .toThrow(ThresholdValidationError)
      })

      it('should throw error for non-object input', () => {
        expect(() => unflattenThreshold('string' as any))
          .toThrow(ThresholdValidationError)

        expect(() => unflattenThreshold(123 as any))
          .toThrow(ThresholdValidationError)

        expect(() => unflattenThreshold(undefined as any))
          .toThrow(ThresholdValidationError)
      })
    })

    describe('Key format validation', () => {
      it('should throw error for invalid key format', () => {
        const invalid: FlattenedThreshold = {'invalid.key': 10}

        expect(() => unflattenThreshold(invalid))
          .toThrow(ThresholdValidationError)

        try {
          unflattenThreshold(invalid)
        } catch (error) {
          expect(error).toBeInstanceOf(ThresholdValidationError)
          expect((error as ThresholdValidationError).code).toBe(VALIDATION_ERROR_CODES.INVALID_KEY_FORMAT)
          expect((error as ThresholdValidationError).message).toContain('invalid.key')
        }
      })

      it('should throw error for single-part key', () => {
        const invalid: FlattenedThreshold = {passed: 10}
        expect(() => unflattenThreshold(invalid)).toThrow(ThresholdValidationError)
      })

      it('should throw error for four-part key', () => {
        const invalid: FlattenedThreshold = {'passed.critical.min.extra': 10}
        expect(() => unflattenThreshold(invalid)).toThrow(ThresholdValidationError)
      })

      it('should throw error for invalid status name', () => {
        const invalid: FlattenedThreshold = {'invalidstatus.critical.min': 10}
        expect(() => unflattenThreshold(invalid)).toThrow(ThresholdValidationError)
      })

      it('should throw error for invalid severity name', () => {
        const invalid: FlattenedThreshold = {'passed.invalidseverity.min': 10}
        expect(() => unflattenThreshold(invalid)).toThrow(ThresholdValidationError)
      })

      it('should throw error for invalid type (not min/max)', () => {
        const invalid: FlattenedThreshold = {'passed.critical.exact': 10}
        expect(() => unflattenThreshold(invalid)).toThrow(ThresholdValidationError)
      })
    })

    describe('Value validation', () => {
      it('should throw error for non-number value', () => {
        const invalid: any = {'passed.critical.min': 'ten'}

        expect(() => unflattenThreshold(invalid))
          .toThrow(ThresholdValidationError)

        try {
          unflattenThreshold(invalid)
        } catch (error) {
          expect(error).toBeInstanceOf(ThresholdValidationError)
          expect((error as ThresholdValidationError).code).toBe(VALIDATION_ERROR_CODES.INVALID_THRESHOLD_VALUE)
        }
      })

      it('should throw error for negative value', () => {
        const invalid: FlattenedThreshold = {'passed.critical.min': -5}

        expect(() => unflattenThreshold(invalid))
          .toThrow(ThresholdValidationError)

        try {
          unflattenThreshold(invalid)
        } catch (error) {
          expect(error).toBeInstanceOf(ThresholdValidationError)
          expect((error as ThresholdValidationError).code).toBe(VALIDATION_ERROR_CODES.NEGATIVE_VALUE)
        }
      })

      it('should throw error for Infinity', () => {
        const invalid: FlattenedThreshold = {'passed.critical.min': Infinity}

        expect(() => unflattenThreshold(invalid))
          .toThrow(ThresholdValidationError)

        try {
          unflattenThreshold(invalid)
        } catch (error) {
          expect((error as ThresholdValidationError).code).toBe(VALIDATION_ERROR_CODES.NON_FINITE_VALUE)
        }
      })

      it('should throw error for NaN', () => {
        const invalid: FlattenedThreshold = {'passed.critical.min': Number.NaN}

        expect(() => unflattenThreshold(invalid))
          .toThrow(ThresholdValidationError)
      })
    })

    describe('Compliance percentage validation', () => {
      it('should accept valid compliance percentages (0-100)', () => {
        const valid: FlattenedThreshold = {
          'compliance.min': 0,
          'compliance.max': 100,
        }
        const result = unflattenThreshold(valid)

        expect(result.compliance?.min).toBe(0)
        expect(result.compliance?.max).toBe(100)
      })

      it('should accept decimal compliance percentages', () => {
        const valid: FlattenedThreshold = {'compliance.min': 66.5}
        const result = unflattenThreshold(valid)

        expect(result.compliance?.min).toBe(66.5)
      })

      it('should throw error for compliance > 100', () => {
        const invalid: FlattenedThreshold = {'compliance.min': 101}

        expect(() => unflattenThreshold(invalid))
          .toThrow(ThresholdValidationError)

        try {
          unflattenThreshold(invalid)
        } catch (error) {
          expect((error as ThresholdValidationError).code).toBe(VALIDATION_ERROR_CODES.INVALID_PERCENTAGE)
          expect((error as ThresholdValidationError).message).toContain('0-100')
        }
      })

      it('should throw error for compliance < 0 (caught by negative check)', () => {
        const invalid: FlattenedThreshold = {'compliance.min': -1}

        expect(() => unflattenThreshold(invalid))
          .toThrow(ThresholdValidationError)
      })
    })

    describe('Error details', () => {
      it('should include helpful error details for invalid keys', () => {
        const invalid: FlattenedThreshold = {'bad.key': 10}

        try {
          unflattenThreshold(invalid)
        } catch (error) {
          const validationError = error as ThresholdValidationError
          expect(validationError.message).toContain('bad.key')
          expect(validationError.message).toContain('Expected format')
          expect(validationError.details).toBeDefined()
        }
      })

      it('should include value information in error details', () => {
        const invalid: FlattenedThreshold = {'passed.critical.min': -10}

        try {
          unflattenThreshold(invalid)
        } catch (error) {
          const validationError = error as ThresholdValidationError
          expect(validationError.details).toHaveProperty('key')
          expect(validationError.details).toHaveProperty('value')
        }
      })
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle complex threshold with all features', () => {
      const flattened: FlattenedThreshold = {
        'compliance.min': 66,
        'passed.critical.min': 0,
        'passed.high.min': 11,
        'passed.medium.min': 208,
        'passed.low.min': 8,
        'passed.total.min': 227,
        'failed.critical.max': 0,
        'failed.high.max': 6,
        'failed.medium.max': 87,
        'failed.low.max': 19,
        'failed.total.max': 112,
        'skipped.total.max': 3,
        'error.total.max': 0,
        'no_impact.high.max': 3,
        'no_impact.medium.max': 30,
        'no_impact.none.max': 0,
        'no_impact.total.max': 33,
      }

      // Should not throw
      const result = unflattenThreshold(flattened)

      expect(result.compliance?.min).toBe(66)
      expect(result.passed?.total?.min).toBe(227)
      expect(result.failed?.total?.max).toBe(112)
      expect(result.no_impact?.none?.max).toBe(0)
    })

    it('should validate and reject mixed valid/invalid keys', () => {
      const mixed: FlattenedThreshold = {
        'compliance.min': 66,
        'passed.critical.min': 10,
        'invalid.key': 5, // This should cause failure
      }

      expect(() => unflattenThreshold(mixed))
        .toThrow(ThresholdValidationError)
    })
  })
})
