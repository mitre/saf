

import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test scoutsuite', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>(['convert scoutsuite2hdf',
      '-i', path.resolve('./test/sample_data/scoutsuite/sample_input_report/scoutsuite_sample.js'),
      '-o', `${tmpobj.name}/scoutsuitetest.json`,
    ])
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/scoutsuitetest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/scoutsuite/scoutsuite-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test scoutsuite using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter with raw output test', async () => {
    await runCommand<{name: string}>(['convert scoutsuite2hdf',
      '-i', path.resolve('./test/sample_data/scoutsuite/sample_input_report/scoutsuite_sample.js'),
      '-o', `${tmpobj.name}/scoutsuitetest.json`, '-w',
    ])
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/scoutsuitetest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/scoutsuite/scoutsuite-hdf-withraw.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
