import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test veracode', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>([
      'convert veracode2hdf',
      '-i', path.resolve('./test/sample_data/veracode/sample_input_report/veracode.xml'),
      '-o', `${tmpobj.name}/veracodetest.json`,
    ])
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/veracodetest.json`, 'utf8'))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/veracode/veracode-hdf.json'), 'utf8'))
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
