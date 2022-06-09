import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {ExecJSON} from 'inspecjs'

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256'])
}

describe('Test sarif', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert sarif2hdf', '-i', path.resolve('./test/sample_data/sarif/sample_input_report/sarif_input.sarif'), '-o', `${tmpobj.name}/sariftest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/sariftest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/sarif/sarif-hdf.json'), 'utf8'))
    expect(omitVersions(test)).to.eql(omitVersions(sample))
  })
})
