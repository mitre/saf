import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'
import {execSync} from 'child_process'

describe('Test (generic) convert', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .it('hdf-converter output test (asff)', () => {
    const runresults = execSync(
      `node bin/run convert -i ./test/sample_data/asff/sample_input_report/asff_sample.json -o ${tmpobj.name}/asfftest`,
    )

    console.log('runresults', runresults)

    const lsresults = execSync(`ls ${tmpobj.name}`) // debugging
    console.log('lsresults', lsresults)

    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/asfftest/CIS AWS Foundations Benchmark v1.2.0.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/asff/asff-cis_aws-foundations_benchmark_v1.2.0-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })

  test
  .it('hdf-converter output test (burpsuite)', () => {
    execSync(
      `node bin/run convert -i ./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min -o ${tmpobj.name}/burpsuitetest.json`,
    )

    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/burpsuite-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })

  test
  .it('hdf-converter output test (jfrog)', () => {
    execSync(
      `node bin/run convert -i ./test/sample_data/jfrog_xray/sample_input_report/jfrog_xray_sample.json -o ${tmpobj.name}/jfrogtest.json`,
    )

    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/jfrog_xray/jfrog-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })

  test
  .it('hdf-converter output test (zap) - zero.webappsecurity', () => {
    execSync(
      `node bin/run convert -i ./test/sample_data/zap/sample_input_report/zero.webappsecurity.json -n http://zero.webappsecurity.com -o ${tmpobj.name}/zaptest-webappsecurity.json`,
    )

    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webappsecurity.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webappsecurity-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
