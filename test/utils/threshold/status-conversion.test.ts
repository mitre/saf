import {describe, expect, it} from 'vitest'
import {renameStatusName, reverseStatusName} from '../../../src/utils/threshold/status-conversion.js'

describe('Status Name Conversion Functions', () => {
  describe('renameStatusName', () => {
    it('should convert passed to Passed', () => {
      expect(renameStatusName('passed')).toBe('Passed')
    })

    it('should convert failed to Failed', () => {
      expect(renameStatusName('failed')).toBe('Failed')
    })

    it('should convert skipped to Not Reviewed', () => {
      expect(renameStatusName('skipped')).toBe('Not Reviewed')
    })

    it('should convert no_impact to Not Applicable', () => {
      expect(renameStatusName('no_impact')).toBe('Not Applicable')
    })

    it('should convert error to Profile Error', () => {
      expect(renameStatusName('error')).toBe('Profile Error')
    })

    it('should default to Profile Error for unknown status', () => {
      expect(renameStatusName('unknown')).toBe('Profile Error')
    })
  })

  describe('reverseStatusName', () => {
    it('should convert Passed to passed', () => {
      expect(reverseStatusName('Passed')).toBe('passed')
    })

    it('should convert Failed to failed', () => {
      expect(reverseStatusName('Failed')).toBe('failed')
    })

    it('should convert Not Reviewed to skipped', () => {
      expect(reverseStatusName('Not Reviewed')).toBe('skipped')
    })

    it('should convert Not Applicable to no_impact', () => {
      expect(reverseStatusName('Not Applicable')).toBe('no_impact')
    })

    it('should convert Profile Error to error', () => {
      expect(reverseStatusName('Profile Error')).toBe('error')
    })

    it('should default to error for unknown status', () => {
      expect(reverseStatusName('Unknown')).toBe('error')
    })

    it('should be inverse of renameStatusName', () => {
      const statuses = ['passed', 'failed', 'skipped', 'no_impact', 'error']
      for (const status of statuses) {
        const renamed = renameStatusName(status)
        const reversed = reverseStatusName(renamed)
        expect(reversed).toBe(status)
      }
    })
  })
})
