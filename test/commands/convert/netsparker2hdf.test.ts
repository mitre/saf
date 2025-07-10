import {runCommand} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import {describe, expect, it} from 'vitest'
import {omitHDFChangingFields} from '../utils'

describe('Test Netsparker', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>([
      'convert netsparker2hdf',
      '-i', path.resolve('./test/sample_data/netsparker/sample_input_report/sample-netsparker-invicti.xml'),
      '-o', `${tmpobj.name}/netsparkertest.json`,
    ])
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/netsparkertest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/netsparker/netsparker-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test Netsparker using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter with raw output test', async () => {
    await runCommand<{name: string}>([
      'convert netsparker2hdf',
      '-i', path.resolve('./test/sample_data/netsparker/sample_input_report/sample-netsparker-invicti.xml'),
      '-o', `${tmpobj.name}/netsparkertest.json`, '-w',
    ])
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/netsparkertest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/netsparker/netsparker-hdf-withraw.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
