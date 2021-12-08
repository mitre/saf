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
  .command(['convert:sarif', '-j', path.resolve('./test/sample_jsons/sarif/sample_input_report/sarif_input.sarif'), '-o', `${tmpobj.name}/sariftest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/sariftest.json`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_jsons/sarif/sarif-hdf.json'), {encoding: 'utf-8'}))
    expect(omitVersions(test)).to.equal(omitVersions(sample))
  })
})
