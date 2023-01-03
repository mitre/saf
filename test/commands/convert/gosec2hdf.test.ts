import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test gosec', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert gosec2hdf', '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Grype_gosec_results.json'), '-o', `${tmpobj.name}/gosectest.json`])
    .it('hdf-converter output test - gosec', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/gosec-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})
