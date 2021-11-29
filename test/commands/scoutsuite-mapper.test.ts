import { expect, test } from '@oclif/test'
import * as tmp from 'tmp'
import * as path from 'path'
import fs from 'fs'
import _ from 'lodash'
import { ExecJSON } from 'inspecjs';

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256']);
}

describe('Test scoutsuite_mapper', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command(['scoutsuite_mapper', '-j', path.resolve(__dirname, '../../sample_jsons/scoutsuite_mapper/sample_input_report/scoutsuite_sample.js'), '-o', `${tmpobj.name}/scoutsuitetest.json`])
    .it(`hdf-converter output test`, ctx => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/scoutsuitetest.json`, { encoding: 'utf-8' }))
      const sample = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../sample_jsons/scoutsuite_mapper/scoutsuite-hdf.json'), { encoding: 'utf-8' }))
      expect(JSON.stringify(omitVersions(test))).to.equal(JSON.stringify(omitVersions(sample)))
    })
})
