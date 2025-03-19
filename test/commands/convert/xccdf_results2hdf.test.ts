import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test xccdf_results', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>([
      'convert xccdf_results2hdf',
      '-i', path.resolve('./test/sample_data/xccdf_results/sample_input_report/xccdf-results-openscap-rhel7.xml'),
      '-o', `${tmpobj.name}/xccdfresultstest.json`,
    ])
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/xccdfresultstest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/xccdf_results/xccdf-openscap-rhel7-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test xccdf_results using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter with raw output test', async () => {
    await runCommand<{name: string}>([
      'convert xccdf_results2hdf',
      '-i', path.resolve('./test/sample_data/xccdf_results/sample_input_report/xccdf-results-openscap-rhel7.xml'),
      '-o', `${tmpobj.name}/xccdfresultstest.json`, '-w',
    ])
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/xccdfresultstest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/xccdf_results/xccdf-openscap-rhel7-hdf-withraw.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
