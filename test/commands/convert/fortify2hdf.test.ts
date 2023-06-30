import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test fortify', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert fortify2hdf', '-i', path.resolve('./test/sample_data/fortify/sample_input_report/fortify_webgoat_results.fvdl'), '-o', `${tmpobj.name}/fortify.json`])
    .it('hdf-converter output test', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/fortify.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/fortify/fortify-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test fortify using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert fortify2hdf', '-i', path.resolve('./test/sample_data/fortify/sample_input_report/fortify_webgoat_results.fvdl'), '-o', `${tmpobj.name}/fortify.json`, '-w'])
    .it('hdf-converter withraw output test', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/fortify.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/fortify/fortify-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
})
