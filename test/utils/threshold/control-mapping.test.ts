import {describe, expect, it} from 'vitest'
import {
  getControlIdMap,
  getDescriptionContentsOrUndefined,
  extractControlSummariesBySeverity,
} from '../../../src/utils/threshold/control-mapping.js'
import {convertFileContextual, ContextualizedProfile} from 'inspecjs'
import fs from 'fs'
import path from 'path'

describe('Control Mapping Functions', () => {
  const loadTestProfile = (filename: string): ContextualizedProfile => {
    const filePath = path.resolve(`./test/sample_data/HDF/input/${filename}`)
    const hdfData = fs.readFileSync(filePath, 'utf8')
    const parsed = convertFileContextual(hdfData)
    return parsed.contains[0] as ContextualizedProfile
  }

  describe('getControlIdMap', () => {
    it('should map control IDs by status and severity', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const map = getControlIdMap(profile)

      expect(map).toHaveProperty('passed')
      expect(map).toHaveProperty('skipped')
    })

    it('should organize controls by severity within status', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const map = getControlIdMap(profile)

      if (map.passed) {
        const severityLevels = Object.keys(map.passed)
        expect(severityLevels.length).toBeGreaterThan(0)
      }
    })

    it('should accept existing threshold object to populate', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const existingThreshold = {compliance: {min: 80}}
      const map = getControlIdMap(profile, existingThreshold)

      expect(map.compliance?.min).toBe(80)
      expect(map.passed || map.skipped).toBeDefined()
    })

    it('should only include root controls, not extended controls', () => {
      const profile = loadTestProfile('triple_overlay_profile_example.json')
      const map = getControlIdMap(profile)

      let totalMappedControls = 0
      for (const status of ['passed', 'failed', 'skipped', 'no_impact', 'error'] as const) {
        const statusMap = map[status]
        if (statusMap) {
          for (const severity of Object.keys(statusMap)) {
            const controls = (statusMap as any)[severity]?.controls
            if (controls && Array.isArray(controls)) {
              totalMappedControls += controls.length
            }
          }
        }
      }

      const rootControls = profile.contains.filter(c => c.extendedBy.length === 0)
      expect(totalMappedControls).toBe(rootControls.length)
    })
  })

  describe('getDescriptionContentsOrUndefined', () => {
    it('should return undefined for null descriptions', () => {
      const result = getDescriptionContentsOrUndefined('check', null)
      expect(result).toBeUndefined()
    })

    it('should return undefined for undefined descriptions', () => {
      const result = getDescriptionContentsOrUndefined('check', undefined)
      expect(result).toBeUndefined()
    })

    it('should find description by label in array', () => {
      const descriptions = [
        {label: 'check', data: 'Check content here'},
        {label: 'fix', data: 'Fix content here'},
      ]
      const result = getDescriptionContentsOrUndefined('check', descriptions)
      expect(result).toBe('Check content here')
    })

    it('should return undefined if label not found', () => {
      const descriptions = [
        {label: 'check', data: 'Check content'},
      ]
      const result = getDescriptionContentsOrUndefined('nonexistent', descriptions)
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty array', () => {
      const result = getDescriptionContentsOrUndefined('check', [])
      expect(result).toBeUndefined()
    })

    it('should return undefined for non-array descriptions', () => {
      const descriptions = {someKey: 'someValue'}
      const result = getDescriptionContentsOrUndefined('check', descriptions)
      expect(result).toBeUndefined()
    })
  })

  describe('extractControlSummariesBySeverity', () => {
    it('should extract control summaries organized by status', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const summaries = extractControlSummariesBySeverity(profile)

      expect(summaries).toHaveProperty('passed')
      expect(summaries).toHaveProperty('failed')
      expect(summaries).toHaveProperty('skipped')
      expect(summaries).toHaveProperty('no_impact')
      expect(summaries).toHaveProperty('error')
    })

    it('should create detailed summary for each control', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const summaries = extractControlSummariesBySeverity(profile)

      const passedControls = Object.values(summaries.passed)
      if (passedControls.length > 0) {
        const control = passedControls[0]
        expect(control).toHaveProperty('vuln_num')
        expect(control).toHaveProperty('severity')
        expect(control).toHaveProperty('message')
        expect(control).toHaveProperty('control_status')
      }
    })

    it('should only process root controls', () => {
      const profile = loadTestProfile('triple_overlay_profile_example.json')
      const summaries = extractControlSummariesBySeverity(profile)

      let totalSummarized = 0
      for (const status of ['passed', 'failed', 'skipped', 'no_impact', 'error'] as const) {
        totalSummarized += Object.keys(summaries[status]).length
      }

      const rootControls = profile.contains.filter(c => c.extendedBy.length === 0)
      expect(totalSummarized).toBe(rootControls.length)
    })

    it('should include finding details in summaries', () => {
      const profile = loadTestProfile('red_hat_good.json')
      const summaries = extractControlSummariesBySeverity(profile)

      const allControls = [
        ...Object.values(summaries.passed),
        ...Object.values(summaries.skipped),
      ]

      if (allControls.length > 0) {
        const controlWithDetails = allControls.find(c => c.finding_details)
        expect(controlWithDetails).toBeDefined()
      }
    })
  })
})
