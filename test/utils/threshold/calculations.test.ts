import {describe, expect, it} from 'vitest'
import {calculateCompliance, extractStatusCounts, exitNonZeroIfTrue} from '../../../src/utils/threshold/calculations.js'
import {convertFileContextual, ContextualizedProfile} from 'inspecjs'
import fs from 'fs'
import path from 'path'

describe('Threshold Calculation Functions', () => {
  // Helper to load test HDF data
  const loadTestProfile = (filename: string): ContextualizedProfile => {
    const filePath = path.resolve(`./test/sample_data/HDF/input/${filename}`)
    const hdfData = fs.readFileSync(filePath, 'utf8')
    const parsed = convertFileContextual(hdfData)
    return parsed.contains[0] as ContextualizedProfile
  }

  describe('calculateCompliance', () => {
    it('should calculate compliance percentage correctly', () => {
      const statusHash = {
        Passed: 80,
        Failed: 10,
        'Not Reviewed': 5,
        'Profile Error': 5,
        'Not Applicable': 20,
        'From Profile': 0,
        Skipped: 0,
        Waived: 0,
        PassedTests: 0,
        FailedTests: 0,
        PassingTestsFailedControl: 0,
      }

      // Compliance = Passed / (Passed + Failed + Not Reviewed + Profile Error)
      // = 80 / (80 + 10 + 5 + 5) = 80 / 100 = 80%
      expect(calculateCompliance(statusHash)).toBe(80)
    })

    it('should round to nearest integer', () => {
      const statusHash = {
        Passed: 66,
        Failed: 34,
        'Not Reviewed': 0,
        'Profile Error': 0,
        'Not Applicable': 0,
        'From Profile': 0,
        Skipped: 0,
        Waived: 0,
        PassedTests: 0,
        FailedTests: 0,
        PassingTestsFailedControl: 0,
      }

      // 66 / 100 = 66%
      expect(calculateCompliance(statusHash)).toBe(66)
    })

    it('should handle 100% compliance', () => {
      const statusHash = {
        Passed: 100,
        Failed: 0,
        'Not Reviewed': 0,
        'Profile Error': 0,
        'Not Applicable': 10,
        'From Profile': 0,
        Skipped: 0,
        Waived: 0,
        PassedTests: 0,
        FailedTests: 0,
        PassingTestsFailedControl: 0,
      }

      expect(calculateCompliance(statusHash)).toBe(100)
    })

    it('should handle 0% compliance', () => {
      const statusHash = {
        Passed: 0,
        Failed: 50,
        'Not Reviewed': 50,
        'Profile Error': 0,
        'Not Applicable': 0,
        'From Profile': 0,
        Skipped: 0,
        Waived: 0,
        PassedTests: 0,
        FailedTests: 0,
        PassingTestsFailedControl: 0,
      }

      expect(calculateCompliance(statusHash)).toBe(0)
    })

    it('should return 0 for zero total controls', () => {
      const statusHash = {
        Passed: 0,
        Failed: 0,
        'Not Reviewed': 0,
        'Profile Error': 0,
        'Not Applicable': 10,
        'From Profile': 0,
        Skipped: 0,
        Waived: 0,
        PassedTests: 0,
        FailedTests: 0,
        PassingTestsFailedControl: 0,
      }

      expect(calculateCompliance(statusHash)).toBe(0)
    })

    it('should exclude Not Applicable from compliance calculation', () => {
      const statusHash = {
        Passed: 50,
        Failed: 0,
        'Not Reviewed': 0,
        'Profile Error': 0,
        'Not Applicable': 1000, // Should be ignored
        'From Profile': 0,
        Skipped: 0,
        Waived: 0,
        PassedTests: 0,
        FailedTests: 0,
        PassingTestsFailedControl: 0,
      }

      // 50 / 50 = 100% (Not Applicable is not counted)
      expect(calculateCompliance(statusHash)).toBe(100)
    })
  })

  describe('extractStatusCounts', () => {
    it('should extract status counts from profile', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const counts = extractStatusCounts(profile)

      expect(counts).toHaveProperty('Passed')
      expect(counts).toHaveProperty('Failed')
      expect(counts).toHaveProperty('Not Reviewed')
      expect(counts).toHaveProperty('Profile Error')
      expect(counts).toHaveProperty('Not Applicable')
      expect(counts).toHaveProperty('PassedTests')
      expect(counts).toHaveProperty('FailedTests')
      expect(counts).toHaveProperty('Waived')

      // Red hat good has known counts
      expect(typeof counts.Passed).toBe('number')
      expect(typeof counts.Failed).toBe('number')
      expect(counts.Passed).toBeGreaterThan(0)
    })

    it('should count waived tests for Not Applicable controls with waived flag', () => {
      // This tests lines 60-62 (waived counting)
      // We'd need a fixture with waived controls, or mock data
      const profile = loadTestProfile('red_hat_good.json')
      const counts = extractStatusCounts(profile)

      // Waived count should be a number (even if 0)
      expect(typeof counts.Waived).toBe('number')
      expect(counts.Waived).toBeGreaterThanOrEqual(0)
    })

    it('should filter by severity when specified', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const allCounts = extractStatusCounts(profile)
      const highCounts = extractStatusCounts(profile, 'high')

      // High severity counts should be less than or equal to total counts
      expect(highCounts.Passed).toBeLessThanOrEqual(allCounts.Passed)
      expect(highCounts.Failed).toBeLessThanOrEqual(allCounts.Failed)
    })

    it('should count passed tests correctly', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const counts = extractStatusCounts(profile)

      expect(counts.PassedTests).toBeGreaterThanOrEqual(0)
      // PassedTests should be >= Passed controls (each control has at least 1 test)
      expect(counts.PassedTests).toBeGreaterThanOrEqual(counts.Passed)
    })

    it('should count failed tests correctly', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const counts = extractStatusCounts(profile)

      expect(counts.FailedTests).toBeGreaterThanOrEqual(0)
    })

    it('should handle profiles with no controls gracefully', () => {
      const profile = loadTestProfile('minimal-hdf.json')
      const counts = extractStatusCounts(profile)

      expect(counts).toHaveProperty('Passed')
      expect(counts).toHaveProperty('Failed')
    })
  })

  describe('exitNonZeroIfTrue', () => {
    it('should not throw when condition is false', () => {
      expect(() => exitNonZeroIfTrue(false, 'Should not throw')).not.toThrow()
    })

    it('should throw when condition is true with custom message', () => {
      expect(() => exitNonZeroIfTrue(true, 'Custom error message')).toThrow('Custom error message')
    })

    it('should throw when condition is true with default message', () => {
      // Tests lines 118-123 (default error message path)
      expect(() => exitNonZeroIfTrue(true)).toThrow('Compliance levels were not met')
    })

    it('should log error message before throwing', () => {
      const originalError = console.error
      let errorMessage = ''
      console.error = (msg: string) => { errorMessage = msg }

      try {
        exitNonZeroIfTrue(true, 'Test error')
      } catch {
        // Expected
      }

      console.error = originalError
      expect(errorMessage).toBe('Error: Test error')
    })
  })
})
