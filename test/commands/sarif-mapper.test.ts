import { expect, test } from '@oclif/test'
import * as tmp from 'tmp'
import * as path from 'path'
import fs from 'fs'
import _ from 'lodash'
import { ExecJSON } from 'inspecjs';

function omitVersions(input: ExecJSON.Execution): Partial<ExecJSON.Execution> {
  return _.omit(input, ['version', 'platform.release', 'profiles[0].sha256']);
}

describe('Test sarif_mapper', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  test
    .stdout()
    .command(['sarif_mapper', '-j', path.resolve(__dirname, '../../sample_jsons/sarif_mapper/sample_input_report/sarif_input.sarif'), '-o', `${tmpobj.name}/sariftest.json`])
    .it(`hdf-converter output test`, ctx => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/sariftest.json`, { encoding: 'utf-8' }))
      const sample = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../sample_jsons/sarif_mapper/sarif-hdf.json'), { encoding: 'utf-8' }))
      expect(JSON.stringify(omitVersions(test))).to.equal(JSON.stringify(omitVersions(sample)))
    })
})
