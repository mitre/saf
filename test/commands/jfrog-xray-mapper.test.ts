import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {ExecJSON} from 'inspecjs'

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256'])
}

describe('Test jfrog_xray_mapper', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['jfrog_xray_mapper', '-j', path.resolve(__dirname, '../../sample_jsons/jfrog_xray_mapper/sample_input_report/jfrog_xray_sample.json'), '-o', `${tmpobj.name}/jfrogtest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../sample_jsons/jfrog_xray_mapper/jfrog-hdf.json'), {encoding: 'utf-8'}))
    expect(JSON.stringify(omitVersions(test))).to.equal(JSON.stringify(omitVersions(sample)))
  })
})
