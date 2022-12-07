import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test zap', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert zap2hdf', '-i', path.resolve('./test/sample_data/zap/sample_input_report/webgoat.json'), '-n', 'http://mymac.com:8191', '-o', `${tmpobj.name}/zaptest-webgoat.json`])
    .it('hdf-converter output test - webgoat', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webgoat.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webgoat-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert zap2hdf', '-i', path.resolve('./test/sample_data/zap/sample_input_report/zero.webappsecurity.json'), '-n', 'http://zero.webappsecurity.com', '-o', `${tmpobj.name}/zaptest-webappsecurity.json`])
    .it('hdf-converter output test - zero.webappsecurity', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webappsecurity.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webappsecurity-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})
