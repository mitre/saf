import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test dbprotect', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert dbprotect2hdf', '-i', path.resolve('./test/sample_data/dbprotect/sample_input_report/DbProtect-Check-Results-Details-XML-Sample.xml'), '-o', `${tmpobj.name}/dbprotecttest.json`])
    .it('hdf-converter output test - check results', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/dbprotecttest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/dbprotect/dbprotect-check-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })

  test
    .stdout()
    .command(['convert dbprotect2hdf', '-i', path.resolve('./test/sample_data/dbprotect/sample_input_report/DbProtect-Findings-Detail-XML-Sample.xml'), '-o', `${tmpobj.name}/dbprotecttest.json`])
    .it('hdf-converter output test - findings results', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/dbprotecttest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/dbprotect/dbprotect-findings-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test dbprotect using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert dbprotect2hdf', '-i', path.resolve('./test/sample_data/dbprotect/sample_input_report/DbProtect-Check-Results-Details-XML-Sample.xml'), '-o', `${tmpobj.name}/dbprotecttest.json`, '-w'])
    .it('hdf-converter withraw output test - check results', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/dbprotecttest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/dbprotect/dbprotect-check-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })

  test
    .stdout()
    .command(['convert dbprotect2hdf', '-i', path.resolve('./test/sample_data/dbprotect/sample_input_report/DbProtect-Findings-Detail-XML-Sample.xml'), '-o', `${tmpobj.name}/dbprotecttest.json`, '-w'])
    .it('hdf-converter withraw output test - findings results', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/dbprotecttest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/dbprotect/dbprotect-findings-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})
