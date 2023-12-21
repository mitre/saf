import {expect, test} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'

describe('Test spreadsheet2inspec_stub', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['generate spreadsheet2inspec_stub', '-i', path.resolve('./test/sample_data/csv/input/Ubuntu.csv'), '-o', `${tmpobj.name}/Ubuntu`, '--format', 'disa'])
    .it('Has the same number of controls in the CSV as generated - Ubuntu', () => {
      const fileCount = fs.readdirSync(`${tmpobj.name}/Ubuntu/controls/`).length
      expect(fileCount).to.eql(194)
    })
})
