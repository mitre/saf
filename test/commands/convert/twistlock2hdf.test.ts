/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test twistlock', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>(['convert twistlock2hdf',
      '-i', path.resolve('./test/sample_data/twistlock/sample_input_report/twistlock-twistcli-sample-1.json'),
      '-o', `${tmpobj.name}/twistlock.json`,
    ])
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/twistlock.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/twistlock/twistlock-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>(['convert twistlock2hdf',
      '-i', path.resolve('./test/sample_data/twistlock/sample_input_report/twistlock-twistcli-coderepo-scan-sample.json'),
      '-o', `${tmpobj.name}/twistlock.json`,
    ])
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/twistlock.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/twistlock/twistlock-coderepo-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test twistlock using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter with raw output test - standard', async () => {
    await runCommand<{name: string}>(['convert twistlock2hdf',
      '-i', path.resolve('./test/sample_data/twistlock/sample_input_report/twistlock-twistcli-sample-1.json'),
      '-o', `${tmpobj.name}/twistlock.json`, '-w',
    ])
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/twistlock.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/twistlock/twistlock-hdf-withraw.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })

  it('hdf-converter with raw output test - code repo', async () => {
    await runCommand<{name: string}>(['convert twistlock2hdf',
      '-i', path.resolve('./test/sample_data/twistlock/sample_input_report/twistlock-twistcli-coderepo-scan-sample.json'),
      '-o', `${tmpobj.name}/twistlock.json`, '-w',
    ])
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/twistlock.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/twistlock/twistlock-coderepo-hdf-withraw.json'), 'utf8'))
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
  })
})
