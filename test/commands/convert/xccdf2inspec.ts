import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

describe('Test xccdf_results', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert:xccdf2inspec', '-i', path.resolve('./test/sample_data/xccdf_results/sample_input_report/xccdf-results.xml'), '-o', `${tmpobj.name}/xccdfresultstest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/xccdfresultstest.json`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/xccdf_results/xccdf-hdf.json'), {encoding: 'utf-8'}))
    expect(omitVersions(test)).to.eql(omitVersions(sample))
  })
})
