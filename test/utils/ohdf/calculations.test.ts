// test/utils/ohdf/calculations.test.ts

import {
  calculateSummariesForExecJSONs,
  calculateComplianceScoresForExecJSONs,
  calculateTotalCountsForSummaries,
  calculateSeverityCounts,
} from '../../../src/utils/ohdf/calculations'
import {ContextualizedEvaluation, ContextualizedProfile} from 'inspecjs'
import path from 'path'
import fs from 'fs'
import {expect} from 'chai'
import {loadExecJSONs} from '../../../src/utils/ohdf/dataLoader'

const UTF8_ENCODING = 'utf8'
const hdfFilePath = path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json')

function loadExpectedData(samplePath: string) {
  const resolvedPath = path.resolve(samplePath)
  return JSON.parse(fs.readFileSync(resolvedPath, UTF8_ENCODING))
}

describe('calculations.ts utils', () => {
  let execJSONs: Record<string, ContextualizedEvaluation>

  beforeEach(() => {
    // Arrange
    execJSONs = loadExecJSONs([hdfFilePath])
  })

  it('calculateSummariesForExecJSONs returns the expected summaries', () => {
    const summaries = calculateSummariesForExecJSONs(execJSONs)
    if (process.env.VERBOSE_TESTING === 'true') {
      console.log(JSON.stringify(summaries))
    }

    const expectedSummaries = loadExpectedData('./test/sample_data/utils/ohdf/calculations/calculateSummariesForExecJSONs.sample')
    expect(summaries).to.deep.equal(expectedSummaries)
  })

  it('calculateComplianceScoresForExecJSONs returns correct compliance scores', () => {
    const complianceScores = calculateComplianceScoresForExecJSONs(execJSONs)
    if (process.env.VERBOSE_TESTING === 'true') {
      console.log(JSON.stringify(complianceScores))
    }

    const expectedComplianceScores = loadExpectedData('./test/sample_data/utils/ohdf/calculations/calculateComplianceScoresForExecJSONs.sample')
    expect(complianceScores).to.deep.equal(expectedComplianceScores)
  })

  it('calculateTotalCounts returns the correct totals', () => {
    const summaries = calculateSummariesForExecJSONs(execJSONs)
    const totalCounts = calculateTotalCountsForSummaries(summaries)
    if (process.env.VERBOSE_TESTING === 'true') {
      console.log(JSON.stringify(totalCounts))
    }

    const expectedTotalCounts = loadExpectedData('./test/sample_data/utils/ohdf/calculations/calculateTotalCounts.sample')
    expect(totalCounts).to.deep.equal(expectedTotalCounts)
  })

  it('calculateSeverityCounts modifies the summary correctly', () => {
    Object.values(execJSONs).forEach(parsedExecJSON => {
      const summary: Record<string, Record<string, number>> = {}
      const parsedProfile = parsedExecJSON.contains[0] as ContextualizedProfile

      calculateSeverityCounts(summary, parsedProfile)

      if (process.env.VERBOSE_TESTING === 'true') {
        console.log(JSON.stringify(summary))
      }

      const expectedSummary = loadExpectedData('./test/sample_data/utils/ohdf/calculations/calculateSeverityCounts.sample')
      expect(summary).to.deep.equal(expectedSummary)
    })
  })

  it('calculateTotalCountsForSummaries calculates the totals correctly', () => {
    const summaries = calculateSummariesForExecJSONs(execJSONs)

    const totals = calculateTotalCountsForSummaries(summaries)

    if (process.env.VERBOSE_TESTING === 'true') {
      console.log(JSON.stringify(totals))
    }

    const expectedTotals = loadExpectedData('./test/sample_data/utils/ohdf/calculations/calculateTotalCountsForSummaries.sample')
    expect(totals).to.deep.equal(expectedTotals)
  })
})
