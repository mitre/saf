import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test (generic) convert', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  // .command(['convert', '-i', path.resolve('./test/sample_data/asff/sample_input_report/asff_sample.json'), '-o', `${tmpobj.name}/asfftest.json`])
  .it('hdf-converter output test (asff)', () => {
    require('child_process').execSync(
      `node bin/run convert -i ./test/sample_data/asff/sample_input_report/asff_sample.json -o ${tmpobj.name}/asfftest.json`,
    )
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/asfftest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/asff/asff_hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })

  test
  .stdout()
  .command(['convert', '-i', path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min'), '-o', `${tmpobj.name}/burpsuitetest.json`])
  .it('hdf-converter output test (burpsuite)', () => {
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/zero.webappsecurity.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })

  test
  .stdout()
  .command(['convert', '-i', path.resolve('./test/sample_data/jfrog_xray/sample_input_report/jfrog_xray_sample.json'), '-o', `${tmpobj.name}/jfrogtest.json`])
  .it('hdf-converter output test (jfrog)', () => {
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/jfrog_xray/jfrog-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })

  test
  .stdout()
  .command(['convert', '-i', path.resolve('./test/sample_data/zap/sample_input_report/webgoat.json'), '-o', `${tmpobj.name}/zaptest.json`, '-n', 'http://mymac.com:8191'])
  .it('hdf-converter output test (zap)', () => {
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webgoat-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })
})
