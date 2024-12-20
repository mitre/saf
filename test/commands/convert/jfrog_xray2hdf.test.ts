/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test jfrog_xray', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>(['convert jfrog_xray2hdf',
      '-i', path.resolve('./test/sample_data/jfrog_xray/sample_input_report/jfrog_xray_sample.json'),
      '-o', `${tmpobj.name}/jfrogtest.json`,
    ])
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/jfrog_xray/jfrog-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test jfrog_xray using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter with raw output test', async () => {
    await runCommand<{name: string}>(['convert jfrog_xray2hdf',
      '-i', path.resolve('./test/sample_data/jfrog_xray/sample_input_report/jfrog_xray_sample.json'),
      '-o', `${tmpobj.name}/jfrogtest.json`, '-w',
    ])
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/jfrogtest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/jfrog_xray/jfrog-hdf-withraw.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })
})
