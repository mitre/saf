import * as fs from 'fs'
import { Command, Flags } from '@oclif/core'
import { markdownTable } from 'markdown-table'

interface Data {
  compliance: number;
  passed: Record<string, number>;
  failed: Record<string, number>;
  skipped: Record<string, number>;
  no_impact: Record<string, number>;
  error: Record<string, number>;
}

const ROW_ORDER = ['Total', 'Critical', 'High', 'Medium', 'Low', 'Not Applicable']
const COLUMN_ORDER = [
  'Passed :white_check_mark:',
  'Failed :x:',
  'Not Reviewed :leftwards_arrow_with_hook:',
  'Not Applicable :heavy_minus_sign:',
  'Error :warning:',
]

function generateRow(row: string, data: Data): string[] {
  let values: string[]
  if (row === 'Total') {
    values = [
      data.passed.total.toString(),
      data.failed.total.toString(),
      data.skipped.total.toString(),
      data.no_impact.total.toString(),
      data.error.total.toString(),
    ]
  } else if (row === 'Not Applicable') {
    values = ['-', '-', '-', data.no_impact.total.toString(), '-']
  } else {
    values = [
      data.passed[row.toLowerCase()].toString(),
      data.failed[row.toLowerCase()].toString(),
      data.skipped[row.toLowerCase()].toString(),
      '-',
      data.error[row.toLowerCase()].toString(),
    ]
  }

  return [row, ...values]
}

async function processData(data: Data, output: string | undefined) {
  const tableData = [
    [`Compliance: ${data.compliance}% :test_tube:`, ...COLUMN_ORDER],
  ]

  for (const row of ROW_ORDER) {
    tableData.push(generateRow(row, data))
  }

  const table = markdownTable(tableData)

  if (output) {
    fs.writeFileSync(output, table)
  } else {
    console.log(table)
  }
}

export default class MarkdownTableSummary extends Command {
  static description = 'Generate a markdown table summary of your OHDF file'

  static flags = {
    help: Flags.help({ char: 'h' }),
    input: Flags.string({ char: 'i', description: 'input file' }),
    output: Flags.string({ char: 'o', description: 'output file' }),
  }

  async run() {
    const { flags } = await this.parse(MarkdownTableSummary)

    try {
      const rawData = flags.input ? fs.readFileSync(flags.input, 'utf8') : (await this.stdin())
      const data: Data = JSON.parse(rawData)
      processData(data, flags.output)
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to process data: ${error.message}`)
      } else {
        this.error(`An unexpected error occurred: ${error}`)
      }
    }
  }
}
