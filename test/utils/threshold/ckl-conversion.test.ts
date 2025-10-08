import {describe, expect, it} from 'vitest'
import {cklControlStatus, controlFindingDetails} from '../../../src/utils/threshold/ckl-conversion.js'
import type {ContextualizedControl} from 'inspecjs'

describe('CKL Conversion Functions', () => {
  describe('cklControlStatus', () => {
    it('should return Not_Applicable for impact 0 controls', () => {
      const control = {
        data: {impact: 0},
        hdf: {segments: []},
      } as any as ContextualizedControl

      expect(cklControlStatus(control)).toBe('Not_Applicable')
      expect(cklControlStatus(control, true)).toBe('Not_Applicable')
    })

    it('should return Profile_Error for controls with error status', () => {
      const control = {
        data: {impact: 0.5},
        hdf: {segments: [{status: 'error'}]},
      } as any as ContextualizedControl

      expect(cklControlStatus(control)).toBe('Profile_Error')
    })

    it('should return Profile_Error for controls with no segments in summary mode', () => {
      const control = {
        data: {impact: 0.5},
        hdf: {segments: []},
      } as any as ContextualizedControl

      expect(cklControlStatus(control, true)).toBe('Profile_Error')
    })

    it('should return Open for controls with failed tests', () => {
      const control = {
        data: {impact: 0.5},
        hdf: {segments: [{status: 'passed'}, {status: 'failed'}]},
      } as any as ContextualizedControl

      expect(cklControlStatus(control)).toBe('Open')
    })

    it('should return NotAFinding for controls with only passed tests', () => {
      const control = {
        data: {impact: 0.5},
        hdf: {segments: [{status: 'passed'}, {status: 'passed'}]},
      } as any as ContextualizedControl

      expect(cklControlStatus(control)).toBe('NotAFinding')
    })

    it('should return Not_Reviewed for controls with only skipped tests', () => {
      const control = {
        data: {impact: 0.5},
        hdf: {segments: [{status: 'skipped'}]},
      } as any as ContextualizedControl

      expect(cklControlStatus(control)).toBe('Not_Reviewed')
    })

    it('should return Not_Reviewed for controls with no segments (non-summary mode)', () => {
      const control = {
        data: {impact: 0.5},
        hdf: {segments: []},
      } as any as ContextualizedControl

      expect(cklControlStatus(control, false)).toBe('Not_Reviewed')
    })
  })

  describe('controlFindingDetails', () => {
    it('should format Open status findings', () => {
      const control = {message: ['Test failed', 'Another issue']}
      const result = controlFindingDetails(control, 'Open')

      expect(result).toContain('One or more of the automated tests failed')
      expect(result).toContain('Another issue')
      expect(result).toContain('Test failed')
    })

    it('should format NotAFinding status findings', () => {
      const control = {message: ['All tests passed']}
      const result = controlFindingDetails(control, 'NotAFinding')

      expect(result).toContain('All Automated tests passed')
      expect(result).toContain('All tests passed')
    })

    it('should format Not_Reviewed status findings', () => {
      const control = {message: ['Skipped due to X']}
      const result = controlFindingDetails(control, 'Not_Reviewed')

      expect(result).toContain('Automated test skipped')
      expect(result).toContain('Skipped due to X')
    })

    it('should format Not_Applicable status findings', () => {
      const control = {message: ['Not applicable because...']}
      const result = controlFindingDetails(control, 'Not_Applicable')

      expect(result).toContain('Justification')
      expect(result).toContain('Not applicable because')
    })

    it('should format Profile_Error status findings', () => {
      const control = {message: []}
      const result = controlFindingDetails(control, 'Profile_Error')

      expect(result).toContain('No test available or some test errors occurred')
    })

    it('should sort messages before formatting', () => {
      const control = {message: ['Z message', 'A message', 'M message']}
      const result = controlFindingDetails(control, 'Open')

      const aIndex = result.indexOf('A message')
      const mIndex = result.indexOf('M message')
      const zIndex = result.indexOf('Z message')

      expect(aIndex).toBeLessThan(mIndex)
      expect(mIndex).toBeLessThan(zIndex)
    })
  })
})
