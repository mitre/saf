import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test sarif', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert sarif2hdf', '-i', path.resolve('./test/sample_data/sarif/sample_input_report/sarif_input.sarif'), '-o', `${tmpobj.name}/sariftest.json`])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/sariftest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/sarif/sarif-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test sarif withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert sarif2hdf', '-i', path.resolve('./test/sample_data/sarif/sample_input_report/sarif_input.sarif'), '-o', `${tmpobj.name}/sariftest.json`, '-w'])
  .it('hdf-converter withraw output test', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/sariftest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/sarif/sarif-hdf-withraw.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
