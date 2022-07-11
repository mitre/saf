import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'
import {ExecJSON} from 'inspecjs'

describe('Test nessus', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert nessus2hdf', '-i', path.resolve('./test/sample_data/nessus/sample_input_report/sample.nessus'), '-o', `${tmpobj.name}/nessustest.json`])
  .it('hdf-converter output test', () => {
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/nessustest.json`, 'utf8'))
    const sample = [
      JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/nessus/nessus-hdf-10.0.0.3.json'), 'utf8')),
      JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/nessus/nessus-hdf-10.0.0.2.json'), 'utf8')),
      JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/nessus/nessus-hdf-10.0.0.1.json'), 'utf8')),
    ]
    expect(converted.map((result: ExecJSON.Execution) => omitHDFChangingFields(result))).to.eql(sample.map(result => omitHDFChangingFields(result)))
  })
})
