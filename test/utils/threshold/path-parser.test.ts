import {describe, expect, it} from 'vitest'
import {parseThresholdPath} from '../../../src/utils/threshold/path-parser.js'
import {ThresholdValidationError} from '../../../src/types/threshold-validation.js'

describe('parseThresholdPath', () => {
  describe('2-part paths - compliance', () => {
    it('should parse compliance.min', () => {
      const result = parseThresholdPath('compliance.min')
      expect(result.statusName).toBe('passed')
      expect(result.type).toBe('min')
      expect(result.severity).toBeUndefined()
    })

    it('should parse compliance.max', () => {
      const result = parseThresholdPath('compliance.max')
      expect(result.statusName).toBe('passed')
      expect(result.type).toBe('max')
      expect(result.severity).toBeUndefined()
    })

    it('should throw error for invalid compliance type', () => {
      expect(() => parseThresholdPath('compliance.invalid')).toThrow(ThresholdValidationError)
      expect(() => parseThresholdPath('compliance.invalid')).toThrow('Invalid compliance threshold type')
    })
  })

  describe('2-part paths - status.total', () => {
    it('should parse passed.total', () => {
      const result = parseThresholdPath('passed.total')
      expect(result.statusName).toBe('passed')
      expect(result.severity).toBe('total')
      expect(result.type).toBeUndefined()
    })

    it('should parse failed.total', () => {
      const result = parseThresholdPath('failed.total')
      expect(result.statusName).toBe('failed')
      expect(result.severity).toBe('total')
      expect(result.type).toBeUndefined()
    })

    it('should parse skipped.total', () => {
      const result = parseThresholdPath('skipped.total')
      expect(result.statusName).toBe('skipped')
      expect(result.severity).toBe('total')
      expect(result.type).toBeUndefined()
    })

    it('should parse error.total', () => {
      const result = parseThresholdPath('error.total')
      expect(result.statusName).toBe('error')
      expect(result.severity).toBe('total')
      expect(result.type).toBeUndefined()
    })

    it('should parse no_impact.total', () => {
      const result = parseThresholdPath('no_impact.total')
      expect(result.statusName).toBe('no_impact')
      expect(result.severity).toBe('total')
      expect(result.type).toBeUndefined()
    })

    it('should throw error for invalid status name', () => {
      expect(() => parseThresholdPath('invalid.total')).toThrow(ThresholdValidationError)
      expect(() => parseThresholdPath('invalid.total')).toThrow('Invalid status name')
    })
  })

  describe('3-part paths - status.severity.type', () => {
    it('should parse passed.critical.min', () => {
      const result = parseThresholdPath('passed.critical.min')
      expect(result.statusName).toBe('passed')
      expect(result.severity).toBe('critical')
      expect(result.type).toBe('min')
    })

    it('should parse failed.high.max', () => {
      const result = parseThresholdPath('failed.high.max')
      expect(result.statusName).toBe('failed')
      expect(result.severity).toBe('high')
      expect(result.type).toBe('max')
    })

    it('should parse skipped.medium.controls', () => {
      const result = parseThresholdPath('skipped.medium.controls')
      expect(result.statusName).toBe('skipped')
      expect(result.severity).toBe('medium')
      expect(result.type).toBe('controls')
    })

    it('should parse no_impact.none.max', () => {
      const result = parseThresholdPath('no_impact.none.max')
      expect(result.statusName).toBe('no_impact')
      expect(result.severity).toBe('none')
      expect(result.type).toBe('max')
    })

    it('should throw error for invalid status in 3-part path', () => {
      expect(() => parseThresholdPath('invalid.critical.min')).toThrow(ThresholdValidationError)
      expect(() => parseThresholdPath('invalid.critical.min')).toThrow('Invalid status name')
    })

    it('should throw error for invalid severity', () => {
      expect(() => parseThresholdPath('passed.invalid.min')).toThrow(ThresholdValidationError)
      expect(() => parseThresholdPath('passed.invalid.min')).toThrow('Invalid severity')
    })

    it('should throw error for invalid type', () => {
      expect(() => parseThresholdPath('passed.critical.invalid')).toThrow(ThresholdValidationError)
      expect(() => parseThresholdPath('passed.critical.invalid')).toThrow('Invalid threshold type')
    })
  })

  describe('Invalid path formats', () => {
    it('should throw error for 1-part path', () => {
      expect(() => parseThresholdPath('invalid')).toThrow(ThresholdValidationError)
      expect(() => parseThresholdPath('invalid')).toThrow('Expected 2-3 parts')
    })

    it('should throw error for 4-part path', () => {
      expect(() => parseThresholdPath('a.b.c.d')).toThrow(ThresholdValidationError)
      expect(() => parseThresholdPath('a.b.c.d')).toThrow('Expected 2-3 parts')
    })

    it('should throw error for empty string', () => {
      expect(() => parseThresholdPath('')).toThrow(ThresholdValidationError)
    })
  })
})
