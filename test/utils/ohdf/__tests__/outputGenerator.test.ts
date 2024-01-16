import {PrintableSummary} from './../../../../src/utils/ohdf/types'
import {generateMarkdownTableRow, prettyPrintRowTitle, prettyPrintColumnTitle, generateMarkdownTable, convertToMarkdown} from '../../../../src/utils/ohdf/outputGenerator'
import marked from 'marked'
import {mocked} from 'jest-mock'

// jest.mock('../../../../src/utils/ohdf/outputGenerator')

let item: PrintableSummary
const titleTables = true
const logLevel = 'verbose'

beforeEach(() => {
  item = {
    profileName: 'redhat-enterprise-linux-8-stig-baseline',
    resultSets: ['rhel-8_hardened.json'],
    compliance: 66,
    passed: {critical: 0, high: 11, medium: 208, low: 8, total: 227},
    failed: {critical: 0, high: 6, medium: 87, low: 19, total: 112},
    skipped: {critical: 0, high: 1, medium: 1, low: 1, total: 3},
    error: {critical: 0, high: 0, medium: 0, low: 0, total: 0},
    no_impact: {none: 33, total: 33},
  }
})

const testTableRows = [
  ['Total', '227', '112', '3', '33', '0'],
  ['Critical', '0', '0', '0', '0', '0'],
  ['High', '11', '6', '1', '0', '0'],
  ['Medium', '208', '87', '1', '0', '0'],
  ['Low', '8', '19', '1', '0', '0'],
]

const expectedColumnOrder = ['Compliance', 'Passed', 'Failed', 'Not Reviewed', 'Not Applicable', 'Error']
const expectedRowOrder = ['Total', 'Critical', 'High', 'Medium', 'Low']

// Mock the functions
// mocked(prettyPrintRowTitle).mockReturnValue('mocked title')
// mocked(generateMarkdownTableRow).mockReturnValue(['mocked', 'row'])

describe('outputGenerator', () => {
  describe('generateMarkdownTableRow', () => {
    it('should generate a row for the Markdown table', () => {
      const row = 'high'
      const result = generateMarkdownTableRow(row, item)
      expect(result).toEqual(['11', '6', '1', '0', '0'])
    })
  })

  describe('prettyPrintRowTitle', () => {
    it.each([
      ['total', 'Total'],
      ['test title', 'Test title'],
      ['Test Title', 'Test Title'],
      ['title', 'Title'],
      ['', ''],
    ])('should correctly format row title "%s"', (title: string, expected: string) => {
      const result = prettyPrintRowTitle(title)
      expect(result).toBe(expected)
    })
  })

  describe('prettyPrintColumnTitle', () => {
    it.each([
      ['skipped', 'Not Reviewed'],
      ['no_impact', 'Not Applicable'],
      ['passed', 'Passed'],
    ])('should correctly format column title "%s"', (title: string, expected: string) => {
      const result = prettyPrintColumnTitle(title)
      expect(result).toBe(expected)
    })
  })
})

describe('generateMarkdownTable', () => {
  it('generates a table with both columns and rows', () => {
    const result = generateMarkdownTable(item, titleTables, logLevel)
    const tokens = marked.lexer(result)
    const tableToken = tokens.find(token => token.type === 'table') as marked.Tokens.Table

    if (tableToken && tableToken.type === 'table') {
      const headers = tableToken.header
      const rows = tableToken.rows.map(rowToken => rowToken.map(cellToken => cellToken.text))
      expect(Array.isArray(headers)).toBe(true)
      expect(Array.isArray(rows)).toBe(true)
    }
  })

  it('each row matches a row in `testTableRows`', () => {
    const result = generateMarkdownTable(item, titleTables, logLevel)
    const tokens = marked.lexer(result)
    const tableToken = tokens.find(token => token.type === 'table') as marked.Tokens.Table

    if (tableToken && tableToken.type === 'table') {
      const rows = tableToken.rows.map(rowToken => rowToken.map(cellToken => cellToken.text))

      rows.forEach((row, index) => {
        expect(Array.isArray(row)).toBe(true)
        const matchedRowIndex = testTableRows.findIndex(testRow => JSON.stringify(testRow) === JSON.stringify(row))
        expect(matchedRowIndex).not.toBe(-1)
      })
    }
  })

  it(`rows are in the expected order: ${expectedRowOrder}`, () => {
    const result = generateMarkdownTable(item, titleTables, logLevel)
    const tokens = marked.lexer(result)
    const tableToken = tokens.find(token => token.type === 'table') as marked.Tokens.Table

    if (tableToken && tableToken.type === 'table') {
      const rows = tableToken.rows.map(rowToken => rowToken.map(cellToken => cellToken.text))

      rows.forEach((row, index) => {
        expect(row[0]).toBe(expectedRowOrder[index])
      })
    }
  })
  it(`columns are in the expected order: ${expectedColumnOrder}`, () => {
    const result = generateMarkdownTable(item, titleTables, logLevel)
    const tokens = marked.lexer(result)
    const tableToken = tokens.find(token => token.type === 'table') as marked.Tokens.Table

    if (tableToken && tableToken.type === 'table') {
      const headers = tableToken.header

      const headerTexts = headers.map((header, index) => {
        if (index === 0) {
          // Special case for the first element
          return header.text.split(': ')[0]
        }

        return header.text.split('<br>')[0]
      })

      headerTexts.forEach((headerText, index) => {
        expect(headerText).toBe(expectedColumnOrder[index])
      })
    }
  })
  it(`each column matches a column in ${expectedColumnOrder}`, () => {
    const result = generateMarkdownTable(item, titleTables, logLevel)
    const tokens = marked.lexer(result)
    const tableToken = tokens.find(token => token.type === 'table') as marked.Tokens.Table

    if (tableToken && tableToken.type === 'table') {
      const headers = tableToken.header

      const headerTexts = headers.map((header, index) => {
        if (index === 0) {
        // Special case for the first element
          return header.text.split(': ')[0]
        }

        return header.text.split('<br>')[0]
      })

      headerTexts.forEach((headerText, index) => {
        const matchedColumnIndex = expectedColumnOrder.indexOf(headerText)
        expect(matchedColumnIndex).not.toBe(-1)
      })
    }
  })
})
