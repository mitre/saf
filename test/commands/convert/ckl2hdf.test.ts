import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test ckl2hdf RHEL8 example', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert ckl2hdf', '-i', path.resolve('./test/sample_data/checklist/sample_input_report/converted-RHEL8V1R3.ckl'), '-o', `${tmpobj.name}/checklisttest.json`])
    .it('hdf-converter output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/checklisttest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checklist/checklist-RHEL8V1R3-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test ckl2hdf RHEL8 example with raw', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert ckl2hdf', '--with-raw', '-i', path.resolve('./test/sample_data/checklist/sample_input_report/converted-RHEL8V1R3.ckl'), '-o', `${tmpobj.name}/checklisttest.json`])
    .it('hdf-converter output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/checklisttest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checklist/checklist-RHEL8V1R3-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test ckl2hdf Three Stig Checklist example', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert ckl2hdf', '-i', path.resolve('./test/sample_data/checklist/sample_input_report/three_stig_checklist.ckl'), '-o', `${tmpobj.name}/threestigchecklisttest.json`])
    .it('hdf-converter output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/threestigchecklisttest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checklist/three_stig_checklist-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})
