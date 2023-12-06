import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitChecklistChangingFields} from '../utils'

describe('Test hdf2checklist', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert hdf2ckl', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), '-o', `${tmpobj.name}/hdf2ckl_test.json`])
    .it('hdf-converter output test - defaults', () => {
      const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_test.json`, 'utf8')
      const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good.ckl'), 'utf8')
      expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample))
    })

  test
    .stdout()
    .command(['convert hdf2ckl', '-i', path.resolve('./test/sample_data/HDF/input/vSphere8_report.json'), '-o', `${tmpobj.name}/hdf2ckl_test.json`])
    .it('hdf-converter output test - inspec results from profile with dependent profiles', () => {
      const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_test.json`, 'utf8')
      const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/vSphere8_report.ckl'), 'utf8')
      expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample))
    })

  test
    .stdout()
    .command(['convert hdf2ckl', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), '-o', `${tmpobj.name}/hdf2ckl_metadata_test.json`, '-m', path.resolve('./test/sample_data/checklist/metadata.json')])
    .it('hdf-converter output test - with metadata', () => {
      const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_metadata_test.json`, 'utf8')
      const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good_metadata.ckl'), 'utf8')
      expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample))
    })
})
