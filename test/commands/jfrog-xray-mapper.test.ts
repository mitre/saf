import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {ExecJSON} from 'inspecjs'

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256'])
}

describe('Test jfrog_xray', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert:jfrog_xray', '-i', path.resolve('./test/sample_jsons/jfrog_xray/sample_input_report/jfrog_xray_sample.json'), '-o', `${tmpobj.name}/jfrogtest.json`])
  .it('hdf-converter output test', () => {
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_jsons/jfrog_xray/jfrog-hdf.json'), {encoding: 'utf-8'}))
    expect(omitVersions(converted)).to.eql(omitVersions(sample))
  })
})
