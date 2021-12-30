import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {ExecJSON} from 'inspecjs'

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256'])
}

describe('Test xccdf_results', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert:xccdf_results2hdf', '-i', path.resolve('./test/sample_jsons/xccdf_results/sample_input_report/xccdf-results.xml'), '-o', `${tmpobj.name}/xccdfresultstest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/xccdfresultstest.json`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_jsons/xccdf_results/xccdf-hdf.json'), {encoding: 'utf-8'}))
    expect(omitVersions(test)).to.eql(omitVersions(sample))
  })
})
