import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test Netsparker', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert netsparker2hdf', '-i', path.resolve('./test/sample_data/netsparker/sample_input_report/sample-netsparker-invicti.xml'), '-o', `${tmpobj.name}/netsparkertest.json`])
    .it('hdf-converter output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/netsparkertest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/netsparker/netsparker-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test Netsparker using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert netsparker2hdf', '-i', path.resolve('./test/sample_data/netsparker/sample_input_report/sample-netsparker-invicti.xml'), '-o', `${tmpobj.name}/netsparkertest.json`, '-w'])
    .it('hdf-converter withraw output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/netsparkertest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/netsparker/netsparker-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})