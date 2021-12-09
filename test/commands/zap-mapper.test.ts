import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {ExecJSON} from 'inspecjs'

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256'])
}

describe('Test zap', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['normalize:zap', '-j', path.resolve('./test/sample_jsons/zap/sample_input_report/webgoat.json'), '-n', 'http://mymac.com:8191', '-o', `${tmpobj.name}/zaptest-webgoat.json`])
  .it('hdf-converter output test - webgoat', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webgoat.json`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_jsons/zap/zap-webgoat-hdf.json'), {encoding: 'utf-8'}))
    expect(omitVersions(test)).to.equal(omitVersions(sample))
  })
  test
  .stdout()
  .command(['normalize:zap', '-j', path.resolve('./test/sample_jsons/zap/sample_input_report/zero.webappsecurity.json'), '-n', 'http://zero.webappsecurity.com', '-o', `${tmpobj.name}/zaptest-webappsecurity.json`])
  .it('hdf-converter output test - zero.webappsecurity', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webappsecurity.json`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_jsons/zap/zap-webappsecurity-hdf.json'), {encoding: 'utf-8'}))
    expect(omitVersions(test)).to.equal(omitVersions(sample))
  })
})
