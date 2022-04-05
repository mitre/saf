import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {ExecJSON} from 'inspecjs'

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256'])
}

describe('Test burpsuite', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert burpsuite2hdf', '-i', path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min'), '-o', `${tmpobj.name}/burpsuitetest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf-8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/zero.webappsecurity.json'), 'utf-8'))
    expect(omitVersions(test)).to.eql(omitVersions(sample))
  })
})

describe('Test using space topic separator using burpsuite case', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert burpsuite2hdf', '-i', path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min'), '-o', `${tmpobj.name}/burpsuitetest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf-8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/zero.webappsecurity.json'), 'utf-8'))
    expect(omitVersions(test)).to.eql(omitVersions(sample))
  })
})
