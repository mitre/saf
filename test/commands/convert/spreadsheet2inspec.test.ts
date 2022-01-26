import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'

describe('Test spreadsheet2inspec', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert:spreadsheet2inspec', '-i', path.resolve('./test/sample_data/csv/input/Ubuntu.csv'), '-o', `${tmpobj.name}/Ubuntu`, '--format', 'disa'])
  .it('Has the same number of controls in the CSV as generated - Ubuntu', () => {
    const fileCount = fs.readdirSync(`${tmpobj.name}/Ubuntu/controls/`).length
    expect(fileCount).to.eql(194)
  })
})
